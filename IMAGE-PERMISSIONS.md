# Reproduction coverage and outstanding permissions

All 51 artists have substantial written profiles, media, career timelines, at least two significant-work studies, social and historical context, source references, reflection prompts, and a quiz. Actual artwork images are included for 28 artists; 23 artists currently have written studies without an artwork reproduction. Artist portraits are included for 42; nine profiles use initials or an anonymous symbol.

The site does not pretend this is complete imagery. A photograph of a modern artwork is not treated as freely reusable solely because its photographer selected a Creative Commons licence. No screenshot of an unlicensed work, classroom poster image, or pupil artwork was substituted.

## Artwork reproductions still needed

- Jonathan Green
- Banksy
- Frida Kahlo
- Loïs Mailou Jones
- George Rodrigue
- Yayoi Kusama
- Andrew Wyeth
- Heather Galler
- Annie Leibovitz
- Andy Warhol
- Wayne Thiebaud
- Norval Morrisseau
- Mark Rothko
- Elizabeth Catlett
- Faith Ringgold
- Amy Sherald
- Jacob Lawrence
- David Hockney
- Ted Harrison
- René Magritte
- I. Rice Pereira
- Jackson Pollock
- Jean-Michel Basquiat

## Artist portraits not included

- Jonathan Green — no suitable reusable portrait was verified.
- Banksy — identity unconfirmed; intentionally anonymous.
- Dorothea Lange — no suitable reusable portrait was verified.
- Heather Galler — no suitable reusable portrait was verified.
- Wayne Thiebaud — no suitable reusable portrait was verified.
- Norval Morrisseau — no suitable reusable portrait was verified.
- Mark Rothko — no suitable reusable portrait was verified.
- Elizabeth Catlett — no suitable reusable portrait was verified.
- Ted Harrison — no suitable reusable portrait was verified.

## Complete an image slot

Obtain a file with a documented licence or explicit permission covering the proposed public school website. Keep permission evidence and required credit. Where a work is still copyrighted, verify both the photograph’s licence and the underlying artwork’s reproduction basis. Record any reliance on public-art panorama rules without claiming the artwork itself is public domain.

Save the local file in `dist/assets/`. Add a record to the artist’s `gallery` array in `dist/artists.js` with `path`, `title`, `date`, `alt`, `credit`, `source`, `license`, `licenseUrl`, and `changes`. Include `rightsBasis` and a teacher content note where relevant. Add the matching IMAGE-CREDITS.json entry and update IMAGE-CREDITS.md and dist/credits.txt. Update coverage counts in the README, handover, inventory, and tests.

If an available licensed image is a different work from the famous examples discussed, preserve its actual title and date. Do not caption an alternate sculpture as the artist’s better-known painting. Some representative works and series have no verified single creation date; the site says so.
