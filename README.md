# Ancient Witness Press — approved homepage visual + research reader

This is an **interim, static visual restoration**, not a recovered original homepage source. Inspection of the supplied Grok workspace found a TanStack research reader, **not** the black-and-gold approved homepage pictured in the supplied image. The approved homepage screenshot is included as a reference image and used as the visible homepage with accessible clickable navigation regions. The original source for that exact design is not present in the provided workspace.

## Deployment

Upload **wrangler.jsonc**, **site/**, **.gitignore**, and this README to the root of your existing GitHub repository. Do not remove the existing files yet. The Cloudflare Worker Git integration currently runs `npx wrangler deploy`; the `wrangler.jsonc` here changes the published asset directory to `./site` so `.git` and repository metadata are not included. Leave the Cloudflare deploy command unchanged. Commit, then check the new deployment log for `assets directory .../site` and ensure no `.git/` uploads. If Cloudflare has custom overrides, update them to respect the config.

## Site contents

- `site/index.html` — approved homepage visual with functional navigation hotspots.
- `site/approved-homepage-reference.png` — user-provided approved design screenshot; the text is baked into this image.
- `site/reader.html` and `site/app.js` — original static research reader, relocated to `/reader.html`.
- `site/data/` — byte-identical research JSON from the previous GitHub-safe package, Surahs 1–12.
- `site/thought.html`, `site/about.html`, `site/contact.html` — conservative placeholder sections, not invented book/contact content.

## Limitations

The approved homepage has been restored **visually** from the screenshot, but its original interactive source is unavailable in the supplied Grok workspace. On mobile the reference scales down, and a separate responsive navigation list is supplied. Rebuilding the layout natively with individual artwork, responsive text, and full sections will require the original homepage source/assets or a new implementation. The current research reader presents QDISC/QB and does not yet independently expose all 16 components. Research classifications remain unchanged.

Do not connect ancientwitnesspress.com until homepage, navigation, data loading, and deployment security are tested on the temporary workers.dev address.
