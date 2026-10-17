# Seraphim March — Empire of Iron
### Game Rules & Design Specification
*A March of Empires-style conquest map × Robot Wars arena × Hack The Box puzzle CTF, wrapped in a sportsbook. Everything is fully simulated: fictional networks, fictional machines, play-money credits, zero real exploit code, zero real targets.*

---

## 1. Premise & Win Condition

You are a Warlord-Commander marching across **Thronenet**, a kingdom of six fortified servers ("thrones"). Each throne is defended by a firewall wall, an AI guardian, and a champion war-machine in the arena. Breach the server, wreck its champion in a **Robot Wars bout**, and bank its flag. Every flag you bank pays you at posted American odds.

**You win the campaign when all six flags are banked.** Victory screen reports time, hints used, final balance and net profit. Divine Credits (₡) are play money — you start with **₡1,000** and there is no cash value, no deposits, no withdrawals.

## 2. The Map & The March (March of Empires layer)

- The realm map shows six throne nodes connected by a road: **1 YHWH → 2 Michael → 3 Gabriel → 4 Raphael → 5 Metatron → 6 Seraphim**.
- **March order is strict:** only Throne 1 is reachable at first; a throne unlocks when the previous one falls. Locked thrones cannot be probed, breached or bet on.
- Clicking a node selects it and opens the Target Node panel with recon, defense intel and actions.
- Solved thrones get gold chips in the header progress bar; the ⏱ timer runs from first launch.

## 3. Turn & Phase Loop

1. Each **round** grants **3 AP (⚡)**.
2. Spend AP in any order: **Probe (1 AP)**, **Breach (1 AP)**, optional **EMP strike (1 AP, needs tool)**.
3. AP hitting zero ends the round — a supply convoy restores AP to 3 and the round counter ticks. Nothing else decays with time.
4. Free actions (no AP): buying/deploying toolkit items, buying hints, arena bouts, placing bets, collecting flags.

## 4. Server Representation (Hack The Box layer)

Each throne is a simulated host with an OS/difficulty tier, a listening "gate" port and layered defenses:

| L# | Throne (host) | Tier / stack | Gate port | Single-odds | Defense theme |
|---|---|---|---|---|---|
| 1 | YHWH — The Source | TIER I — Debian 12 · nginx/1.18 | 22/tcp | −200 | Ancient banner; secret in plain sight |
| 2 | Michael — The Gatekeeper | TIER II — Alpine · postgres 13 | 5432/tcp | −120 | Base64 cipher carved on the wall |
| 3 | Gabriel — The Herald | TIER III — CentOS 7 · apache 2.4 | 80/tcp | +150 | White-on-white invisible text |
| 4 | Raphael — The Healer | TIER II — Ubuntu 20.04 · node 16 | 3000/tcp | +200 | One intentional console whisper |
| 5 | Metatron — The Scribe | TIER IV — Windows Server 2019 · IIS | 3389/tcp | +250 | Secret split across data attributes |
| 6 | Seraphim — The Burning One | TIER V — hardened · k8s + WAF | 6443/tcp | +500 | Pattern assembly + arena assault |

### Hacking, fully abstracted (no commands, no exploits)
- **Probe (1 AP):** one wall segment falls + recon reveals the stack, open gate port and **defense intel** — a riddle describing the flag-hiding technique.
- **Wall:** each throne has 8–20 hardening segments. Probe cuts 1; **Bolt Cutters** and **EMP** cut 3. At 0 segments, **Breach (1 AP)** = root shell (node becomes *pwned*). A failed breach (wall still standing) costs ₡20 in toolkit repairs — ₡0 with the **CRC Field Kit**.
- **Flag hiding (HTB-style techniques, one per throne):** ① HTML comment in page source ② Base64 string ③ invisible same-color text ④ styled `console.log` output (F12) ⑤ `data-first`/`data-second` attribute split ⑥ pattern assembly from the first letters **Y·M·G·R·M** + `_BURNS_BRIGHTEST`.
- **Divine Guidance (₡50):** reveals the technique hint for the selected node; usage is counted on the victory screen.
- **Flags (educational, self-contained):** `CTF{YHWH_SEES_ALL}` · `CTF{MICHAEL_GUARDS_THE_GATES}` · `CTF{GABRIEL_ANNOUNCES_TRUTH}` · `CTF{RAPHAEL_HEALS_THE_CODE}` · `CTF{METATRON_WRITES_THE_BOOK}` · `CTF{YMGRM_BURNS_BRIGHTEST}`.

## 5. Robot Wars Arena

After a breach you must **win the bout** to collect that throne's flag.

| Machine | Armor / Drive / Weapon | PWR | Entry fee | Circuit hazards |
|---|---|---|---|---|
| GAUNTLET-05 | alloy armor / mecha legs / lance arm | 78 | free | Solar flare −15 · Electrical surge −15 |
| WEDGE PROTOCOL | steel armor / wheels / arc welder | 72 | ₡60 | Magnetic storm −15 · Oil slick −10 |
| POLY-BOMB | polycarbonate / treads / spike ram | 65 | ₡100 | Solar flare −15 · Oil slick −10 |
| TIN CLERIC | tin armor / microcontroller / flail | 60 | ₡120 | Solar flare −15 · EMP burst −10 |
| TITAN RECLAIMER | titanium / hydraulics / crusher jaw | 85 | ₡200 | Magnetic storm −15 · Electrical surge −15 |

- Both sides start (foe HP scales with its PWR); rounds alternate your strike and its counter-strike; damage rolls include PWR.
- **Hazards strike on rounds 3 and 6** and damage *your* machine — higher tiers risk more.
- Lose the bout and the entry fee is gone; buy another machine and retry. No bout win, no flag.
- The **Firewall Banner** (toolkit) makes your next foe fight at −10 power.

## 6. Toolkit (in-game items, Divine Credits)

| Item | Cost | Effect |
|---|---|---|
| Bolt Cutters | ₡60 | consumable — cuts 3 wall segments (no AP) |
| EMP Charge | ₡45 | consumable — cuts 3 wall segments (no AP); also adds an AP-based EMP strike button |
| CRC Field Kit | ₡90 | permanent — failed breaches cost ₡0 instead of ₡20 |
| Firewall Banner | ₡100 | consumable — your next arena foe fights at −10 power |

## 7. Betting System (play-money sportsbook)

- **Currency:** Divine Credits ₡ — play money only; Reset restores ₡1,000.
- **Markets:** each throne is an event priced in American odds (see §4 table). Negative odds are favorites (−200 → a ₡100 stake profits ₡50); positive are underdogs (+500 → profits ₡500). Payout basis: ₡100 stakes.
- **Bet Slip:** add open thrones as legs (1–6), set stake (manual or ₡10/₡100/₡500/MAX). Validation: numeric, > 0, ≤ balance. Combined odds = product of leg decimal odds; displayed live with the per-₡100 payout.
- **Grading:** a ticket pays only when **every leg's flag is collected**. Singles grade on collection. **Locked-leg rule:** if you bank any flag while another leg on the ticket is still open (throne not even breached), the ticket is graded **LOST** and the stake is forfeit. Settled thrones are locked out of the slip (no betting on resolved events).
- **My Bets:** ticket IDs, Pending/Cashed/Lost, total staked, cashed P/L, open risk, manual grade button.

### Verified pricing ladder (per ₡100 stake)

| Parlay | Legs | Combined odds | Decimal | Pays |
|---|---|---|---|---|
| Heavenly Double | YHWH + Michael | +175 | 2.75 | ₡275.00 |
| Trinity Teaser | + Gabriel | +588 | 6.875 | ₡687.50 |
| Four Horsemen | + Raphael | +1963 | 20.625 | ₡2,062.50 |
| Pentarchy Special | + Metatron | +7119 | 72.1875 | ₡7,218.75 |
| Grand Seraphim — ALL IN | + Seraphim | +43213 | 433.125 | ₡43,312.50 |

Conversion: American → decimal (+A → 1+A/100, −A → 1+100/A); legs multiply; round back to American. Worked example: 1.50 × 1.8333 × 2.50 = 6.875 → **+588** → ₡687.50.

## 8. Safety & Compliance Notes

- **Fully simulated:** all "hacking" is abstract resource-and-riddle mechanics; there is no real exploit code, no real commands, and no real hostnames or targets anywhere in the build.
- **Play money only:** no deposits, withdrawals, purchases, or prizes; ₡ have no monetary value. The game is educational (security-awareness puzzle + odds arithmetic) and is not a gambling service.
- The blueprint's licensed-operator briefing (KYC/AML, geofencing, audited pots, player protection) informed the design guardrails: transparent fixed odds, no opaque rule changes, no value-bearing tokens.
