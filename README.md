<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/9732eb07-1aaf-4f27-80ef-9409cce56c66

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Git Push with a Personal Access Token (PAT)

- PATs must never be committed. Use a local `.env` and the provided script.
- Steps:
  1. `cp .env.example .env`
  2. Edit `.env` and set `GITHUB_PAT`
  3. Load env: `set -a; source .env; set +a`
  4. Push: `bash ./push-with-pat.sh`

The script uses your token only for the push and restores the remote afterward.

## Database Configuration (Internal Colify)

- Prefer `DATABASE_URL` for internal connectivity:
  - Format: `postgres://USER:PASSWORD@HOST:5432/DB_NAME`
  - Set this in your Colify environment dashboard (never commit real values).
- Optionally set `DB_SSL="false"` or `"true"` depending on your provider.
- If `DATABASE_URL` is not provided, the app falls back to `DB_USER/DB_PASSWORD/DB_HOST/DB_PORT/DB_NAME`.
