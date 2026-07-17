# Responsive UI rework plan

> Living handoff document. Update this file at the end of every UI work session and whenever scope, design decisions, or implementation status changes.

## Document status

| Field | Value |
|---|---|
| Status | Phase 1 in progress — responsive foundations and playable main menu started |
| Production branch | `main` |
| Planned work branch | `ui/responsive-rework` |
| Game UI source | `www/index.html` |
| Last updated | 2026-07-18 |
| Last completed phase | Interactive HTML prototype and first responsive branch stylesheet |
| Next action | Playtest the real main menu at compact and wide sizes, then migrate shared modals and guide/settings |

## Objective

Rework DRIFT's existing HTML game UI so it remains comfortable and visually intentional on:

- Android portrait phones, including short screens, notches and gesture areas.
- Landscape phones.
- Tablets and iPads in portrait and landscape.
- Desktop browsers at common laptop and monitor sizes.
- Touch, mouse, keyboard and, where supported, controller input.

This is a UI and responsive-layout project. Existing gameplay rules, progression, persistence and monetization behavior must remain unchanged unless a separate decision is recorded in this document.

## Ground truth and constraints

- The game and its UI currently live primarily in the single file `www/index.html`.
- The root `index.html` redirects to `www/index.html`.
- Capacitor packages the same web UI for Android.
- The current public GitHub Pages deployment is assumed to publish `main`; feature branches remain locally testable without affecting production.
- Work must happen on `ui/responsive-rework` after this plan is committed to `main`.
- Do not use the generated cars, spacecraft, invented statistics, invented navigation, or invented gameplay from the concept boards as product requirements.
- The concept boards are references for layout, hierarchy, responsive reflow and component styling only.
- Actual labels, mechanics, controls, currencies, orbs, guide content and available actions must come from `www/index.html`.
- Preserve saved-game and settings compatibility. Do not rename local-storage keys without an explicit migration.

## Reference material

- Concept folder: `mockups/ui-redesign/concepts/`
- Current baseline captures: `mockups/ui-redesign/current/`
- Concept audit: `mockups/ui-redesign/README.md`
- Existing skill-tree specification: `docs/skill-tree-design.md`

The mockup folder should be committed if the image size is acceptable for the repository. If not, retain the written findings and store the large images in an agreed external location.

## Definition of success

- All existing UI states remain reachable and functional.
- No important control is clipped, hidden behind a safe area, or unreachable by scrolling.
- The game has intentional compact, medium and wide compositions rather than a uniformly enlarged phone layout.
- Gameplay UI does not unnecessarily cover the central play corridor.
- Phone touch targets are at least 44 CSS pixels where practical.
- Keyboard focus is visible and logical on desktop.
- Text remains readable without depending on hover.
- Skill-tree state is communicated by shape/icon/outline as well as color.
- Existing persistence, resume, cloud-save, leaderboard, tutorial and Android behaviors continue working.
- The rework is verified at every viewport in the test matrix before merge.

## Responsive layout system

Use available layout width and height rather than user-agent or device-name checks.

| Mode | Initial range | Intended composition |
|---|---:|---|
| Compact | `< 600px` wide | One primary column, edge-to-edge screens, bottom sheets, thumb-friendly controls |
| Medium | `600–1023px` wide | Navigation rail plus main content, or balanced two-panel layout |
| Wide | `>= 1024px` wide | Capped multi-column content, persistent context panels, generous negative space |

These are starting values, not immutable requirements. Adjust them based on where the content actually stops fitting.

Height must be treated independently:

- Short viewports must remain scrollable without hiding primary actions.
- Tall portrait screens should not create excessive dead space between related controls.
- Landscape phones may use a compact two-column layout even when their height is limited.
- Use `clamp()` for fluid spacing and type, but cap maximum sizes on desktop.
- Centralize `env(safe-area-inset-top/right/bottom/left)` in a shared screen shell.

## Exact UI inventory

The first branch task is to verify this list against the HTML, record the controlling element IDs/functions, and add any missing states. Do not begin broad styling until this inventory is complete.

### Startup and account

- [ ] Loading screen: progress, status, completion and stalled/error recovery.
- [ ] Pilot/username prompt and rename flow.
- [ ] Google Play Games/cloud-save first-launch prompt.
- [ ] Cloud-save status and sign-in/out states.

### Main menu

- [ ] Title, subtitle/version and pilot identity.
- [ ] Crystal balance.
- [ ] Orb browser, equipped orb state, description and unlock/equip actions.
- [ ] Difficulty selection, including all currently supported difficulties.
- [ ] Start/new-run action.
- [ ] Resume-run action and saved-run information.
- [ ] Guide entry.
- [ ] Skill-tree entry and locked/hidden state.
- [ ] Leaderboard entry.
- [ ] Settings entry.

### Guide and onboarding

- [ ] All guide pages, illustrations, navigation arrows, dots and return action.
- [ ] First-time tutorial narrator/coach states.
- [ ] Tutorial gameplay overlays and input blocking/pass-through behavior.
- [ ] Rainbow Orb or other narrative/cutscene overlays.

### Settings and statistics

- [ ] Music and SFX controls.
- [ ] Cloud-save controls.
- [ ] Frame-rate selection.
- [ ] Render-quality selection.
- [ ] Settings helper text and close behavior.
- [ ] Stats overview and all subviews/actions.

### Skill trees

- [ ] Orb/tree selection and unlock purchase flow.
- [ ] Tree header, points/currencies and navigation.
- [ ] Panning and zooming.
- [ ] Standard and custom tree layouts.
- [ ] Locked, available, owned, selected, ranked and capstone node states.
- [ ] Node detail, cost, requirements, rank and effect readout.
- [ ] Purchase, refund and confirmation flows.
- [ ] Dead Center radial selection overlay.
- [ ] Skill-related message/toast/quip overlays.

### Gameplay HUD and overlays

- [ ] Score, timer, streak/combo and milestone presentation.
- [ ] Crystal or other run-resource presentation.
- [ ] Orb/skill status and cooldown feedback.
- [ ] Power-up selection and contextual overlays.
- [ ] Touch controls and their safe/reachable regions.
- [ ] Desktop keyboard/control hints.
- [ ] Pause entry and pause menu.
- [ ] Inspect panels/tooltips and touch alternatives to hover.

### End-of-run and social

- [ ] Death/run-summary layout for short and tall result sets.
- [ ] Score and reward breakdown.
- [ ] Leaderboard menu and result-screen variants.
- [ ] Retry, return and relevant ad/banner clearance.
- [ ] New-best, milestone and unlock celebrations.

### Shared transient UI

- [ ] Generic confirmation popup.
- [ ] Unlock/purchase confirmation.
- [ ] Error, warning and status messages.
- [ ] Tooltips and keyword explanations.
- [ ] Focus, disabled, loading and pressed states for every interactive component.

## Proposed component system

The initial implementation should reduce duplicated visual rules without forcing an immediate rewrite of all JavaScript.

- `ui-screen`: full-viewport shell, safe-area padding and overflow policy.
- `ui-screen-header`: title, back/close action and optional resources/actions.
- `ui-panel`: shared dark surface, border and spacing.
- `ui-button`: primary, secondary, quiet, danger, icon and disabled variants.
- `ui-segmented`: difficulty, quality, frame-rate and tab selection.
- `ui-setting-row`: label, help text and control placement.
- `ui-modal`: confirmation, account, unlock and recovery states.
- `ui-bottom-sheet`: compact node details and other contextual phone content.
- `ui-navigation-rail`: medium/wide guide, settings or skill-tree navigation.
- Shared focus ring, reduced-motion behavior, scrollbar styling and typography tokens.

Prefer additive classes and CSS custom properties first. Change JavaScript or markup only where real reflow, accessibility or state correctness requires it.

## Screen-specific direction

### Main menu

- Compact: preserve a strong centered DRIFT identity, keep the main run action within easy reach, and prevent optional content from pushing navigation off-screen.
- Medium/wide: use available width for an orb showcase plus a clearly ordered action/navigation panel.
- Resume must take priority when a valid saved run exists.
- Do not invent new profile progression or navigation items.

### Guide

- Compact: swipeable/page-based guide with short text blocks and persistent progress/navigation.
- Medium/wide: chapter rail plus illustration/text content.
- Reuse the existing real guide pages and artwork logic.

### Settings

- Group real settings into Audio, Display, Account/Cloud and Statistics where this can be done without changing behavior.
- Compact: one scroll column.
- Wide: two balanced columns or section navigation with one focused content panel.
- Preserve immediate-save behavior unless deliberately changed and documented.

### Skill trees

- Compact: pannable tree canvas with node details in a bottom sheet.
- Medium: canvas plus detail inspector.
- Wide: orb/tree rail, canvas and detail inspector.
- Preserve existing pan/zoom, purchase, refund and custom-tree behavior.

### Gameplay HUD

- Keep a clear central play corridor.
- Attach persistent information to safe-zone edges.
- Touch controls appear only where required; desktop gets keyboard/controller guidance without permanently consuming play space.
- Critical status must not rely solely on small text or color.

### End screens and leaderboard

- Separate celebratory run summary from dense score breakdown.
- Stack on compact screens; use summary and breakdown columns on wide screens.
- Preserve ad clearance and outer scrolling behavior.

## Implementation phases

### Phase 0 — Baseline and inventory

- [ ] Commit this plan to `main`.
- [ ] Decide whether mockup PNGs belong in Git or external storage.
- [ ] Create `ui/responsive-rework` from the updated `main`.
- [ ] Record starting commit in the session log.
- [ ] Complete the exact UI/state inventory with IDs and controlling functions.
- [ ] Capture baseline screenshots at every viewport in the test matrix.
- [ ] Record current console errors, loading failures and known unrelated bugs.

Exit condition: every user-facing UI state is accounted for and reproducible.

### Phase 1 — Foundations

- [ ] Add design tokens for color, typography, spacing, radii, borders and motion.
- [ ] Add shared screen, panel, button, focus and safe-area primitives.
- [ ] Establish compact/medium/wide layout rules.
- [ ] Add reduced-motion and visible keyboard-focus behavior.
- [ ] Verify that foundations do not change gameplay or persistence.

Exit condition: existing screens can opt into the new primitives without visual regressions elsewhere.

### Phase 2 — Main menu and shared modals

- [ ] Rework main menu in all three layout modes.
- [ ] Rework loading and recovery presentation.
- [ ] Unify pilot name, confirmation, cloud-save and unlock modal styling.
- [ ] Verify resume/new-run, difficulty, orb and navigation behavior.

Exit condition: startup through gameplay entry works on all target sizes.

### Phase 3 — Guide, settings and stats

- [ ] Rework guide navigation and content layout.
- [ ] Rework settings grouping and controls.
- [ ] Rework stats layout.
- [ ] Test scrolling, close/back behavior and focus restoration.

Exit condition: all informational and configuration screens are usable with touch and keyboard.

### Phase 4 — Skill trees

- [ ] Implement compact bottom-sheet layout.
- [ ] Implement medium inspector layout.
- [ ] Implement wide rail/canvas/inspector layout.
- [ ] Verify standard and custom trees.
- [ ] Verify unlock, purchase, rank, refund and confirmation states.
- [ ] Verify pan/zoom with touch, mouse wheel/trackpad and keyboard where applicable.

Exit condition: every existing tree operation works without clipping or lost context.

### Phase 5 — Gameplay HUD and pause

- [ ] Reorganize HUD safe zones for compact, landscape and wide playfields.
- [ ] Rework touch-control placement without altering control semantics.
- [ ] Add desktop-appropriate hints/focus behavior.
- [ ] Rework pause and in-run transient overlays.
- [ ] Verify no central-playfield obstruction during representative runs.

Exit condition: a complete run is playable across the viewport matrix.

### Phase 6 — End screens and polish

- [ ] Rework run summary/death screen.
- [ ] Rework leaderboard states.
- [ ] Verify rewards, unlock celebrations and ad clearance.
- [ ] Normalize animation, focus, hover, pressed and disabled states.
- [ ] Perform accessibility and readability pass.

Exit condition: the full menu → run → result → menu loop is visually and functionally complete.

### Phase 7 — Regression and release preparation

- [ ] Run the full viewport/input matrix.
- [ ] Test fresh storage, existing storage and resumable-run storage.
- [ ] Test Android debug build on a physical device if available.
- [ ] Check console for new errors.
- [ ] Confirm no persistence keys or production integrations changed unexpectedly.
- [ ] Update README/screenshots if appropriate.
- [ ] Record final limitations and follow-ups.
- [ ] Merge only after explicit review.

## Viewport and input test matrix

| Target | Viewport/example | Primary input | Status |
|---|---|---|---|
| Small Android phone | 360 × 800 portrait | Touch | Not started |
| Standard Android phone | 412 × 915 portrait | Touch | Baseline loading capture only |
| Landscape phone | 915 × 412 | Touch | Not started |
| Small tablet | 768 × 1024 portrait | Touch | Not started |
| Tablet landscape | 1024 × 768 | Touch/keyboard | Not started |
| iPad-style portrait | 820 × 1180 | Touch | Not started |
| Laptop | 1366 × 768 | Mouse/keyboard | Baseline loading capture only |
| Desktop | 1920 × 1080 | Mouse/keyboard | Not started |
| Narrow desktop window | 800 × 700 | Mouse/keyboard | Not started |

For every row, verify startup, menu, guide, settings, stats, skill tree, gameplay, pause, result and leaderboard states.

## Functional regression checklist

- [ ] Fresh first launch.
- [ ] Returning player with existing local storage.
- [ ] Start each difficulty.
- [ ] Resume a saved run.
- [ ] Browse, unlock and equip real orbs.
- [ ] Unlock, purchase, rank and refund skills.
- [ ] Complete guide navigation.
- [ ] Change and persist every setting.
- [ ] Open statistics and leaderboard.
- [ ] Pause, resume, restart and return to menu.
- [ ] Finish/die in a run and retry.
- [ ] Cloud-save signed-out, signing-in, signed-in and failure states.
- [ ] Android back behavior where applicable.
- [ ] Ad/banner clearance on result screens.
- [ ] Resize/orientation change without stale layout or canvas sizing.

## Local development and cross-machine handoff

### Start the web version

From the repository root:

```powershell
python -m http.server 8765
```

Open `http://localhost:8765/`.

### Sync and open Android

```powershell
npx cap sync android
npx cap open android
```

Only run the sync after web changes intended for Android testing. Review generated Android changes before committing them.

### Resume work on another machine

```powershell
git fetch origin
git switch ui/responsive-rework
git pull --ff-only
```

Then read, in order:

1. `docs/ui-responsive-rework-plan.md`
2. The latest entry in **Session log** below.
3. `git status`
4. Recent branch commits with `git log --oneline --decorate -10`

Do not assume uncommitted files from another machine are available. End each meaningful session with a coherent commit or explicitly document why work remains uncommitted.

## Branch and commit policy

- Commit this planning document to `main` before creating the feature branch.
- Create `ui/responsive-rework` from that commit.
- Keep each commit limited to one screen group, shared foundation, or verification/fix set.
- Suggested prefixes: `docs(ui):`, `feat(ui):`, `fix(ui):`, `test(ui):`.
- Update this document in the same commit when a phase status or decision changes.
- Do not merge partial work merely to move between machines; push the feature branch instead.
- Avoid force-pushing the shared work branch.

## Decision log

| Date | Decision | Reason |
|---|---|---|
| 2026-07-18 | Use a dedicated `ui/responsive-rework` branch | Keeps the production Pages version stable while the full UI is iterated locally |
| 2026-07-18 | Treat generated mockups as structural references only | Several images contain inaccurate cars, spacecraft, labels and placements |
| 2026-07-18 | Use compact/medium/wide layout modes | Tablet and desktop need true reflow rather than enlarged phone layouts |
| 2026-07-18 | Keep this plan on `main` and maintain it on the branch | Enables reliable pickup after changing machines |

## Known issues and risks

- A clean local headless desktop load stalled at 76%. Determine whether this is an artifact of headless asset/audio behavior or a real recoverability issue before changing loading logic.
- `www/index.html` is very large; broad CSS changes can affect distant states. Prefer scoped classes and verify all overlays after foundation changes.
- Existing UI contains many short-height exceptions. Consolidate them carefully rather than deleting them before replacement layouts are verified.
- Android WebView, browser and iOS Safari may differ in dynamic viewport height and safe-area behavior.
- Skill trees have custom layouts and complex modal layering; they require separate regression coverage.
- Local storage and cloud-save compatibility are release-critical.

## Open decisions

- [ ] Confirm whether the concept PNGs should be committed to Git.
- [ ] Choose the final visual direction after accurate in-game wireframes are reviewed.
- [ ] Decide whether CSS/JS should remain embedded or be split into separate files during this project. Default: avoid a structural split unless it clearly lowers implementation risk.
- [ ] Decide whether a hosted feature-branch preview is worth adding. Default: use local preview and Android debug builds.

## Session log

Add new entries above older entries. Each entry should state the branch, last commit, completed work, verification, unresolved issues and exact next action.

### 2026-07-18 — Playable branch migration started

- Branch: `ui/responsive-rework`
- Starting commit: `2347c2c` (`feat(ui): add responsive HTML prototype`)
- Completed:
  - Added `www/ui-responsive.css` and loaded it after the legacy embedded stylesheet.
  - Added shared responsive tokens, safe-area variables, visible keyboard focus and reduced-motion handling.
  - Reworked the real main menu into a wide two-column composition at 1024px and above.
  - Refined compact phone sizing and action reachability below 600px.
  - Preserved all real element IDs and JavaScript behavior; this is a visual/layout layer only.
- Verification:
  - Confirmed the stylesheet is served from the local branch build.
  - Confirmed the HTML change only adds the branch stylesheet after legacy CSS.
  - `git diff --check` passes.
- Unresolved:
  - Clean headless sessions still stop on the existing 76% loading state, so visual confirmation of the live menu requires a normal playtest session.
  - Tablet-specific tuning between 600px and 1023px still uses the legacy layout pending playtest.
  - Guide, settings, skill trees, gameplay HUD and result screens have not yet migrated into the playable game.
- Next action:
  - Playtest the real branch menu at phone and desktop sizes, fix any live-state layout issues, then migrate guide/settings and shared modal foundations.

### 2026-07-18 — Branch created and interactive prototype started

- Branch: `ui/responsive-rework`
- Base commit: `28cb4f2` (`docs(ui): add responsive rework plan`)
- Completed:
  - Committed the living plan to `main` and created the feature branch from it.
  - Added `mockups/ui-prototype/`, an interactive responsive HTML/CSS prototype separate from the production game.
  - Added real main-menu labels, shipped orb names/descriptions, the six real guide chapters, real settings, and the existing skill-tree actions.
  - Added compact, medium and wide responsive layouts plus direct hash links for each prototype screen.
- Verification:
  - Rendered the prototype at 1366 × 768 and 412 × 915.
  - Confirmed the current game remains untouched and available alongside the prototype.
- Unresolved:
  - Skill-tree example node names still need a complete source-of-truth pass before implementation.
  - Resume-run, leaderboard, stats, gameplay HUD, pause and result screens are not yet included in the interactive prototype.
  - Exact UI/state inventory is not yet complete.
- Next action:
  - Review the main menu, guide, settings and responsive skill-tree structure in the prototype; record requested changes before transferring any design into `www/index.html`.

### 2026-07-18 — Planning and concept audit

- Branch: `main`
- Last commit: record when this document is committed.
- Completed:
  - Confirmed the game UI is implemented in `www/index.html`.
  - Produced six responsive concept boards under `mockups/ui-redesign/concepts/`.
  - Identified that concept imagery contains inaccurate cars/spacecraft and must not drive game content.
  - Established compact, medium and wide layout direction.
  - Created this living plan for branch work and cross-machine handoff.
- Verification:
  - No game source files were edited during the concept phase.
  - Local baseline captures were written only under `mockups/ui-redesign/current/`.
- Unresolved:
  - Exact UI/state inventory is not yet complete.
  - Local clean headless load stopped at 76%.
  - Mockup commit/storage decision remains open.
- Next action:
  - Commit this document to `main`, decide whether to include the mockups, then create `ui/responsive-rework` and complete Phase 0 inventory.
