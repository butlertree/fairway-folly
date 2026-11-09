# Fairway & Folly private multiplayer beta

The frontend remains on GitHub Pages. This Supabase project stores private two-player matches, fixed weather/pin settings, scorecards, and settled-shot checkpoints.

## Setup already applied

- Project `bfnbacnqwzarnfyklfkh`, Free, North Virginia.
- Guest (anonymous) authentication enabled with Chris's approval. Email confirmation settings unchanged.
- `multiplayer.sql` applied through the Supabase SQL editor. All data tables live in the non-exposed `ff_private` schema, RLS enabled, no direct client table grants.
- Only five participant-checked RPCs are executable by authenticated players. Unauthenticated API-key holders cannot call them. `security definer` functions use an empty search path and fully qualified application objects.
- The only key in the frontend is the browser-safe publishable key. No database password, secret key, service-role key, or Supabase account session belongs in source control.

## Player experience

Choose **Play with a friend** on the start screen or **Private multiplayer** in Menu. Create a match, choose 1–9 holes, conditions and a pin set, then send the invitation. The first guest to join takes the second seat. Invitations put their random 256-bit secret in the URL fragment, not the query string, and only its SHA-256 hash is stored in the database.

The host plays hole 1, then the guest plays hole 1. The guest starts hole 2, then the host plays hole 2. The first player alternates on every hole. This means the second player on one hole also starts the next hole. Results appear in both scorecards. Lowest total strokes wins. Ties remain ties.

Finish the hole, then choose **Submit hole · View match**. The server locks the match row, records each score once, and advances the turn. Retrying the same submission is idempotent. Saves use a revision check to stop an older tab overwriting newer progress. Polling refreshes the match approximately every 8 seconds while the page is visible; manual refresh is also available. No paid Realtime feature or public data publication is required.

Guest identity is saved in that browser. Return using Menu → Private multiplayer or the match URL. Progress resumes from the last successfully saved settled shot; refreshing during an unsaved/in-flight shot can replay from the prior checkpoint. Changing device/browser, private browsing, signing out, or clearing site data loses guest access. Optional email-linked identities are a future improvement.

## Beta boundaries

This is asynchronous hole-by-hole play, not live shot spectating, push notifications, chat, or public matchmaking. Incomplete opponents' shots are not streamed. The shared match scorecard is online; the separate solo family leaderboard still uses local/imported scorecards.

Physics and stroke counting run on the client. Server checks restrict access, turn order, score ranges, nondecreasing saved strokes, duplicate submissions, and checkpoints, but do not independently replay/validate every shot. This is appropriate for a trusted family test, not a cheat-resistant public tournament.

Guest signup uses Supabase's existing auth rate limits. Before wider release, add bot protection, account recovery/linking, stale-match retention rules, and server-validated scores. This setup does not change the subscription or enable paid add-ons.

## Verification

`npm test` covers game regressions and serialization. `node supabase/smoke.mjs` creates three QA guests and a clearly labelled two-hole QA match; it tests the actual API and leaves the completed QA record for audit. It does not modify real players' matches and never prints session tokens. This network test should be run intentionally, not on every production build.

Local DEV-only `testplayer=host` / `testplayer=guest` uses separate auth storage keys to simulate two devices in browser tabs. DEV-only `preview=match-putt` starts a new unsaved turn near the cup so actual putt completion and handoff can be checked quickly. These overrides are removed from production builds.

Existing installations: apply `nine-holes.sql` once to extend match lengths without deleting scores or changing access rules. `FF_QA_HOLES=9 node supabase/smoke.mjs` checks a full labeled nine-hole protocol match.

## Shot-play matches

Apply `group-matches.sql` after `multiplayer.sql` before deploying a frontend that creates shot-play matches. Existing match links keep the original hole-by-hole protocol. New matches admit two to four invited guests including the host. The host starts the lobby. Everyone tees off, then the farthest unfinished lie plays. Low score has honors on the next tee.

Each settled shot saves the new lie and replay input atomically. Other clients poll and replay the shot locally. The latest 16 shots are retained to bridge polling gaps. This is near-live playback after a shot settles. As with the original mode, physics is client-side and intended for trusted private play.

`group-smoke.sql` exercises a four-player match against a disposable PostgreSQL database with an `auth.uid()` test shim. It rolls back its fixtures.

## Live leaderboard rounds

The same `group-matches.sql` migration adds a private leaderboard option for 2–10 players. Everyone plays the host's selected holes, weather and pins at their own pace. Settled shots save per player, and finished holes appear in the shared standings as clients poll. The standings rank by score to par on finished holes and display holes finished alongside each score. Final ties share the result.

`leaderboard-smoke.sql` verifies ten seats, outsider rejection, stale-shot protection, duplicate saves, independent hole progress and final results. Run it on the same disposable database as `group-smoke.sql`.
