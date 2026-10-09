# Ancient Witness Press — independent static research website

This is a **clean, standalone static reader**, extracted from the user-provided Grok workspace ZIP. It does not require Grok, ChatGPT, Node.js, an AI API, a database, or authentication to serve. It preserves the supplied generated research JSON **byte-for-byte**.

## What is included
- All twelve `surah-XX.json` generated research exports and their original `source-manifest.json` (unchanged bytes).
- Static HTML/JS searchable QDISC/QB research reader with separate ChatGPT/Grok provenance and OPEN flags.
- Project-owner publication approval for Surahs 1–12 is applied **only in the display layer**; source metadata is untouched.

## What is not included
- `.grok/`, `.vercel/`, workspace configuration, authentication, server routes, database integrations, attachments, research ZIPs, original transcript, screenshots, logs, environment variables, or credentials.
- The original Grok React/TanStack interface. This package is a **standalone migration/preview reader**, not a pixel-perfect build of the original application.
- Complete 16-component research-library presentation; that requires additional controlled exports.

## Local preview
From the extracted folder, run `python -m http.server 8000` then open `http://localhost:8000`. Do not open `index.html` directly from disk because browsers restrict JSON fetches from `file://`.

## Deploy
Upload **the contents of this folder** (not the original Grok workspace ZIP) to the public GitHub repository. Connect that repository to Cloudflare Pages, using **no build command** and **output directory `/`** (repository root). If the host requires an output folder, set it to `.`. Test the provider preview domain before touching the domain DNS.

## Governance and provenance
- Original workspace ZIP SHA-256: `5b097bb9406e531d4fdd93599af6da144301d6babf76bea3d7f34572cfc88c8f`
- Source JSON bytes are unchanged; see `DATA_SHA256SUMS.txt`.
- Original source research/publication-state fields may still say DRAFT or UNPUBLISHED; they have not been silently changed. The owner approved public display of Surahs 1–12 separately on 2026-10-09.
- Full frozen-source field-level reconciliation is still outstanding; do not represent this as a certified full 16-component repository.
- Review all content, licensing and attribution before public deployment.
