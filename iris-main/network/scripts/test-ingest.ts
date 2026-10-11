// One-off proof that the ingestion engine turns a real repo into a profile.
// Run: OPENAI_API_KEY=... OPENAI_MODEL=gpt-4o-mini npx tsx scripts/test-ingest.ts <owner/repo>
// Uses a minimal Clerk-free reader so it runs outside Next.
import { Octokit } from "@octokit/rest";
import { ingestBrain } from "../src/lib/ingest";

const SAMPLE = `# rare-cell/atlas
Description: Pipeline + models for single-cell RNA-seq of rare fibrotic tissue.
Topics: single-cell, bioinformatics, transcriptomics

## README
Atlas is our internal pipeline for processing single-cell RNA-seq data. We have
assembled a large, unpublished dataset of ~2.1M cells from rare fibrotic tissue
biopsies that is currently sitting unused after our lead program was shelved.
We also maintain a trained cell-type classifier and a batch-correction toolkit.

Right now we are blocked on cloud compute — the imaging reanalysis needs ~4000
GPU-hours we can't afford, and we need a pharma partner to fund and co-author a
translational paper. See issues for the reanalysis backlog.

## requirements.txt
scanpy, anndata, torch, scikit-learn

## Recent commits
- shelve program X, archive dataset
- add batch-correction toolkit v2
- classifier: bump accuracy to 0.94

## Open issues
- reanalysis blocked: no compute budget
- looking for a funding/co-author partner for translational work`;

async function main() {
  const arg = process.argv[2];
  let full = arg || "rare-cell/atlas";
  let material = SAMPLE;

  if (arg) {
    try {
      const [owner, repo] = arg.split("/");
      const ok = new Octokit();
      const meta = await ok.repos.get({ owner, repo });
      const readme = await ok.repos
        .getReadme({ owner, repo, mediaType: { format: "raw" } })
        .then((r) => String(r.data))
        .catch(() => "");
      material = `# ${meta.data.full_name}\n${meta.data.description || ""}\n\n## README\n${readme}`.slice(0, 9000);
      full = meta.data.full_name;
    } catch {
      console.log("(GitHub read failed — using baked-in sample material instead)\n");
      full = "rare-cell/atlas";
      material = SAMPLE;
    }
  }

  console.log(`Ingesting ${full} …\n`);
  const profile = await ingestBrain(material, full);
  console.log(JSON.stringify(profile, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
