#!/usr/bin/env bash
set -euo pipefail

# Push to origin using a GitHub PAT from environment without persisting the token in git config.
# Requirements:
# - Export GITHUB_PAT in your shell or source it from a local .env (not committed)
# - Origin must be an HTTPS GitHub URL
#
# Example:
#   cp .env.example .env
#   # edit .env and set GITHUB_PAT=<your_token>
#   set -a; source .env; set +a
#   bash ./push-with-pat.sh

if [[ -z "${GITHUB_PAT:-}" ]]; then
  echo "Error: GITHUB_PAT is not set in the environment."
  echo "Set it (e.g., export GITHUB_PAT=...) or source your local .env before running."
  exit 1
fi

ORIGIN_URL="$(git remote get-url origin)"
if [[ "${ORIGIN_URL}" != https://github.com/* ]]; then
  echo "Error: origin is not an HTTPS GitHub URL: ${ORIGIN_URL}"
  echo "Please set origin to an HTTPS GitHub URL before running this script."
  exit 1
fi

TOKEN_URL="${ORIGIN_URL/https:\/\/github.com/https://${GITHUB_PAT}@github.com}"

echo "Temporarily setting origin to token URL for push..."
git remote set-url origin "${TOKEN_URL}"

echo "Pushing current branch to origin..."
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
git push origin "${CURRENT_BRANCH}"

echo "Restoring origin to standard HTTPS URL..."
git remote set-url origin "${ORIGIN_URL}"

echo "Done. Token was used only for this push and not persisted in git config."
