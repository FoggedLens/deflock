import { load } from 'cheerio';
import OpenAI from 'openai';

const MODEL = 'gpt-4o-mini';

const SYSTEM_PROMPT = `You are a data extraction assistant. You will be given the text of a news article about a city terminating, rejecting, or deactivating an ALPR (Automatic License Plate Reader) contract or system — typically with a vendor like Flock Safety.

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

Replace ARTICLE_URL with the actual URL provided and VERB PHRASE with the natural language action from the sentence. Do not add a separate "Read more" link.`;

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

async function fetchArticleText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; import-win/1.0)' },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Failed to fetch article: ${response.status} ${response.statusText}`);
  const html = await response.text();
  const $ = load(html);
  $('script, style, nav, footer, header, aside').remove();
  return $.text().replace(/\s+/g, ' ').trim();
}

async function extractFields(openai, articleText, url) {
  const response = await openai.chat.completions.create({
    model: MODEL,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Article URL: ${url}\n\nArticle text:\n${articleText.slice(0, 12000)}` },
    ],
  });
  return JSON.parse(response.choices[0].message.content);
}

function toCmsPayload(result) {
  return {
    cityState: `${result.city}, ${result.state}`,
    monthYear: `${MONTH_NAMES[result.month]} ${result.year}`,
    description: result.description,
    outcome: result.outcome,
  };
}

export default (router, { env }) => {
  router.post('/', async (req, res) => {
    if (!req.accountability?.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { url } = req.body ?? {};
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Request body must include a "url" string.' });
    }

    const apiKey = env['OPENAI_API_KEY'];
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENAI_API_KEY is not configured on the server.' });
    }

    let articleText;
    try {
      articleText = await fetchArticleText(url);
    } catch (err) {
      return res.status(422).json({ error: `Failed to fetch article: ${err.message}` });
    }

    const openai = new OpenAI({ apiKey });

    let extracted;
    try {
      extracted = await extractFields(openai, articleText, url);
    } catch (err) {
      return res.status(500).json({ error: `OpenAI extraction failed: ${err.message}` });
    }

    return res.json(toCmsPayload(extracted));
  });
};
