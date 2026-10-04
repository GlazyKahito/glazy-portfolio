# GLAZY: the experience

Design notes for the cinematic rebuild (September 2026) and the agency relaunch (October 2026): what it is, why it is built this way, where the footage comes from, and how to extend it.

## Art direction

- **A short film, not a scrolling page.** One full-screen scene at a time. Nothing of the next scene shows until you travel to it.
- **Real places, real light.** Every chapter sits on 4K footage with a cinematic grade: darker where text sits, never a flat overlay.
- **Apple-quiet interface.** Frosted panels, one serif, generous space, motion with long expo easing. No glitch effects outside the transitions.
- **Type.** Instrument Serif at poster sizes (with a true italic for accents), Geist for reading, Geist Mono for small labels.

## The journey

| # | Chapter | Footage | Arrives with |
| --- | --- | --- | --- |
| 00 | GLAZY (the opening) | Depth poster from the dusk clip | The loader's letterbox opening; the wordmark rises from behind the ridge |
| 01 | What we make | Sunset over the sea | A glitch cut: bands tear in, RGB tear bars, a title on a bad signal |
| 02 | The work (5 scenes, sideways) | A city at dusk from high above, a red horizon | An iris; projects swing in in 3D behind a sweep of their colour |
| 03 | In the works | The Milky Way over a dark ridge | Shutter blinds opening in a wave |
| 04 | The founder (3 scenes, sideways) | Sunset over a bay of islands | A film burn |
| 05 | The toolkit | A road at golden hour, from above (graded warm) | Opening doors |
| 06 | Start a project (2 scenes, sideways) | An aircraft wing at dusk | A mosaic |

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

## The depth poster

The opening borrows from editorial posters where the title stands between the background and a cut-out foreground. A 4K frame of the dusk clip is split by `public/scenes/` into `glazy-sky-*.webp` (the sky, with the mountains painted out so the planes can slide past each other without a seam) and `glazy-ridge-*.webp` (the ridge and lake, cut out along the silhouette). `DepthPoster.tsx` stacks sky, a low sun, the wordmark, haze and the ridge on a 16:9 stage that covers the screen, so the letters stay locked to the ridge at any size. The planes drift in a slow dolly and follow the pointer at different depths; lite mode and reduced motion keep it still.

## Transitions

Glitch, shutter, film burn and mosaic are GSAP timelines in `SceneDeck.tsx` over three overlays (tear bars and scanlines, a light leak, a 16×9 block grid). The glitch only ever adds bands, so it never strobes, and colour breaks happen on two frames only. Reduced motion replaces every chapter transition with a crossfade.

## Footage credits

All clips are from Mixkit under the [Mixkit Stock Video Free License](https://mixkit.co/license/#videoFree): free for commercial use, no attribution required (credited anyway). Re-encoded to seamless 4K H.264 loops without audio.

| File | Clip |
| --- | --- |
| `sea` | [Stunning sunset seen from the sea](https://mixkit.co/free-stock-video/stunning-sunset-seen-from-the-sea-4119/) |
| `citydusk` | [Tour high above a city at dusk](https://mixkit.co/free-stock-video/tour-high-above-a-city-at-dusk-41375/) |
| `nightridge` | [Milky Way seen at night](https://mixkit.co/free-stock-video/milky-way-seen-at-night-4148/) (denoised, warmed) |
| `bay` | [Beautiful sunset on a bay from above](https://mixkit.co/free-stock-video/beautiful-sunset-on-a-bay-from-above-4999/) |
| `goldroad` | [Natural landscape with a road at sunset](https://mixkit.co/free-stock-video/natural-landscape-with-a-road-at-sunset-50267/) (darkened, warmed) |
| `flight` | [Panorama from the window of an airplane at dusk](https://mixkit.co/free-stock-video/panorama-from-the-window-of-an-airplane-at-dusk-40102/) |
| `dusk` | [Landscape of a lake during a red sunset](https://mixkit.co/free-stock-video/landscape-of-a-lake-during-a-red-sunset-5002/) |

## Higgsfield prompts (optional, manual)

Higgsfield was not used: its pricing and free tier could not be verified from here, and generation needs a signed-in account. If you want original footage instead of stock, generate these on the free tier yourself, export at the highest free resolution, and drop them in as new `footage` entries (see AGENTS.md for the encoding recipe). Keep clips 8 to 12 seconds, no text, no people's faces, no logos.

1. **Services (the opening is now a depth poster).** "Slow cinematic dolly over a calm sea at sunset, sun touching the horizon, long golden reflection on gentle swells, thin clouds lit orange and magenta, anamorphic lens, soft film grain, 16:9, 10 seconds, locked horizon, no people."
2. **The work.** "Aerial drone glide over a dense modern city at night, glowing office windows and cool blue building edges, light traffic streaks below, slow forward motion, moody teal and amber grade, 16:9, 10 seconds."
3. **In the works.** "Time-lapse of the Milky Way rotating over a perfectly still mountain lake, stars reflected in the water, faint horizon glow, deep blue night, static tripod shot, 16:9, 12 seconds."
4. **The founder.** "Sunrise over a misty valley, layers of fog between hills, first warm light spilling across the mist, very slow push-in, soft pastel grade, 16:9, 10 seconds."
5. **The toolkit.** "Drone flight along a lush green canyon with a river at the bottom, morning light, forward motion following the river, natural greens, 16:9, 10 seconds."
6. **The opening and case-study headers.** "Wide shot of a lake between dark mountains at dusk, red sky reflected in still water, gentle ripples, locked-off camera, 16:9, 12 seconds."
7. **Start a project.** "View from an aircraft window at dusk, wing silhouetted against an orange-violet horizon, slight turbulence, clouds far below, 16:9, 10 seconds."

## Mr. Nimbus

Mr. Nimbus is the office cat (Krutik's own: a black-and-white tuxedo, and a gentleman) and the site's guide. His portrait (`public/nimbus/`) is his own photo, colour-corrected and cut out onto a warm backdrop.

- **On Vercel, with nothing to configure**, his replies come through the Vercel AI Gateway, signed in with the deployment's own OIDC token: Gemini Flash-Lite first, then a zero-cost model if the credits run out. **With `GEMINI_API_KEY` set**, Gemini is called directly first. Either way the route is `app/api/nimbus/route.ts` and he is grounded only in the site's own data (`lib/server/nimbus-brain.ts`). The key stays on the server; replies are structured JSON (reply plus an intent that picks the follow-up buttons); history is capped at 12 turns, 600 characters a message and 20 requests a minute; nothing is stored.
- **If no AI line answers,** he falls back to his guided answers, with the same buttons.
- Jokes are his own and served instantly.
