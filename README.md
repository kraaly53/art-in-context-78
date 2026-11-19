# Art in Context — The Art & Ideas Lab

A separate Grade 7–8 website exploring the same 51 artists in the supplied classroom bulletin-board photos. It develops art-history context, visual analysis, media knowledge, and creative thinking rather than adapting the younger-student interface.

**Live site:** https://kraaly53.github.io/art-in-context-78/
**Repository:** https://github.com/kraaly53/art-in-context-78

The earlier [Little Artist Explorers](https://kraaly53.github.io/little-artist-explorers/) site is a separate project and has not been replaced. For operation and maintenance, see [HANDOVER.md](HANDOVER.md).

## What students can explore

- 51 artist profiles with media/materials, lifespans and places, 153 career timeline moments, 103 significant-work studies, interesting facts, and separate social and art-historical impact sections.
- 42 portraits and 28 rights-documented artwork reproductions, with magnification and credits. Twenty-three artists currently have written work studies without a cleared artwork image; see [image permissions](IMAGE-PERMISSIONS.md).
- Search by artist, medium, movement, place, or work title; filter by medium and thematic perspective.
- A chronological overview, side-by-side artist comparisons, clickable medium explanations, and a timeline-order game.
- Creative briefs with constraints and context-based quizzes, with discussion prompts supported by visual evidence and historical context.
- Device-local English read-aloud. No microphone permission is used.

There are no student accounts, ads, external media embeds, outgoing clickable student links, uploads, analytics, or server-side storage. Source and licence addresses are shown as plain text. Only completed-quiz markers and comparison choices are held in this tab’s session storage. There are no student writing fields or saved reflections.

## Run locally

No build or package installation is needed. From the repository root:

```sh
python3 -m http.server 4174 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:4174 and stop the server with Control-C. Local serving is the supported offline option; the hosted site does not promise an offline cache.

## Validate and publish

```sh
node tests/validate.mjs
```

Commit changes to `main`. The **Publish classroom website** GitHub Actions workflow validates the data and local files, then publishes **only `dist`** to GitHub Pages. Repository **Settings → Pages** uses **GitHub Actions**. The workflow can also be run manually from the Actions tab.

For school hosting, upload the contents of `dist` together, preserving relative paths. No API keys, secrets, environment variables, database, backend, or external image service are needed. GitHub Pages is public; use approved school hosting if access must be restricted.

## Edit content

- `dist/artists.js` contains `window.ARTISTS`: biographies, media, timelines, work studies, impact paragraphs, quizzes, image galleries, and source addresses.
- `dist/app.js` implements navigation, filtering, comparison, game, creative briefs, glossary explanations, and speech.
- `dist/styles.css` and `dist/index.html` define the layout, shell, content policy, and teacher desk.
- `dist/assets` holds local images. The teacher desk’s credit list is generated from the data.

Use stable artist IDs. Review source evidence when changing a historical claim. The impact paragraphs are clearly identified as educational synthesis; do not present an interpretation as a documented fact. Preserve uncertainty where a birth date, campaign year, or work date is disputed.

Image changes must include a verified reuse basis, accurate title/date, useful alt text, and matching credits. A licensed photograph does not automatically grant rights to the art it depicts. Update coverage counts and tests when adding cleared images. Do not insert unlicensed screenshots or relabel a substitute as an artist’s own work.

## Teacher and maintainer documents

- [HANDOVER.md](HANDOVER.md): ownership, maintenance, publishing, rollback, classroom use, and remaining work.
- [ARTIST-INVENTORY.md](ARTIST-INVENTORY.md): the 51 names and confirming locations in the original photos.
- [SOURCES-AND-TEACHING-NOTES.md](SOURCES-AND-TEACHING-NOTES.md): primary-source map, dates, editorial decisions, and lesson framing.
- [IMAGE-CREDITS.md](IMAGE-CREDITS.md) / [IMAGE-CREDITS.json](IMAGE-CREDITS.json): licences, attribution, and modifications.
- [IMAGE-PERMISSIONS.md](IMAGE-PERMISSIONS.md): the exact image gaps and completion process.
- [TEST-REPORT.md](TEST-REPORT.md): completed checks and practical limits.

The original classroom photos and pupil artworks are not redistributed. Preview all images before a lesson; one Dalí sculpture photograph contains nonsexual figurative anatomy. Read-aloud quality depends on the school’s actual browser and device policies. The site itself does not prevent address-bar or other-tab navigation.

## Reuse

Original code is provided under MIT; original educational text is offered under CC0. Third-party media retains its individually documented rights and licence requirements. No artist or institution endorsement is implied.
