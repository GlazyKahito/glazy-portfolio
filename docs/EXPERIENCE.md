# GLAZY: the experience

Design notes for the cinematic rebuild (September 2026): what it is, why it is built this way, where the footage comes from, and how to extend it.

## Art direction

- **A short film, not a scrolling page.** One full-screen scene at a time. Nothing of the next scene shows until you travel to it.
- **Real places, real light.** Every chapter sits on 4K footage with a cinematic grade: darker where text sits, never a flat overlay.
- **Apple-quiet interface.** Frosted panels, one serif, generous space, motion with long expo easing. No glitch effects outside the transitions.
- **Type.** Instrument Serif at poster sizes (with a true italic for accents), Geist for reading, Geist Mono for small labels.

## The journey

| # | Chapter | Footage | Arrives with |
| --- | --- | --- | --- |
| 00 | Opening | Sunset over the sea | The loader's letterbox opening |
| 01 | The work (6 scenes, sideways) | A city at night from the air | An iris from the Continue button; projects swing in in 3D behind a sweep of their colour |
| 02 | On the bench | Stars over a still lake | A rise |
| 03 | The person (2 scenes) | First light over a misty valley | A zoom-through |
| 04 | The ecosystem | Flying over a green canyon | Opening doors |
| 05 | Work with me (2 scenes, sideways) | A lake at dusk | A sideways slide |
| 06 | Say hello | An aircraft wing at dusk | A diagonal wipe |

Every chapter change also plays that chapter's title card with its own small emblem. Going back plays the departing chapter's transition in reverse.

## Rules the deck enforces

- A move always plays to the end (about 1.7 s). Input during it is ignored, and so is the tail of a trackpad flick afterwards, so a burst of scrolling moves exactly one scene.
- The Continue prompt only appears once the scene has arrived and played in.
- If a chapter's 4K footage is not ready when you reach it, its loader holds the door (with real buffering progress) instead of showing a blank.
- The progress rail and menu list only chapters you have reached.

## Quality and performance

- Everyone gets the 4K master; there is no silent downgrade. The loading screen checks for software rendering, data saver and slow connections, warns plainly, and offers lite mode (still frames instead of video).
- `LagWatch` samples the frame rate after the opening; two slow two-second windows in a row offer lite mode again. The L key toggles it anywhere.
- Only the current chapter's clip plays; the next chapter's loads ahead. Clips are about 5 to 13 MB each and cached for a year.
- Reduced motion (an OS setting) gets still frames and short transitions.

## Footage credits

All clips are from Mixkit under the [Mixkit Stock Video Free License](https://mixkit.co/license/#videoFree): free for commercial use, no attribution required (credited anyway). Re-encoded to seamless 4K H.264 loops without audio.

| File | Clip |
| --- | --- |
| `sea` | [Stunning sunset seen from the sea](https://mixkit.co/free-stock-video/stunning-sunset-seen-from-the-sea-4119/) |
| `city` | [Movement in a city at night in an aerial shot](https://mixkit.co/free-stock-video/movement-in-a-city-at-night-in-an-aerial-shot-42343/) |
| `stars` | [Night sky with stars at a calm lake, time-lapse](https://mixkit.co/free-stock-video/night-sky-with-stars-at-a-calm-lake-time-lapse-1704/) |
| `dawn` | [Beautiful sunrise landscape](https://mixkit.co/free-stock-video/beautiful-sunrise-landscape-1944/) |
| `canyon` | [Fly over a huge canyon covered in vegetation](https://mixkit.co/free-stock-video/fly-over-a-huge-canyon-covered-in-vegetation-41401/) |
| `flight` | [Panorama from the window of an airplane at dusk](https://mixkit.co/free-stock-video/panorama-from-the-window-of-an-airplane-at-dusk-40102/) |
| `dusk` | [Landscape of a lake during a red sunset](https://mixkit.co/free-stock-video/landscape-of-a-lake-during-a-red-sunset-5002/) |

## Higgsfield prompts (optional, manual)

Higgsfield was not used: its pricing and free tier could not be verified from here, and generation needs a signed-in account. If you want original footage instead of stock, generate these on the free tier yourself, export at the highest free resolution, and drop them in as new `footage` entries (see AGENTS.md for the encoding recipe). Keep clips 8 to 12 seconds, no text, no people's faces, no logos.

1. **Opening.** "Slow cinematic dolly over a calm sea at sunset, sun touching the horizon, long golden reflection on gentle swells, thin clouds lit orange and magenta, anamorphic lens, soft film grain, 16:9, 10 seconds, locked horizon, no people."
2. **The work.** "Aerial drone glide over a dense modern city at night, glowing office windows and cool blue building edges, light traffic streaks below, slow forward motion, moody teal and amber grade, 16:9, 10 seconds."
3. **On the bench.** "Time-lapse of the Milky Way rotating over a perfectly still mountain lake, stars reflected in the water, faint horizon glow, deep blue night, static tripod shot, 16:9, 12 seconds."
4. **The person.** "Sunrise over a misty valley, layers of fog between hills, first warm light spilling across the mist, very slow push-in, soft pastel grade, 16:9, 10 seconds."
5. **The ecosystem.** "Drone flight along a lush green canyon with a river at the bottom, morning light, forward motion following the river, natural greens, 16:9, 10 seconds."
6. **Work with me.** "Wide shot of a lake between dark mountains at dusk, red sky reflected in still water, gentle ripples, locked-off camera, 16:9, 12 seconds."
7. **Say hello.** "View from an aircraft window at dusk, wing silhouetted against an orange-violet horizon, slight turbulence, clouds far below, 16:9, 10 seconds."

## Nimbus

Nimbus is Krutik's cat and the site's guide. Today it recognises what visitors ask about (a website, hiring, a project by name, the stack, contact, availability) and answers from `data/`, with buttons that do the thing. Anything else gets an honest "AI is being linked to me soon". To connect a model later, replace `answer()` in `components/ui/Nimbus.tsx` with a call to a server route that holds the API key (never expose it to the client) and keep the guided replies as the fallback.
