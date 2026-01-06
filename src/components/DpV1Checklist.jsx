import { useEffect, useMemo, useState } from "react";
import "./DpV1Checklist.css";

const STORAGE_KEY = "dp_v1_checklist_v3";
const THEME_KEY = "dp_v1_theme";

const PHASES = [
  {
    id: "A",
    className: "phaseA",
    title: "Phase A — Baseline & garde-fous",
    tag: "Sécurité",
    items: [
      { id: "A1", text: "Repo de travail cloné (branche dédiée)" },
      { id: "A2", text: "Dossier _outputs/ créé" },
      { id: "A3", text: "PDF baseline PROD archivé (depuis /dp)" },
      { id: "A4", text: "PDF baseline LOCAL archivé (repo)" },
      { id: "A5", text: "Comparaison DP1 / DP2 baseline validée" },
    ],
  },
  {
    id: "B",
    className: "phaseB",
    title: "Phase B — Cartographie DP1 / DP2",
    tag: "Carto",
    items: [
      { id: "B1", text: "WMS cadastre IGN corrigé (endpoint fonctionnel)" },
      { id: "B2", text: "DP1 : placeholders supprimés (fond visible)" },
      { id: "B3", text: "DP2 : placeholders supprimés (fond visible)" },
    ],
  },
  {
    id: "C",
    className: "phaseC",
    title: "Phase C — DP2A (Plan de masse AVANT)",
    tag: "Avant",
    items: [
      { id: "C1", text: "Limites de propriété tracées sur DP2A" },
      { id: "C2", text: "Pan de toit concerné mis en évidence (si dispo, sinon skip)" },
      { id: "C3", text: "PDF DP2A exploitable mairie" },
    ],
  },
  {
    id: "D",
    className: "phaseD",
    title: "Phase D — DP2B (Plan de masse APRÈS)",
    tag: "Après",
    items: [
      { id: "D1", text: "Panneaux ajoutés (nombre exact = input UI)" },
      { id: "D2", text: "DP2B différent de DP2A (visuellement)" },
      { id: "D3", text: "PDF final validé" },
    ],
  },
];

function safeLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export default function DpV1Checklist() {
  const allItems = useMemo(() => PHASES.flatMap((p) => p.items), []);
  const total = allItems.length;

  const [checked, setChecked] = useState({});
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    setChecked(safeLoad(STORAGE_KEY, {}));
    const t = localStorage.getItem(THEME_KEY);
    setTheme(t === "light" ? "light" : "dark");
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
    } catch {}
  }, [checked]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const doneCount = useMemo(
    () => allItems.reduce((acc, it) => acc + (checked[it.id] ? 1 : 0), 0),
    [allItems, checked]
  );

  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  function toggle(id) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function resetAll() {
    setChecked({});
  }

  function checkAll() {
    const next = {};
    for (const it of allItems) next[it.id] = true;
    setChecked(next);
  }

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  return (
    <div className="dp-page">
      <div className="dp-container">
        <div className="dp-hero">
          <div>
            <h1>DP Generator — Roadmap V1</h1>
            <p className="subtitle">
              Patch minimal : <b>DP1 + DP2 (DP2A / DP2B)</b> sans casser l’existant
            </p>

            <div className="badgeRow">
              <span className="badge">
                <strong>Prod</strong> /dp
              </span>
              <span className="badge">
                <strong>Progress</strong> {doneCount}/{total} ({pct}%)
              </span>
              <span className="badge">
                <strong>Règle</strong> une étape = un PDF comparé
              </span>
            </div>

            <div className="progressWrap">
              <div className="progressTop">
                <span>Avancement</span>
                <span>{pct}%</span>
              </div>
              <div className="bar">
                <div style={{ width: `${pct}%` }} />
              </div>
              <div className="actions">
                <button className="btn" onClick={checkAll} type="button">
                  Tout cocher
                </button>
                <button className="btn" onClick={resetAll} type="button">
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="themeToggle">
            <div className="toggleLabel">Mode {theme === "dark" ? "nuit" : "jour"}</div>
            <button
              className="switch"
              type="button"
              onClick={toggleTheme}
              data-on={theme === "light"}
              aria-label="Basculer thème"
            >
              <span className="knob" />
            </button>
          </div>
        </div>

        <div className="grid">
          {PHASES.map((phase) => (
            <div key={phase.id} className={`card ${phase.className}`}>
              <div className="card-header">
                <h2>{phase.title}</h2>
                <span className="tag">
                  <span className="dot" /> {phase.tag}
                </span>
              </div>

              <div className="checklist">
                {phase.items.map((it) => {
                  const isDone = !!checked[it.id];
                  return (
                    <div key={it.id} className={`item ${isDone ? "done" : ""}`}>
                      <div className="item-left">
                        <input
                          className="cb"
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggle(it.id)}
                        />
                        <div>
                          <div className="item-text">{it.text}</div>
                          <div className="item-meta">{it.id}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="footer-hint">
          Checkpoints sauvegardés automatiquement (localStorage). Thème aussi.
        </div>
      </div>
    </div>
  );
}
