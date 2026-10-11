# Directional search over the network

Apply the directional-search thesis (`search_agent_plan.md`) to the **people network**: the
custodians are orgs/people whose context we already hold as brains, not web institutions. Given a
stated need from person Q, reason about **who in the network holds it or would know who does** —
and when nobody inside does, fall through to the external web agent.

This is the *inverse* of what the app does today. Today's matcher is **push / all-pairs / batch**:
for every pair of orgs an LLM judges direct asset↔need trades and workstream↔workstream collabs,
the admin publishes, people passively receive. Directional search is **pull / single-source /
on-demand**: one need, actively routed across the network, returning holders *and* leads.

---

## 1. What directional search adds over the current matcher

The current matcher (`lib/match.ts`) already finds the **direct holder** case (asset satisfies
need) for every pair. Directional search adds three things it structurally cannot do:

1. **Reframing.** The need as stated rarely lexically matches an asset. "I need labeled dialog for
   eval" *is* "a conversational dataset with turn annotations" — reason about what it really is
   before looking. (§REFRAME.)
2. **Leads, not just holders.** Today `assessPair` *rejects* any need that's really for a
   relationship, service, intro, hire, or domain expertise ("NOT satisfied by receiving a file").
   Those rejects are exactly the **lead** cases: nobody hands you a file, but someone in the
   adjacent space knows who to talk to. The thing the matcher throws away is the thing the user
   asked for ("give them leads on who to reach out to").
3. **On-demand + external fall-through.** Fresh per query, O(N) not O(N²), and when the network
   comes up empty it hands the *reframed* need to the external directional agent.

---

## 2. The loop (REFRAME → ATTRIBUTE → LOCATE, over people)

For a stated need `q` from querying org `Q`:

1. **REFRAME** — what is this need really? Produce canonical facets + the *kind* of custodian who
   would hold or know it (a team with dataset X; a distribution channel; a co-author with Y depth).
2. **SHORTLIST** — cheap prefilter over all other brains → candidate set. Keeps the expensive step
   off the whole network. (v1: reason over *whatever brains exist* in `profiles`; seam for
   embeddings later — §4.)
3. **ATTRIBUTE** — classify each candidate's relation to the reframed need:
   - **Holder** — a concrete asset/capability that directly satisfies it (today's matcher case).
   - **Adjacency lead** — doesn't hold it but works the adjacent space / has the domain, so likely
     knows who does → "reach out for a lead."
   - **None.**
4. **LOCATE / go-direct** — holders: the specific asset + a concrete first move (an intro request
   framed around what Q *receives*). Leads: why they'd know + exactly what to ask them.
5. **FALL-THROUGH** — if no strong internal holder, hand the *reframed* need (not Q's raw words) to
   the external web agent: who *outside* is obligated to hold it. Label internal vs external
   clearly.
6. **REVISE on failure** — re-attribute (change the guess about *who*), never re-word the query.
   This is the plan's single sharpest behavioral commitment, carried over intact.

Every result carries its **evidence** (the brain signal that surfaced it), never a bare score —
same commitment as the matcher's per-item rationale.

---

## 3. Where it plugs into the code

| Piece | Location | Notes |
|---|---|---|
| `directionalSearch(orgId, query, opts)` | new `lib/search.ts` | core loop; reuses the two-stage reason→structure shape from `assessPair` |
| Reframe | inside `search.ts` | `generateObject`, ingestion-style |
| Shortlist | inside `search.ts` | v1: over all brains; seam for embeddings |
| Attribute/rank | inside `search.ts` | holder \| lead \| none per candidate, with evidence |
| External fall-through | `lib/websearch.ts` (new) | thin TS port of REFRAME→ATTRIBUTE→LOCATE for the open web, via AI SDK + a web-search tool. The Python `search_agent/` is an interactive human-scored planner, not a service — do not call it; port the prompt. |
| Typed search API | new `POST /api/admin/search` | pull path; operator-triggered for now (mirrors admin match flow) |
| UI | admin search box | operator searches on any org's behalf; results grouped Holders / Leads / External; each with evidence + "Request intro" / "Draft outreach"; suggested queries seeded from the chosen org's `needs[]`. Self-serve dashboard search is a later move. |
| Auto-surface (phase 3) | job over each org's `needs[]` | push path; persists results |

**Reuse, don't fork.** The strict trade rules in `match.ts` (reject cross-domain, reject
service/relationship-as-artifact, demand a concrete mechanism) are the **holder** detector — lift
them. Their rejection branch feeds the **lead** detector.

---

## 4. Scale & cost (the frontier idea, applied)

- **Probe = one LLM candidate evaluation.** Cheap prefilter → reason only over the shortlist,
  exactly the two-stage split the matcher already uses.
- v1 reasons over every brain actually in `profiles` (however many that is). The seam: add a `pgvector` embedding per profile for a
  recall-first shortlist when N grows. Keep it a seam, not phase-0 work.
- Output is a **ranked frontier** with evidence, not a single answer — mirrors success@budget.

---

## 5. Data model additions

- `searches` — query log `{orgId, query, reframed, results, createdAt}`. Powers eval, auto-surface,
  and the feedback loop (the network analogue of `search_agent/feedback.jsonl`).
- `leads` (phase 3) — persisted auto-surfaced results, so push has somewhere to write.
- optional `profiles.embedding` (pgvector) — shortlist at scale.

---

## 6. Eval / research artifact (borrowed from `search_agent_plan.md`)

- **attribution@k** — did search name the true holder/lead? Scored independently of the final list.
- **success@budget** — real holder found within B candidate-evaluations; sweep B → the frontier.
- **internal vs external split** — the control: directional reasoning should beat naive keyword
  match over brain text exactly where the need→holder link is a deduction, and the effect should
  shrink where a brain literally names the asset (the "head").
- **feedback loop** — log searches; Q (or admin) scores usefulness → a `lessons.md`-style rubric
  injected into future reframes. This is the same human-as-reward-signal loop as `search_agent/`,
  now with real outcomes (an intro happened / didn't) instead of scored intentions.

---

## 7. Phasing

- **Phase 0 — core internal pull.** REFRAME + shortlist + ATTRIBUTE (holders only) over internal
  brains; `POST /api/search`; results with evidence; dashboard search box. Proves the loop.
- **Phase 1 — leads.** Add the adjacency-lead role + suggested queries from `needs[]` + intro /
  outreach drafting. This is the "who to reach out to" the request centers on.
- **Phase 2 — external fall-through.** Port REFRAME→ATTRIBUTE→LOCATE to TS for the open web; blend
  external custodians in as clearly-labeled leads when internal comes up short.
- **Phase 3 — auto-surface (push).** Run each org's `needs[]` through the loop in the background;
  persist to `leads`; surface proactively — the current matcher's ergonomics with attribution.
- **Phase 4 — feedback + eval.** `searches` log, scoring, the rubric, attribution@k /
  success@budget. The publishable artifact.
