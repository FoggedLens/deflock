#!/usr/bin/env python3
"""
extract_win.py — Extract structured data from an ALPR contract-loss news article.

Usage:
    python extract_win.py <url>             # extract, save to /tmp/flock-wins/, optionally upload
    python extract_win.py --upload <file>   # upload a saved JSON file to the CMS

Requires OPENAI_API_KEY in .env. DIRECTUS_API_KEY enables CMS upload.
"""

import argparse
import json
import os
import sys
from calendar import month_name
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

MODEL = "gpt-4o-mini"
DIRECTUS_URL = "https://cms.deflock.me/items/flockWins"

SYSTEM_PROMPT = """You are a data extraction assistant. You will be given the text of a news article about a city terminating, rejecting, or deactivating an ALPR (Automatic License Plate Reader) contract or system — typically with a vendor like Flock Safety.

Extract the following fields and return ONLY valid JSON with no additional text:

{
  "year": <integer — year the article was published>,
  "month": <integer — month the article was published (1–12)>,
  "city": <string — name of the city that is the primary subject>,
  "state": <string — two-letter US state abbreviation>,
  "outcome": <one of exactly: "Contract Canceled", "Contract Rejected", or "Cameras Deactivated">,
  "description": <string — 1–2 sentence summary of the outcome, ending with an HTML anchor tag linking to the article>
}

Outcome definitions:
- "Contract Canceled": an existing contract was terminated before its natural end
- "Contract Rejected": a proposed contract was not accepted initially, or an existing contract was not renewed
- "Cameras Deactivated": cameras were turned off or removed for any other reason

The description must include an <a> tag wrapping the key verb phrase that describes what happened — such as "canceled their contract", "voted not to renew", "terminated the agreement", etc. Format the tag exactly as:
<a href="ARTICLE_URL" target="_blank">VERB PHRASE</a>

Replace ARTICLE_URL with the actual URL provided and VERB PHRASE with the natural language action from the sentence. Do not add a separate "Read more" link."""


def fetch_article_text(url: str) -> str:
    """Fetch a URL and return its readable text content."""
    headers = {"User-Agent": "Mozilla/5.0 (compatible; extract_win/1.0)"}
    response = requests.get(url, headers=headers, timeout=15)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    # Remove scripts, styles, nav, footer noise
    for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
        tag.decompose()

    return soup.get_text(separator="\n", strip=True)


def extract(client: OpenAI, article_text: str, url: str, feedback: str | None = None, prior: dict | None = None) -> dict:
    """Call OpenAI to extract structured data. Optionally pass prior result + user feedback."""
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    user_content = f"Article URL: {url}\n\nArticle text:\n{article_text[:12000]}"
    messages.append({"role": "user", "content": user_content})

    if prior and feedback:
        messages.append({"role": "assistant", "content": json.dumps(prior)})
        messages.append({
            "role": "user",
            "content": f"Please revise the extraction based on this feedback: {feedback}",
        })

    response = client.chat.completions.create(
        model=MODEL,
        response_format={"type": "json_object"},
        messages=messages,
    )
    return json.loads(response.choices[0].message.content)


def review_loop(client: OpenAI, article_text: str, url: str) -> dict:
    """Run the extraction + interactive review loop."""
    result = extract(client, article_text, url)

    while True:
        print("\n--- Extracted Data ---", file=sys.stderr)
        print(json.dumps(result, indent=2), file=sys.stderr)
        print("----------------------", file=sys.stderr)
        print("\nAccept this result? Press Enter to accept, or type correction guidance: ", end="", file=sys.stderr)

        user_input = input().strip()
        if user_input.lower() in ("", "y", "yes"):
            return result

        feedback = user_input
        print("\nRe-extracting with your feedback...", file=sys.stderr)
        result = extract(client, article_text, url, feedback=feedback, prior=result)


def to_cms_payload(result: dict) -> dict:
    """Map extracted fields to the Directus flockWins schema."""
    return {
        "cityState": f"{result['city']}, {result['state']}",
        "monthYear": f"{month_name[result['month']]} {result['year']}",
        "description": result["description"],
        "outcome": result["outcome"],
    }


def post_to_cms(payload: dict, api_key: str) -> None:
    """POST a new item to the Directus CMS."""
    response = requests.post(
        DIRECTUS_URL,
        json=payload,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        timeout=15,
    )
    response.raise_for_status()
    item = response.json().get("data", {})
    print(f"Added to CMS with id={item.get('id')}", file=sys.stderr)


SAVE_DIR = Path("/tmp/flock-wins")


def save_result(result: dict) -> Path:
    """Save extracted JSON to /tmp/flock-wins/<city>-<state>.json."""
    SAVE_DIR.mkdir(parents=True, exist_ok=True)
    city_slug = result["city"].lower().replace(" ", "-")
    state_slug = result["state"].lower()
    path = SAVE_DIR / f"{city_slug}-{state_slug}.json"
    path.write_text(json.dumps(result, indent=2))
    return path


def main():
    parser = argparse.ArgumentParser(description="Extract structured data from an ALPR news article.")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("url", nargs="?", help="URL of the news article to extract")
    group.add_argument("--upload", metavar="FILE", help="Upload a saved JSON file to the CMS")
    args = parser.parse_args()

    directus_key = os.environ.get("DIRECTUS_API_KEY")

    # --- Upload-only mode ---
    if args.upload:
        if not directus_key:
            print("Error: DIRECTUS_API_KEY is not set in the environment or .env file.", file=sys.stderr)
            sys.exit(1)
        try:
            result = json.loads(Path(args.upload).read_text())
        except (OSError, json.JSONDecodeError) as e:
            print(f"Error reading file: {e}", file=sys.stderr)
            sys.exit(1)
        print(json.dumps(result, indent=2), file=sys.stderr)
        print(f"\nUpload to CMS? [y/N] ", end="", file=sys.stderr)
        if input().strip().lower() in ("y", "yes"):
            try:
                post_to_cms(to_cms_payload(result), directus_key)
            except requests.exceptions.RequestException as e:
                print(f"Error posting to CMS: {e}", file=sys.stderr)
                sys.exit(1)
        return

    # --- Extract mode ---
    if not os.environ.get("OPENAI_API_KEY"):
        print("Error: OPENAI_API_KEY is not set in the environment or .env file.", file=sys.stderr)
        sys.exit(1)

    client = OpenAI()

    print(f"Fetching article: {args.url}", file=sys.stderr)
    try:
        article_text = fetch_article_text(args.url)
    except requests.exceptions.RequestException as e:
        print(f"Error fetching article: {e}", file=sys.stderr)
        sys.exit(1)

    print("Extracting data with OpenAI...", file=sys.stderr)
    result = review_loop(client, article_text, args.url)

    saved_path = save_result(result)
    print(json.dumps(result, indent=2))
    print(f"\nSaved to {saved_path}", file=sys.stderr)

    if directus_key:
        print("Add this entry to the CMS? [y/N] ", end="", file=sys.stderr)
        if input().strip().lower() in ("y", "yes"):
            try:
                post_to_cms(to_cms_payload(result), directus_key)
            except requests.exceptions.RequestException as e:
                print(f"Error posting to CMS: {e}", file=sys.stderr)
                sys.exit(1)


if __name__ == "__main__":
    main()
