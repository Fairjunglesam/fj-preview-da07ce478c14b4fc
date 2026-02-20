# Spec V0 — Search Results: Transport

> Proto live : https://fairjunglesam.github.io/fj-preview-da07ce478c14b4fc/
> Scope : étape Transport uniquement. Hotel = spec séparée à venir.

---

## TL;DR

**Backend : zéro changement.** Tout ce dont le proto a besoin existe déjà dans l'API GraphQL. Ce V0 est un pur redesign frontend.

### Ce qui existe déjà dans le backend/API

| Feature | Code existant | Vérifié dans |
|---|---|---|
| 3 recos transport | `transportOptions: [NG_TransportRate]` sur `NG_Project` | `project.gql.ts` |
| Scoring ML + labels | `orderedTags[]` (Recommended, Cheapest, Ecofriendly, DiscountedPrice, NegociatedPrice) | `clientTypes.ts:GqlNgTagId` |
| Leg-by-leg trains | Mutation `SearchTrainSessionSelectLeg`, state machine `selectLegRateIdImpl`, flow outbound→inbound | `SearchSessionTrainLegsSearchController.ts`, `TransportRailContext.tsx` |
| Tarifs alternatifs | `sameClassByFlexibilityDefaultSiblings` (Light/Semi-flex/Flex), `sameclassAndFlexibilitySiblingGroups` (1ère/2nde), `defaultSiblingOfClass()`, `listRelPrice` (delta "+50 €") | `clientTypes.ts:GqlNgLegRate`, `LegSelectionUi.tsx` |
| Counts résultats | `totalListSize` sur `FlightsListInfo`, déjà utilisé pour la pagination | `TransportList.tsx`, `flightsList.ts` (MongoDB aggregation) |
| Master-detail layout | `AllTransportTemplate` (liste gauche + detail droite sticky) | `AllTransportTemplate.tsx` |
| Filtres | `FilterMenuBar` horizontal : airlines, cabin classes, horaires, durée, airports, layovers, tags | `TransportSearchFilter.tsx` |
| Train pagination | Cursor-based "Partir plus tôt / Partir plus tard" via `prevListMark`/`nextListMark` | `LegSelectionUi.tsx`, `TransportRailContext.tsx` |
| Flight pagination | Offset-based, 15 items/page, composant `Pagination` | `TransportList.tsx` |
| CO2 | `carbonEmissionsInKg` (Float, kg bruts) sur `NG_TransportRate` | `clientTypes.ts` |
| Conditions tarifaires | `fareConditions[]` per leg + `additionalServices.changeable/cancellable` (Available/ForAFee/Unavailable) | `GqlNgFareConditions`, `GqlNgTransportServices` |
| "Voir tous" buttons | Déjà dans `SuggestionsMainUi`, route vers `AllTransportTemplate` | `SuggestionsMainUi.tsx:101` |
| Mobile modal | `TransportDetailModalTemplate` (centered modal, header sticky + X close) | `TransportDetailModalTemplate.tsx` |

### Ce que le V0 change (front uniquement)

| Aspect | Aujourd'hui (prod) | V0 |
|---|---|---|
| **Layout recos** | `PropositionsSlider` (carousel horizontal) | Grid 3 colonnes (desktop), carousel avec peek (mobile) |
| **Detail reco** | Centered modal (`TransportDetailModal.tw.tsx`) | **Inline detail** sous la grid (desktop), fullscreen overlay (mobile) — nouveau pattern |
| **Tarif dans recos** | Clic = sélection directe (1 tarif) | **Tariff cards** : afficher les alternatives existantes (`sameClassByFlexibilityDefaultSiblings`) |
| **All Trains** | Liste verticale dans `AllTransportTemplate`, leg-by-leg via `RailSearchUi` | **Redesign UI** : phase bar explicite, selection footer. Même data flow. |
| **All Flights** | `AllTransportTemplate` + `FilterMenuBar`, pas de tri | Ajout **tri** (pertinence, heure départ, heure arrivée, prix) — front-only. Mêmes filtres, même layout. |
| **"Voir tous" buttons** | Existent mais sans count | Afficher `totalListSize` dans le libellé |

**Ratio effort : ~100% front.** Le CTO peut dormir tranquille.

---

## 1. Architecture des vues

```
TRANSPORT STEP
│
├── Vue Recos (default)
│   ├── Context chips (ville, dates, voyageurs)
│   ├── Hint "Selon votre politique, préférences et historique"
│   ├── Boutons "Tous les trains (N)" / "Tous les vols (N)"
│   ├── 3 reco cards (grid / carousel mobile)
│   ├── Inline detail (expand/collapse, pleine largeur)
│   └── CTA bar fixe (bottom, quand detail ouvert)
│
├── Vue All Trains (master-detail, leg-by-leg)
│   ├── Nav bar : ← Recos | context chips | Voir les vols →
│   ├── Phase bar : "Choix de l'aller" / "Choix du retour" + résumé aller
│   ├── "Partir plus tôt" / "Partir plus tard" (pagination existante)
│   ├── Liste gauche : train cards par date (groupBy departure.dateTime)
│   ├── Detail droite : itinéraire + tariff cards + CO2
│   └── Selection footer (quand A/R complet)
│
└── Vue All Flights (master-detail, A/R atomique)
    ├── Nav bar : ← Recos | context chips | Voir les trains →
    ├── Sort bar : Pertinence (défaut) | Heure de départ | Heure d'arrivée | Prix
    ├── FilterMenuBar existant (airlines, classes, horaires, durée, escales)
    ├── Liste gauche : flight cards (legs empilés)
    ├── Detail droite : itinéraire + tariff cards + CO2
    ├── Pagination numérotée (existante)
    └── CTA dans le detail
```

Navigation directe entre les 3 vues. Pas de steps intermédiaires.

---

## 2. Vue Recos

### 2.1 Source des données

Zéro changement. `transportOptions: [NG_TransportRate]` sur `NG_Project`, fragment `ngProjectSearchResults`.

### 2.2 Reco cards — mapping données

| Champ affiché | Source GraphQL | Notes |
|---|---|---|
| Icône 🚄/✈️ | `mainTransportKind` (Rail/Flight) | |
| Prix total A/R | `price.amount` | |
| Prix par pax | `perTravelerPrice.amount` | Si `travelersCount > 1` |
| Tag principal | `orderedTags[0]` | Recommended / Cheapest / Ecofriendly |
| Opérateur + logo | `orderedLegs[0].summary.mainMarketingCompany` | `.companyName`, `.logos` |
| Classe | `orderedLegs[0].summary.cabinClass` + `transportClassDescription` | `.longDescription` = "2nde classe" |
| Horaires aller | `orderedLegs[0].summary.departure.dateTime` / `.arrival.dateTime` | |
| Durée aller | `orderedLegs[0].summary.totalDuration` | Minutes |
| Direct/escales | `orderedLegs[0].summary.stops` | 0 = direct |
| Horaires retour | `orderedLegs[1].summary.…` | Idem leg 1 |
| Conditions | `additionalServices.changeable.availability` / `.cancellable.availability` | Enum: Available, ForAFee, Unavailable |
| CO2 | `carbonEmissionsInKg` | Nullable, kg bruts |

### 2.3 Reco inline detail — contenu

**Aujourd'hui** : clic reco → centered modal (`TransportDetailModal.tw.tsx`).
**V0** : clic reco → inline detail (desktop) / fullscreen overlay (mobile).

Contenu du detail (données toutes disponibles) :

1. **Itinéraire aller** — timeline segments (`orderedLegs[0].segments[]`), chaque segment : `departure/arrival`, `duration`, `marketingCompany`, `cabinClass`, `vehicle`
2. **Itinéraire retour** — `orderedLegs[1].segments[]`
3. **Fare conditions** — `orderedLegs[].summary.fareConditions[]` → `fareOptionWording` + `fareConditionOperatorText`
4. **Tariff cards** — données dans `siblings[]` (sur `NG_TransportRate` pour les recos) ou via `sameClassByFlexibilityDefaultSiblings` + `sameclassAndFlexibilitySiblingGroups` (sur `NG_LegRate` pour All Trains). Voir section 5.
5. **CO2** — `carbonEmissionsInKg` (kg bruts)

**Ce qu'on NE montre PAS en V0** :
- **CO2 kg bruts** → `carbonEmissionsInKg`, affichage "127 kg CO2" + icône verte. Pour les trains, ajouter le bandeau info statique existant : _"Le train émet en moyenne 98% moins de CO2 que l'avion."_ (déjà hardcodé dans `LegSelectionUi.tsx:482`, à réutiliser).
- ~~Fidélité / points par classe~~ → pas dans `NG_TransportRate`. **Post-V0** : afficher les programmes fidélité éligibles si au moins un traveller a une carte de fidélité compatible. Le mapping supplier → programme de fidélité existe déjà dans un CSV du repo. Condition d'affichage : au moins 1 traveller avec une `loyaltyCard` dont le programme match le supplier du transport.

### 2.4 Desktop vs mobile

| | Desktop | Mobile (<768px) |
|---|---|---|
| Grid | 3 colonnes | Carousel horizontal (82% width, scroll snap, peek card suivante) |
| Detail | Inline sous la grid, grid passe en compact | **Fullscreen overlay** slide-up (header sticky titre + ✕) |
| CTA | Bar fixe en bas de page | Bar fixe en bas de l'overlay |
| Fermeture | Click outside = ferme le detail | Bouton ✕ dans le header |

---

## 3. Vue All Trains — leg-by-leg

### 3.1 Tout existe côté data

| Brique | Code existant | Ce qu'on réutilise tel quel |
|---|---|---|
| Search session | `NG_trainTransportSearchSessionWithProjectId` | Crée la session train |
| Liste des legs | `NG_transportSearchSessionLegs(sessionId, listMark)` → `legRates[]` | Liste d'allers, puis de retours |
| Detail d'un leg | `NG_transportSearchSessionLegDetailForId(sessionId, legRateId)` | Panel droit : detail complet |
| Sélection leg | `NG_searchSessionSelectRateId(sessionId, legRateId)` | Backend switch outbound→inbound |
| Retours compatibles | `searchInboundLegsApiImpl()` côté back, `returnLegsForSession()` côté front | Chargés après select aller |
| Pagination temps | `prevListMark` / `nextListMark` sur `pageMeta` | "Partir plus tôt / plus tard" |
| Tarifs alternatifs | `sameClassByFlexibilityDefaultSiblings`, `sameclassAndFlexibilitySiblingGroups` sur `NG_LegRate` | Tariff cards dans le detail |
| Sélection finale | `NG_selectItineraryInProjectFromSessionSelection(sessionId)` | → avance vers Hotel |

**Le flow front existant** (`TransportRailContext.tsx`) :
1. `handleConfirmSelection()` avec outbound sélectionné → appelle `selectLegRateId()` → backend renvoie les retours
2. Reducer dans `RailSearchUi.tsx` switch de `showLegs` à `showReturnLegs`
3. Même process pour le retour → `selectLegRateId()` → session complete

**Ce qu'on change** : uniquement le rendering. On remplace le composant `LegSelectionUi` actuel par un nouveau layout master-detail + phase bar. Le data flow est identique.

### 3.2 Le flow en 3 phases

```
Phase OUTBOUND                    Phase RETURN                     Phase COMPLETE
┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
│ Liste = allers   │  select     │ Liste = retours  │  select     │ Selection footer │
│ Detail = vide    │ ────────►   │ Detail = vide    │ ────────►   │ "Continuer →"    │
│ Phase bar =      │   aller     │ Phase bar =      │   retour    │                  │
│ "Choix de l'aller"│            │ "Choix du retour"│             │ Résumé A/R +     │
└─────────────────┘              │ + chip résumé    │             │ prix combiné     │
                                 │   aller          │             └─────────────────┘
                                 └─────────────────┘
```

### 3.3 Train list card — mapping données

Données depuis `NG_LegRate` (fragment `ngLegRestrictedSummary`) :

| Champ | Source |
|---|---|
| Opérateur + logo | `summary.mainMarketingCompany.companyName` + `.logos` |
| Durée + stops | `summary.totalDuration` + `summary.stops` (0 = direct) |
| Horaires | `summary.departure.dateTime` / `summary.arrival.dateTime` |
| Gares | `summary.departure.place.name` / `summary.arrival.place.name` |
| Tags | `orderedTags[]` |
| Classe + tarif | `summary.cabinClass` + `summary.fareOptionWording` |
| Prix | `price.amount` |
| Prix relatif | `listRelPrice.amount` (delta vs moins cher, "+50 €") |
| Conditions | `summary.fareConditions[].fareConditionOperatorText` |

### 3.4 Train detail panel

Données depuis `NG_LegRate` (fragment `ngLegDetailedSummary` + `ngLegDetailedSegment`) :

- Timeline segments : `segments[]` avec `departure`, `arrival`, `duration`, `marketingCompany`, `vehicle`, `cabinClass`
- Correspondances : `hasTransfert`, `preFlightLayoverDuration`
- Tariff cards : voir section 5
- Fare conditions complètes : `summary.fareConditions[].fareConditionOperatorText`
- CO2 : pas dispo par leg individuel (seulement sur `NG_TransportRate` global)

---

## 4. Vue All Flights — A/R atomique

### 4.1 Tout existe aussi

Même session/query que les trains mais avec `NG_flightTransportSearchSessionWithProjectId`. Chaque `NG_LegRate` = un A/R complet (outbound + return dans `segments[]`).

### 4.2 Filtres existants

Déjà implémentés dans `TransportSearchFilter.tsx` sous forme de `FilterMenuBar` horizontal :

| Filtre | Type | Source data (`FlightsListInfo`) |
|---|---|---|
| Airlines | Multi-select | `carriers[]` |
| Cabin classes | Multi-select | `cabinClasses[]` |
| Horaires aller | Range slider | `minMaxOutboundDepartureTime` |
| Horaires retour | Range slider | `minMaxInboundDepartureTime` |
| Durée max | Slider | `durationRange` |
| Airports départ | Multi-select | `airports[].originAirports` (si multi-aéroport) |
| Airports arrivée | Multi-select | `airports[].destinationAirports` |
| Escales | Multi-select | `layovers` |
| Tags | Multi-select | `tags[]` |
| ~~Prix~~ | ~~Range~~ | Code existe mais **désactivé** (`"to implement later"`) |

### 4.3 Tri (NOUVEAU — n'existe pas en prod)

**Vols uniquement.** Les trains n'ont ni tri ni filtre — l'affichage est toujours chronologique.

| Option de tri | Défaut | Implémentation |
|---|---|---|
| **Pertinence** | ✅ Oui | Ordre naturel retourné par l'API (scoring ML côté back) |
| **Heure de départ** | | Tri front sur `orderedLegs[0].summary.departure.dateTime` |
| **Heure d'arrivée** | | Tri front sur `orderedLegs[0].summary.arrival.dateTime` |
| **Prix** | | Tri front sur `price.amount` (croissant) |

**UI** : barre de tri sous le nav bar, au-dessus des filtres. 4 boutons pill, le tri actif est highlighted. Clic = re-tri instantané de la liste (front-only, pas de re-fetch API).

**Backend** : aucun changement. Le tri est purement front-end. L'API retourne déjà les résultats triés par pertinence (scoring ML). Les 3 autres tris sont des sorts JavaScript sur les données déjà chargées.

> **Note** : la prod n'a aucun tri transport (`TransportSearchController.tsx` ne contient aucun `sort`/`orderBy`). Le tri existe uniquement pour les hôtels (`HotelSearchController.tsx` avec `GqlNgHotelSortInput`). C'est donc une feature **nouvelle** pour les vols.

**Ce qu'on change** : les filtres sont déjà en chips horizontal. Le layout master-detail existe. On ajoute le tri (nouveau) + CSS polish.

---

## 5. Tariff cards — données existantes, UI nouveau

### 5.1 Les données existent

**C'est la découverte principale de cette analyse.** L'API expose déjà TOUS les tarifs alternatifs :

**Sur `NG_LegRate`** (dans All Trains) :

| Field | Contenu | Utilisé dans |
|---|---|---|
| `sameClassByFlexibilityDefaultSiblings[]` | 1 tarif par niveau de flexibilité (Light / Semi-flex / Flex) | `LegSelectionUi.tsx:427-470` |
| `sameclassAndFlexibilitySiblingGroups[]` | Matrice complète classe × flexibilité (1ère Standard, 1ère Flex, 2nde Standard, 2nde Flex…) | `LegSelectionUi.tsx` (ComfortClassBlock) |
| `defaultSiblingOfClass(transportClass)` | Tarif par défaut pour une classe donnée | Requête GQL paramétrable |
| `listRelPrice` | Prix relatif vs le moins cher ("+75 €") | Déjà affiché dans les cards |
| Chaque sibling a | `price`, `fareOption`, `fareOptionWording`, `cabinClass`, `transportClassDescription`, `additionalServices` | |

**Sur `NG_TransportRate`** (dans les recos) :

| Field | Contenu |
|---|---|
| `siblings[]` | Array de `NG_TransportRate` — mêmes legs, tarif/classe différent |
| `fareOption` | Light / Standard / Flex / Unknown |
| `fareOptionWording` | Texte localisé ("Semi-flex", "Flexible") |
| Chaque sibling a | Tous les mêmes champs que le rate parent |

**Frontend existant** : `LegSelectionUi.tsx` affiche déjà des boutons de sélection de tarif (section "Tarifs") et de classe (section "Confort"). Le composant `ComfortClassBlock` rend les alternatives par classe avec `relativePrice`.

### 5.2 Ce qu'on crée

Un nouveau composant `TariffCard` qui réutilise ces données :

```
┌─────────────────────────────────┐
│ 2nde Standard         97 €/pax │  ← sélectionné (fareOption = "Standard")
│ Modifiable avec frais           │     additionalServices.changeable.availability = ForAFee
│ Non remboursable                │     additionalServices.cancellable.availability = Unavailable
├─────────────────────────────────┤
│ ▾ Conditions détaillées         │  ← fareConditionOperatorText
│ "Billet échangeable (ajustement│
│  au tarif en vigueur) et       │
│  remboursable uniquement avant │
│  départ : 15 € de frais..."   │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 2nde Flex              +50 €   │  ← listRelPrice.amount = 50
│ Modifiable sans frais           │     changeable.availability = Available
│ Remboursable                    │     cancellable.availability = Available
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 1ère Standard         +75 €   │  ← sameclassAndFlexibilitySiblingGroups[1]
│ Modifiable avec frais           │
│ Non remboursable                │
└─────────────────────────────────┘
```

**Pas de backend.** On consomme `sameClassByFlexibilityDefaultSiblings` pour la flexibilité et `sameclassAndFlexibilitySiblingGroups` pour les classes. Les prix relatifs sont déjà calculés côté back.

### 5.3 Sélection d'un tarif alternatif

Quand l'user sélectionne un tarif différent, on appelle la même mutation existante `NG_searchSessionSelectRateId` avec l'`id` du sibling rate. Le backend gère le switch.

---

## 6. State management

### 6.1 Variables d'état

| Variable | Type | Rôle |
|---|---|---|
| `currentTransportView` | `'recos' \| 'all-trains' \| 'all-flights'` | Vue active |
| `expandedRecoId` | `string \| null` | Reco dont le detail est ouvert. **Survit** aux changements de vue. |
| `trainPhase` | `'outbound' \| 'return' \| 'complete'` | Phase leg-by-leg (All Trains only) |
| `trainOutboundSelection` | `NG_LegRate \| null` | Aller sélectionné (résumé dans la phase bar) |
| `trainReturnSelection` | `NG_LegRate \| null` | Retour sélectionné |
| `selectedTariffId` | `string \| null` | Tarif actif dans le detail panel (sibling rate id) |
| `flightSortBy` | `'relevance' \| 'departure' \| 'arrival' \| 'price'` | Tri actif pour All Flights (défaut: `'relevance'`). Reset à `'relevance'` quand on quitte la vue. |

### 6.2 Invariants

1. **Un seul CTA visible** : reco CTA bar XOR selection footer XOR rien
2. **`expandedRecoId` survit** aux switches de vue
3. **Train state reset** quand on quitte All Trains
4. **Body scroll lock** sur mobile quand overlay fullscreen ouvert — restore dans CHAQUE chemin de sortie (close, select, back)

### 6.3 Détail

Voir [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md)

---

## 7. Changements backend

**Aucun.**

| "Changement" qu'on pensait nécessaire | Statut réel |
|---|---|
| ~~Leg-by-leg trains~~ | **Existe** : `SearchTrainSessionSelectLeg` + `selectLegRateIdImpl` |
| ~~Tarifs alternatifs~~ | **Existe** : `sameClassByFlexibilityDefaultSiblings`, `sameclassAndFlexibilitySiblingGroups`, `siblings[]` |
| ~~Counts résultats~~ | **Existe** : `totalListSize` sur `FlightsListInfo` |
| ~~CO2~~ | **Existe** : `carbonEmissionsInKg` |
| ~~Conditions tarifaires~~ | **Existe** : `fareConditions[]` + `additionalServices` |
| ~~Pagination trains~~ | **Existe** : `prevListMark`/`nextListMark` |

Points d'attention backend :
- **Re-sélection aller** : vérifier que le flow existant (changer d'avis après avoir vu les retours) fonctionne correctement. Ce n'est pas un développement, c'est un test.
- **Tri vols** : le tri est purement front-end (sort JS sur les données déjà chargées). Aucun paramètre `sort`/`orderBy` à ajouter côté API. L'ordre par défaut de l'API = "pertinence" (scoring ML).

---

## 8. Changements frontend — résumé pour le dev

### Nouveaux composants

| Composant | Ce qu'il fait | Données source | Effort |
|---|---|---|---|
| **RecoGrid** | Remplace `PropositionsSlider` — grid 3 cols desktop, carousel mobile, expand/collapse inline detail | `NG_Project.transportOptions[]` (même data) | Fort |
| **RecoInlineDetail** | Itinéraire A/R + tariff cards + CO2 + CTA bar. Remplace la centered modal actuelle. | `NG_TransportRate` (legs, segments, siblings, fareConditions, carbonEmissionsInKg) | Fort |
| **TariffCard** | Sélection visuelle de tarif (classe × flexibilité) avec conditions collapsibles | `sameClassByFlexibilityDefaultSiblings`, `sameclassAndFlexibilitySiblingGroups`, `listRelPrice` | Moyen |
| **TrainPhaseBar** | Barre "Choix de l'aller" / "Choix du retour" + résumé chip aller sélectionné | State local (`trainPhase`, `trainOutboundSelection`) | Faible |
| **SelectionFooter** | Récap A/R + prix combiné + CTA "Continuer →" | `trainOutboundSelection` + `trainReturnSelection` | Faible |
| **CrossNavBar** | Navigation ← Recos | context | Voir les vols/trains → | State local (`currentTransportView`) | Faible |

### Composants modifiés

| Composant existant | Modification | Effort |
|---|---|---|
| **AllTrainsView** (wraps `AllTransportTemplate`) | Ajouter phase bar, train pagination ("Partir plus tôt/tard" existe dans `LegSelectionUi`, à repositionner dans le nouveau layout), selection footer | Fort |
| **TransportCard** | Ajouter affichage classes/prix par pax dans la card (`listRelPrice` pour les alternatives) | Faible |
| **TransportDetailModalTemplate** | Adapter pour reco fullscreen overlay mobile (même pattern, juste routing différent) | Faible |

### Composants inchangés

| Composant | Pourquoi |
|---|---|
| `AllTransportTemplate` | Layout master-detail existe, on wrape juste |
| `TransportSearchFilter` / `FilterMenuBar` | Filtres chips déjà en place |
| `TransportList` / `Pagination` | Liste + pagination offset pour vols |
| `TransportRailContext` + `RailSearchUi` | Data flow leg-by-leg intact |
| `TransportDetail` | Panel detail droite, on ajoute juste TariffCard dedans |

---

## 9. Pièges

### Frontend

| Piège | Pourquoi c'est piégeux | Mitigation |
|---|---|---|
| **Inline detail = nouveau pattern** | Aujourd'hui toutes les recos ouvrent une modal (`TransportDetailModal.tw.tsx`). L'inline expand n'existe nulle part en prod. C'est le plus gros risque UX du V0. | Bien tester focus management, accessibility, keyboard nav. Le proto valide le concept mais pas l'intégration React. |
| **Double CTA** | Le reco CTA bar et le selection footer (All Trains) peuvent coexister si le state n'est pas clean | Invariant strict : un seul CTA visible à la fois |
| **State leak trains → flights** | `trainPhase` et les sélections persistent si on oublie le reset | Reset systématique dans `showAllView()` |
| **Body scroll lock mobile** | Overlay fullscreen = `overflow: hidden` sur body. Si on oublie de restore (cas: sélection depuis l'overlay, back, close) → page bloquée | Restore dans CHAQUE chemin de sortie |
| **`siblings[]` vs `sameClassByFlexibilityDefaultSiblings`** | Sur `NG_TransportRate` (recos) c'est `siblings[]`. Sur `NG_LegRate` (All Trains) c'est `sameClassByFlexibilityDefaultSiblings` + `sameclassAndFlexibilitySiblingGroups`. Deux structures différentes pour le même concept. | Le composant TariffCard doit accepter les deux formats, ou normaliser en amont |
| **CO2 commenté** | `carbonEmissionsInKg` est dans le schema mais **commenté** dans `TransportCard.tsx:116`. Il faut le ré-activer. | Vérifier que les data sont bien remplies (bug connu : Duffel renvoie parfois 0) |
| **Tri vols front-only** | Le tri est un sort JS côté front sur les données déjà chargées. Attention à la pagination : si 15 items/page, le tri ne s'applique qu'à la page courante (pas au dataset complet côté back). Documenter ce comportement. | Afficher "Tri sur les résultats affichés" ou charger toutes les pages avant de trier |
| **Train pagination dans master-detail** | "Partir plus tôt/tard" existe dans `LegSelectionUi` comme boutons en haut/bas de liste. Dans le nouveau layout, ils doivent aller dans le pane gauche. | Extraire la logique de pagination de `LegSelectionUi` pour la réutiliser |
| **Résultats groupés par date** | Les trains sont groupés par date (`groupBy departure.dateTime.slice(0,10)` dans `LegSelectionUi.tsx:156`). Le proto ne montre pas ce grouping. | Garder le grouping — c'est utile et cohérent avec "Partir plus tôt/tard" |
| **Filtre prix désactivé** | Le code existe dans `TransportSearchFilter.tsx` mais est commenté ("to implement later"). | Ne pas l'activer en V0 — c'est désactivé pour une raison (probablement data quality) |

### Backend (quasi rien, mais à vérifier)

| Point | Détail |
|---|---|
| **Re-sélection aller** | Tester : est-ce que `selectLegRateIdImpl` gère le cas "j'ai sélectionné un aller, j'ai vu les retours, je veux changer mon aller" ? Faut-il reset la session ? |
| **CO2 = 0** | Bug connu Duffel : certains vols remontent `carbonEmissionsInKg = 0`. Afficher "N/A" si 0 plutôt que "0 kg CO2". |

---

## 10. Décisions prises + questions restantes

### Décisions actées

| Question | Décision |
|---|---|
| **CO2** | Kg bruts ("127 kg CO2" + icône verte). Pour les trains : bandeau statique "Le train émet en moyenne 98% moins de CO2 que l'avion" (texte existant dans `LegSelectionUi.tsx:482`). |
| **Fidélité** | Coupé du V0. Post-V0 : afficher si au moins 1 traveller a une carte de fidélité éligible (CSV mapping supplier→programme existe dans le repo). |
| **Grouping par date (trains)** | On garde. Headers par jour ("Lundi 23 février") + "Partir plus tôt/tard" en haut/bas de la liste. |
| **Tri** | **Vols** : tri par pertinence (défaut, ordre API), heure de départ, heure d'arrivée, prix. Front-only (sort JS sur données chargées, pas de re-fetch). **Trains** : aucun tri, aucun filtre — affichage chronologique uniquement. |

### Questions restantes

#### Pour le CTO

1. **Re-sélection aller** : le flow `selectLegRateIdImpl` supporte-t-il de re-sélectionner un aller après avoir déjà vu les retours ? Ou faut-il reset la session et recommencer ?

#### Pour le front dev

2. **Structure TariffCard** : `siblings[]` (recos) et `sameClassByFlexibilityDefaultSiblings` (legs) ont des structures différentes. Normaliser dans un hook ou gérer dans le composant ?

3. **Compact mode reco grid** : quand le detail inline s'ouvre sur desktop, les cards passent en mode compact dans le proto. Est-ce qu'on veut ça en prod ou juste masquer les non-sélectionnées ?

---

## 11. Ce qui manque dans le proto

| Élément | Impact | Qui gère |
|---|---|---|
| **Loading state switch aller→retour** | Skeleton dans la liste pendant le chargement retours | Front |
| **Empty states** | "Aucun résultat" + suggestion reset filtres | Front + Design |
| **Erreur réseau** | Toast/banner avec retry | Front |
| **Prix dynamique** | `CorrectionProposal` existe côté back. Front : warning si prix change. | Front |
| **Grouping par date (trains)** | ✅ Décidé : on garde. Headers par jour dans la liste gauche. | Front |
| **"Partir plus tôt/tard"** | ✅ Décidé : en haut/bas de la liste gauche. Réutiliser `usePageButtonsHandlersFromMeta`. | Front |
| **Accessibility** | Focus trap sur fullscreen overlays, keyboard nav dans la grid, aria-labels | Front |
| **Analytics** | Events : `reco_clicked`, `reco_selected`, `tariff_changed`, `leg_selected`, `transport_confirmed` | Front |

---

## Annexes

- [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) — Variables d'état, transitions, edge cases, invariants
- [Proto live](https://fairjunglesam.github.io/fj-preview-da07ce478c14b4fc/) — Wireframe interactif
- [v1-flow.html](./v1-flow.html) + [v1-app.js](./v1-app.js) + [v1-styles.css](./v1-styles.css) — Source du proto

### Fichiers prod clés (référence pour le dev)

| Fichier | Rôle |
|---|---|
| `components/suggestions/view/SuggestionsMainUi.tsx` | Recos actuelles + "Voir tous" buttons |
| `components/suggestions/view/TransportSuggestionContent.tsx` | Reco card actuelle |
| `components/User/Trip/TripItemDetails/TransportDetailModal.tw.tsx` | Modal detail reco actuelle |
| `components/search/ui/template/transport/AllTransportTemplate.tsx` | Layout master-detail |
| `components/search/ui/views/transport/TransportList.tsx` | Liste résultats + pagination |
| `components/search/ui/views/transport/TransportCard.tsx` | Card résultat (vols/trains) |
| `components/search/ui/views/transport/TransportDetail.tsx` | Panel detail droite |
| `components/search/ui/views/transport/TransportSearchFilter.tsx` | Filtres (FilterMenuBar) |
| `components/User/Trip/RailsReservation/TransportRailContext.tsx` | Flow leg-by-leg trains |
| `components/User/Trip/RailsReservation/RailSearchUi.tsx` | Reducer phases outbound/inbound |
| `components/User/Trip/RailsReservation/LegSelectionUi.tsx` | UI sélection leg (tarifs, classes, pagination) |
| `graphql/operationCalls/operationDefinitions/transportSearch.ts` | Mutations/queries transport |
| `graphql/operationCalls/operationDefinitions/legsFragments.ts` | Fragments restricted/detailed |
| `graphql/operationCalls/operationDefinitions/project.ts` | Fragment `ngProjectSearchResults` (recos) |
