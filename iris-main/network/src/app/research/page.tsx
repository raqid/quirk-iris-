"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/* Research visualization. Every number below is drawn verbatim from    */
/* two papers in this repo:                                             */
/*  P1  HIDDEN-DEAL: A Benchmark for Private Deal Discovery and          */
/*      Selective Surfacing in Trusted Agent Markets                    */
/*  P2  Learning to Surface: A Calibrated Notification Policy … Beats    */
/*      an LLM Agent                                                     */
/* Conditions are labeled wherever two runs differ. Nothing invented.   */
/* ------------------------------------------------------------------ */

const POS = "#8fe3b8"; // ours / good
const NEG = "#e5646b"; // catastrophic
const BASE = "#8a8f99"; // scripted baselines
const LLM = "#e6c07a"; // the LLM agent

function useInView<T extends HTMLElement>(threshold = 0.3) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "none" : "translateY(20px)",
        transition: `opacity .8s ease ${delay}ms, transform .8s cubic-bezier(.2,.7,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function CountUp({
  to,
  dur = 1100,
  decimals = 0,
  suffix = "",
  prefix = "",
}: {
  to: number;
  dur?: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.5);
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    let started = 0;
    const step = (t: number) => {
      if (!started) started = t;
      const p = Math.min(1, (t - started) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(to * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, dur]);
  return (
    <span ref={ref}>
      {prefix}
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}

type Row = { label: string; value: number; color: string; highlight?: boolean };

function Bars({
  rows,
  min = -50,
  max = 100,
  ceiling,
}: {
  rows: Row[];
  min?: number;
  max?: number;
  ceiling?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const span = max - min;
  const frac = (v: number) => (v - min) / span;
  const zero = frac(0);
  return (
    <div ref={ref} className="flex flex-col gap-2.5">
      {rows.map((r, i) => {
        const f = frac(r.value);
        const left = Math.min(zero, f) * 100;
        const width = Math.abs(f - zero) * 100;
        return (
          <div key={r.label} className="grid grid-cols-[130px_1fr_60px] items-center gap-3 sm:grid-cols-[160px_1fr_66px]">
            <div
              className={
                "text-[13px] leading-tight " + (r.highlight ? "font-semibold text-ink" : "text-muted")
              }
            >
              {r.label}
            </div>
            <div className="relative h-7 overflow-hidden bg-tint">
              {/* zero baseline */}
              <div className="absolute top-0 bottom-0 w-px bg-hair" style={{ left: `${zero * 100}%` }} />
              {/* ceiling marker */}
              {ceiling != null && (
                <div
                  className="absolute top-0 bottom-0 w-px"
                  style={{ left: `${frac(ceiling) * 100}%`, background: "#6c6f78" }}
                />
              )}
              <div
                className="absolute top-0 bottom-0"
                style={{
                  left: `${inView ? left : zero * 100}%`,
                  width: `${inView ? width : 0}%`,
                  background: r.color,
                  opacity: r.highlight ? 1 : 0.82,
                  boxShadow: r.highlight ? `0 0 0 1px ${r.color}` : "none",
                  transition: `width .9s cubic-bezier(.2,.7,.2,1) ${i * 90}ms, left .9s cubic-bezier(.2,.7,.2,1) ${i * 90}ms`,
                }}
              />
            </div>
            <div
              className="text-right font-[family-name:var(--font-mono)] text-[13px] tabular-nums"
              style={{ color: r.highlight ? r.color : "var(--color-soft)" }}
            >
              <CountUp to={r.value} decimals={r.value % 1 === 0 ? 0 : 1} suffix="%" dur={1000 + i * 120} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* Surface-all (flood) vs selective (a few) pings hitting a principal. */
function PingPanel({ mode }: { mode: "flood" | "selective" }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const flood = mode === "flood";
  const n = 14;
  const deals = Array.from({ length: n }, (_, i) => {
    const t = (i / (n - 1)) * Math.PI - Math.PI / 2; // -90..90deg fan on the left
    return { x: 12 + 8 * Math.cos(t) * 0, y: 12 + (i / (n - 1)) * 176, i };
  });
  // which pings are "good" (green) vs wasted
  const good = flood ? new Set([2, 9]) : new Set([1, 4, 7, 10]);
  const shown = flood ? deals : deals.filter((d) => good.has(d.i));
  const cx = 300;
  const cy = 100;
  return (
    <div ref={ref} className="border border-hair bg-panel p-4">
      <p className="mb-2 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] text-faint">
        {flood ? "Surface everything" : "Surface the right few"}
      </p>
      <svg viewBox="0 0 340 200" className="w-full">
        {shown.map((d, k) => {
          const isGood = good.has(d.i);
          return (
            <line
              key={d.i}
              x1={20}
              y1={d.y}
              x2={cx}
              y2={cy}
              stroke={isGood ? POS : NEG}
              strokeWidth={isGood ? 1.6 : 1}
              strokeDasharray="220"
              strokeDashoffset={inView ? 0 : 220}
              opacity={inView ? (isGood ? 0.95 : 0.4) : 0}
              style={{
                transition: `stroke-dashoffset .7s ease ${k * 55}ms, opacity .5s ease ${k * 55}ms`,
              }}
            />
          );
        })}
        {shown.map((d) => (
          <circle key={"n" + d.i} cx={20} cy={d.y} r={3} fill={good.has(d.i) ? POS : NEG} opacity={inView ? 1 : 0} />
        ))}
        {/* principal */}
        <circle cx={cx} cy={cy} r={16} fill="#17171d" stroke="#f2f3f5" strokeWidth={1.5} />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="9" fill="#f2f3f5">
          you
        </text>
      </svg>
      <p className="mt-1 text-[13px] leading-snug text-muted">
        {flood ? (
          <>
            <span style={{ color: NEG }}>83% of pings are wasted.</span> Real value drowns in noise. Capture efficiency{" "}
            <b className="text-ink">−310%</b>.
          </>
        ) : (
          <>
            <span style={{ color: POS }}>One strong deal per need.</span> Recovers <b className="text-ink">~79%</b> of the
            achievable value, zero redundancy.
          </>
        )}
      </p>
    </div>
  );
}

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-verm">{children}</p>
);

const Section = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <section className={"mx-auto w-full max-w-[820px] px-6 " + className}>{children}</section>
);

export default function Research() {
  return (
    <main className="pb-32">
      {/* ---------------- HERO ---------------- */}
      <Section className="pt-20 pb-24 sm:pt-28">
        <Reveal>
          <Label>Research · Trusted agent markets</Label>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-5 text-[38px] font-semibold leading-[1.08] tracking-[-0.02em] text-ink-d sm:text-[54px]">
            When an agent finds you a hundred private deals, which ones are worth your attention?
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-6 max-w-[620px] text-[18px] leading-relaxed text-muted">
            Agents can already negotiate privately. We show the decision that actually makes a dealmaking agent
            useful, or noisy, is <span className="text-ink">which</span> discoveries to surface. We built a benchmark
            for it, and a tiny learned controller that beats a strong LLM at it.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 font-[family-name:var(--font-mono)] text-[12px] text-faint">
            <span>2 papers</span>
            <span>1 benchmark · HIDDEN-DEAL</span>
            <span>computable optimum ceiling</span>
          </div>
        </Reveal>
      </Section>

      {/* ---------------- THE REFRAME ---------------- */}
      <Section className="py-16">
        <Reveal>
          <Label>The problem everyone else skips</Label>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight text-ink sm:text-[34px]">
            The hard part isn&rsquo;t talking privately. It&rsquo;s deciding what to say out loud.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            Inside trusted infrastructure, agents can explore and negotiate freely, and that&rsquo;s invisible and free.
            The costly, principal-visible act is <b className="text-ink">surfacing</b>: putting a concrete deal in front
            of someone. Surface too much and you bury the signal. Surface too little and you leave value on the table.
          </p>
        </Reveal>
        <Reveal delay={120} className="mt-8 grid gap-4 sm:grid-cols-2">
          <PingPanel mode="flood" />
          <PingPanel mode="selective" />
        </Reveal>
      </Section>

      {/* ---------------- THE BENCHMARK ---------------- */}
      <Section className="py-16">
        <Reveal>
          <Label>HIDDEN-DEAL · the benchmark</Label>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight text-ink sm:text-[34px]">
            A market where the best possible answer is computable.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            Firms hold assets and have needs; many suppliers can serve the same need, so candidate deals{" "}
            <b className="text-ink">conflict</b>: at most one per need can execute. Because the market is generated,
            the best achievable outcome is a max-weight non-conflicting matching over the deals that actually execute:
            a ground-truth ceiling. We score every policy by <b className="text-ink">capture efficiency</b>: realized
            value relative to that ceiling.
          </p>
        </Reveal>
        <Reveal delay={120} className="mt-8 border border-hair bg-panel p-5">
          <p className="mb-4 text-[13px] text-muted">
            Capture efficiency vs the oracle ceiling{" "}
            <span className="text-faint">· scripted policies, N=40 markets (P1)</span>
          </p>
          <Bars
            min={-60}
            max={100}
            ceiling={100}
            rows={[
              { label: "Oracle (ceiling)", value: 100, color: BASE },
              { label: "Greedy-Capture", value: 79, color: POS, highlight: true },
              { label: "Best-per-Need", value: 76, color: BASE },
              { label: "Surface-All", value: -310, color: NEG },
            ]}
          />
          <p className="mt-4 text-[13px] leading-snug text-muted">
            Surfacing everything is not just worse. It&rsquo;s <span style={{ color: NEG }}>catastrophic</span> (capture
            −310%, its bar runs off the axis). One disciplined deal per need already recovers most of what&rsquo;s
            achievable.
          </p>
        </Reveal>
      </Section>

      {/* ---------------- NEGOTIATION ---------------- */}
      <Section className="py-16">
        <Reveal>
          <Label>Private negotiation</Label>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight text-ink sm:text-[34px]">
            Talking longer, privately, raises the ceiling you can reach.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            Each private round improves a deal&rsquo;s odds of closing. Principals never see the negotiation, only the
            better-qualified deal that comes out of it. Capture efficiency climbs with rounds:
          </p>
        </Reveal>
        <Reveal delay={120} className="mt-8 border border-hair bg-panel p-5">
          <Bars
            min={0}
            max={100}
            ceiling={100}
            rows={[
              { label: "0 rounds", value: 54, color: BASE },
              { label: "1 round", value: 79, color: BASE },
              { label: "2 rounds", value: 90, color: POS },
              { label: "3 rounds", value: 97, color: POS, highlight: true },
            ]}
          />
          <p className="mt-4 text-[13px] text-faint">Greedy-Capture over 0–3 negotiation rounds (P1).</p>
        </Reveal>
      </Section>

      {/* ---------------- THE LLM ---------------- */}
      <Section className="py-16">
        <Reveal>
          <Label>The LLM agent</Label>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight text-ink sm:text-[34px]">
            A capable model is clean, but too cautious.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            Handed the candidate list, gpt-5-mini handles conflicts perfectly (precision 0.88, zero redundancy). But it{" "}
            <b className="text-ink">under-surfaces</b>, raising ~13 deals where the oracle and a scripted baseline raise
            ~20, and leaves value on needs it quietly declines to mention.
          </p>
        </Reveal>
        <Reveal delay={120} className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { k: "Capture efficiency", v: 69, s: "%", sub: "below Greedy's 79%" },
            { k: "Deals surfaced", v: 13, s: "", sub: "oracle & Greedy raise ~20" },
            { k: "Redundancy", v: 0, s: "%", sub: "clean, never noisy" },
          ].map((c) => (
            <div key={c.k} className="border border-hair bg-panel p-4">
              <div className="font-[family-name:var(--font-mono)] text-[32px] font-semibold" style={{ color: LLM }}>
                <CountUp to={c.v} suffix={c.s} />
              </div>
              <p className="mt-1 text-[13px] text-ink">{c.k}</p>
              <p className="text-[12px] text-faint">{c.sub}</p>
            </div>
          ))}
        </Reveal>
        <Reveal delay={200}>
          <p className="mt-4 text-[13px] text-faint">gpt-5-mini pilot, N=12 markets (P1).</p>
        </Reveal>
      </Section>

      {/* ---------------- THE INSIGHT: CALIBRATION ---------------- */}
      <Section className="py-16">
        <Reveal>
          <Label>The key insight</Label>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight text-ink sm:text-[34px]">
            Surfacing is a calibration problem.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            Raise a need&rsquo;s best deal only when its expected value beats its expected waste. That&rsquo;s the whole
            rule:
          </p>
        </Reveal>
        <Reveal delay={100} className="mt-6">
          <div className="border border-hair bg-tint px-6 py-6 text-center">
            <span className="font-[family-name:var(--font-mono)] text-[22px] text-ink sm:text-[26px]">
              surface{"  ⟺  "}
              <span style={{ color: POS }}>p · cap</span>
              {"  >  "}
              <span style={{ color: NEG }}>(1 − p) · cost</span>
            </span>
            <p className="mt-3 text-[13px] text-faint">
              expected value of a deal that closes vs the expected cost of a ping that doesn&rsquo;t
            </p>
          </div>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-8 text-[16px] leading-relaxed text-muted">
            Getting this threshold right barely matters when pings are cheap, and matters enormously when they&rsquo;re
            expensive. A naive &ldquo;surface every need&rsquo;s best deal&rdquo; rule <b className="text-ink">collapses</b>{" "}
            as the cost of a wasted notification rises. The calibrated rule holds.
          </p>
        </Reveal>
        <Reveal delay={220} className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="border border-hair bg-panel p-5">
            <p className="mb-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] text-faint">
              Cheap pings (λ = 0.05)
            </p>
            <Bars
              min={-20}
              max={100}
              rows={[
                { label: "Naive one-per-need", value: 86, color: BASE },
                { label: "Calibrated", value: 86, color: POS, highlight: true },
              ]}
            />
            <p className="mt-3 text-[12px] text-faint">Roughly tied. The decision hardly matters here.</p>
          </div>
          <div className="border border-hair bg-panel p-5">
            <p className="mb-3 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.1em] text-faint">
              Expensive pings (λ = 0.8)
            </p>
            <Bars
              min={-20}
              max={100}
              rows={[
                { label: "Naive one-per-need", value: -4, color: NEG },
                { label: "Calibrated", value: 24, color: POS, highlight: true },
              ]}
            />
            <p className="mt-3 text-[12px] text-faint">
              The naive rule goes <span style={{ color: NEG }}>negative</span>; calibration stays +28 pts ahead.
            </p>
          </div>
        </Reveal>
      </Section>

      {/* ---------------- THE LEARNED CONTROLLER ---------------- */}
      <Section className="py-16">
        <Reveal>
          <Label>Learning to surface</Label>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight text-ink sm:text-[34px]">
            Two weights, trained on reward alone, rediscover the rule.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            We never hand the policy the formula. It sees only realized value and, via black-box optimization, converges
            to a two-weight gate whose learned weights <span className="text-ink">reconstruct</span> expected-value-minus-waste:
          </p>
        </Reveal>
        <Reveal delay={100} className="mt-6 flex flex-wrap items-center gap-4">
          <div className="border border-hair bg-panel px-5 py-4">
            <div className="font-[family-name:var(--font-mono)] text-[28px] font-semibold" style={{ color: POS }}>
              +1.00
            </div>
            <p className="text-[12px] text-muted">weight on expected value</p>
          </div>
          <span className="text-[22px] text-faint">·</span>
          <div className="border border-hair bg-panel px-5 py-4">
            <div className="font-[family-name:var(--font-mono)] text-[28px] font-semibold" style={{ color: NEG }}>
              −1.17
            </div>
            <p className="text-[12px] text-muted">weight on expected waste</p>
          </div>
          <p className="max-w-[240px] text-[13px] text-faint">
            i.e. surface when value exceeds waste: the exact rule, recovered from reward.
          </p>
        </Reveal>

        <Reveal delay={160} className="mt-10 border border-green bg-panel p-5">
          <p className="mb-4 text-[13px] text-muted">
            Head-to-head capture efficiency <span className="text-faint">· deployment ping cost λ=0.15, 6 markets (P2)</span>
          </p>
          <Bars
            min={-60}
            max={100}
            ceiling={100}
            rows={[
              { label: "Oracle (ceiling)", value: 100, color: BASE },
              { label: "Learned (ours)", value: 79.8, color: POS, highlight: true },
              { label: "Greedy", value: 78.4, color: BASE },
              { label: "gpt-5-mini", value: 66.9, color: LLM },
              { label: "Surface-All", value: -42.9, color: NEG },
            ]}
          />
          <p className="mt-4 text-[15px] leading-snug text-soft">
            The learned controller beats the LLM by <b style={{ color: POS }}>~13 points</b>, edges out the best scripted
            baseline, and, unlike the LLM, <b className="text-ink">stays calibrated</b> as the ping cost changes.
          </p>
        </Reveal>
      </Section>

      {/* ---------------- WHY: CALIBRATION NOT REASONING ---------------- */}
      <Section className="py-16">
        <Reveal>
          <Label>Why the LLM falls short</Label>
          <h2 className="mt-4 text-[28px] font-semibold leading-tight text-ink sm:text-[34px]">
            It&rsquo;s a missing calibration step, not a reasoning failure.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-muted">
            Tell the model to be cost-aware and most of the gap closes. Curiously, handing it the exact arithmetic rule
            to execute helps <span className="text-ink">less</span> than the qualitative framing:
          </p>
        </Reveal>
        <Reveal delay={120} className="mt-8 border border-hair bg-panel p-5">
          <Bars
            min={0}
            max={100}
            ceiling={100}
            rows={[
              { label: "LLM, plain", value: 66.9, color: LLM },
              { label: "LLM + cost-aware prompt", value: 78.9, color: POS, highlight: true },
              { label: "LLM + exact rule in prompt", value: 70.7, color: BASE },
            ]}
          />
          <p className="mt-4 text-[15px] leading-snug text-soft">
            &ldquo;The model reasons about the trade-off better than it computes it.&rdquo; Give it the intuition, not the
            formula, or better, take the decision off its plate.
          </p>
        </Reveal>
      </Section>

      {/* ---------------- CONCLUSIONS ---------------- */}
      <Section className="py-16">
        <Reveal>
          <Label>What we conclude</Label>
          <h2 className="mt-4 text-[30px] font-semibold leading-tight text-ink-d sm:text-[38px]">
            The takeaways, plainly.
          </h2>
        </Reveal>
        <div className="mt-8 flex flex-col divide-y divide-hair border-y border-hair">
          {[
            "In trusted agent markets, the binding decision is which privately-discovered deals to surface, not whether agents can negotiate.",
            "Surface everything and you drown value in noise. Surface one strong deal per need and you recover ~80% of what's achievable; private negotiation pushes it toward the ceiling.",
            "The surface/withhold decision reduces to one calibrated threshold: raise a deal only when its expected value beats its expected waste.",
            "A tiny two-weight controller learns that threshold from reward alone, beats a strong LLM by ~13 points, and stays calibrated as pings get expensive, where the LLM doesn't.",
            "The LLM's gap is calibration, not reasoning. So the right design is a division of labor: the model discovers, negotiates, and estimates value; a small, auditable controller decides what reaches you.",
          ].map((t, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className="flex gap-5 py-5">
                <span className="font-[family-name:var(--font-mono)] text-[14px] text-green">{String(i + 1).padStart(2, "0")}</span>
                <p className="text-[17px] leading-relaxed text-soft">{t}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ---------------- BRIDGE TO PRODUCT ---------------- */}
      <Section className="py-16">
        <Reveal className="border border-green bg-panel p-8 text-center">
          <Label>Research → product</Label>
          <h2 className="mx-auto mt-4 max-w-[560px] text-[26px] font-semibold leading-tight text-ink sm:text-[32px]">
            This is exactly how Quirk surfaces deals.
          </h2>
          <p className="mx-auto mt-4 max-w-[560px] text-[16px] leading-relaxed text-muted">
            Companies&rsquo; agents discover and price trades privately. An operator surfaces only the high-value,
            non-conflicting few, the calibrated decision this research isolates, so owners get signal, never a flood
            of pings.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/admin2"
              className="border-[1.5px] border-ink bg-ink px-5 py-2.5 font-[family-name:var(--font-serif)] text-[15px] font-medium text-ground hover:bg-ink-d"
            >
              See the network →
            </Link>
            <Link
              href="/"
              className="border border-hair px-5 py-2.5 font-[family-name:var(--font-serif)] text-[15px] text-muted hover:border-muted hover:text-ink"
            >
              Back to main site
            </Link>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-6 text-center font-[family-name:var(--font-mono)] text-[11px] leading-relaxed text-faint">
            Figures from &ldquo;HIDDEN-DEAL&rdquo; (benchmark) and &ldquo;Learning to Surface&rdquo; (learned policy).
            gpt-5-mini shown at its two reported conditions (69% at N=12; 66.9% at λ=0.15).
          </p>
        </Reveal>
      </Section>
    </main>
  );
}
