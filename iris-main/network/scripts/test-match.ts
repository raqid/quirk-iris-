// Prove the M3 matcher: two org profiles → trade + collaboration matches.
// Run: OPENAI_API_KEY=... OPENAI_MODEL=gpt-4o-mini npx tsx scripts/test-match.ts
import { matchProfiles, type OrgProfile } from "../src/lib/match";
import type { Profile } from "../src/lib/profile";

const atlas: OrgProfile = {
  orgId: "org_atlas",
  name: "rare-cell/atlas",
  profile: {
    summary: "Single-cell RNA-seq pipeline and models for rare fibrotic tissue.",
    capabilities: ["single-cell RNA-seq", "batch correction", "cell-type classification"],
    assets: [
      { name: "Unpublished fibrotic single-cell dataset (~2.1M cells)", detail: "shelved after program cut", idle: true, floor: 120000 },
      { name: "Trained cell-type classifier", detail: "0.94 accuracy", idle: false, floor: null },
    ],
    workstreams: [{ title: "Batch-correction toolkit v2", detail: "harmonizing multi-run scRNA data" }],
    needs: [{ need: "Cloud GPU compute for imaging reanalysis", why: "blocked on ~4000 GPU-hours", budget: 50000 }],
  } satisfies Profile,
};

const nimbus: OrgProfile = {
  orgId: "org_nimbus",
  name: "nimbus/labs",
  profile: {
    summary: "Compute-rich ML lab building rare-disease foundation models.",
    capabilities: ["large-scale training", "batch-correction research"],
    assets: [
      { name: "Idle GPU compute credits", detail: "underused cluster capacity this quarter", idle: true, floor: 40000 },
    ],
    workstreams: [{ title: "Batch-correction methods for scRNA", detail: "new harmonization approach" }],
    needs: [
      { need: "A rare fibrotic-disease single-cell dataset", why: "needed to validate the foundation model", budget: 600000 },
    ],
  } satisfies Profile,
};

const brewline: OrgProfile = {
  orgId: "org_brewline",
  name: "brewline/coffee",
  profile: {
    summary: "Direct-to-consumer specialty coffee subscription and roastery.",
    capabilities: ["coffee roasting", "subscription logistics", "D2C marketing"],
    assets: [{ name: "Roastery capacity", detail: "spare roasting slots", idle: true, floor: 20000 }],
    workstreams: [{ title: "Launch a cold-brew product line", detail: "canned cold brew for retail" }],
    needs: [{ need: "Retail shelf distribution for beverages", why: "want to move beyond online", budget: 100000 }],
  } satisfies Profile,
};

async function report(a: OrgProfile, b: OrgProfile) {
  console.log(`\n=== ${a.name}  ×  ${b.name} ===`);
  const matches = await matchProfiles(a, b);
  if (!matches.length) console.log("  (no genuine connection — correct if these are unrelated)");
  for (const m of matches) {
    if (m.kind === "trade") {
      const priced = m.priced
        ? `PRICED $${m.price?.toLocaleString()} · seller nets +$${m.sellerNet?.toLocaleString()} · buyer saves $${m.buyerSave?.toLocaleString()}`
        : `UNPRICED (set floor/budget)`;
      console.log(`  TRADE  ${m.sellerOrgId} sells "${m.item}" → ${m.buyerOrgId}\n         ${m.rationale} · ${priced}`);
    } else {
      console.log(`  COLLAB ${m.relation}  "${m.aWork}" ~ "${m.bWork}"\n         ${m.note}`);
    }
  }
}

async function main() {
  await report(atlas, nimbus); // related — should surface real trades / collab
  await report(atlas, brewline); // unrelated — should surface nothing
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
