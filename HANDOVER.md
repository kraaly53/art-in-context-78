# Art in Context — site handover

Updated 18 November 2026.

## Identity and ownership

| Item | Value |
| --- | --- |
| Audience | Grade 7–8 art students |
| Live site | https://kraaly53.github.io/art-in-context-78/ |
| Source | https://github.com/kraaly53/art-in-context-78 |
| Owner | `kraaly53` |
| Published branch and folder | `main` / `dist` |
| Publishing | GitHub Actions, `.github/workflows/pages.yml` |
| Access | Public; no pupil login |
| Earlier site | `kraaly53/little-artist-explorers`, retained as a separate site |

The repository owner manages collaborator access. No application credentials or paid service are required. The public repository contains the site and documentation, not the original classroom photographs or pupil work.

## Delivered learning experience

All 51 artists have media, life-date guidance, three career moments, at least two significant-work studies, social context, art-historical influence, interesting facts, a context quiz, and discussion prompts. There are 103 written work studies and 153 timeline moments in total.

Students can search the index, filter media and perspectives, open a chronology, compare two artists, explore medium definitions, solve a timeline-order challenge, and generate creative briefs. Discussion prompts encourage claims supported by visual evidence and context. Impact paragraphs are identified as educational synthesis, not quotations or single-cause historical proof.

**Current artwork coverage:** 515 distinct artwork images and 42 portraits; 51 of 51 artists meet the ten-work target. The profile gallery appears near the top and shows its exact count. New copyrighted illustrations accompany original work-specific criticism and discussion prompts, including in the enlarged viewer. ARTWORK-COVERAGE.md gives every count and any actual remaining gap. Canadian fair-dealing assessments supplement the existing public-domain/licensed collection; they are not artist permissions or open licences.

## Files and architecture

The site is plain HTML, CSS, and JavaScript. There is no framework or build dependency, backend, database, external font/image request, service worker, or authentication system. `dist/index.html` loads `artists.js`, `app.js`, `styles.css`, and local assets with relative paths suitable for GitHub Pages project hosting.

GitHub Pages and the repository remain public; search-exclusion requests do not provide access control. Do not describe this deployment as a password-protected class platform.

The student interface contains no outgoing clickable web links. Source addresses and image licences appear as plain text in profile details and the teacher desk. The content policy blocks outbound application connections, remote resources, frames, and form submissions. It permits local/blob/data images for the interface and downloaded artifacts.

Completed-quiz markers and selected comparison IDs use separate `art-context-discoveries` and `art-context-compare` session-storage keys. The site has no student writing fields, note storage, or export feature. Storage failures fall back to the open page’s memory. These keys do not overwrite the earlier site’s storage keys.

## Maintenance workflow

1. Get the latest `main`. When collaborating, use a branch and pull request rather than editing a shared branch without review.
2. Edit `dist/artists.js` for content or image metadata; `app.js` for behaviour; `styles.css` for presentation.
3. Preview using `python3 -m http.server 4174 --bind 127.0.0.1 --directory dist` from the repository root.
4. Run `node scripts/version-assets.mjs` to refresh browser asset versions, then `node tests/validate.mjs` with Node.js. Review the actual source evidence as well: automated checks verify structure and important reviewed dates, not every historical interpretation.
5. Exercise the changed interaction in a browser, including keyboard access and a narrow viewport for interface changes.
6. Commit and push to `main`. Wait for **Publish classroom website** to succeed in Actions. Verify the public URL and the changed page.

The workflow validates, configures Pages, uploads `dist`, and deploys it. It uses GitHub’s temporary token with `contents: read`, `pages: write`, and `id-token: write`, not a checked-in personal token. In **Settings → Pages**, choose **GitHub Actions**. A maintainer can use **Actions → Publish classroom website → Run workflow** to publish again.

Documentation and source notes outside `dist` are available through the repository, not as student-facing pages. Updating documents also triggers the publishing workflow.

## Artwork information and portrait viewing

All 515 artwork records require a substantive `description` and one or more `infoSources`. This is shown under About this artwork in the featured panel, gallery card and enlarged viewer, alongside available date/material metadata. Do not use a generic biography, bare title/year or unanswered question in place of information about the particular piece. Keep IMAGE-CREDITS.json in sync when editing these fields.

The 42 available portraits use larger uncropped images with an Enlarge portrait button. Their dedicated dialog includes artist identification and source credit; its close button or Escape returns focus to the portrait button. Missing portraits still use initials rather than an invented image.

## Image updates

Check both the source photo’s rights and the artwork’s underlying rights, including Canadian status. Educational fair dealing is an assessed use basis under ss.29/29.1, not a blanket licence; follow EDUCATIONAL-USE.md and retain substantive image-specific commentary. Do not claim s.30.04 automatically applies merely because a picture is online. Some included public-sculpture photographs rely on a documented panorama exception; those artworks are not claimed to be public domain. Preserve that distinction. Match a photo to its actual work: an alternate sculpture is not a substitute image for a famous painting.

Add local image data to an artist’s `gallery` array with `path`, `title`, `date`, `alt`, `credit`, `source`, `license`, `licenseUrl`, and `changes`; include `rightsBasis` where relevant. Copyrighted educational images also require `description`, `rightsAssessment`, retained copyright credit and a maximum 640px study image; retain any separate `sourceLicense` designation. A portrait uses the `portrait` object. Update IMAGE-CREDITS.json, IMAGE-CREDITS.md, dist/credits.txt, inventory coverage, permissions gaps, README, this handover, and tests to the new verified totals.

The current checks require 51 artists, 42 portraits, matching artwork/credit totals (currently 515 works), and all 51 galleries meeting ten, and guard selected corrected dates. Revise counts when an authorised content expansion changes them; do not weaken checks to bypass an unexplained failure.

## Classroom operation

Use **Teacher desk & credits** to inspect sources, permissions, privacy notes, and image content. Reset this tab’s completed challenges between groups. This clears Art in Context’s keys, not other applications on the same host.

Read-aloud selects only installed local English voices. Its absence does not hide the text. Install an offline voice through the device’s normal settings if needed; no microphone or camera is used. Artist-name pronunciation may need teacher support.

The site is public and does not control the address bar or other tabs. Follow school policy for kiosk/guided access or restricted hosting. The hosted version has no guaranteed offline cache; a downloaded copy served locally can operate without an internet connection.

The content addresses race, inequality, cultural representation, war, anxiety, and public debate in non-graphic educational language. Some Renaissance works and modern figure studies include nonsexual anatomy; review the actual images before class. Preview the collection for the particular class. Indigenous cultures are described as living and distinct; briefs ask for students’ own symbols rather than copying sacred imagery.

## Troubleshooting and rollback

| Problem | Check |
| --- | --- |
| An update is missing | Confirm the commit reached `main`, inspect Actions, then refresh the live page. Ensure student-facing edits are under `dist`. |
| A deployment fails | Open the failing workflow step and run the validation command locally. Check the Pages source setting and the actual error before rerunning. |
| An image fails to load | Check the committed filename, exact case, relative path, and source record. GitHub Pages is case-sensitive. |
| Search returns nothing | Reset both the perspective and medium filters; search ignores accents but still matches the chosen filter combination. |
| Read-aloud is disabled | Check whether the device offers a local English voice. Remote voices are intentionally excluded. |
| A pupil leaves the site | Use device-level restrictions; the website itself cannot prevent other-tab or address-bar browsing. |

To undo a bad update, review the faulty commit and make a new revert commit, then let the same workflow publish it. Do not force-push or rewrite shared history as a routine rollback. The earlier Grade 1 repository should not be changed as part of this site’s maintenance.

## Known limits and next priorities

1. Keep all galleries at ten or more distinct works and maintain the image-specific commentary, source credits and assessment records. Nine portraits remain unavailable. Banksy is intentionally anonymous.
2. Check local voices, touch behaviour, and school restrictions on actual classroom devices.
3. Consider additional teacher-reviewed visual analysis questions and lesson sequences after classroom feedback.
4. Keep dates and sources current, and preserve explicit uncertainty rather than inventing an exact birth or creation year.

See TEST-REPORT.md for the checks completed during delivery and any remaining verification limits. The supporting files are linked from README.md.
