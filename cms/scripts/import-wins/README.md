# import-wins

A CLI script that extracts structured data from news articles about cities terminating, rejecting, or deactivating ALPR (Automatic License Plate Reader) contracts — typically with vendors like Flock Safety.

## What It Does

Given a news article URL, the script:

1. Fetches and parses the article text
2. Uses OpenAI to extract:
   - **Publication date** (year + month)
   - **City & state** that is the subject of the article
   - **Outcome** — one of `Contract Canceled`, `Contract Rejected`, or `Cameras Deactivated`
   - **Description** — a 1–2 sentence summary with a link back to the article
3. Displays the result for review
4. Lets you accept or provide feedback to re-extract
5. Outputs final JSON to stdout

### Outcome Definitions

| Outcome | Meaning |
|---|---|
| `Contract Canceled` | An existing contract was terminated before its natural end |
| `Contract Rejected` | A proposed contract was not accepted, or an existing one was not renewed |
| `Cameras Deactivated` | Cameras were turned off or removed for any other reason |

### Output Shape

```json
{
  "year": 2024,
  "month": 3,
  "city": "Springfield",
  "state": "IL",
  "outcome": "Contract Canceled",
  "description": "Springfield <a href=\"https://...\" target=\"_blank\">terminated its Flock Safety contract</a> amid privacy concerns."
}
```

## Requirements

- [uv](https://docs.astral.sh/uv/)
- A `.env` file (copy from `.env.example`)

## Configuration

```bash
cp .env.example .env
```

Edit `.env`:

```env
OPENAI_API_KEY=sk-...
DIRECTUS_API_KEY=        # optional — enables CMS posting after review
```

## Usage

**Extract from a URL:**

```bash
uv run python extract_win.py "https://example.com/article"
```

The script fetches the article, shows the extracted data for review, and lets you accept or provide correction guidance. The final JSON is saved to `/tmp/flock-wins/<city>-<state>.json` and printed to stdout. If `DIRECTUS_API_KEY` is set, you'll be prompted to upload to the CMS.

**Upload a saved JSON file to the CMS:**

```bash
uv run python extract_win.py --upload /tmp/flock-wins/springfield-il.json
```

Useful if you want to manually tweak the saved JSON before uploading. Requires `DIRECTUS_API_KEY`.
