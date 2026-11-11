# Fairway & Folly audio

Foley source: Kenney, **Impact Sounds (1.0)**, Creative Commons Zero / CC0.
Original: https://kenney.nl/assets/impact-sounds
Download mirror: https://github.com/GeorgeQLe/assets-sfx-combat/tree/main/assets/kenney/impact-sounds
Original license: kenney/LICENSE.txt

Included originals: three soft impacts, two grass footsteps, one snow footstep,
one generic light impact, wood light, metal light and tin medium. These are foley
building blocks, not claimed to be recordings of golf. Local WAV derivatives
trim leading silence/tails and convert to mono 24kHz; runtime adjusts pitch,
filtering and gain for turf/rough/green/sand, strike, bank and cup layers.

Additional oscillators, short noise transients, soft outdoor wind bed and
celebration melodies are original procedural sound design in src/audio.js.
No third-party network requests occur during gameplay. All samples are local.

## Recorded golf contacts — 0.13.0

See [in-game audio credits](credits.html) for source and license links.

- Scottrex05 — Driver hitting golf ball.wav, Freesound 593483, CC0. Original: golf/driver-scottrex05.mp3.
- CGEffex — Golf.wav, Freesound 98334, CC BY 4.0. Actual six-iron contacts used for the iron family. Original: golf/iron-cgeffex.mp3.
- Bluesy1905 — HSN golf pitch.wav, Freesound 349325, CC BY 3.0. Wedge contact used for both wedges. Original: golf/wedge-bluesy1905.mp3.
- 170129 — putt.wav, Freesound 408260, CC0. Three putting contacts. Original: golf/putter-170129.mp3.
- Christophe / BigSoundBank — Golf swing, with a wooden club, 0455, CC0. Wooden-club substitute for hybrid, not an identified hybrid recording. Original: golf/wood-christophe.mp3.

Derivatives crop contacts into 0.4-second mono 24kHz WAVs, filter and level them, and fade tails. Driver uses 75–6200Hz; other contacts use 80–6500Hz. Runtime applies slight variation, gain and low-body layers. Driver at 97–100% adds a stronger transient/body. No metallic strike oscillator. Kenney wood foley remains a loading fallback; surface/cup foley is unchanged.

## Recorded golf cup drop — 0.18.0

Scottrex05 — **Golf ball in hole.wav**, Freesound 593482.
Source: https://freesound.org/people/Scottrex05/sounds/593482/
License: CC0 1.0, as declared on the source page. Original public preview retained as `golf/cup-scottrex05.mp3`.
`golf/cup-drop.wav` crops the first real cup contact (1.01–2.06 seconds), converts to mono 24kHz, filters below 60Hz/above 10kHz and applies short boundary fades. No synthetic metallic ringing is layered over the recording. Playback is synchronized to the ball falling through the rim.

- `nature/blackbird.mp3` uses [Common blackbird singing denoised](https://commons.wikimedia.org/wiki/File:Common_blackbird_singing_denoised.flac) by tinga, CC0 1.0. Mixed to mono, filtered, and faded.
