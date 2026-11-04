# Changelog

## 0.2.0 — October 30, 2026

- Preserved original handoff as local git baseline; Prototype 13 unchanged.
- Added playable par-four, timed power/accuracy, club/aim controls, curved flight, bouncing, terrain slopes and surface-sensitive rolling.
- Added central pond and left lay-up option, visible exact OB boundary, replay penalties and settled-only green transition.
- Added mapped mini-green, pullback preview, bank putts, bumpers, water, continuously simulated vertical windmill blades on the hole and honest cup drop.
- Added ball-follow and inspect cameras, phone framing, restart guards, VS Code workspace and reproducible dependencies.
- Added 17 regression/integration tests and documented verification limits.

### Player feedback revision

- Moved the windmill onto the actual mini-green with a playable opening, physical support columns and vertical blade contacts.
- Replaced geometric water patches with shared organic shorelines, animated water and shallow/deep colouring.
- Added numeric putting power, estimated rollout, direct power selection and camera-independent drag strength.

## 0.3.0 — October 30, 2026

- Made the freely positioned inspection camera playable, with independent camera/aim modes, optional hidden controls, and orientation preserved on green transition.
- Unified the full-hole geometry, physics and yardage with a true 360-yard tee-to-pin layout. Resized flag, ball and green; calibrated a full straight driver to about 245 yards of carry and 268 yards including roll.
- Added a separate, flat tee box, tee markers and a visible tee under the ball.
- Fixed pond/turf intersections with a submerged bed and level water; removed overlapping grass layers and trimmed the stream to the island.
- Separated rising power from centered accuracy: live percentage, percentage-labelled button, estimated carry, locked power readout and explicit accuracy instructions.
- Converted all player-facing distances to feet or yards.
- Expanded regression coverage to 21 tests, including driver range, real hole distance, tee surface and pond-bed checks.

### Score panel stability

- Fixed score-panel column widths and tabular numerals so live distance updates cannot resize or shift the card.
- Removed ball-position tracking from the putting camera; the mini-green keeps one framing throughout a putt.

## 0.4.0 — October 30, 2026

- Added a real cup opening, lip and dark interior, a 1.5-second ball-centering/drop animation, close-up finish camera, score celebration/confetti and replay button.
- Added counted tap-in putts within 8 feet; distant/moving balls cannot use them.
- Replaced camera/aim mode buttons with direct gestures: drag to rotate, click to aim, pull from the ball to putt.
- Added high-contrast planned aim lines, labelled carry targets, OB warnings, visible sky-view ball markers and actual flight trails. Phone sky framing keeps the ball above the controls.
- Increased power/accuracy meter speed and retained clear percentage/strike feedback.
- Expanded regression coverage to 29 tests.

## 0.5.0 — October 30, 2026

- Replaced aim lines with target discs and a small contrasting direction arrow; old trails disappear once the ball rests.
- Kept the mini-green artwork while making it play as an 18 × 30-foot hole; remapped putting power for 20 feet at roughly 50%, gentle low-power control and strong 60-foot bank shots.
- Added half-percent putting adjustment and longer pullback travel for phones; enlarged touch targets and checked the four-club layout at 390×844.
- Added a 55-yard high-loft sand wedge with better sand carry retention and lie-aware carry estimates.
- Replaced the swing-power easing curve with a steady-speed sweep so 100% requires precise timing.
- Added a brighter two-sided red/white flag, striped pole and PIN marker.
- Added original synthesized game sounds, a persistent mute toggle and background-tab suppression.
- Expanded coverage to 36 tests, including short-putt calibration, actual bunker escape, power-peak timing and one-time sound events.

## 0.6.0 — November 1, 2026

- Simplified putting to one gesture: touch the ball, pull back/sideways, release. Removed the putting aim slider, strength slider and separate hit button.
- Added a behind-ball putting camera that holds still during the pull and roll, avoids the windmill roof and looks through the arch when needed.
- Replaced the dotted guide with a physical putter head and alignment stripe. Removed the mini-green ball halo and disabled depth writes on the invisible input plane.
- Added a compact, read-only drag-strength indicator and retained optional tap-ins.
- Verified actual desktop and phone-sized drag/release shots; expanded regression coverage to 40 tests.

### 0.6.1 — short-approach visibility

- Improved moving-ball size, follow-camera tracking and flight/rolling labels for short approaches.
- Added a brief settled landing phase before the mini-green reveal.
- Added a repeatable 38-yard pitch regression and verified its flight, landing and reveal in the browser.
- Started a stable production preview on local port 4173, separate from the developer server that reloads when files are edited.

## 0.7.0 — Cascade Reach, November 1, 2026

- Added hole 2: a 520-yard par 5 with broad left layup islands and a narrow central two-shot route over water. All routes use the existing flight, landing and penalty simulation.
- Added an arched wooden bridge green with slope gravity, rail rebounds, exposed-stream penalties and an animated waterfall spilling over the island edge.
- Added Next hole progression, carried scorecards, current-hole restart and direct practice at `http://127.0.0.1:4173/?hole=2`.
- Preserved hole-one windmill and all previous physics regressions. Fixed distant water/shore depth flicker.
- Passed 47 tests and production build. Visually checked desktop course/green and phone-sized putting; real desktop and phone pull/release putts crossed the bridge and entered the cup. Real iPhone Safari was not available.

### November 2 — larger landing areas, clearer overview

- Enlarged both safe islands to roughly twice their previous area and the central risk island to nearly three times its previous area; visible turf and collision use the same dimensions.
- Removed route note banners and overview aim text. Replaced ball/pin text labels with small symbols; the ground aim marker remains visible.
- Revalidated the three-shot safe route and two-shot central route after changed landing physics. The central route now uses full driver for the second test shot. All 47 regressions and production build pass.

## 0.8.0 — sculpted islands and hole navigation, November 2

- Added deep, layered island cliffs, wooded perimeter hills, pine/broadleaf groves, richer lighting and correctly framed elevated terrain on both holes.
- Hole one now has a raised tee, raised green and rolling fairway terrain. Hole two has ascending landing shelves and a higher green overlooking the lake. Terrain height remains shared with ball flight/bounce/roll; retained enlarged islands.
- Added accessible Choose hole selector on desktop and phone. Switching keeps each hole's current game in memory within the open session and updates its direct URL. Sequential Next hole flow still carries round scores. Refresh starts a fresh game.
- Passed 48 physics/regression tests, including new elevation assertions, both complete tee-to-cup routes and safe-three/risky-two par-five routes. Browser verified both scenes, switching, retained club selection and 390×844 selector/layout.

## 0.9.0 — course-first controls, November 2

- Removed the large title and default shot panel from play. Menu contains hole choice/restart/sound; Play shot opens the controls on demand. Controls hide during flight/roll, overview recenters when closed, putting uses a small bottom gesture/power hint.
- Added island distances from current ball and one-click aim for each island; Aim at pin lines up the approach. Enlarged full-course flag and added clear red/white PIN/CUP beacons.
- Replaced the compressed putting-entry band with a wider, approach-quality-based mapping: close approaches start close to cup, outer-green landings start further away with lateral variation. Preserve actual approach landing data and avoid starting in pools or solid obstacles.
- Prolonged full-course rolling plays at 3× then 6× speed; physical integration, path, penalties and final lie remain unchanged. Flight and mini-green putting remain normal speed.
- 50 tests and production build pass; real browser checked clear desktop/mobile overview, yardage aiming, menu and pull/release putting.

## 0.10.0 — target markers, hybrid and real cup, November 2

- Tapping the course leaves a persistent target ring and one compact yardage marker. Heightfield ray intersection matches raised islands; island aim buttons also set the same target. Yardage is distance to the selected point, not a guaranteed carry prediction.
- Added Hybrid (200yd carry) between Driver (245) and 7 iron (155).
- Each settled full shot and penalty replay automatically aligns toward the pin and clears the previous target. Player selection overrides that direction until the next shot finishes.
- Terrain-aware follow camera clears nearby slopes and pulls back for steep uphill approaches. Full-course ball uses a minimum readable screen size and remains visible over terrain; mini-green ball retains normal depth occlusion for cup entry.
- Replaced gold-edged dark opening with recessed white cup liner, soil/turf cut edge, depth shading, bottom socket/drain details. Capture opening and scoring unchanged.
- 55 tests and build pass. Desktop/390×844 landing taps, hybrid selection, uphill camera and counted tap-in/cup finish visually checked.

### 0.10.1 — movable behind-ball camera

- Enabled orbit, zoom and pan in behind-ball view for full golf and putting. User-adjusted views remain in place instead of being overwritten every frame.
- Added Reset camera (compact reset arrow on phone). Full shots still follow their flight; cup animation retains its close-up.
- Camera drags do not change aim. Pulling from the mini ball temporarily disables camera controls, then releases exactly one putt. A second pointer cancels a pending ball pull rather than accidentally firing it.
- 55 regressions/build pass. Real desktop rotate/zoom/reset, unchanged zero-degree aim/zero strokes, and a counted putt from a manually rotated view verified. Phone-size reset layout checked; physical multi-touch not available.

## 0.11.0 — satisfying finishes and crisp impacts

- Added 14px separation between primary finish action and Play hole again, plus space before score totals.
- Rebuilt synthesized swing/putt impacts with transient clicks, short resonant body and low impact weight. Cup finish now layers a decaying liner rattle, hollow resonance and bottom drop.
- Earned eagles trigger a bald-eagle swoop; birdies trigger a smaller songbird fly-in, with matching chirps. Original SVG artwork and CSS wing animation; reduced-motion preference uses a gentle fade.
- Added score-gated eagle/birdie audio events once on legitimate completion; muted/hidden-tab handling preserved.
- 56 tests/build pass. Browser verified actual 3-stroke eagle and 4-stroke birdie via counted putts, fly-in elements, desktop/phone button gaps and sound toggle. No subjective audio audition claimed.

### 0.11.1 — illustrated tee plaques

- Replaced blank tee boards with framed ivory/green/gold course plaques on both holes, including original island-and-flag crest, The Verdant Isles course name, hole number, par and yardage. Hole two also names Cascade Reach.
- Both faces carry correctly oriented lettering, with wooden support posts. Kept the plaques outside the shot line and used a local high-resolution canvas texture with no external artwork/font fetches.
- Production build and existing 56 regressions pass; both tee scenes inspected in browser.

## 0.12.0 — surface foley, clear shot risk and a proper putter

- Investigated sound sources; added Kenney Impact Sounds CC0 foley with original license and provenance. Trimmed local mono WAV derivatives load once after a gesture; no third-party requests during gameplay.
- Turf/rough/green/sand landings now emit distinct physical-contact events with impact-strength thuds and varied foley layers. Added dry recorded bank/cup layers, subtle wind and a master peak limiter. Club strikes have separate driver/hybrid/iron/wedge/putter profiles and power-based weight; removed metallic strike layers/high ringing tones.
- Added development sound comparison page at `http://127.0.0.1:5173/?soundcheck` for auditioning each effect independently.
- Removed floating predicted Out of bounds label. Full-power boundary risk now appears explicitly in shot controls, separately from the selected target/current lie.
- Replaced block-and-stick putter with bevelled metal head, face insert/grooves, raised alignment mark, curved hosel, steel shaft and rubber grip. Pull/release mechanics unchanged.
- 59 tests/build pass; all 10 PCM clips validated and decoded in browser. Compared driver/iron playback paths, verified warning clears with shorter club, and counted a putt with the new model.

### 0.12.1 — clear putter facing and audible fly-ins

- Reshaped putter into a front blade with distinct open rear cavity/heel-toe weights. Removed rear plate that looked like a second striking face. Centralized pose and verified the grooved local −Z face stays at ball contact for all aim directions.
- Birdie now plays clear modulated chirps; eagle has a substantially louder, lower, raspier procedural call. Delayed call timing to the visible fly-in (about 1–2 seconds after completion), rather than sounding while the bird is still offscreen.
- Added birdie/eagle audition buttons to DEV sound check. 60 tests/build pass; browser call playback paths had no errors; actual drag putt still counted once.

## 0.13.0 — upright tees, recorded contacts and river outlet

- Both tees start upright looking down the hole; free camera remains available. Removed hovering ball HUD dot.
- Separate recorded driver, iron, wedge and putter contacts; wooden-club substitute for hybrid. Stronger driver smash at 97–100%. In-game audio credits included.
- Extended hole-one river over the island edge with waterfall/foam; embedded rocks on supported terrain.
- 65 tests and production build pass. Both desktop tees and waterfall inspected; all 19 sound clips decoded and impact playback paths ran without errors.

## 0.14.0 — Kingfisher Cove and richer putting islands

- Added hole 3, Kingfisher Cove: 165-yard par 3, island green, sculpted hills, wrapping lake, pale hillside path and stone-gate putting challenge. Menu and next-hole progression now cover a three-hole round.
- Replaced plain putting boards with textured turf, planted island surrounds and layered banks; holes 1/3 have curved corner banks with matching collision geometry. Hole 2 retains its bridge/stream opening.
- All tee boxes have bevelled raised grass edges; Cascade Reach now has a raised level terrain shelf. Revalidated safe/risk routes after the elevation change.
- A slow grounded full shot crossing the actual regulation-size cup can hole out without a putt. High/fast shots and near misses do not capture. Preserves stroke count and animates cup entry; added hole-in-one title.
- 73 regression tests and production build pass, including a complete three-hole scored simulation. Browser checked new tee/overview, live swing/flight, pull-release putt, tap-in/cup completion and 390×844 finish layout.

## 0.15.0 — wind and Kingfisher falls

- Added per-hole 4/6/5 mph breezes with deterministic gentle gusts, physical flight drift/carry, camera-relative wind arrow, mph/gust readout and Menu calm toggle. Putting is sheltered. Calm simulation fixtures remain reproducible.
- Connected Kingfisher lake to a carved spillway and animated waterfall over its shared island cliff; reused the waterfall rendering for both holes. Flags respond to wind.
- Added 60 mini-golf concepts and a recommended waterfall-grotto redesign for Kingfisher; concepts are not represented as implemented obstacles.
- 76 tests/build pass; inspected waterfall and wind HUD in browser, including calm toggle.

## 0.16.0 — three signature putting gardens

- Hole 1, Mill Garden: flowering planters, stone bank route, mill cottage, turning waterwheel and overflow waterfall. Existing timed windmill remains a physical obstacle.
- Hole 2, Moon Garden: pavilion, stone lanterns, planted rock gardens, angled banks, detailed moon-bridge rails and animated spillway. Bridge and stream-side routes remain playable.
- Hole 3, Waterfall Grotto: mossy rock arch with a playable tunnel, side route, overhead stream and waterfall pool hazard. Removed generic stone discs. Roof fades when it intersects the camera sightline; address camera stays below the tunnel ceiling.
- Shared circle/capsule data drives garden obstacle rendering, collision and safe approach placement. Kept original scoring, full-shot hole-outs, cup animation and pullback controls.
- 81 tests/build pass. Completed a real pull/release putt through the grotto to the cup in desktop and 390×844 browser views. All three scenes inspected without console errors.

## 0.17.0 — family playtest, rotating cups and responsive shot timing

- Added Play Course setup, named three-hole rounds, correct live/completed totals, device-local family leaderboard and cross-device scorecard links/import. Rankings filter by matching conditions and cup layout; no live server synchronization is claimed.
- Calm/Windy/Stormy presets now control gusts, flag motion, drifting clouds, storm lighting and lightweight rain. Reduced-motion preference suppresses animated weather effects.
- Four safe fixed cups per green rotate between new rounds and remain fixed during play. Physical flags, aim, yardage, green-entry mapping, cup meshes/cutouts, camera, tap-ins and full-shot hole-outs share the chosen position.
- Double/triple/quadruple bogey names, disappointed sound, and playful encouragement replace inappropriate celebrations. Round Even par wording replaces Round E.
- Meter animation uses compositor transforms and direct press timestamps; scenery stays memoized instead of rebuilding with HUD refreshes. Fixed stale Start Swing disabled state and stale club carry text after motion/club changes. Rolling playback now eases gradually to 2.5× rather than jumping to 3×/6×.
- Fixed grotto ball visibility with complete canopy cutaway based on the actual ball, plus a lower exit camera.
- Added GitHub Pages workflow and base-aware asset/audio URLs. Public repository creation/push/Pages authorized by Chris on November 2, 2026. Local original history and handoff are retained.

## 0.18.0 — November 2, 2026

- Smoothed ball rendering between fixed physics ticks and eased camera position and look target together. Disabled orbit damping during automatic full-shot tracking to prevent competing camera movement.
- Moved live putting power and estimated distance to the top of the phone screen while pulling; hid the lower hint during the gesture.
- Raised the grotto address camera and cut away obstructing roof/support scenery, retaining low bank footprints.
- Replaced synthesized cup contact with a CC0 recording of a real golf ball entering a cup, synchronized to the rim drop.

## 0.19.0 — November 2, 2026

- Added original holes 4–6: Amberlight Bluff (390-yard par 4), Willowspire Reach (535-yard par 5), and Starfall Sanctuary (142-yard par 3). Each has raised tees, sculpted terrain, broad landing areas, shared water boundaries, bunkers, landmarks and a cliff waterfall.
- Added Tideglass Garden, Clockwork Orchard and Starlight Labyrinth miniature greens with distinct scenery, timed physical gates or crescent bank lines, pools, four cup positions and camera-safe low obstacles.
- Play Course now offers 1–6 holes, with matching par/yardage, correct final-hole behavior and scorecard sharing. Leaderboards compare equal-length rounds; existing three-hole scores are preserved.
- Added route/width/water/gate/cup/scorecard tests and extended the full integration playthrough to six holes. Research scope, primary sources and original design decisions are in docs/HOLES_4_TO_6_DESIGN.md.

## 0.20.0 — November 2, 2026

- Replaced all coarse painted bunker patches with smooth, sculpted sand bowls, clean cut grass lips, subtle raked-sand texture and deeper pot variants. Eighteen bunkers now span the six holes, adding nine hazards while retaining tested safe routes.
- Bunker outlines, sand lies and depressed ball-contact surfaces share one data set. Detailed collars join the interpolated terrain mesh; masked underlying grass cannot poke through the sand.
- Repositioned Kingfisher's small bunkers to clear both water and green; kept the larger landing shelves open. Calibrated sand-wedge distance retention for the new depressed lies.
- Added coverage for all bunker boundaries, depth/floor/lip continuity, every pot's lofted escape, and terrain collar joins.

## 0.21.0 — November 3, 2026

- Simplified the phone HUD to one slim score strip; moved reset/wind away from the flag and placed detailed round information in Menu. While pulling a putt, optional HUD panels disappear.
- Replaced the large top putting-power card with a compact side readout that chooses a position clear of the cup, ball and pulling finger, and stays anchored during the gesture.
- Replaced distant fixed overview positions with screen-fitted tee-to-green and miniature views; removed the upward phone camera shift and cleared orbit damping on view changes.
- Added swept physical flagstick contacts, deflections, a short visible staff wobble and dry impact sound, using the staff's rendered dimensions and selected pin placement. Slow grounded cup captures remain possible with the flag in.
- Deferred initial audio activation to a user gesture and added a local favicon.


## 0.22.0 — November 3, 2026

Private two-player matches on Supabase: guest player identities, invitation links, selectable 1–6-hole rounds, fixed weather and pin placement, alternating first player by hole, shared scorecards, settled-shot save/resume, duplicate-safe score submission, winner/tie results and another-match flow. Solo play remains available.

Data tables are private with RLS enabled and no direct client grants. Participant-checked RPCs enforce turn order and revision checks. Browser uses only the publishable key. Guest access stays tied to the browser; live spectating, cross-device account recovery and server-replayed competitive score validation are not part of this private beta.


## 0.22.1 — private design studio (unreleased)

Development-only profile portrait/outfit/badge/scorecard-theme prototypes and Moonlit Garden, Autumn Forest and Snowy Village visual previews on the first three existing holes. Decorations, lighting and seasonal particles are cosmetic. Normal game and multiplayer do not load or expose the studio. Production build now rejects leaked preview UI, styles, storage keys or environment catalogue. No purchases, public profile rollout, golfer character or swing-control replacement.

## 0.23.0 — November 3, 2026

- Parked the design studio and focused normal play on the six existing holes.
- Six distinct curved putting outlines now share rendering, aiming and bank physics. Replaced the grotto with an open cascade garden; fixed bumper-center and bridge-side contacts and cut away foreground scenery that obscures near-wall balls.
- Amberlight Bluff is now a 445-yard right dogleg, 55 yards longer, with additional landing and greenside bunkers. Its lighthouse is 50% larger and embedded in the terrain.
- Willowspire Reach creek now crosses at the foot of the green hill; removed the separate right landing pad and added a fairway bunker. Course total is 2,167 yards, par 24.
- 127 tests pass, including six-hole playthrough, reachable putting regions and edge-rest escape audits.

## 0.24.0 — November 3, 2026

- Reviewed bunkers across all six holes against drive, layup and approach landing zones; moved/resized hazards into play while retaining clear safe routes. Added a bunker to Cascade Reach's risky island.
- Strengthened club-specific sand distance penalties and display the reduced carry on each club button. All deep pots retain lofted sand-wedge exits.
- Club-specific straight accuracy windows now grow progressively from driver to sand wedge, with matching visual feedback and actual shot response.
- Added Seabell Headland (202-yard par 3), Copperpine Bend (460-yard left-dogleg par 4), and Azalea Crown (602-yard par 5), with three original mini gardens and four pin placements each. Nine holes total par 36, 3,431 yards, 35 bunkers.
- Solo rounds, scorecards and private matches support 1–9 holes. Applied the compatible match-length migration; existing match data and security rules preserved.
- Removed overlapping stream/lake water surfaces and excluded decorative landmark trees from water and cliff-edge positions.
