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

All 51 artists have media, life-date guidance, three career moments, at least two significant-work studies, social context, art-historical influence, interesting facts, a context quiz, and a reflection space. There are 103 written work studies and 153 timeline moments in total.

Students can search the index, filter media and perspectives, open a chronology, compare two artists, explore medium definitions, solve a timeline-order challenge, generate creative briefs, and export notebook text. The notebook promotes a claim supported by visual evidence and context. Impact paragraphs are identified as educational synthesis, not quotations or single-cause historical proof.

**Image coverage is incomplete:** 42 portraits and 28 actual artwork reproductions are included. Nine profiles have no verified portrait; 23 have no cleared artwork reproduction. Those profiles use text studies and, where available, a portrait. They do not display invented works. See IMAGE-PERMISSIONS.md for every remaining name.

## Files and architecture

The site is plain HTML, CSS, and JavaScript. There is no framework or build dependency, backend, database, external font/image request, service worker, or authentication system. `dist/index.html` loads `artists.js`, `app.js`, `styles.css`, and local assets with relative paths suitable for GitHub Pages project hosting.

The student interface contains no outgoing clickable web links. Source addresses and image licences appear as plain text in profile details and the teacher desk. The content policy blocks outbound application connections, remote resources, frames, and form submissions. It permits local/blob/data images for the interface and downloaded artifacts.

Notebook text, discovery markers, and selected comparison IDs use separate `art-context-*` session-storage keys. They do not overwrite the earlier site’s storage keys. No notes are uploaded or visible to a teacher through a dashboard. Storage failures fall back to the open page’s memory. Export before closing the tab; the downloaded file is the student’s retained copy.

## Maintenance workflow

1. Get the latest `main`. When collaborating, use a branch and pull request rather than editing a shared branch without review.
2. Edit `dist/artists.js` for content or image metadata; `app.js` for behaviour; `styles.css` for presentation.
3. Preview using `python3 -m http.server 4174 --bind 127.0.0.1 --directory dist` from the repository root.
4. Run `node tests/validate.mjs` with Node.js. Review the actual source evidence as well: automated checks verify structure and important reviewed dates, not every historical interpretation.
5. Exercise the changed interaction in a browser, including keyboard access and a narrow viewport for interface changes.
6. Commit and push to `main`. Wait for **Publish classroom website** to succeed in Actions. Verify the public URL and the changed page.

The workflow validates, configures Pages, uploads `dist`, and deploys it. It uses GitHub’s temporary token with `contents: read`, `pages: write`, and `id-token: write`, not a checked-in personal token. In **Settings → Pages**, choose **GitHub Actions**. A maintainer can use **Actions → Publish classroom website → Run workflow** to publish again.

Documentation and source notes outside `dist` are available through the repository, not as student-facing pages. Updating documents also triggers the publishing workflow.

## Image updates

Check both the source photo’s licence and the artwork’s underlying rights. Some included public-sculpture photographs rely on a documented panorama exception; those artworks are not claimed to be public domain. Preserve that distinction. Match a photo to its actual work: an alternate sculpture is not a substitute image for a famous painting.

Add local image data to an artist’s `gallery` array with `path`, `title`, `date`, `alt`, `credit`, `source`, `license`, `licenseUrl`, and `changes`; include `rightsBasis` where relevant. A portrait uses the `portrait` object. Update IMAGE-CREDITS.json, IMAGE-CREDITS.md, dist/credits.txt, inventory coverage, permissions gaps, README, this handover, and tests to the new verified totals.

The current tests deliberately expect 51 artists, 42 portraits, and 28 work images, and guard selected corrected dates. Revise counts when an authorised content expansion changes them; do not weaken checks to bypass an unexplained failure.

## Classroom operation

Use **Teacher desk & credits** to inspect sources, permissions, privacy notes, and image content. Clear this tab’s notebook/discoveries between groups after exporting any work to keep. This clears Art in Context’s keys, not other applications on the same host.

Read-aloud selects only installed local English voices. Its absence does not hide the text. Install an offline voice through the device’s normal settings if needed; no microphone or camera is used. Artist-name pronunciation may need teacher support.

The site is public and does not control the address bar or other tabs. Follow school policy for kiosk/guided access or restricted hosting. Check device download policies before asking pupils to export notes. The hosted version has no guaranteed offline cache; a downloaded copy served locally can operate without an internet connection.

The content addresses race, inequality, cultural representation, war, anxiety, and public debate in non-graphic educational language. The Dalí sculpture photograph includes nonsexual figurative anatomy. Preview the collection for the particular class. Indigenous cultures are described as living and distinct; briefs ask for students’ own symbols rather than copying sacred imagery.

## Troubleshooting and rollback

| Problem | Check |
| --- | --- |
| An update is missing | Confirm the commit reached `main`, inspect Actions, then refresh the live page. Ensure student-facing edits are under `dist`. |
| A deployment fails | Open the failing workflow step and run the validation command locally. Check the Pages source setting and the actual error before rerunning. |
| An image fails to load | Check the committed filename, exact case, relative path, and source record. GitHub Pages is case-sensitive. |
| Search returns nothing | Reset both the perspective and medium filters; search ignores accents but still matches the chosen filter combination. |
| Read-aloud is disabled | Check whether the device offers a local English voice. Remote voices are intentionally excluded. |
| Notes disappear | They belong to the current browser tab/session, not an account. Export a copy; there is no server backup. |
| Export is blocked | Check school-managed browser download settings and the device’s Downloads folder. |
| A pupil leaves the site | Use device-level restrictions; the website itself cannot prevent other-tab or address-bar browsing. |

To undo a bad update, review the faulty commit and make a new revert commit, then let the same workflow publish it. Do not force-push or rewrite shared history as a routine rollback. The earlier Grade 1 repository should not be changed as part of this site’s maintenance.

## Known limits and next priorities

1. Obtain permissions for the 23 missing artwork images and nine missing portraits, retaining all credit evidence. Banksy is intentionally anonymous.
2. Check notebook downloads, local voices, touch behaviour, and school restrictions on actual classroom devices.
3. Consider additional teacher-reviewed visual analysis questions and lesson sequences after classroom feedback.
4. Keep dates and sources current, and preserve explicit uncertainty rather than inventing an exact birth or creation year.

See TEST-REPORT.md for the checks completed during delivery and any remaining verification limits. The supporting files are linked from README.md.
