# Art in Context — The Art & Ideas Lab

A separate Grade 7–8 website exploring 49 selected artists in the supplied classroom bulletin-board photos. It develops art-history context, visual analysis, media knowledge, and creative thinking rather than adapting the younger-student interface.

**Live site:** https://kraaly53.github.io/art-in-context-78/
**Repository:** https://github.com/kraaly53/art-in-context-78

The earlier [Little Artist Explorers](https://kraaly53.github.io/little-artist-explorers/) site is a separate project and has not been replaced. For operation and maintenance, see [HANDOVER.md](HANDOVER.md).

## What students can explore

- 49 artist profiles with media/materials, lifespans and places, 147 career timeline moments, 99 significant-work studies, interesting facts, and separate social and art-historical impact sections.
- 41 portraits and 489 distinct artwork images, with prominent galleries, titles/dates, and a keyboard-accessible larger-image viewer. 43 of 49 artists meet the original ten-work target; six galleries intentionally have nine after teacher-requested removals. New copyrighted images have original visual-analysis prompts and documented Canadian educational fair-dealing assessments. See the exact [coverage report](ARTWORK-COVERAGE.md).
- Every artist has a pinned classroom-appropriate featured artwork, shared by the index card, profile and comparison view. [Selection evidence](FEATURED-WORKS.md) distinguishes iconic works from representative choices where no single most-famous work is established.
- Every artwork has a piece-specific **About this artwork** section in its gallery card, featured panel and enlarged viewer, with local read-aloud support.
- Available artist portraits are larger, uncropped and open in a dedicated portrait viewer. Eight artists without a verified portrait retain their initials/anonymous symbol.
- Search by artist, medium, movement, place, or work title; filter by medium and thematic perspective.
- A horizontal **Art Time Machine** with portrait markers that move along sourced career bands, hover/tap/focus story cards, grouped milestones, year playback, period shortcuts, zoom, an artist finder and a live list of overlapping careers. All 147 career moments are preserved. See [timeline date evidence](TIMELINE-SOURCES.md).
- Side-by-side artist comparisons, clickable medium explanations, and a timeline-order game.
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
node scripts/version-assets.mjs
node tests/validate.mjs
```

Commit changes to `main`. The **Publish classroom website** GitHub Actions workflow validates the data and local files, then publishes **only `dist`** to GitHub Pages. Repository **Settings → Pages** uses **GitHub Actions**. The workflow can also be run manually from the Actions tab.

For school hosting, upload the contents of `dist` together, preserving relative paths. No API keys, secrets, environment variables, database, backend, or external image service are needed. GitHub Pages is public; use approved school hosting if access must be restricted.

## Edit content

- `dist/artists.js` contains `window.ARTISTS`: biographies, media, timelines, work studies, impact paragraphs, quizzes, image galleries, and source addresses.
- `dist/app.js` implements navigation, filtering, comparison, game, creative briefs, glossary explanations, and speech.
- `dist/activity.js` holds the 49 sourced approximate career periods; `dist/timeline.js` renders the horizontal timeline, animated year markers and layered details.
- `dist/styles.css` and `dist/index.html` define the layout, shell, content policy, and teacher desk.
- `dist/assets` holds local images. The teacher desk’s credit list is generated from the data.

Use stable artist IDs. Review source evidence when changing a historical claim. The impact paragraphs are clearly identified as educational synthesis; do not present an interpretation as a documented fact. Preserve uncertainty where a birth date, campaign year, or work date is disputed.

Image changes must include an accurate work identity/date, useful alt text, attribution and a documented use basis. Open licences, public-domain records and Canadian fair-dealing assessments are distinguished; a photo licence or US public-domain designation does not automatically clear the underlying artwork in Canada. Copyrighted study images need their own substantive visual commentary and assessment, including public distribution and market considerations. See EDUCATIONAL-USE.md. Never relabel an unrelated substitute as the artist’s work.

## Teacher and maintainer documents

- [HANDOVER.md](HANDOVER.md): ownership, maintenance, publishing, rollback, classroom use, and remaining work.
- [ARTIST-INVENTORY.md](ARTIST-INVENTORY.md): the 51 names and confirming locations in the original photos.
- [SOURCES-AND-TEACHING-NOTES.md](SOURCES-AND-TEACHING-NOTES.md): primary-source map, dates, editorial decisions, and lesson framing.
- [IMAGE-CREDITS.md](IMAGE-CREDITS.md) / [IMAGE-CREDITS.json](IMAGE-CREDITS.json): licences, attribution, and modifications.
- [ARTWORK-COVERAGE.md](ARTWORK-COVERAGE.md) / [ARTWORK-COVERAGE.json](ARTWORK-COVERAGE.json): exact per-artist counts, source checks, and shortfalls.
- [EDUCATIONAL-USE.md](EDUCATIONAL-USE.md): Canadian classroom purpose, fair-dealing framework, public-hosting limits, and reuse distinctions.
- [IMAGE-PERMISSIONS.md](IMAGE-PERMISSIONS.md): the exact image gaps and completion process.
- [TEST-REPORT.md](TEST-REPORT.md): completed checks and practical limits.

The original classroom photos and pupil artworks are not redistributed. The current images have been visually reviewed against the teacher’s no-nudity/no-violence rule; see SCHOOL-CONTENT-REVIEW.md. Read-aloud quality depends on the school’s actual browser and device policies. The site itself does not prevent address-bar or other-tab navigation.

## Reuse

Original code is provided under MIT; original educational text is offered under CC0. Third-party media retains its individually documented rights and licence requirements. No artist or institution endorsement is implied.

Profile artwork galleries run earliest to latest, using the start of date ranges. Unverified artwork dates appear last. The independently selected featured artwork stays at the top of the profile; enlarged gallery navigation follows date order.

School image policy: no nudity or violence. Suitable selections take priority over an absolute fame ranking; see [SCHOOL-CONTENT-REVIEW.md](SCHOOL-CONTENT-REVIEW.md) and the fingerprinted approval manifest. Every new or changed image requires visual review before publication.

Teacher revision, 19 November 2026: the requested whole-artist and three individual-work exclusions are removed from every student view, the challenge bank and current image files. Stable artist IDs are retained; ID 15 is no longer included. Historical audit entries document removals outside the student site.

The Timeline now opens in **Everyone at a glance**: all 49 named portrait/initial cards fit in one screen, with mini career bands and green highlighting for the selected year. Hover or keyboard focus shows the artist’s larger portrait and story; a tap opens a story dialog on phones. **Focus view** adds room, and **Detailed timeline** retains the larger scrolling career map and all milestone dots.

Additional teacher revision, 19 November 2026: Jacob Lawrence and his eleven media files are excluded, along with Trans Forming Liberty, The Jewish Bride and Hollywood Africans. All current student data, gallery files, timeline records, comparisons and challenge entries reflect these removals. Historical IDs 15 and 42 remain unused.
