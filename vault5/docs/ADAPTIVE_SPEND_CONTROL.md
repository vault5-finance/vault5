# Scenario Six: Adaptive Spend Control (Design and Implementation Spec)

Goal
- Make Vault5 proactively adjust spending and savings behavior based on observed daily patterns.
- Adapt allocations, throttle non-essentials, redirect surpluses, and engage fail-safes automatically.
- Provide transparent logs and explanations for every automatic adjustment.

Scope of this Spec
- Data model additions
- Configuration and thresholds (env-driven)
- Algorithms and decision flow
- Integration points with transfers, P2P, payouts, and allocation engine
- Jobs/schedulers required
- APIs and UI wiring
- 14-day simulation to guide implementation/testing

Key Concepts
- Baseline Daily Budget: dynamic estimate of daily needs for the Daily account (cash buffer).
- Surplus Management: when daily spend < threshold, redirect excess to savings/emergency/micro-investments.
- Overspend Autocorrect: throttle non-essentials, pull from liquid buffer, suggest cheaper alternatives.
- Pattern Learning: streaks of under/overspend drive baseline updates and allocation flex.
- Emergency Mode: lock non-essential actions if overspend continues and buffer depletes.

Environment Configuration (defaults; override in production)
Additions to [backend/.env.example](vault5/backend/.env.example:1)
- DAILY_AI_ALERT_THRESHOLD_PCT=20
- FUN_SWEEP_ENABLED=true
- (Existing rules toggles will interact with adaptive engine decisions.)
- New adaptive toggles (to add later in code):
  - ADAPTIVE_UNDERSPEND_THRESHOLD_PCT=20  # if spend < 80% of baseline
  - ADAPTIVE_OVERSPEND_THRESHOLD_PCT=20   # if spend > 120% of baseline
  - ADAPTIVE_STREAK_WINDOW_DAYS=7
  - ADAPTIVE_THROTTLE_DAYS=3
  - ADAPTIVE_SURPLUS_SPLIT="emergency:40,investment:40,longterm:20"
  - ADAPTIVE_MICROCREDIT_ENABLED=false
  - ADAPTIVE_MICROCREDIT_LIMIT=5000

Data Model Additions
1) UserBudgetProfile (new collection)
- user: ObjectId ref User (unique index)
- dailyBaseline: Number (KES)  // rolling estimate of user’s daily spend needs
- lastAdjustedAt: Date
- underSpendStreak: Number (days)
- overSpendStreak: Number (days)
- mode: String enum ['normal','throttle','emergency']
- notes: [String] // administrative comments or explanations
File to create: [UserBudgetProfile.js](vault5/backend/models/UserBudgetProfile.js:1)

2) DailySpendSnapshot (new collection)
- user: ObjectId
- date: Date (unique with user)
- budgetBaseline: Number
- actualSpend: Number
- surplus: Number
- overspend: Number
- actions: [String] // actions taken (e.g., redirect_surplus, throttle_fun, pull_buffer, lock_nonessential)
File to create: [DailySpendSnapshot.js](vault5/backend/models/DailySpendSnapshot.js:1)

3) Rule Logs (extend existing AuditLog)
- action: adaptive.adjustment
- context: { reason, fromPercentages, toPercentages, throttleDays, pulledFromBuffer, penaltiesApplied }
File: [AuditLog.js](vault5/backend/models/AuditLog.js:1)

API Surface
- No new public endpoints required for core automation (driven by schedulers and interception at money-moving endpoints).
- Optional admin/user endpoints for visibility/override:
  - GET /api/adaptive/profile -> returns [UserBudgetProfile](vault5/backend/models/UserBudgetProfile.js:1)
  - GET /api/adaptive/snapshots?startDate=&endDate= -> returns snapshot list
  - POST /api/adaptive/override -> body: { dailyBaseline?, mode?, throttleDays? }
Controllers to add: [adaptiveController.js](vault5/backend/controllers/adaptiveController.js:1)
Routes: [adaptive.js](vault5/backend/routes/adaptive.js:1)

Core Algorithms

A) Daily Close-Out (Scheduler)
When: nightly at local midnight (or 00:30)
Steps:
1) Compute actualSpend from day’s outflow Transactions (Daily + Fun primarily; could include other non-savings if configured).
2) Compare against budgetBaseline from [UserBudgetProfile](vault5/backend/models/UserBudgetProfile.js:1).
3) If actualSpend <= (1 - underThreshold) * baseline:
   - Surplus = baseline - actualSpend
   - Redirect Surplus per ADAPTIVE_SURPLUS_SPLIT:
     - emergency += 40%
     - investment += 40%
     - longterm += 20%
   - Increment underSpendStreak, reset overSpendStreak
   - Consider reducing dailyBaseline slightly (e.g., -2%) if underSpendStreak >= ADAPTIVE_STREAK_WINDOW_DAYS
4) If actualSpend >= (1 + overThreshold) * baseline:
   - Overspend = actualSpend - baseline
   - Apply throttle for ADAPTIVE_THROTTLE_DAYS (non-essential throttle: prevent internal Fun transfers and discretionary tagged spends)
   - Pull small % from liquid buffer (Daily or wallet) up to a cap to cover overspend. Do NOT pull from LongTerm or Investment.
   - Increment overSpendStreak, reset underSpendStreak
   - If overSpendStreak >= ADAPTIVE_STREAK_WINDOW_DAYS:
     - Keep dailyBaseline constant but reduce lifestyle share (Fun) for next period
     - Optionally enable micro-credit buffer if ADAPTIVE_MICROCREDIT_ENABLED
5) Emergency Mode trigger:
   - If buffer depleted and overspend persists: mode='emergency'
   - Lock non-essential actions (block Fun, block internal transfers to non-essential accounts)
   - Reduce dailyBaseline to strict essentials (small amount) until buffer recovers
6) Write snapshot and audit logs; send notifications with rationale.

Files to add:
- Scheduler job: [jobs/adaptiveDailyClose.js](vault5/backend/jobs/adaptiveDailyClose.js:1)
- Registered in server bootstrap or a worker:
  - [server.js](vault5/backend/server.js:1) or separate worker entry

B) Real-Time Interception (at money-moving endpoints)
Where: internal transfers, P2P, payouts
- Use a middleware or service to:
  - If mode === 'throttle', block or warn for non-essential (e.g., Fun -> internal transfer)
  - Apply AI warnings and present cheaper alternatives for payouts (if structured)
- Integration points:
  - [transfersController.js](vault5/backend/controllers/transfersController.js:1)
  - [payoutsController.js](vault5/backend/controllers/payoutsController.js:1)
  - [compliance.js](vault5/backend/middleware/compliance.js:1) (can chain new adaptiveGate if desired)

C) Baseline Estimation
- Initialize dailyBaseline using:
  - Average of last 14 days spend (if available), else a static default (e.g., KES 1000)
- Update rules:
  - Under-spend streak >= 7: decrease baseline by 2–5% (min floor)
  - Over-spend streak >= 7: keep baseline but reduce lifestyle allocation 2–5%, and consider expand essentials allocation

Allocation Flex (Dynamic Percentages)
- Start percentages: Daily 50, Emergency 10, Investment 20, LongTerm 10, Fun 10
- Adaptation:
  - Under-spend streak: increase Investment by +5 percentage points, decrease Daily by -5 (bounded)
  - Over-spend streak: decrease Fun by -5, increase Daily by +5 (bounded)
- Changes applied with caution and logged in [AuditLog.js](vault5/backend/models/AuditLog.js:1)

UI/UX
- Accounts Center:
  - Show current mode: normal/throttle/emergency
  - Show dailyBaseline and lastAdjustedAt
  - Show “Why” details per day (from snapshots)
  - Buttons to accept/reject suggested adjustments (uses POST /api/adaptive/override)
- Dashboard Insights:
  - If under-spend streak: “You’ve been consistently underspending; we raised Investments by X”.
  - If over-spend streak: “We tightened lifestyle spending for 3 days to stabilize.”

Pseudocode (Daily Close-Out)
```pseudo
profile = getProfile(user)
baseline = profile.dailyBaseline || estimateDefault(user)

actual = sumOutflows(user, today)

snapshot = { user, date: today, budgetBaseline: baseline, actualSpend: actual }

if actual <= baseline * (1 - underThreshold):
    surplus = baseline - actual
    applySurplusSplit(user, surplus)  // emergency/investment/longterm
    profile.underSpendStreak += 1
    profile.overSpendStreak = 0
    actions.push('redirect_surplus')
    if profile.underSpendStreak >= streakWindow:
        profile.dailyBaseline = max(minFloor, round(profile.dailyBaseline * 0.98))
        actions.push('lower_baseline')
else if actual >= baseline * (1 + overThreshold):
    overspend = actual - baseline
    applyThrottle(user, throttleDays)
    pulled = pullFromLiquidBuffer(user, overspend * 0.3) // cap pulling at 30% of overspend or env
    profile.overSpendStreak += 1
    profile.underSpendStreak = 0
    actions.push('throttle_nonessential')
    if profile.overSpendStreak >= streakWindow:
        adjustLifestyleDown(user, 0.05) // -5% lifestyle, +5% daily
        actions.push('adjust_allocations')
    if bufferDepleted(user):
        profile.mode = 'emergency'
        lockNonEssential(user)
        actions.push('enter_emergency_mode')
else:
    profile.underSpendStreak = 0
    profile.overSpendStreak = 0

snapshot.actions = actions
saveSnapshot(snapshot)
saveProfile(profile)
logAudit('adaptive.adjustment', { actions, baselineBefore, baselineAfter })
notifyUser(user, actionsSummary)
```

Integration Details
- applySurplusSplit -> executes internal transfers from Daily to Emergency/Investment/LongTerm following [TRANSFERS_PAYOUTS.md](vault5/docs/TRANSFERS_PAYOUTS.md:1). For now, call allocation engine or internal transfer service when implemented.
- applyThrottle -> writes a windowed flag (throttle until date) into [UserBudgetProfile.js](vault5/backend/models/UserBudgetProfile.js:1) and a lightweight cache; enforcement happens in money-moving controllers via “adaptiveGate”.
- lockNonEssential -> same principle; mark profile.mode='emergency' and enforce via “adaptiveGate”.
- bufferDepleted(user) -> checks Daily/wallet balance vs. minimum baseline multiplier.

APIs to Implement (Phase 2)
- GET /api/adaptive/profile → returns { dailyBaseline, mode, under/over streaks, lastAdjustedAt }
- GET /api/adaptive/snapshots?startDate=&endDate= → list snapshots with actions
- POST /api/adaptive/override → allow manual overrides (baseline, mode), logs audit
Files: [adaptiveController.js](vault5/backend/controllers/adaptiveController.js:1), [adaptive.js](vault5/backend/routes/adaptive.js:1)

Schedulers/Workers
- Nightly job: [jobs/adaptiveDailyClose.js](vault5/backend/jobs/adaptiveDailyClose.js:1)
- Deployed either as part of the API process (node-cron) or separate worker service.

14-Day Simulation (Example)
Assume:
- Baseline KES 1000
- underThreshold=20% (spend < 800), overThreshold=20% (spend > 1200)
- streakWindow=7

Day 1–3 (Spend: 650, 700, 720)
- Surplus each day ~300, 300, 280 redirected (emergency+investment+longterm)
- underSpendStreak=3
- Baseline unchanged yet

Day 4–7 (Spend: 680, 750, 700, 640)
- underSpendStreak reaches 7
- Baseline lowered by 2% to 980
- Investment allocation +5 pp, Daily -5 pp (bounded)

Day 8–9 (Spend spikes: 1450, 1300)
- Over threshold both days
- Throttle non-essential for 3 days, pull small buffer from Daily (e.g., 30% of overspend)
- overSpendStreak=2, underSpend=0

Day 10–12 (Spend: 1180, 1220, 1250)
- Hovering near threshold, overSpendStreak increases
- On reaching 7-day overspend (hypothetical extension), adjust allocations: -5 pp Fun, +5 pp Daily

Day 13–14 (Spend: 1700, 1800) and buffer low
- Enter Emergency Mode: lock non-essential, reduce dailyBaseline to essentials-only (e.g., 700) for stabilization
- After buffer recovery (future days), exit emergency mode

Acceptance Criteria
- Snapshots created daily with actions taken and amounts moved
- Profile adjusts baseline and streaks correctly
- Throttle/emergency modes enforced in money-moving controllers (block/warn)
- Logs/audits explain every decision
- Users see clear “why” notes in Accounts Center and/or Dashboard Insights

Files to Create/Modify (Code Mode)
- models:
  - [UserBudgetProfile.js](vault5/backend/models/UserBudgetProfile.js:1)
  - [DailySpendSnapshot.js](vault5/backend/models/DailySpendSnapshot.js:1)
- controllers:
  - [adaptiveController.js](vault5/backend/controllers/adaptiveController.js:1)
  - Integrations in [transfersController.js](vault5/backend/controllers/transfersController.js:1), [payoutsController.js](vault5/backend/controllers/payoutsController.js:1)
- routes:
  - [adaptive.js](vault5/backend/routes/adaptive.js:1)
- middleware/services:
  - adaptiveGate for enforcement at runtime (non-essential throttle/lock)
- jobs:
  - [jobs/adaptiveDailyClose.js](vault5/backend/jobs/adaptiveDailyClose.js:1)
- UI:
  - AccountsCenter: show profile mode, baseline, lastAdjustedAt; display “Why” from snapshots; override controls
  - Dashboard Insights: explanatory cards when actions occur

Notes
- All adaptive changes should be reversible and admin-overridable
- Keep adjustments small and bounded (e.g., +/− 5 percentage points per streak window) to avoid whiplash
- Provide clear user messaging and logs (explain why changes happened)
