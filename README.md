# DP Generator — Roadmap V1 (DP1 + DP2) — Patch minimal, zéro régression

URL produit (référence) : https://solaire-dp-generator-29459740400.europe-west1.run.app/dp/

Objectif : corriger la cartographie (DP1) + compléter DP2A/DP2B (plan de masse avant/après) SANS casser le générateur existant (PDF, branding, pages DP4+).

---

## 0) SASP (Situation / Attendu / Solution)

### Situation actuelle (factuel)
- Le générateur fonctionne et sort un PDF avec une structure solide.
- Prod = 2 services Cloud Run :
  - `solaire-dp-generator` = UI (/dp)
  - `dp-generator` = API (/dp/preview, /dp/generate, /dp/download)
- Problème carto : endpoint WMS cadastre cassé / mauvais → placeholders / cartes non fiables.
- DP2A/DP2B : gabarit OK (cadre, titres, légendes, rose des vents, échelle affichée) mais l’image centrale métier est incomplète.
- DP2B est trop proche de DP2A : panneaux non dessinés alors que le nombre de panneaux est connu (input UI).

### Attendu (métier)
- DP1 : plus aucun placeholder, fond carto stable (sources officielles).
- DP2A : plan de masse AVANT exploitable (fond + limites propriété + repère/zone).
- DP2B : identique à DP2A + panneaux visibles (quantité exacte) — la légende “Panneaux solaires” existe déjà, on ne la modifie pas.
- Branding intact : société, maître d’ouvrage, logo upload, champs techniques doivent rester cohérents.

### Solution V1 (patch minimal)
- Corriger la génération du fond carto (DP1 + DP2) en remplaçant WMS cassé par WMS fonctionnel.
- Remplacer UNIQUEMENT les images centrales DP2 (avant/après) par une image composite :
  - DP2A = fond + limites propriété (+ zone/repère si dispo)
  - DP2B = DP2A + panneaux (rectangles) en quantité exacte
- Aucune refonte globale, aucun changement de layout PDF, pas de changement CRM master.

---

## 1) MÉTIER (ce qu’on veut voir dans le PDF)

### 1.1 DP1 (cartes)
- [ ] Les cartes DP1 ne doivent jamais être vides.
- [ ] Les fonds carto doivent être stables (cadastre/plan IGN/ortho selon preset existant).
- [ ] Le rendu doit rester identique en mise en page (cadres/titres/légendes).

### 1.2 DP2A (Plan de masse AVANT)
- [ ] Fond carto (cadastre ou plan IGN) visible.
- [ ] Limites de propriété visibles (contour parcelle).
- [ ] Zone concernée / repère : si donnée dispo (roof/segment), on highlight. Sinon, on n’invente pas : on reste sur parcelle + repère simple.
- [ ] Le cadre DP2 (échelle affichée, rose des vents, titres, légendes) reste inchangé.

### 1.3 DP2B (Plan de masse APRÈS)
- [ ] Identique à DP2A + panneaux visibles.
- [ ] Nombre de panneaux = valeur saisie dans le formulaire UI.
- [ ] Pas besoin de calepinage exact : rectangles réguliers suffisent, mais N doit être exact.
- [ ] La légende “Panneaux solaires” est déjà dans le PDF : ne pas la toucher.

### 1.4 Variables “produit” (à ne pas casser)
- [ ] Nom de la société (input UI) apparaît correctement.
- [ ] Maître d’ouvrage (input UI) apparaît correctement.
- [ ] Logo uploadé (input UI) est intégré correctement.
- [ ] Champs techniques (puissance, nb panneaux, etc.) restent cohérents.

---

## 2) TECHNIQUE (pipeline à exécuter sans casser)

### Règles de sécurité
- Interdit : toucher au CRM master / autres projets.
- Interdit : modifier la mise en page globale du PDF.
- Interdit : gros refactor.
- Obligatoire : génération d’un PDF de référence à CHAQUE étape (comparaison avant/après).
- Obligatoire : rollback simple (git branch + commits atomiques).

### 2.1 Base de travail
- Source de travail = code qui matche la prod (snapshot/hash identique à Cloud Run).
- Travail en branche dédiée : `patch-carto-dp1-dp2`.

### 2.2 Environnement Python
- Utiliser Python 3.11 (éviter 3.14 qui casse Pillow/roues).
- Venv propre + installation deps.
- Smoke test : générer un PDF baseline sans aucun patch.

### 2.3 Fix fond carto (DP1 + DP2)
- But : supprimer placeholders.
- Action : remplacer endpoint WMS cadastre cassé (wms-v/ows) par endpoint fonctionnel (wms-r/wms) + paramètres cohérents (WMS 1.3.0, CRS, bbox order, etc.).
- Output : PDF “T2” où DP1 et DP2 ont un fond visible.

### 2.4 DP2A composite (image centrale)
- Base : image fond DP2 (cadastre/plan).
- Overlay : limites de propriété (géométrie parcelle) tracées (Pillow/canvas côté backend).
- Overlay optionnel : highlight “pan de toit concerné” si géométrie dispo. Sinon : pas d’invention.

### 2.5 DP2B composite (DP2A + panneaux)
- Réutiliser DP2A composite.
- Ajouter panneaux : N rectangles (N = nb panneaux input UI).
- Placement :
  - Si zone roof/segment dispo : placement dans cette zone.
  - Sinon : placement dans zone parcelle (fallback contrôlé, sans géométrie au hasard “hors parcelle”).

---

## 3) FAIT / À FAIRE (checklist avec validations)

### Phase A — Baseline & garde-fous
- [ ] A1. Repo de travail prêt (branche dédiée).
- [ ] A2. `_outputs/` créé.
- [ ] A3. PDF baseline PROD (depuis /dp) archivé.
- [ ] A4. PDF baseline LOCAL (depuis repo) archivé.
- [ ] A5. Diff visuel DP1/DP2 baseline OK (on sait ce qu’on corrige).

### Phase B — Carto DP1/DP2 : plus de placeholder
- [ ] B1. Endpoint WMS corrigé (wms-r/wms).
- [ ] B2. PDF après B1 : DP1 OK (fond visible).
- [ ] B3. PDF après B1 : DP2 OK (fond visible).

### Phase C — DP2A complet
- [ ] C1. Contour parcelle tracé sur DP2A.
- [ ] C2. (Optionnel) highlight zone toit si dispo.
- [ ] C3. PDF après C : DP2A exploitable.

### Phase D — DP2B complet
- [ ] D1. Ajout des panneaux (N exact).
- [ ] D2. PDF après D : DP2B ≠ DP2A et correct.

### Phase E — Non-régression produit
- [ ] E1. Société OK.
- [ ] E2. Maître d’ouvrage OK.
- [ ] E3. Logo upload OK.
- [ ] E4. Pages DP4+ inchangées (spot check).

### Phase F — GitHub & traçabilité
- [ ] F1. Repo GitHub créé ou branche pushée.
- [ ] F2. README + runbook + checklist.
- [ ] F3. `_outputs/` (ou liens) + captures avant/après.
- [ ] F4. Tag release `v1.0-patch-carto`.

---

## 4) Tests de validation (adresse canonique)
Adresse canonique de test :
- 14 Rue Emile Nicol, 14430 Dozulé

Inputs (exemple) :
- Société : SOLAIRE FACILE
- Maître d’ouvrage : Nom Prénom
- Nb panneaux : 24
- Logo : upload test

Attendus :
- DP1 : fonds carto non vides
- DP2A : fond + parcelle visible
- DP2B : DP2A + 24 panneaux visibles

---

## 5) Notes importantes
- La légende “Panneaux solaires” est déjà présente : on ne la modifie pas.
- Le bâtiment peut être visible via le fond carto (cadastre/plan). Ne pas dépendre uniquement de Solar API pour “dessiner un bâtiment”.
- V1 = patch minimal : on privilégie stabilité + non-régression.
