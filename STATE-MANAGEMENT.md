# State Management — Search Results Flow (V0)

## Variables d'état

| Variable | Type | Valeurs | Rôle |
|---|---|---|---|
| `currentStep` | string | `'transport'` \| `'hotel'` \| `'recap'` \| `'confirmation'` | Étape active du wizard |
| `currentTransportView` | string | `'recos'` \| `'all-trains'` \| `'all-flights'` | Sous-vue transport active |
| `expandedRecoId` | string \| null | `'train1'` \| `'flight1'` \| `'train2'` \| `null` | Reco dont le detail inline est ouvert |
| `trainPhase` | string | `'outbound'` \| `'return'` \| `'complete'` | Phase de sélection leg-by-leg (All Trains) |
| `trainOutboundSelection` | object \| null | `{ id, name, price, times, cls }` | Aller sélectionné dans All Trains |
| `trainReturnSelection` | object \| null | `{ id, name, price, times, cls }` | Retour sélectionné dans All Trains |
| `currentSelection` | object | `{ id, name, price, step }` | Sélection en cours (transport ou hotel) |
| `hotelSkipped` | boolean | `true` \| `false` | L'utilisateur a skip l'étape hotel |

---

## Vues transport — 3 sous-vues exclusives

```
┌─────────────────────────────────────────────────────┐
│                   TRANSPORT STEP                     │
│                                                      │
│   ┌──────────┐   ┌──────────────┐   ┌────────────┐  │
│   │  Recos   │──▶│  All Trains  │   │ All Flights│  │
│   │(default) │◀──│  (md layout) │   │ (md layout)│  │
│   │          │──▶│              │   │            │  │
│   │          │◀──│              │   │            │  │
│   │          │──▶└──────────────┘   └────────────┘  │
│   │          │──▶                   ▲               │
│   │          │──────────────────────┘               │
│   │          │◀─────────────────────                │
│   └──────────┘                                      │
└─────────────────────────────────────────────────────┘
```

### Vue Recos (`currentTransportView === 'recos'`)

**États possibles :**

| État | `expandedRecoId` | Grid CSS | CTA bar | Detail zone |
|---|---|---|---|---|
| Aucune reco sélectionnée | `null` | normal | masqué | vide |
| Reco X ouverte | `'X'` | `.compact` | visible (summary de X) | panel HTML de X injecté |

**Transitions :**

| Action | Depuis | Vers | Effets |
|---|---|---|---|
| Clic reco card X | aucune sélection | X ouverte | inject `panels[X].html`, grid → compact, CTA bar visible, scroll vers detail |
| Clic reco card Y | X ouverte | Y ouverte | ferme X (vide innerHTML), ouvre Y, CTA bar update |
| Clic reco card X | X ouverte | aucune sélection | ferme X, grid → normal, CTA bar masqué |
| Clic "Voir tous les trains" | n'importe | All Trains | CTA bar **masqué** (mais `expandedRecoId` conservé) |
| Clic "Voir tous les vols" | n'importe | All Flights | CTA bar **masqué** (mais `expandedRecoId` conservé) |
| Clic CTA "Sélectionner" | X ouverte | → Hotel step | `selectRecoTransport()`, CTA bar masqué, `goToStep('hotel')` |

**Invariants :**
- Au plus 1 reco expanded à la fois
- CTA bar visible ⟺ `expandedRecoId !== null` ET `currentTransportView === 'recos'`
- Grid `.compact` ⟺ `expandedRecoId !== null`
- Le hint row ("Sélectionnées selon votre politique...") ne change JAMAIS de visibilité

### Vue All Trains (`currentTransportView === 'all-trains'`)

**Sous-états (leg-by-leg) :**

| `trainPhase` | Liste affichée | Detail droite | Footer | Guidance bar |
|---|---|---|---|---|
| `outbound` | Allers | placeholder ou aller sélectionné | masqué | "Choix de l'aller, puis du retour." |
| `return` | Retours | placeholder ou retour sélectionné | masqué | "Choisissez votre retour" + résumé aller |
| `complete` | masquée | dernier retour | visible (prix A/R) | masquée |

**Transitions :**

| Action | Depuis | Vers | Effets |
|---|---|---|---|
| Clic card aller dans liste | outbound, aucun | outbound, card highlight | `selectMdItem()`, injecte panel dans detail droite |
| Clic "Sélectionner cet aller" (dans detail) | outbound | return | `selectTrainLeg('outbound', ...)`, switch liste → retours, vide detail, leg summary visible |
| Clic card retour dans liste | return, aucun | return, card highlight | `selectMdItem()`, injecte panel retour dans detail |
| Clic "Sélectionner ce retour" (dans detail) | return | complete | `selectTrainLeg('return', ...)`, calcul prix A/R, selection-footer visible |
| Clic "Modifier l'aller" | return | outbound | `resetMdTrainOutbound()`, reset complet |
| Clic footer "Continuer →" | complete | Hotel step | `selectItem()`, `goToStep('hotel')` |
| Clic "← Retour aux recommandations" | n'importe | Recos | `showRecoView()`, reset train state, **restaure CTA bar si reco expanded** |
| Clic "✈️ Voir les vols" | n'importe | All Flights | `showAllView('flights')`, reset train state, flights detail vide |

**Invariants :**
- Selection footer visible ⟺ `trainPhase === 'complete'`
- Reco CTA bar toujours masqué dans cette vue
- Quand on switch outbound → return, la detail droite est vidée et les highlights retirés

### Vue All Flights (`currentTransportView === 'all-flights'`)

**Plus simple : pas de leg-by-leg** (vols = A/R atomique)

| Action | Effet |
|---|---|
| Clic card vol dans liste | `selectMdItem()`, highlight + injecte detail |
| Clic "Sélectionner et continuer" dans detail | `selectItem()` → Hotel step |
| Clic "← Retour aux recommandations" | `showRecoView()`, **restaure CTA bar si reco expanded** |
| Clic "🚄 Voir les trains" | `showAllView('trains')`, trains detail vide, phase outbound |

---

## Transitions entre vues

```
                    showAllView('trains')
              Recos ─────────────────────▶ All Trains
                ▲ ◀──── showRecoView() ──────┘  │
                │                                │ showAllView('flights')
                │   showAllView('flights')       ▼
                └──── showRecoView() ───── All Flights
              Recos ─────────────────────▶ All Flights
                                  showAllView('trains')
              All Flights ────────────────▶ All Trains
              All Trains  ────────────────▶ All Flights
```

Navigation directe entre All Trains ↔ All Flights via les liens cross-navigation ("✈️ Voir les vols" / "🚄 Voir les trains"). Passe par `showAllView()` qui reset l'état de la vue quittée.

### `showAllView(mode)` — vers All Trains ou All Flights

**Appelable depuis :** Recos (boutons "Voir tous"), All Trains (cross-link), All Flights (cross-link)

**Doit faire :**
- Masquer `#view-recos`, afficher uniquement la vue cible
- Reset `trainPhase` → `outbound` + selections (pour les DEUX modes — couvre le cas All Trains → All Flights)
- Vider detail droite + retirer highlights de la vue cible
- **Masquer le reco CTA bar** (ne PAS reset `expandedRecoId` — on conserve la sélection)
- Masquer selection-footer
- Scroll top

**Ne doit PAS faire :**
- Reset `expandedRecoId` (la reco reste ouverte visuellement pour le retour)
- Modifier les reco cards / grid / detail zone

### `showRecoView()` — All Trains/Flights → Recos

**Doit faire :**
- Masquer les vues All, afficher `#view-recos`
- Reset train state (`trainPhase`, sélections)
- Masquer selection-footer
- **Si `expandedRecoId` est set : restaurer le CTA bar** (`.visible`)
- Scroll top

**Ne doit PAS faire :**
- Fermer la reco expanded (elle est toujours dans le DOM)
- Modifier la grid (reste en mode compact si une reco est ouverte)

---

## Step transitions — Transport → Hotel → Recap → Confirmation

| Transition | Trigger | State reset |
|---|---|---|
| Transport → Hotel | `selectRecoTransport()` ou footer "Continuer" ou `selectItem(... 'transport')` | CTA bar masqué |
| Hotel → Recap | `selectItem(... 'hotel')` ou "Skip & continue" | `hotelSkipped` toggle |
| Recap → Confirmation | "Confirmer et réserver" | — |
| Retour arrière (stepper clic) | `goToStep(step)` | Pas de reset auto — l'état des sous-vues est conservé |

---

## Éléments UI pilotés par l'état

| Élément | Quand visible | Piloté par |
|---|---|---|
| **Reco CTA bar** (`#reco-cta-bar`) | Reco expanded ET vue = recos | `toggleRecoDetail()`, `showAllView()`, `showRecoView()` |
| **Selection footer** (`#selection-footer`) | Train A/R complet dans All Trains | `selectTrainLeg('return')`, `showAllView()`, `showRecoView()` |
| **Grid compact mode** (`.d-reco-grid.compact`) | Reco expanded | `toggleRecoDetail()` |
| **Train guidance bar** | Vue All Trains, phase ≠ complete | `updateMdTrainPhaseUI()` |
| **Leg summary chip** | Vue All Trains, phase = return | `updateMdTrainPhaseUI()` |
| **Drawer** | Hotels uniquement | `openDrawer()` (transport blocked) |
| **Hint row** | Toujours visible dans la zone recos | CSS statique, jamais modifié par JS |

---

## Edge cases et pièges connus

### 1. Retour Recos après All Trains avec reco expanded
- **Scénario** : Clic reco → detail ouvert → "Voir tous les trains" → "← Retour aux recos"
- **Attendu** : La reco est toujours ouverte, grid compact, CTA bar visible
- **Piège** : `showAllView()` masque le CTA bar. `showRecoView()` doit le restaurer.

### 2. Sélection dans All Trains puis retour aux Recos
- **Scénario** : Reco ouverte → All Trains → sélection aller+retour → footer visible → "← Retour"
- **Attendu** : Footer masqué, train state reset, reco toujours ouverte avec CTA bar
- **Piège** : Le selection-footer ne doit pas leak vers la vue recos.

### 3. Changement de reco pendant qu'une autre est ouverte
- **Scénario** : Clic reco A → detail A ouvert → clic reco B
- **Attendu** : Detail A fermé (innerHTML vidé), detail B ouvert, CTA bar mis à jour avec infos B
- **Piège** : Ne pas oublier de vider `innerHTML` du précédent (pas juste `display:none`).

### 4. Clic stepper "Transport" depuis Hotel
- **Scénario** : Reco sélectionnée → hotel → clic stepper "Transport"
- **Attendu** : Retour sur la vue transport dans l'état où elle a été quittée
- **Piège** : `goToStep('transport')` ne reset rien — c'est voulu. L'état des sous-vues est conservé.

### 5. Cross-navigation All Trains → All Flights (directe)
- **Scénario** : All Trains → sélection aller en cours → clic "✈️ Voir les vols"
- **Attendu** : All Flights s'ouvre vierge, train state reset, selection-footer masqué
- **Piège** : `showAllView('flights')` doit reset `trainPhase`, `trainOutboundSelection`, `trainReturnSelection`. Sinon le state train leak.

### 6. Cross-navigation All Flights → All Trains
- **Scénario** : All Flights → clic "🚄 Voir les trains"
- **Attendu** : All Trains s'ouvre en mode outbound, detail vide, aucun highlight
- **Piège** : `showAllView('trains')` reset déjà tout — OK. Vérifier que le flight detail/highlights sont aussi nettoyés (ils le sont car la vue est simplement masquée).

### 7. Train phase et CTA overlap
- **Scénario** : All Trains, phase `complete` → selection-footer visible → "← Retour aux recos"
- **Attendu** : Selection-footer masqué, pas de double CTA
- **Piège** : `showRecoView()` doit masquer selection-footer ET potentiellement afficher reco CTA bar. Ne jamais avoir les deux visibles simultanément.

---

## Checklist pour les devs front

- [ ] Un seul CTA visible à la fois (reco CTA bar XOR selection-footer XOR rien)
- [ ] `expandedRecoId` survit aux changements de sous-vue transport
- [ ] Grid compact / normal est synchronisé avec `expandedRecoId`
- [ ] Train state (`trainPhase`, selections) est reset quand on quitte All Trains
- [ ] Le hint row ne bouge jamais (pas de transition, pas de hide/show)
- [ ] Le drawer ne s'ouvre jamais pour du transport (`openDrawer` short-circuit)
- [ ] `innerHTML` est vidé quand on ferme un detail (pas juste `display:none`) pour éviter les event listeners zombies
- [ ] Scroll top systématique au changement de sous-vue
