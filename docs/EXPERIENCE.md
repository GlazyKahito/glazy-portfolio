# GLAZY: the experience

Design notes for the site: what it is, why it is built this way, and where the footage comes from.

## Art direction

- **A short film, not a scrolling page.** One full-screen scene at a time; nothing of the next scene shows until you travel to it.
- **Real places, one light.** Every chapter sits on 4K footage at dusk or the edge of night: a warm horizon and dark silhouettes, graded darker where text sits.
- **A quiet interface.** Frosted panels, one serif, generous space, long expo easing. Glitch effects only in the transitions.
- **Type.** Instrument Serif at poster sizes with a true italic for accents, Geist for reading, Geist Mono for labels.

## The journey

| # | Chapter | Footage | Arrives with |
| --- | --- | --- | --- |
| 00 | GLAZY (the opening) | Depth poster from the dusk clip | The loader's letterbox; the wordmark rises from behind the ridge |
| 01 | What we make | Sunset over the sea | A glitch cut and a title on a bad signal |
| 02 | The work (one scene per project, then Concepts) | A city at dusk from high above | An iris; projects swing in behind a sweep of their colour |
| 03 | In the works | The Milky Way over a dark ridge | Shutter blinds opening in a wave |
| 04 | The founder (3 scenes) | Sunset over a bay of islands | A film burn |
| 05 | The toolkit | A road at golden hour, from above | Opening doors |
| 06 | Start a project (2 scenes) | An aircraft wing at dusk | A mosaic |

Each chapter change also plays that chapter's title card. Going back plays the transition in reverse.

## Rules the deck enforces

- A move always plays to the end (about 1.7 s). Input during it is ignored, and so is the tail of a trackpad flick, so a burst of scrolling moves exactly one scene.
- The Continue prompt appears only once the scene has arrived.
- If a chapter's footage is not ready, its loader holds the door with real buffering progress instead of showing a blank.
- The progress rail and menu list only chapters you have reached.

## Quality and performance

- Everyone gets the 4K master; there is no silent downgrade. The loader warns on software rendering, data saver, slow networks and low-memory devices and offers lite mode (stills instead of video).
- `LagWatch` samples the frame rate after the opening; two slow windows in a row offer lite mode again. The L key toggles it anywhere.
- Only the current chapter's clip decodes; the next one loads ahead. Clips are 5 to 11 MB each and cached for a year.
- Animation is compositor-only (transforms and opacity). Reduced motion gets still frames and crossfades.

## The depth poster

The opening borrows from editorial posters where the title stands between the background and a cut-out foreground. A 4K frame of the dusk clip is split into `public/scenes/glazy-sky-*.webp` (the sky, with the mountains painted out so the planes can slide without a seam) and `glazy-ridge-*.webp` (the ridge and lake, cut along the silhouette). `DepthPoster.tsx` stacks sky, sun, wordmark, haze and ridge on a 16:9 stage that covers the screen, so the letters stay locked to the ridge at any size.

## Transitions

Glitch, shutter, film burn and mosaic are GSAP timelines in `SceneDeck.tsx` over three overlays: tear bars and scanlines, a light leak, and a 16×9 block grid. The glitch only adds bands, so it never strobes. Lite mode and reduced motion use crossfades.

## Footage credits

All clips are from Mixkit under the [Mixkit Stock Video Free License](https://mixkit.co/license/#videoFree): free for commercial use, no attribution required (credited anyway). Re-encoded as seamless 4K H.264 loops without audio.

| File | Clip |
| --- | --- |
| `sea` | [Stunning sunset seen from the sea](https://mixkit.co/free-stock-video/stunning-sunset-seen-from-the-sea-4119/) |
| `citydusk` | [Tour high above a city at dusk](https://mixkit.co/free-stock-video/tour-high-above-a-city-at-dusk-41375/) |
| `nightridge` | [Milky Way seen at night](https://mixkit.co/free-stock-video/milky-way-seen-at-night-4148/) (denoised, warmed) |
| `bay` | [Beautiful sunset on a bay from above](https://mixkit.co/free-stock-video/beautiful-sunset-on-a-bay-from-above-4999/) |
| `goldroad` | [Natural landscape with a road at sunset](https://mixkit.co/free-stock-video/natural-landscape-with-a-road-at-sunset-50267/) (darkened, warmed) |
| `flight` | [Panorama from the window of an airplane at dusk](https://mixkit.co/free-stock-video/panorama-from-the-window-of-an-airplane-at-dusk-40102/) |
| `dusk` | [Landscape of a lake during a red sunset](https://mixkit.co/free-stock-video/landscape-of-a-lake-during-a-red-sunset-5002/) |

## Mr. Nimbus

Mr. Nimbus is the office cat (Krutik's own tuxedo cat) and the site's guide. His portrait in `public/nimbus/` is his own photo, colour-corrected and cut out onto a warm backdrop.

- **AI answers** go through `app/api/nimbus/route.ts`. With `GEMINI_API_KEY` set, Gemini is called directly; otherwise the Vercel AI Gateway is used with the deployment's OIDC token, which needs a card on the Vercel account before the gateway's free credits work. He is grounded only in the site's data (`lib/server/nimbus-brain.ts`). Replies are structured JSON; history is capped at 12 turns, 600 characters a message and 20 requests a minute, and nothing is stored.
- **When no AI answers,** he falls back to guided answers with the same buttons. Jokes are always instant.
