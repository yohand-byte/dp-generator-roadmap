// Artifact JSX (optionnel) — Checklist UI “step-by-step” pour suivre V1
// Usage : coller dans une page React (ex: Next.js / Vite) et adapter si besoin.

import React, { useMemo, useState } from "react";

const SECTIONS = [
  {
    id: "A",
    title: "Phase A — Baseline & garde-fous",
    items: [
      "Repo de travail prêt (branche dédiée patch-carto-dp1-dp2)",
      "_outputs/ créé",
      "PDF baseline PROD (depuis /dp) archivé",
      "PDF baseline LOCAL (depuis repo) archivé",
      "Comparaison DP1/DP2 baseline validée",
    ],
  },
  {
    id: "B",
    title: "Phase B — Carto DP1/DP2 : plus de placeholder",
    items: [
      "Endpoint WMS corrigé (wms-r/wms)",
      "PDF après fix : DP1 fond visible",
      "PDF après fix : DP2 fond visible",
    ],
  },
  {
    id: "C",
    title: "Phase C — DP2A complet",
    items: [
      "Contour parcelle tracé sur DP2A",
      "Highlight zone toit si dispo (sinon skip)",
      "PDF après C : DP2A exploitable",
    ],
  },
  {
    id: "D",
    title: "Phase D — DP2B complet",
    items: [
      "Ajout panneaux (N exact = input UI)",
      "PDF après D : DP2B ≠ DP2A et correct",
    ],
  },
  {
    id: "E",
    title: "Phase E — Non-régression produit (variables)",
    items: [
      "Société OK",
      "Maître d’ouvrage OK",
      "Logo upload OK",
      "Pages DP4+ inchangées (spot check)",
    ],
  },
  {
    id: "F",
    title: "Phase F — GitHub & traçabilité",
    items: [
      "Repo GitHub créé ou branche pushée",
      "README + runbook + checklist",
      "Captures/PDF avant-après ajoutés (ou liens)",
      "Tag release v1.0-patch-carto",
    ],
  },
];

function storageKey(sectionId, idx) {
  return `dp_v1_${sectionId}_${idx}`;
}

export default function DpV1Checklist() {
  const initial = useMemo(() => {
    const state = {};
    for (const s of SECTIONS) {
      s.items.forEach((_, idx) => {
        const key = storageKey(s.id, idx);
        state[key] = localStorage.getItem(key) === "1";
      });
    }
    return state;
  }, []);

  const [checked, setChecked] = useState(initial);

  const toggle = (key) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(key, next[key] ? "1" : "0");
      return next;
    });
  };

  const total = useMemo(() => {
    let t = 0;
    SECTIONS.forEach((s) => (t += s.items.length));
    return t;
  }, []);

  const done = useMemo(() => {
    let d = 0;
    Object.values(checked).forEach((v) => v && d++);
    return d;
  }, [checked]);

  return (
    <div style={{ fontFamily: "system-ui, Arial", padding: 20, maxWidth: 900 }}>
      <h1 style={{ margin: 0 }}>DP Generator — Roadmap V1 (DP1 + DP2)</h1>
      <p style={{ marginTop: 8 }}>
        Patch minimal : corriger carto DP1 + compléter DP2A/DP2B sans casser le
        reste.
      </p>

      <div style={{ margin: "14px 0", padding: 12, border: "1px solid #ddd", borderRadius: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div><b>Progress</b> : {done}/{total}</div>
          <div>
            <b>Prod</b> :{" "}
            <a href="https://solaire-dp-generator-29459740400.europe-west1.run.app/dp/" target="_blank" rel="noreferrer">
              /dp
            </a>
          </div>
        </div>
        <div style={{ marginTop: 10, height: 10, background: "#eee", borderRadius: 999 }}>
          <div
            style={{
              width: `${Math.round((done / total) * 100)}%`,
              height: "100%",
              borderRadius: 999,
              background: "#111",
            }}
          />
        </div>
      </div>

      {SECTIONS.map((s) => (
        <div key={s.id} style={{ marginBottom: 16, border: "1px solid #ddd", borderRadius: 12, padding: 14 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>{s.title}</h2>
          <ul style={{ listStyle: "none", paddingLeft: 0, marginTop: 10, marginBottom: 0 }}>
            {s.items.map((label, idx) => {
              const key = storageKey(s.id, idx);
              const isChecked = !!checked[key];
              return (
                <li key={key} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "6px 0" }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(key)}
                    style={{ marginTop: 3 }}
                  />
                  <span style={{ textDecoration: isChecked ? "line-through" : "none", opacity: isChecked ? 0.7 : 1 }}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
