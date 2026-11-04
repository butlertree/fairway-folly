# Central mini-green revision — November 4, 2026

Full-size golf flags keep the four original placements. The miniature cup is fixed at its own (0,0), independently of those flag locations. Pin-set selection therefore still changes the approach target; it does not shift the miniature cup into a corner.

The final settled full-size landing is measured relative to the selected flag, preserving left/right and short/long direction. The first three feet of proximity map directly to feet on the miniature green. Longer distances compress continuously toward the available radius in that direction. Tiny non-holed landings stay outside the miniature capture radius; a full-shot hole-out still requires the separate regulation-size physical cup test.

Safe-start selection searches near the intended direction and distance, avoiding pools, solid banks, planters, bridge curbs and entire moving-gate sweeps. It no longer moves unrelated approaches to a single fixed lane. The original full-size landing and distance remain recorded in approachLanding, together with the resulting putt distance.

All nine central finishing areas have open short-putt access. Hole 1 places the timed mill on the southern wing, with a curved western bank alternative. Hole 2 has a 0.85-foot central terrace: a four-foot-radius plateau, smooth 3.8-foot run-up, and dry routes on every side. Hole 3 crosses a real flowing-water hazard with a broad curved bridge; the outside western bank offers a dry alternative. Holes 4–9 retain their signature gardens with banks, moving gates and planters moved away from the cup.

Rendered terrace vertices, ball height, slope acceleration, putter/camera height, cup liner and cup-drop animation share mini-surfaces.js. Bridge deck and curbs use the same curved centerline as collision. Newly placed approach balls remain stationary until played; moving putts climb, descend and roll back according to the surface. Tap-in is only offered for a clear direct route, with elevation included in its launch energy.

Private-match snapshots mark greenRevision 2. Legacy completed-hole scores remain complete. Legacy unplayed approaches remap from saved full-size landing coordinates; already-played putting positions migrate relative to the old cup while preserving strokes and history. No backend security or score data is changed by this client migration.
