# GenAI Data Chat

Natural language Q&A over uploaded CSVs. Ask questions in plain English; the app builds a query plan, runs it against your file, and returns a grounded answer with a result preview.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Papa Parse for CSV ingestion
- OpenAI for query planning and answer summaries
- In-memory query executor (filter / group / aggregate)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env and add a free Groq key (or OpenAI):

```bash
cp .env.example .env.local
```

Get a free key at [console.groq.com](https://console.groq.com) (no credit card) and set `GROQ_API_KEY`.

3. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Upload a `.csv` (up to 20,000 rows) or click **Try sample sales.csv**
2. Review inferred column types in the preview
3. Ask questions such as:
   - Which region had the highest revenue?
   - What is the average unit price by category?
   - How many orders did West place?

Each answer can include the query used and a result table.

## Notes

- Dataset stays in memory for the browser session (not persisted to disk)
- Large payloads are capped at 20k rows per request
- Requires `GROQ_API_KEY` (free) or `OPENAI_API_KEY` in `.env.local` / Vercel env
