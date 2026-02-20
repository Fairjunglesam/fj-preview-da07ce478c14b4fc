// ===== STATE =====
let currentStep = 'transport';
let currentSelection = { id: null, name: '', price: '', step: '' };
let paginationState = { trains: 4, flights: 3, hotels: 5 }; // initial visible count (0-indexed last)

// Train leg-by-leg state (multimodal only)
let trainPhase = 'outbound'; // 'outbound' | 'return' | 'complete'
let trainOutboundSelection = null; // { id, name, price, times }
let trainReturnSelection = null; // { id, name, price, times }

// V0.1: Transport view state
let currentTransportView = 'recos'; // 'recos' | 'all-trains' | 'all-flights'
let expandedRecoId = null; // track which reco inline detail is open

// ===== DETAIL PANELS DATA =====
const panels = {
  train1: {
    title: '🚄 TGV INOUI 7835', type: 'transport', name: 'TGV INOUI 7835', price: '290 €',
    html: `
      <div class="dp-content">
        <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#e3f2fd">🚄</div><div class="dp-title">TGV INOUI 7835</div></div><div class="dp-subtitle">Paris GdL → Lyon Part-Dieu · A/R · 2nde</div></div><div class="dp-price-box"><div class="dp-price-big">290 €</div><div class="dp-price-info">97 €/p · 3 voy.</div></div></div>
        <div class="dp-section"><div class="dp-section-title">Itinéraire</div>
          <div class="journey-leg"><div class="journey-label">Aller <span class="journey-date">· Ven. 16 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">07:13</span><span class="tl-station">Paris Gare de Lyon</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e3f2fd">🚄</div> 2h · Direct · TGV 7835 · 2nde</div><div class="leg-comfort">💺 Standard, inclinable · 🔌 Prise (selon place) · 📶 WiFi TGV Connect · 🍽️ Bar</div></div><div class="tl-point"><span class="tl-time">09:13</span><span class="tl-station">Lyon Part-Dieu</span></div></div></div>
          <div class="journey-leg"><div class="journey-label">Retour <span class="journey-date">· Ven. 23 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">18:00</span><span class="tl-station">Lyon Part-Dieu</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e3f2fd">🚄</div> 2h · Direct · TGV 6642 · 2nde</div><div class="leg-comfort">💺 Standard, inclinable · 🔌 Prise (selon place) · 📶 WiFi TGV Connect · 🍽️ Bar</div></div><div class="tl-point"><span class="tl-time">20:00</span><span class="tl-station">Paris Gare de Lyon</span></div></div></div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Tarifs</div><div class="tariff-cards">
          <div class="tariff-card selected"><div class="tf-left"><div class="tf-name">2nde Classe</div><div class="tf-conditions"><span class="tf-tag yes">Modif. avec frais</span><span class="tf-tag no">Non remboursable</span></div></div><div class="tf-right"><div class="tf-price">290 €</div></div></div>
          <div class="tf-detail-panel">
            <div class="tf-detail-section"><div class="tf-detail-title">Conditions</div><div class="tf-detail-line">· Échangeable avec retenue de 15 € jusqu'à J-1</div><div class="tf-detail-line">· Non remboursable</div><div class="tf-detail-line">· Valable uniquement sur ce train</div><div class="tf-detail-line">· 2nde classe exclusivement</div></div>
          </div>
          <div class="tariff-card"><div class="tf-left"><div class="tf-name">2nde Flex</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span></div></div><div class="tf-right"><div class="tf-price">340 €</div><div class="tf-delta">+50 €</div></div></div>
          <div class="tf-detail-panel">
            <div class="tf-detail-section"><div class="tf-detail-title">Conditions</div><div class="tf-detail-line">· Échangeable sans frais jusqu'au départ</div><div class="tf-detail-line">· Remboursable avec retenue de 15 €</div><div class="tf-detail-line">· Valable sur tous les TGV du jour</div><div class="tf-detail-line">· 2nde classe exclusivement</div></div>
          </div>
          <div class="tariff-card"><div class="tf-left"><div class="tf-name">1ère Classe</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span></div></div><div class="tf-right"><div class="tf-price">459 €</div><div class="tf-delta">+169 €</div></div></div>
          <div class="tf-detail-panel">
            <div class="tf-detail-section"><div class="tf-detail-title">Conditions</div><div class="tf-detail-line">· Échangeable et remboursable sans frais</div><div class="tf-detail-line">· Valable sur tous les TGV du jour</div><div class="tf-detail-line">· Accès espace 1ère et salon Grand Voyageur</div><div class="tf-detail-line">· Siège large, repose-pieds, prise individuelle</div></div>
          </div>
        </div></div>
        <div class="dp-section"><div class="dp-section-title">Émissions CO2</div>
          <div class="co2-row">🌿 2,4 kg CO2 — 98% de moins qu'en voiture</div>
          <div class="co2-detail">Vol équivalent : ~48 kg CO2 (20x plus)</div>
          <div class="co2-bar"><div class="co2-bar-fill" style="width:5%"></div></div>
          <div class="co2-detail" style="margin-top:4px;font-size:10px">5% de la médiane sur ce trajet</div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Fidélité</div>
          <div class="loyalty-row">🎫 Gagnez <span class="loyalty-points">250 pts</span> Grand Voyageur SNCF</div>
          <div class="loyalty-row" style="font-size:10px;margin-top:2px">1ère Classe : 500 pts · Ajoutez votre n° fidélité lors de la réservation</div>
        </div>
      </div>
      <div class="drawer-cta"><div class="cta-price-summary">Total : <strong>290 €</strong> · 2nde</div><button class="btn-primary" onclick="selectItem('train1','TGV INOUI 7835 · 2nde','290 €','transport')">Sélectionner et continuer →</button></div>`
  },
  'train1-1ere': {
    title: '🚄 TGV INOUI 7835 · 1ère', type: 'transport', name: 'TGV INOUI 7835 · 1ère', price: '459 €',
    html: `
      <div class="dp-content">
        <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#e3f2fd">🚄</div><div class="dp-title">TGV INOUI 7835</div></div><div class="dp-subtitle">Paris GdL → Lyon Part-Dieu · A/R · 1ère Classe</div></div><div class="dp-price-box"><div class="dp-price-big">459 €</div><div class="dp-price-info">153 €/p · 3 voy.</div></div></div>
        <div class="dp-section"><div class="dp-section-title">Itinéraire</div>
          <div class="journey-leg"><div class="journey-label">Aller <span class="journey-date">· Ven. 16 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">07:13</span><span class="tl-station">Paris Gare de Lyon</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e3f2fd">🚄</div> 2h · Direct · TGV 7835 · 1ère</div><div class="leg-comfort">💺 1ère, large, repose-pieds · 🔌 Prise individuelle · 📶 WiFi premium · 🍽️ Service à la place · 🏛️ Salon GV</div></div><div class="tl-point"><span class="tl-time">09:13</span><span class="tl-station">Lyon Part-Dieu</span></div></div></div>
          <div class="journey-leg"><div class="journey-label">Retour <span class="journey-date">· Ven. 23 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">18:00</span><span class="tl-station">Lyon Part-Dieu</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e3f2fd">🚄</div> 2h · Direct · TGV 6642 · 1ère</div><div class="leg-comfort">💺 1ère, large, repose-pieds · 🔌 Prise individuelle · 📶 WiFi premium · 🍽️ Service à la place · 🏛️ Salon GV</div></div><div class="tl-point"><span class="tl-time">20:00</span><span class="tl-station">Paris Gare de Lyon</span></div></div></div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Tarif sélectionné</div><div class="tariff-cards">
          <div class="tariff-card selected"><div class="tf-left"><div class="tf-name">1ère Classe</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span></div></div><div class="tf-right"><div class="tf-price">459 €</div></div></div>
          <div class="tf-detail-panel">
            <div class="tf-detail-section"><div class="tf-detail-title">Conditions</div><div class="tf-detail-line">· Échangeable et remboursable sans frais</div><div class="tf-detail-line">· Valable sur tous les TGV du jour</div><div class="tf-detail-line">· Accès espace 1ère et salon Grand Voyageur</div><div class="tf-detail-line">· Prise individuelle et WiFi inclus</div><div class="tf-detail-line">· Siège large, inclinable, repose-pieds</div></div>
          </div>
        </div></div>
      </div>
      <div class="drawer-cta"><div class="cta-price-summary">Total : <strong>459 €</strong> · 1ère</div><button class="btn-primary" onclick="selectItem('train1','TGV INOUI 7835 · 1ère','459 €','transport')">Sélectionner et continuer →</button></div>`
  },
  train2: {
    title: '🚄 OuiGo 7901', type: 'transport', name: 'OuiGo 7901', price: '196 €',
    html: `
      <div class="dp-content">
        <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#e8f5e9">🚄</div><div class="dp-title">OuiGo 7901</div></div><div class="dp-subtitle">Paris GdL → Lyon Part-Dieu · A/R</div></div><div class="dp-price-box"><div class="dp-price-big">196 €</div><div class="dp-price-info">65 €/p · 3 voy.</div></div></div>
        <div class="dp-section"><div class="dp-section-title">Itinéraire</div>
          <div class="journey-leg"><div class="journey-label">Aller <span class="journey-date">· Ven. 16 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">09:00</span><span class="tl-station">Paris Gare de Lyon</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e8f5e9">🚄</div> 2h30 · Direct · OuiGo 7901</div><div class="leg-comfort">💺 Standard, non inclinable · 🔌 Non · 📶 Non · 🍽️ Non</div></div><div class="tl-point"><span class="tl-time">11:30</span><span class="tl-station">Lyon Part-Dieu</span></div></div></div>
          <div class="journey-leg"><div class="journey-label">Retour <span class="journey-date">· Ven. 23 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">19:30</span><span class="tl-station">Lyon Part-Dieu</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e8f5e9">🚄</div> 2h30 · Direct · OuiGo 7908</div><div class="leg-comfort">💺 Standard, non inclinable · 🔌 Non · 📶 Non · 🍽️ Non</div></div><div class="tl-point"><span class="tl-time">22:00</span><span class="tl-station">Paris Gare de Lyon</span></div></div></div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Tarifs</div><div class="tariff-cards"><div class="tariff-card selected"><div class="tf-left"><div class="tf-name">OuiGo Standard</div><div class="tf-conditions"><span class="tf-tag no">Non modifiable</span><span class="tf-tag no">Non remboursable</span></div></div><div class="tf-right"><div class="tf-price">196 €</div></div></div>
          <div class="tf-detail-panel">
            <div class="tf-detail-section"><div class="tf-detail-title">Conditions</div><div class="tf-detail-line">· Non échangeable, non remboursable</div><div class="tf-detail-line">· Billet nominatif, non cessible</div><div class="tf-detail-line">· Valable uniquement sur ce train</div><div class="tf-detail-line">· Arriver 30 min avant le départ</div><div class="tf-detail-line">· 1 bagage main + 1 cabine inclus</div></div>
          </div>
        </div></div>
        <div class="dp-section"><div class="dp-section-title">Émissions CO2</div>
          <div class="co2-row">🌿 1,8 kg CO2 — Green ♻</div>
          <div class="co2-detail">Vol équivalent : ~48 kg CO2 (27x plus)</div>
          <div class="co2-bar"><div class="co2-bar-fill" style="width:4%"></div></div>
        </div>
      </div>
      <div class="drawer-cta"><div class="cta-price-summary">Total : <strong>196 €</strong></div><button class="btn-primary" onclick="selectItem('train2','OuiGo 7901','196 €','transport')">Sélectionner et continuer →</button></div>`
  },
  train3: {
    title: '🚄 TGV INOUI 7841', type: 'transport', name: 'TGV INOUI 7841', price: '318 €',
    html: `
      <div class="dp-content">
        <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#e3f2fd">🚄</div><div class="dp-title">TGV INOUI 7841</div></div><div class="dp-subtitle">Paris GdL → Lyon Part-Dieu · A/R · 2nde</div></div><div class="dp-price-box"><div class="dp-price-big">318 €</div><div class="dp-price-info">106 €/p · 3 voy.</div></div></div>
        <div class="dp-section"><div class="dp-section-title">Itinéraire</div>
          <div class="journey-leg"><div class="journey-label">Aller <span class="journey-date">· Ven. 16 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">08:30</span><span class="tl-station">Paris Gare de Lyon</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e3f2fd">🚄</div> 2h · Direct · TGV 7841 · 2nde</div><div class="leg-comfort">💺 Standard, inclinable · 🔌 Prise · 📶 WiFi TGV Connect · 🍽️ Bar</div></div><div class="tl-point"><span class="tl-time">10:30</span><span class="tl-station">Lyon Part-Dieu</span></div></div></div>
          <div class="journey-leg"><div class="journey-label">Retour <span class="journey-date">· Ven. 23 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">19:00</span><span class="tl-station">Lyon Part-Dieu</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e3f2fd">🚄</div> 2h · Direct · TGV 6648 · 2nde</div><div class="leg-comfort">💺 Standard, inclinable · 🔌 Prise · 📶 WiFi TGV Connect · 🍽️ Bar</div></div><div class="tl-point"><span class="tl-time">21:00</span><span class="tl-station">Paris Gare de Lyon</span></div></div></div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Tarifs</div><div class="tariff-cards">
          <div class="tariff-card selected"><div class="tf-left"><div class="tf-name">2nde Classe</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span></div></div><div class="tf-right"><div class="tf-price">318 €</div></div></div>
          <div class="tf-detail-panel">
            <div class="tf-detail-section"><div class="tf-detail-title">Conditions</div><div class="tf-detail-line">· Échangeable sans frais jusqu'au départ</div><div class="tf-detail-line">· Remboursable avec retenue de 5 €</div><div class="tf-detail-line">· Valable sur tous les TGV du jour</div></div>
          </div>
          <div class="tariff-card"><div class="tf-left"><div class="tf-name">1ère Classe</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span></div></div><div class="tf-right"><div class="tf-price">495 €</div><div class="tf-delta">+177 €</div><div class="tf-over">Hors budget</div></div></div>
          <div class="tf-detail-panel">
            <div class="tf-detail-section"><div class="tf-detail-title">Conditions</div><div class="tf-detail-line">· Échangeable et remboursable sans frais</div><div class="tf-detail-line">· Valable sur tous les TGV du jour</div><div class="tf-detail-line">· Accès 1ère classe et salon Grand Voyageur</div></div>
          </div>
        </div></div>
        <div class="dp-section"><div class="dp-section-title">Émissions CO2</div>
          <div class="co2-row">🌿 2,4 kg CO2</div>
          <div class="co2-detail">Vol équivalent : ~48 kg CO2 (20x plus)</div>
          <div class="co2-bar"><div class="co2-bar-fill" style="width:5%"></div></div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Fidélité</div>
          <div class="loyalty-row">🎫 Gagnez <span class="loyalty-points">250 pts</span> Grand Voyageur SNCF</div>
        </div>
      </div>
      <div class="drawer-cta"><div class="cta-price-summary">Total : <strong>318 €</strong> · 2nde</div><button class="btn-primary" onclick="selectItem('train3','TGV INOUI 7841 · 2nde','318 €','transport')">Sélectionner et continuer →</button></div>`
  },
  'train3-1ere': {
    title: '🚄 TGV INOUI 7841 · 1ère', type: 'transport', name: 'TGV INOUI 7841 · 1ère', price: '495 €',
    html: `
      <div class="dp-content">
        <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#e3f2fd">🚄</div><div class="dp-title">TGV INOUI 7841</div></div><div class="dp-subtitle">Paris GdL → Lyon Part-Dieu · A/R · 1ère Classe</div></div><div class="dp-price-box"><div class="dp-price-big">495 €</div><div class="dp-price-info">165 €/p · 3 voy.</div></div></div>
        <div class="dp-section"><div class="dp-section-title">Itinéraire</div>
          <div class="journey-leg"><div class="journey-label">Aller <span class="journey-date">· Ven. 16 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">08:30</span><span class="tl-station">Paris Gare de Lyon</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e3f2fd">🚄</div> 2h · Direct · TGV 7841 · 1ère</div><div class="leg-comfort">💺 1ère, large, repose-pieds · 🔌 Prise individuelle · 📶 WiFi premium · 🍽️ Service à la place · 🏛️ Salon GV</div></div><div class="tl-point"><span class="tl-time">10:30</span><span class="tl-station">Lyon Part-Dieu</span></div></div></div>
          <div class="journey-leg"><div class="journey-label">Retour <span class="journey-date">· Ven. 23 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">19:00</span><span class="tl-station">Lyon Part-Dieu</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e3f2fd">🚄</div> 2h · Direct · TGV 6648 · 1ère</div><div class="leg-comfort">💺 1ère, large, repose-pieds · 🔌 Prise individuelle · 📶 WiFi premium · 🍽️ Service à la place · 🏛️ Salon GV</div></div><div class="tl-point"><span class="tl-time">21:00</span><span class="tl-station">Paris Gare de Lyon</span></div></div></div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Tarif sélectionné</div><div class="tariff-cards">
          <div class="tariff-card selected"><div class="tf-left"><div class="tf-name">1ère Classe</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span></div></div><div class="tf-right"><div class="tf-price">495 €</div></div></div>
          <div class="tf-detail-panel">
            <div class="tf-detail-section"><div class="tf-detail-title">Conditions</div><div class="tf-detail-line">· Échangeable et remboursable sans frais</div><div class="tf-detail-line">· Valable sur tous les TGV du jour</div><div class="tf-detail-line">· Accès 1ère classe et salon Grand Voyageur</div><div class="tf-detail-line">· Prise individuelle et WiFi inclus</div><div class="tf-detail-line">· Siège large, repose-pieds</div></div>
          </div>
        </div></div>
      </div>
      <div class="drawer-cta"><div class="cta-price-summary">Total : <strong>495 €</strong> · 1ère</div><button class="btn-primary" onclick="selectItem('train3','TGV INOUI 7841 · 1ère','495 €','transport')">Sélectionner et continuer →</button></div>`
  },
  flight1: {
    title: '✈️ Air France AF7524', type: 'transport', name: 'Air France AF7524', price: '378 €',
    budgetLine: 'Budget max : 480 €',
    html: `
      <div class="dp-content">
        <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#e8eaf6">✈️</div><div class="dp-title">Air France AF7524</div></div><div class="dp-subtitle">CDG → LYS · A/R · Economy</div></div><div class="dp-price-box"><div class="dp-price-big">378 €</div><div class="dp-price-info">126 €/p · 3 voy.</div></div></div>
        <div class="dp-section"><div class="dp-section-title">Itinéraire</div>
          <div class="journey-leg"><div class="journey-label">Aller <span class="journey-date">· Ven. 16 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">07:00</span><span class="tl-station">CDG <span class="tl-station-sub">· T2F</span></span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e8eaf6">✈️</div> 1h10 · Direct · AF7524 · A320</div><div class="leg-comfort">💺 Pitch 79cm · 🔌 USB + secteur · 📶 WiFi payant (8,99 €) · 🎬 Air France Play</div></div><div class="tl-point"><span class="tl-time">08:10</span><span class="tl-station">LYS <span class="tl-station-sub">· Saint-Exupéry</span></span></div></div></div>
          <div class="journey-leg"><div class="journey-label">Retour <span class="journey-date">· Ven. 23 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">20:30</span><span class="tl-station">LYS</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e8eaf6">✈️</div> 1h10 · Direct · AF7531</div><div class="leg-comfort">💺 Pitch 79cm · 🔌 USB + secteur · 📶 WiFi payant (8,99 €)</div></div><div class="tl-point"><span class="tl-time">21:40</span><span class="tl-station">CDG <span class="tl-station-sub">· T2F</span></span></div></div></div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Tarifs</div>
          <div class="guidance-card" style="margin-bottom:8px"><span class="guidance-card-text">🧳 Ce tarif <strong>Light</strong> n'inclut qu'un petit sac personnel (40×30×15 cm). Le bagage cabine classique et la soute sont <strong>en supplément</strong>. Vérifiez les dimensions acceptées par la compagnie avant l'embarquement.</span></div>
          <div class="tariff-cards">
          <div class="tariff-card selected"><div class="tf-left"><div class="tf-name">Economy Light</div><div class="tf-conditions"><span class="tf-tag yes">Modif. avec frais</span><span class="tf-tag no">Non remboursable</span><span class="tf-tag neutral">Cabine 12kg</span><span class="tf-tag no">Pas de soute</span></div></div><div class="tf-right"><div class="tf-price">378 €</div></div></div>
          <div class="tf-detail-panel">
            <div class="tf-detail-section"><div class="tf-detail-title">Bagages</div><div class="tf-detail-line">🎒 1 bagage cabine 12 kg (55×35×25 cm)</div><div class="tf-detail-line">👜 1 accessoire (40×30×15 cm)</div><div class="tf-detail-line">🧳 Soute : non inclus (+65 € par bagage)</div></div>
            <div class="tf-detail-section"><div class="tf-detail-title">Conditions</div><div class="tf-detail-line">· Modification : payante (+50 € + diff. de tarif)</div><div class="tf-detail-line">· Annulation : non remboursable</div><div class="tf-detail-line">· No-show : billet perdu</div><div class="tf-detail-line">· Siège : payant (+12 €)</div><div class="tf-detail-line">· Salon : non inclus</div></div>
          </div>
          <div class="tariff-card"><div class="tf-left"><div class="tf-name">Economy Std</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span><span class="tf-tag neutral">Cabine 12kg</span><span class="tf-tag yes">Soute 23kg</span></div></div><div class="tf-right"><div class="tf-price">438 €</div><div class="tf-delta">+60 €</div></div></div>
          <div class="tf-detail-panel">
            <div class="tf-detail-section"><div class="tf-detail-title">Bagages</div><div class="tf-detail-line">🎒 1 bagage cabine 12 kg</div><div class="tf-detail-line">👜 1 accessoire</div><div class="tf-detail-line">🧳 1 bagage en soute 23 kg inclus</div></div>
            <div class="tf-detail-section"><div class="tf-detail-title">Conditions</div><div class="tf-detail-line">· Modification : sans frais</div><div class="tf-detail-line">· Annulation : remboursable en avoir</div><div class="tf-detail-line">· No-show : billet perdu</div><div class="tf-detail-line">· Siège : payant (+12 €)</div><div class="tf-detail-line">· Salon : non inclus</div></div>
          </div>
          <div class="tariff-card"><div class="tf-left"><div class="tf-name">Business</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span><span class="tf-tag yes">Cabine 18kg</span><span class="tf-tag yes">Soute 2×32kg</span></div></div><div class="tf-right"><div class="tf-price">1 140 €</div><div class="tf-delta">+762 €</div><div class="tf-over">Hors budget</div></div></div>
          <div class="tf-detail-panel">
            <div class="tf-detail-section"><div class="tf-detail-title">Bagages</div><div class="tf-detail-line">🎒 1 bagage cabine 18 kg</div><div class="tf-detail-line">👜 1 accessoire</div><div class="tf-detail-line">🧳 2 bagages en soute 32 kg chacun inclus</div></div>
            <div class="tf-detail-section"><div class="tf-detail-title">Conditions</div><div class="tf-detail-line">· Modification : sans frais</div><div class="tf-detail-line">· Annulation : remboursable intégralement</div><div class="tf-detail-line">· No-show : remboursable avec frais</div><div class="tf-detail-line">· Siège : inclus (choix libre)</div><div class="tf-detail-line">· Salon Air France : inclus</div></div>
          </div>
        </div></div>
        <div class="dp-section"><div class="dp-section-title">Émissions CO2</div>
          <div class="co2-row">🌍 48 kg CO2</div>
          <div class="co2-detail">-18% vs médiane sur CDG–LYS</div>
          <div class="co2-bar"><div class="co2-bar-fill" style="width:82%"></div></div>
          <div class="co2-detail" style="margin-top:4px">Train alternatif : 2,4 kg CO2 (−95%)</div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Fidélité</div>
          <div class="loyalty-row">✈️ Gagnez <span class="loyalty-points">750 Miles</span> Flying Blue (Light)</div>
          <div class="loyalty-row" style="font-size:10px;margin-top:2px">Economy Std : 1 250 Miles · Business : 3 000 Miles</div>
        </div>
      </div>
      <div class="drawer-cta"><div class="cta-price-summary">Total : <strong>378 €</strong> · Eco Light</div><button class="btn-primary" onclick="selectItem('flight1','Air France AF7524 · Economy','378 €','transport')">Sélectionner et continuer →</button></div>`
  },
  'flight1-business': {
    title: '✈️ Air France AF7524 · Business', type: 'transport', name: 'Air France AF7524 · Business', price: '1 140 €',
    budgetLine: 'Budget max : 480 € · Ce tarif : 1 140 € <span class="budget-over">(+660 €)</span>',
    html: `
      <div class="dp-content">
        <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#e8eaf6">✈️</div><div class="dp-title">Air France AF7524</div></div><div class="dp-subtitle">CDG → LYS · A/R · Business</div></div><div class="dp-price-box"><div class="dp-price-big">1 140 €</div><div class="dp-price-info">380 €/p · 3 voy.</div></div></div>
        <div class="dp-section"><div class="dp-section-title">Itinéraire</div>
          <div class="journey-leg"><div class="journey-label">Aller <span class="journey-date">· Ven. 16 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">07:00</span><span class="tl-station">CDG <span class="tl-station-sub">· T2F</span></span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e8eaf6">✈️</div> 1h10 · Direct · AF7524 · Business</div><div class="leg-comfort">💺 Business, grand pitch · 🔌 USB + secteur · 📶 WiFi gratuit · 🍽️ Menu complet inclus · 🏛️ Salon AF</div></div><div class="tl-point"><span class="tl-time">08:10</span><span class="tl-station">LYS <span class="tl-station-sub">· Saint-Exupéry</span></span></div></div></div>
          <div class="journey-leg"><div class="journey-label">Retour <span class="journey-date">· Ven. 23 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">20:30</span><span class="tl-station">LYS</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e8eaf6">✈️</div> 1h10 · Direct · AF7531 · Business</div><div class="leg-comfort">💺 Business, grand pitch · 🔌 USB + secteur · 📶 WiFi gratuit · 🍽️ Menu complet inclus</div></div><div class="tl-point"><span class="tl-time">21:40</span><span class="tl-station">CDG <span class="tl-station-sub">· T2F</span></span></div></div></div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Tarif sélectionné</div><div class="tariff-cards">
          <div class="tariff-card selected"><div class="tf-left"><div class="tf-name">Business</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span><span class="tf-tag yes">Cabine 18kg</span><span class="tf-tag yes">Soute 2×32kg</span></div></div><div class="tf-right"><div class="tf-price">1 140 €</div></div></div>
          <div class="tf-detail-panel">
            <div class="tf-detail-section"><div class="tf-detail-title">Bagages</div><div class="tf-detail-line">🎒 1 bagage cabine 18 kg</div><div class="tf-detail-line">👜 1 accessoire</div><div class="tf-detail-line">🧳 2 bagages en soute 32 kg chacun inclus</div></div>
            <div class="tf-detail-section"><div class="tf-detail-title">Conditions</div><div class="tf-detail-line">· Modification et annulation : sans frais, remboursement intégral</div><div class="tf-detail-line">· No-show : remboursable</div><div class="tf-detail-line">· Siège : sélection premium incluse</div><div class="tf-detail-line">· Accès salon Air France</div><div class="tf-detail-line">· Embarquement prioritaire · Fast track sécurité</div></div>
          </div>
        </div></div>
      </div>
      <div class="drawer-cta"><div class="cta-price-summary">Total : <strong>1 140 €</strong> · Business</div><button class="btn-primary" onclick="selectItem('flight1','Air France AF7524 · Business','1 140 €','transport')">Sélectionner et continuer →</button></div>`
  },
  flight2: {
    title: '✈️ easyJet U2 4583', type: 'transport', name: 'easyJet U2 4583', price: '312 €',
    budgetLine: 'Budget max : 480 €',
    html: `
      <div class="dp-content">
        <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#fff3e0">✈️</div><div class="dp-title">easyJet U2 4583</div></div><div class="dp-subtitle">ORY → LYS · A/R · Economy</div></div><div class="dp-price-box"><div class="dp-price-big">312 €</div><div class="dp-price-info">104 €/p · 3 voy.</div></div></div>
        <div class="dp-section"><div class="dp-section-title">Itinéraire</div>
          <div class="journey-leg"><div class="journey-label">Aller</div><div class="tl"><div class="tl-point"><span class="tl-time">06:30</span><span class="tl-station">ORY <span class="tl-station-sub">· T1</span></span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#fff3e0">✈️</div> 1h15 · Direct · U2 4583</div><div class="leg-comfort">💺 Pitch 74cm, non inclinable · 🔌 Non · 📶 Non · 🍽️ Payante à bord</div></div><div class="tl-point"><span class="tl-time">07:45</span><span class="tl-station">LYS</span></div></div></div>
          <div class="journey-leg"><div class="journey-label">Retour</div><div class="tl"><div class="tl-point"><span class="tl-time">21:00</span><span class="tl-station">LYS</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#fff3e0">✈️</div> 1h15 · Direct · U2 4590</div><div class="leg-comfort">💺 Pitch 74cm, non inclinable · 🔌 Non · 📶 Non · 🍽️ Payante à bord</div></div><div class="tl-point"><span class="tl-time">22:15</span><span class="tl-station">ORY</span></div></div></div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Tarifs</div><div class="tariff-cards">
          <div class="tariff-card selected"><div class="tf-left"><div class="tf-name">Standard</div><div class="tf-conditions"><span class="tf-tag no">Non modifiable</span><span class="tf-tag no">Non remboursable</span><span class="tf-tag neutral">Cabine 15kg</span><span class="tf-tag no">Pas de soute</span></div></div><div class="tf-right"><div class="tf-price">312 €</div></div></div>
          <div class="tf-detail-panel">
            <div class="tf-detail-section"><div class="tf-detail-title">Bagages</div><div class="tf-detail-line">🎒 1 cabine 15 kg (56×45×25 cm)</div><div class="tf-detail-line">🧳 Soute : +29,99 € en ligne / +40 € à l'aéroport</div></div>
            <div class="tf-detail-section"><div class="tf-detail-title">Conditions</div><div class="tf-detail-line">· Non modifiable, non remboursable</div><div class="tf-detail-line">· No-show : billet perdu</div><div class="tf-detail-line">· Siège : payant (+4,99 à 14,99 €)</div></div>
          </div>
          <div class="tariff-card"><div class="tf-left"><div class="tf-name">Flexi</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag neutral">Cabine 15kg</span><span class="tf-tag yes">Soute 23kg</span></div></div><div class="tf-right"><div class="tf-price">396 €</div><div class="tf-delta">+84 €</div></div></div>
          <div class="tf-detail-panel">
            <div class="tf-detail-section"><div class="tf-detail-title">Bagages</div><div class="tf-detail-line">🎒 1 cabine 15 kg</div><div class="tf-detail-line">🧳 1 soute 23 kg inclus</div><div class="tf-detail-line">💺 Choix du siège inclus</div></div>
            <div class="tf-detail-section"><div class="tf-detail-title">Conditions</div><div class="tf-detail-line">· Modifiable sans frais</div><div class="tf-detail-line">· Non remboursable</div><div class="tf-detail-line">· Embarquement prioritaire inclus</div></div>
          </div>
        </div></div>
        <div class="dp-section"><div class="dp-section-title">Émissions CO2</div>
          <div class="co2-row">🌍 42 kg CO2</div>
          <div class="co2-detail">-24% vs médiane sur ORY–LYS</div>
          <div class="co2-bar"><div class="co2-bar-fill" style="width:76%"></div></div>
          <div class="co2-detail" style="margin-top:4px">Train alternatif : 1,8 kg CO2 (−96%)</div>
        </div>
      </div>
      <div class="drawer-cta"><div class="cta-price-summary">Total : <strong>312 €</strong></div><button class="btn-primary" onclick="selectItem('flight2','easyJet U2 4583','312 €','transport')">Sélectionner et continuer →</button></div>`
  },
  hotel1: {
    title: '🏨 Mercure Lyon Centre', type: 'hotel', name: 'Mercure Lyon Centre', price: '742 €',
    budgetLine: 'Budget max hôtel : 150 €/nuit',
    html: `
      <div class="dp-content">
        <div class="dp-section"><div class="dp-section-title">Le meilleur tarif</div>
          <div class="rate-section">
            <div class="rate-room-header"><div class="rate-room-img">🛏️</div><div class="rate-room-info"><div class="rate-room-name">Chambre Standard Double</div><div class="rate-room-type">Chambre · Lit double · Vue ville</div><div class="rate-room-amenities"><span class="rate-room-amenity">🛏️ 1 lit double</span><span class="rate-room-amenity">📐 22 m²</span><span class="rate-room-amenity">❄️ Clim.</span><span class="rate-room-amenity">🚿 SdB privative</span></div></div></div>
            <div class="rate-rows">
              <div class="rate-row selected"><div class="rate-row-conditions"><div class="rate-condition yes">✓ Annulable (avant 8 jan. 18h)</div><div class="rate-condition yes">✓ Avec petit-déjeuner buffet</div></div><div class="rate-row-right"><div class="rate-price">742 €</div><div class="rate-per-night">106 €/nuit · 7 nuits</div><button class="rate-select-btn selected">Sélectionné</button></div></div>
              <div class="rate-row"><div class="rate-row-conditions"><div class="rate-condition yes">✓ Annulable (avant 8 jan. 18h)</div><div class="rate-condition no">Sans petit-déjeuner</div></div><div class="rate-row-right"><div class="rate-price">658 €</div><div class="rate-per-night">94 €/nuit</div><button class="rate-select-btn">Sélectionner</button></div></div>
              <div class="rate-row"><div class="rate-row-conditions"><div class="rate-condition no">Non annulable</div><div class="rate-condition yes">✓ Avec petit-déjeuner</div></div><div class="rate-row-right"><div class="rate-price">616 €</div><div class="rate-per-night">88 €/nuit</div><div class="rate-scarcity">3 restantes</div><button class="rate-select-btn">Sélectionner</button></div></div>
            </div>
          </div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Votre hôtel</div>
          <div class="hotel-dp-name">Mercure Lyon Centre Château Perrache</div>
          <div class="hotel-dp-stars">★★★★</div>
          <div class="hotel-dp-location">📍 12 Cours de Verdun Récamier · Presqu'île · 350m de la gare</div>
          <div class="hotel-dp-rating"><span class="hotel-dp-rating-score">8.6</span><span style="font-size:12px;color:var(--text-subtitle)">Très bien · 1 247 avis</span></div>
          <div class="hotel-subscores">
            <div class="hotel-subscore"><span class="hotel-subscore-label">Emplacement</span><div class="hotel-subscore-bar"><div class="hotel-subscore-fill" style="width:92%"></div></div><span class="hotel-subscore-val">9.2</span></div>
            <div class="hotel-subscore"><span class="hotel-subscore-label">Propreté</span><div class="hotel-subscore-bar"><div class="hotel-subscore-fill" style="width:85%"></div></div><span class="hotel-subscore-val">8.5</span></div>
            <div class="hotel-subscore"><span class="hotel-subscore-label">Confort</span><div class="hotel-subscore-bar"><div class="hotel-subscore-fill" style="width:84%"></div></div><span class="hotel-subscore-val">8.4</span></div>
            <div class="hotel-subscore"><span class="hotel-subscore-label">Service</span><div class="hotel-subscore-bar"><div class="hotel-subscore-fill" style="width:88%"></div></div><span class="hotel-subscore-val">8.8</span></div>
          </div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px"><span class="tag tag-info">Recommandé</span></div>
          <div class="hotel-info-block">
            <div class="hotel-info-grid"><div class="hotel-info-item">☕ Petit-déjeuner</div><div class="hotel-info-item">🍽️ Restaurant</div><div class="hotel-info-item">📶 WiFi gratuit</div><div class="hotel-info-item">🏋️ Salle de sport</div><div class="hotel-info-item">♿ Accessible PMR</div><div class="hotel-info-item">🧳 Bagagerie</div><div class="hotel-info-item">🛁 Baignoire</div><div class="hotel-info-item">❄️ Climatisation</div></div>
            <div class="hotel-desc">Idéalement situé en plein cœur de Lyon, le Mercure Lyon Centre Château Perrache est un hôtel 4 étoiles installé dans un bâtiment historique...</div>
          </div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Localisation</div>
          <div class="hotel-minimap"><span class="hotel-minimap-pin">📍</span><div class="hotel-minimap-label">350m de la gare · Presqu'île</div></div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Galerie</div>
          <div class="hotel-gallery"><div class="hotel-gallery-item">🏨</div><div class="hotel-gallery-item">🛏️</div><div class="hotel-gallery-item">🍽️</div><div class="hotel-gallery-item">🏋️</div><div class="hotel-gallery-more">+8 photos</div></div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Conditions</div>
          <div class="hotel-conditions">
            <div class="hotel-condition-row"><span class="hotel-condition-label">Check-in</span><span class="hotel-condition-value">À partir de 15h00</span></div>
            <div class="hotel-condition-row"><span class="hotel-condition-label">Check-out</span><span class="hotel-condition-value">Avant 11h00</span></div>
            <div class="hotel-condition-row"><span class="hotel-condition-label">Annulation</span><span class="hotel-condition-value" style="color:var(--color-positive)">Gratuite avant le 8 jan. 18h</span></div>
            <div class="hotel-condition-row"><span class="hotel-condition-label">Paiement</span><span class="hotel-condition-value">Sur place à l'arrivée</span></div>
          </div>
        </div>
        <div class="dp-section">
          <div class="dp-section-title">Les chambres <span style="font-weight:400;color:var(--text-muted);text-transform:none;letter-spacing:0">(3)</span></div>
          <div class="room-anchors"><button class="room-anchor-pill" onclick="event.stopPropagation();document.getElementById('h1-room-std').scrollIntoView({behavior:'smooth',block:'start'})">Standard Double</button><button class="room-anchor-pill" onclick="event.stopPropagation();document.getElementById('h1-room-twin').scrollIntoView({behavior:'smooth',block:'start'})">Supérieure Twin</button><button class="room-anchor-pill" onclick="event.stopPropagation();document.getElementById('h1-room-suite').scrollIntoView({behavior:'smooth',block:'start'})">Suite Junior</button></div>
          <div id="h1-room-std" class="rate-section">
            <div class="rate-room-header"><div class="rate-room-img">🛏️</div><div class="rate-room-info"><div class="rate-room-name">Chambre Standard Double</div><div class="rate-room-type">Chambre · Lit double · Vue ville</div><div class="rate-room-amenities"><span class="rate-room-amenity">🛏️ 1 lit double</span><span class="rate-room-amenity">📐 22 m²</span><span class="rate-room-amenity">❄️ Clim.</span><span class="rate-room-amenity">🚿 SdB</span></div></div></div>
            <div class="rate-rows">
              <div class="rate-row selected"><div class="rate-row-conditions"><div class="rate-condition yes">✓ Annulable (avant 8 jan.)</div><div class="rate-condition yes">✓ Petit-déjeuner buffet</div></div><div class="rate-row-right"><div class="rate-price">742 €</div><div class="rate-per-night">106 €/nuit · 7n</div><button class="rate-select-btn selected">Sélectionné</button></div></div>
              <div class="rate-row"><div class="rate-row-conditions"><div class="rate-condition yes">✓ Annulable (avant 8 jan.)</div><div class="rate-condition no">Sans petit-déjeuner</div></div><div class="rate-row-right"><div class="rate-price">658 €</div><div class="rate-per-night">94 €/nuit</div><button class="rate-select-btn">Sélectionner</button></div></div>
              <div class="rate-row"><div class="rate-row-conditions"><div class="rate-condition no">Non annulable</div><div class="rate-condition yes">✓ Avec petit-déjeuner</div></div><div class="rate-row-right"><div class="rate-price">616 €</div><div class="rate-per-night">88 €/nuit</div><div class="rate-scarcity">3 restantes</div><button class="rate-select-btn">Sélectionner</button></div></div>
            </div>
          </div>
          <div id="h1-room-twin" class="rate-section">
            <div class="rate-room-header"><div class="rate-room-img">🛏️</div><div class="rate-room-info"><div class="rate-room-name">Chambre Supérieure Twin</div><div class="rate-room-type">Chambre · 2 lits simples · Vue ville</div><div class="rate-room-amenities"><span class="rate-room-amenity">🛏️ 2 lits simples</span><span class="rate-room-amenity">📐 28 m²</span><span class="rate-room-amenity">❄️ Clim.</span><span class="rate-room-amenity">🏙️ Vue ville</span></div></div></div>
            <div class="rate-rows">
              <div class="rate-row"><div class="rate-row-conditions"><div class="rate-condition yes">✓ Annulable</div><div class="rate-condition yes">✓ Petit-déjeuner inclus</div></div><div class="rate-row-right"><div class="rate-price">868 €</div><div class="rate-per-night">124 €/nuit</div><button class="rate-select-btn">Sélectionner</button></div></div>
              <div class="rate-row"><div class="rate-row-conditions"><div class="rate-condition no">Non annulable</div><div class="rate-condition yes">✓ Petit-déjeuner inclus</div></div><div class="rate-row-right"><div class="rate-price">756 €</div><div class="rate-per-night">108 €/nuit</div><button class="rate-select-btn">Sélectionner</button></div></div>
            </div>
          </div>
          <div id="h1-room-suite" class="rate-section">
            <div class="rate-room-header"><div class="rate-room-img">🌟</div><div class="rate-room-info"><div class="rate-room-name">Suite Junior</div><div class="rate-room-type">Suite · Lit king · Vue panoramique</div><div class="rate-room-amenities"><span class="rate-room-amenity">🛏️ 1 lit king</span><span class="rate-room-amenity">📐 42 m²</span><span class="rate-room-amenity">🛁 Baignoire</span><span class="rate-room-amenity">🍾 Minibar</span></div></div></div>
            <div class="rate-rows">
              <div class="rate-row"><div class="rate-row-conditions"><div class="rate-condition yes">✓ Annulable</div><div class="rate-condition yes">✓ Petit-déjeuner + Minibar offert</div></div><div class="rate-row-right"><div class="rate-price">1 190 €</div><div class="rate-per-night">170 €/nuit</div><div class="rate-scarcity">1 restante !</div><button class="rate-select-btn">Sélectionner</button></div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="drawer-cta"><div class="cta-price-summary">Hôtel : <strong>742 €</strong> · Standard Double · 7 nuits</div><button class="btn-primary" onclick="selectItem('hotel1','Mercure Lyon Centre','742 €','hotel')">Sélectionner et continuer →</button></div>`
  },
  hotel2: {
    title: '🏨 Ibis Lyon Part-Dieu', type: 'hotel', name: 'Ibis Lyon Part-Dieu', price: '518 €',
    budgetLine: 'Budget max hôtel : 150 €/nuit',
    html: `
      <div class="dp-content">
        <div class="dp-section"><div class="dp-section-title">Le meilleur tarif</div>
          <div class="rate-section">
            <div class="rate-room-header"><div class="rate-room-img">🛏️</div><div class="rate-room-info"><div class="rate-room-name">Chambre Standard Double</div><div class="rate-room-type">Chambre · Lit double</div><div class="rate-room-amenities"><span class="rate-room-amenity">🛏️ 1 lit double</span><span class="rate-room-amenity">📐 18 m²</span><span class="rate-room-amenity">❄️ Clim.</span><span class="rate-room-amenity">🚿 SdB</span></div></div></div>
            <div class="rate-rows">
              <div class="rate-row selected"><div class="rate-row-conditions"><div class="rate-condition yes">✓ Annulable (avant 10 jan.)</div><div class="rate-condition no">Sans petit-déjeuner</div></div><div class="rate-row-right"><div class="rate-price">518 €</div><div class="rate-per-night">74 €/nuit · 7n</div><button class="rate-select-btn selected">Sélectionné</button></div></div>
              <div class="rate-row"><div class="rate-row-conditions"><div class="rate-condition yes">✓ Annulable (avant 10 jan.)</div><div class="rate-condition yes">✓ Petit-déjeuner buffet</div></div><div class="rate-row-right"><div class="rate-price">609 €</div><div class="rate-per-night">87 €/nuit</div><button class="rate-select-btn">Sélectionner</button></div></div>
            </div>
          </div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Votre hôtel</div>
          <div class="hotel-dp-name">Ibis Lyon Gare de la Part-Dieu</div><div class="hotel-dp-stars">★★★</div>
          <div class="hotel-dp-location">📍 Place Charles Béraudier · 120m de la gare Part-Dieu</div>
          <div class="hotel-dp-rating"><span class="hotel-dp-rating-score">7.8</span><span style="font-size:12px;color:var(--text-subtitle)">Bien · 892 avis</span></div>
          <div class="hotel-subscores">
            <div class="hotel-subscore"><span class="hotel-subscore-label">Emplacement</span><div class="hotel-subscore-bar"><div class="hotel-subscore-fill" style="width:90%"></div></div><span class="hotel-subscore-val">9.0</span></div>
            <div class="hotel-subscore"><span class="hotel-subscore-label">Propreté</span><div class="hotel-subscore-bar"><div class="hotel-subscore-fill" style="width:75%"></div></div><span class="hotel-subscore-val">7.5</span></div>
            <div class="hotel-subscore"><span class="hotel-subscore-label">Confort</span><div class="hotel-subscore-bar"><div class="hotel-subscore-fill" style="width:72%"></div></div><span class="hotel-subscore-val">7.2</span></div>
            <div class="hotel-subscore"><span class="hotel-subscore-label">Service</span><div class="hotel-subscore-bar"><div class="hotel-subscore-fill" style="width:78%"></div></div><span class="hotel-subscore-val">7.8</span></div>
          </div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px"><span class="tag tag-success">Moins cher</span></div>
          <div class="hotel-info-block"><div class="hotel-info-grid"><div class="hotel-info-item">📶 WiFi gratuit</div><div class="hotel-info-item">🅿️ Parking</div><div class="hotel-info-item">🍽️ Bar</div><div class="hotel-info-item">♿ Accessible</div><div class="hotel-info-item">❄️ Climatisation</div><div class="hotel-info-item">🚭 Non-fumeur</div></div>
            <div class="hotel-desc">Situé face à la gare de la Part-Dieu, l'ibis Lyon offre un accès direct au cœur de Lyon...</div>
          </div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Localisation</div><div class="hotel-minimap"><span class="hotel-minimap-pin">📍</span><div class="hotel-minimap-label">120m de la gare · Part-Dieu</div></div></div>
        <div class="dp-section"><div class="dp-section-title">Conditions</div><div class="hotel-conditions"><div class="hotel-condition-row"><span class="hotel-condition-label">Check-in</span><span class="hotel-condition-value">À partir de 14h00</span></div><div class="hotel-condition-row"><span class="hotel-condition-label">Check-out</span><span class="hotel-condition-value">Avant 12h00</span></div><div class="hotel-condition-row"><span class="hotel-condition-label">Annulation</span><span class="hotel-condition-value" style="color:var(--color-positive)">Gratuite avant le 10 jan.</span></div><div class="hotel-condition-row"><span class="hotel-condition-label">Paiement</span><span class="hotel-condition-value">Prépayé en ligne</span></div></div></div>
        <div class="dp-section">
          <div class="dp-section-title">Les chambres <span style="font-weight:400;color:var(--text-muted);text-transform:none;letter-spacing:0">(2)</span></div>
          <div class="room-anchors"><button class="room-anchor-pill" onclick="event.stopPropagation();document.getElementById('h2-room-std').scrollIntoView({behavior:'smooth',block:'start'})">Standard Double</button><button class="room-anchor-pill" onclick="event.stopPropagation();document.getElementById('h2-room-twin').scrollIntoView({behavior:'smooth',block:'start'})">Standard Twin</button></div>
          <div id="h2-room-std" class="rate-section">
            <div class="rate-room-header"><div class="rate-room-img">🛏️</div><div class="rate-room-info"><div class="rate-room-name">Chambre Standard Double</div><div class="rate-room-type">Chambre · Lit double</div><div class="rate-room-amenities"><span class="rate-room-amenity">🛏️ 1 lit double</span><span class="rate-room-amenity">📐 18 m²</span><span class="rate-room-amenity">❄️ Clim.</span></div></div></div>
            <div class="rate-rows">
              <div class="rate-row selected"><div class="rate-row-conditions"><div class="rate-condition yes">✓ Annulable (avant 10 jan.)</div><div class="rate-condition no">Sans petit-déjeuner</div></div><div class="rate-row-right"><div class="rate-price">518 €</div><div class="rate-per-night">74 €/nuit · 7n</div><button class="rate-select-btn selected">Sélectionné</button></div></div>
              <div class="rate-row"><div class="rate-row-conditions"><div class="rate-condition yes">✓ Annulable (avant 10 jan.)</div><div class="rate-condition yes">✓ Petit-déjeuner buffet</div></div><div class="rate-row-right"><div class="rate-price">609 €</div><div class="rate-per-night">87 €/nuit</div><button class="rate-select-btn">Sélectionner</button></div></div>
            </div>
          </div>
          <div id="h2-room-twin" class="rate-section">
            <div class="rate-room-header"><div class="rate-room-img">🛏️</div><div class="rate-room-info"><div class="rate-room-name">Chambre Standard Twin</div><div class="rate-room-type">Chambre · 2 lits simples</div><div class="rate-room-amenities"><span class="rate-room-amenity">🛏️ 2 lits simples</span><span class="rate-room-amenity">📐 18 m²</span><span class="rate-room-amenity">❄️ Clim.</span></div></div></div>
            <div class="rate-rows">
              <div class="rate-row"><div class="rate-row-conditions"><div class="rate-condition yes">✓ Annulable</div><div class="rate-condition no">Sans petit-déjeuner</div></div><div class="rate-row-right"><div class="rate-price">518 €</div><div class="rate-per-night">74 €/nuit</div><button class="rate-select-btn">Sélectionner</button></div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="drawer-cta"><div class="cta-price-summary">Hôtel : <strong>518 €</strong> · Standard Double · 7 nuits</div><button class="btn-primary" onclick="selectItem('hotel2','Ibis Lyon Part-Dieu','518 €','hotel')">Sélectionner et continuer →</button></div>`
  },
  hotel3: {
    title: '🏨 Novotel Lyon Confluence', type: 'hotel', name: 'Novotel Lyon Confluence', price: '896 €',
    budgetLine: 'Budget max hôtel : 150 €/nuit',
    html: `
      <div class="dp-content">
        <div class="dp-section"><div class="dp-section-title">Le meilleur tarif</div>
          <div class="rate-section">
            <div class="rate-room-header"><div class="rate-room-img">🛏️</div><div class="rate-room-info"><div class="rate-room-name">Chambre Standard Double</div><div class="rate-room-type">Chambre · Lit queen · Vue Confluence</div><div class="rate-room-amenities"><span class="rate-room-amenity">🛏️ 1 lit queen</span><span class="rate-room-amenity">📐 26 m²</span><span class="rate-room-amenity">❄️ Clim.</span><span class="rate-room-amenity">🌅 Vue</span></div></div></div>
            <div class="rate-rows">
              <div class="rate-row selected"><div class="rate-row-conditions"><div class="rate-condition yes">✓ Annulable (avant 12 jan.)</div><div class="rate-condition yes">✓ Petit-déjeuner buffet inclus</div></div><div class="rate-row-right"><div class="rate-price">896 €</div><div class="rate-per-night">128 €/nuit · 7n</div><button class="rate-select-btn selected">Sélectionné</button></div></div>
              <div class="rate-row"><div class="rate-row-conditions"><div class="rate-condition no">Non annulable</div><div class="rate-condition yes">✓ Avec petit-déjeuner</div></div><div class="rate-row-right"><div class="rate-price">756 €</div><div class="rate-per-night">108 €/nuit</div><div class="rate-scarcity">1 restante !</div><button class="rate-select-btn">Sélectionner</button></div></div>
            </div>
          </div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Votre hôtel</div>
          <div class="hotel-dp-name">Novotel Lyon Confluence</div><div class="hotel-dp-stars">★★★★</div>
          <div class="hotel-dp-location">📍 3 Rue Paul Montrochet · Confluence · 1.2km de la gare</div>
          <div class="hotel-dp-rating"><span class="hotel-dp-rating-score">8.9</span><span style="font-size:12px;color:var(--text-subtitle)">Superbe · 2 103 avis</span></div>
          <div class="hotel-subscores">
            <div class="hotel-subscore"><span class="hotel-subscore-label">Emplacement</span><div class="hotel-subscore-bar"><div class="hotel-subscore-fill" style="width:82%"></div></div><span class="hotel-subscore-val">8.2</span></div>
            <div class="hotel-subscore"><span class="hotel-subscore-label">Propreté</span><div class="hotel-subscore-bar"><div class="hotel-subscore-fill" style="width:91%"></div></div><span class="hotel-subscore-val">9.1</span></div>
            <div class="hotel-subscore"><span class="hotel-subscore-label">Confort</span><div class="hotel-subscore-bar"><div class="hotel-subscore-fill" style="width:90%"></div></div><span class="hotel-subscore-val">9.0</span></div>
            <div class="hotel-subscore"><span class="hotel-subscore-label">Service</span><div class="hotel-subscore-bar"><div class="hotel-subscore-fill" style="width:89%"></div></div><span class="hotel-subscore-val">8.9</span></div>
          </div>
          <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px"><span class="tag tag-fast">Populaire</span></div>
          <div class="hotel-info-block"><div class="hotel-info-grid"><div class="hotel-info-item">☕ Petit-déjeuner</div><div class="hotel-info-item">🏊 Piscine</div><div class="hotel-info-item">💆 Spa & bien-être</div><div class="hotel-info-item">🍽️ Restaurant</div><div class="hotel-info-item">🏋️ Salle de sport</div><div class="hotel-info-item">📶 WiFi gratuit</div><div class="hotel-info-item">🐕 Animaux admis</div><div class="hotel-info-item">👨‍👩‍👧 Familial</div></div>
            <div class="hotel-desc">Au cœur du quartier Confluence, le Novotel offre une expérience moderne avec vue sur la Saône...</div>
          </div>
        </div>
        <div class="dp-section"><div class="dp-section-title">Localisation</div><div class="hotel-minimap"><span class="hotel-minimap-pin">📍</span><div class="hotel-minimap-label">1.2km de la gare · Confluence</div></div></div>
        <div class="dp-section"><div class="dp-section-title">Galerie</div><div class="hotel-gallery"><div class="hotel-gallery-item">🏨</div><div class="hotel-gallery-item">🛏️</div><div class="hotel-gallery-item">🏊</div><div class="hotel-gallery-item">🍽️</div><div class="hotel-gallery-more">+11 photos</div></div></div>
        <div class="dp-section"><div class="dp-section-title">Conditions</div><div class="hotel-conditions"><div class="hotel-condition-row"><span class="hotel-condition-label">Check-in</span><span class="hotel-condition-value">À partir de 14h00</span></div><div class="hotel-condition-row"><span class="hotel-condition-label">Check-out</span><span class="hotel-condition-value">Avant 12h00</span></div><div class="hotel-condition-row"><span class="hotel-condition-label">Annulation</span><span class="hotel-condition-value" style="color:var(--color-positive)">Gratuite avant le 12 jan.</span></div><div class="hotel-condition-row"><span class="hotel-condition-label">Paiement</span><span class="hotel-condition-value">Sur place à l'arrivée</span></div></div></div>
        <div class="dp-section">
          <div class="dp-section-title">Les chambres <span style="font-weight:400;color:var(--text-muted);text-transform:none;letter-spacing:0">(3)</span></div>
          <div class="room-anchors"><button class="room-anchor-pill" onclick="event.stopPropagation();document.getElementById('h3-room-std').scrollIntoView({behavior:'smooth',block:'start'})">Standard Double</button><button class="room-anchor-pill" onclick="event.stopPropagation();document.getElementById('h3-room-sup').scrollIntoView({behavior:'smooth',block:'start'})">Supérieure Vue Saône</button><button class="room-anchor-pill" onclick="event.stopPropagation();document.getElementById('h3-room-exec').scrollIntoView({behavior:'smooth',block:'start'})">Executive Suite</button></div>
          <div id="h3-room-std" class="rate-section">
            <div class="rate-room-header"><div class="rate-room-img">🛏️</div><div class="rate-room-info"><div class="rate-room-name">Chambre Standard Double</div><div class="rate-room-type">Chambre · Lit queen · Vue Confluence</div><div class="rate-room-amenities"><span class="rate-room-amenity">🛏️ 1 lit queen</span><span class="rate-room-amenity">📐 26 m²</span><span class="rate-room-amenity">❄️ Clim.</span></div></div></div>
            <div class="rate-rows">
              <div class="rate-row selected"><div class="rate-row-conditions"><div class="rate-condition yes">✓ Annulable (avant 12 jan.)</div><div class="rate-condition yes">✓ Petit-déjeuner buffet</div></div><div class="rate-row-right"><div class="rate-price">896 €</div><div class="rate-per-night">128 €/nuit · 7n</div><button class="rate-select-btn selected">Sélectionné</button></div></div>
              <div class="rate-row"><div class="rate-row-conditions"><div class="rate-condition no">Non annulable</div><div class="rate-condition yes">✓ Avec petit-déjeuner</div></div><div class="rate-row-right"><div class="rate-price">756 €</div><div class="rate-per-night">108 €/nuit</div><div class="rate-scarcity">1 restante !</div><button class="rate-select-btn">Sélectionner</button></div></div>
            </div>
          </div>
          <div id="h3-room-sup" class="rate-section">
            <div class="rate-room-header"><div class="rate-room-img">🌊</div><div class="rate-room-info"><div class="rate-room-name">Supérieure Vue Saône</div><div class="rate-room-type">Chambre supérieure · Lit king · Vue Saône</div><div class="rate-room-amenities"><span class="rate-room-amenity">🛏️ 1 lit king</span><span class="rate-room-amenity">📐 32 m²</span><span class="rate-room-amenity">🌊 Vue Saône</span><span class="rate-room-amenity">🍾 Minibar</span></div></div></div>
            <div class="rate-rows">
              <div class="rate-row"><div class="rate-row-conditions"><div class="rate-condition yes">✓ Annulable</div><div class="rate-condition yes">✓ Petit-déj. + Minibar offert</div></div><div class="rate-row-right"><div class="rate-price">1 050 €</div><div class="rate-per-night">150 €/nuit</div><button class="rate-select-btn">Sélectionner</button></div></div>
              <div class="rate-row"><div class="rate-row-conditions"><div class="rate-condition no">Non annulable</div><div class="rate-condition yes">✓ Petit-déj. inclus</div></div><div class="rate-row-right"><div class="rate-price">910 €</div><div class="rate-per-night">130 €/nuit</div><button class="rate-select-btn">Sélectionner</button></div></div>
            </div>
          </div>
          <div id="h3-room-exec" class="rate-section">
            <div class="rate-room-header"><div class="rate-room-img">🌟</div><div class="rate-room-info"><div class="rate-room-name">Executive Suite</div><div class="rate-room-type">Suite · Lit king · Salon séparé · Vue panoramique</div><div class="rate-room-amenities"><span class="rate-room-amenity">🛏️ 1 lit king</span><span class="rate-room-amenity">📐 48 m²</span><span class="rate-room-amenity">🛁 Baignoire</span><span class="rate-room-amenity">🍾 Minibar</span><span class="rate-room-amenity">🧖 Peignoir</span></div></div></div>
            <div class="rate-rows">
              <div class="rate-row"><div class="rate-row-conditions"><div class="rate-condition yes">✓ Annulable</div><div class="rate-condition yes">✓ Petit-déj. + Spa + Minibar</div></div><div class="rate-row-right"><div class="rate-price">1 540 €</div><div class="rate-per-night">220 €/nuit</div><div class="rate-scarcity">1 restante !</div><button class="rate-select-btn">Sélectionner</button></div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="drawer-cta"><div class="cta-price-summary">Hôtel : <strong>896 €</strong> · Standard Double · 7 nuits</div><button class="btn-primary" onclick="selectItem('hotel3','Novotel Confluence','896 €','hotel')">Sélectionner et continuer →</button></div>`
  }
};

// ===== OUTBOUND TRAIN PANELS (single-leg) =====
panels['train1-out'] = {
  title: '🚄 TGV INOUI 7835 · Aller', type: 'transport', subtype: 'train-outbound',
  name: 'TGV INOUI', price: '145 €', legTimes: '07:13→09:13', legClass: '2nde',
  html: `
    <div class="dp-content">
      <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#e3f2fd">🚄</div><div class="dp-title">TGV INOUI 7835</div></div><div class="dp-subtitle">Paris GdL → Lyon Part-Dieu · Aller · 2nde</div></div><div class="dp-price-box"><div class="dp-price-big">145 €</div><div class="dp-price-info">48 €/p · 3 voy.</div></div></div>
      <div class="dp-section"><div class="dp-section-title">Itinéraire</div>
        <div class="journey-leg"><div class="journey-label">Aller <span class="journey-date">· Ven. 16 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">07:13</span><span class="tl-station">Paris Gare de Lyon</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e3f2fd">🚄</div> 2h · Direct · TGV 7835 · 2nde</div><div class="leg-comfort">💺 Standard, inclinable · 🔌 Prise (selon place) · 📶 WiFi TGV Connect · 🍽️ Bar</div><div class="leg-ratrules"><strong>TARIF 2NDE CLASSE</strong> — Échangeable avec retenue de 15 € jusqu'à la veille du départ. Non remboursable. Billet nominatif valable uniquement sur ce train, en 2nde classe.</div></div><div class="tl-point"><span class="tl-time">09:13</span><span class="tl-station">Lyon Part-Dieu</span></div></div></div>
      </div>
      <div class="dp-section"><div class="dp-section-title">Tarifs</div><div class="tariff-cards">
        <div class="tariff-card selected"><div class="tf-left"><div class="tf-name">2nde Classe</div><div class="tf-conditions"><span class="tf-tag yes">Modif. avec frais</span><span class="tf-tag no">Non remboursable</span></div></div><div class="tf-right"><div class="tf-price">145 €</div></div></div>
        <div class="tariff-card"><div class="tf-left"><div class="tf-name">2nde Flex</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span></div></div><div class="tf-right"><div class="tf-price">170 €</div><div class="tf-delta">+25 €</div></div></div>
        <div class="tariff-card"><div class="tf-left"><div class="tf-name">1ère Classe</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span></div></div><div class="tf-right"><div class="tf-price">230 €</div><div class="tf-delta">+85 €</div></div></div>
      </div></div>
      <div class="dp-section"><div class="dp-section-title">Émissions CO2</div>
        <div class="co2-row">🌿 1,2 kg CO2 — 98% de moins qu'en voiture</div>
      </div>
    </div>
    <div class="drawer-cta"><div class="cta-price-summary">Aller : <strong>145 €</strong> · 2nde</div><button class="btn-primary" onclick="selectTrainLeg('outbound','train1-out','TGV INOUI','145 €','07:13→09:13','2nde')">Sélectionner cet aller →</button></div>`
};
panels['train1-out-1ere'] = {
  title: '🚄 TGV INOUI 7835 · Aller · 1ère', type: 'transport', subtype: 'train-outbound',
  name: 'TGV INOUI', price: '230 €', legTimes: '07:13→09:13', legClass: '1ère',
  html: `
    <div class="dp-content">
      <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#e3f2fd">🚄</div><div class="dp-title">TGV INOUI 7835</div></div><div class="dp-subtitle">Paris GdL → Lyon Part-Dieu · Aller · 1ère Classe</div></div><div class="dp-price-box"><div class="dp-price-big">230 €</div><div class="dp-price-info">77 €/p · 3 voy.</div></div></div>
      <div class="dp-section"><div class="dp-section-title">Itinéraire</div>
        <div class="journey-leg"><div class="journey-label">Aller <span class="journey-date">· Ven. 16 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">07:13</span><span class="tl-station">Paris Gare de Lyon</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e3f2fd">🚄</div> 2h · Direct · TGV 7835 · 1ère</div><div class="leg-comfort">💺 1ère, large, repose-pieds · 🔌 Prise individuelle · 📶 WiFi premium · 🍽️ Service à la place</div><div class="leg-ratrules"><strong>TARIF 1ÈRE CLASSE</strong> — Échangeable sans frais jusqu'à 30 minutes après le départ. Remboursable sans frais jusqu'à la veille du départ. Accès salon Grand Voyageur sous conditions. Billet valable sur tous les TGV INOUI du jour, en 1ère classe.</div></div><div class="tl-point"><span class="tl-time">09:13</span><span class="tl-station">Lyon Part-Dieu</span></div></div></div>
      </div>
      <div class="dp-section"><div class="dp-section-title">Tarif sélectionné</div><div class="tariff-cards">
        <div class="tariff-card selected"><div class="tf-left"><div class="tf-name">1ère Classe</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span></div></div><div class="tf-right"><div class="tf-price">230 €</div></div></div>
      </div></div>
    </div>
    <div class="drawer-cta"><div class="cta-price-summary">Aller : <strong>230 €</strong> · 1ère</div><button class="btn-primary" onclick="selectTrainLeg('outbound','train1-out-1ere','TGV INOUI','230 €','07:13→09:13','1ère')">Sélectionner cet aller →</button></div>`
};
panels['train2-out'] = {
  title: '🚄 OuiGo 7901 · Aller', type: 'transport', subtype: 'train-outbound',
  name: 'OuiGo', price: '98 €', legTimes: '09:00→11:30', legClass: 'Standard',
  html: `
    <div class="dp-content">
      <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#e8f5e9">🚄</div><div class="dp-title">OuiGo 7901</div></div><div class="dp-subtitle">Paris GdL → Lyon Part-Dieu · Aller</div></div><div class="dp-price-box"><div class="dp-price-big">98 €</div><div class="dp-price-info">33 €/p · 3 voy.</div></div></div>
      <div class="dp-section"><div class="dp-section-title">Itinéraire</div>
        <div class="journey-leg"><div class="journey-label">Aller <span class="journey-date">· Ven. 16 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">09:00</span><span class="tl-station">Paris Gare de Lyon</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e8f5e9">🚄</div> 2h30 · Direct · OuiGo 7901</div><div class="leg-comfort">💺 Standard, non inclinable · 🔌 Non · 📶 Non · 🍽️ Non</div><div class="leg-ratrules"><strong>TARIF OUIGO</strong> — Billet non modifiable et non remboursable. Aucun échange ni remboursement possible après l'achat. Billet valable uniquement sur ce train et à cette date.</div></div><div class="tl-point"><span class="tl-time">11:30</span><span class="tl-station">Lyon Part-Dieu</span></div></div></div>
      </div>
      <div class="dp-section"><div class="dp-section-title">Tarifs</div><div class="tariff-cards"><div class="tariff-card selected"><div class="tf-left"><div class="tf-name">OuiGo Standard</div><div class="tf-conditions"><span class="tf-tag no">Non modifiable</span><span class="tf-tag no">Non remboursable</span></div></div><div class="tf-right"><div class="tf-price">98 €</div></div></div></div></div>
    </div>
    <div class="drawer-cta"><div class="cta-price-summary">Aller : <strong>98 €</strong></div><button class="btn-primary" onclick="selectTrainLeg('outbound','train2-out','OuiGo','98 €','09:00→11:30','Standard')">Sélectionner cet aller →</button></div>`
};
panels['train3-out'] = {
  title: '🚄 TGV INOUI 7841 · Aller', type: 'transport', subtype: 'train-outbound',
  name: 'TGV INOUI', price: '159 €', legTimes: '08:30→10:30', legClass: '2nde',
  html: `
    <div class="dp-content">
      <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#e3f2fd">🚄</div><div class="dp-title">TGV INOUI 7841</div></div><div class="dp-subtitle">Paris GdL → Lyon Part-Dieu · Aller · 2nde</div></div><div class="dp-price-box"><div class="dp-price-big">159 €</div><div class="dp-price-info">53 €/p · 3 voy.</div></div></div>
      <div class="dp-section"><div class="dp-section-title">Itinéraire</div>
        <div class="journey-leg"><div class="journey-label">Aller <span class="journey-date">· Ven. 16 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">08:30</span><span class="tl-station">Paris Gare de Lyon</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e3f2fd">🚄</div> 2h · Direct · TGV 7841 · 2nde</div><div class="leg-comfort">💺 Standard, inclinable · 🔌 Prise · 📶 WiFi TGV Connect · 🍽️ Bar</div><div class="leg-ratrules"><strong>TARIF 2NDE CLASSE</strong> — Échangeable sans frais jusqu'à 30 minutes après le départ. Remboursable avec retenue de 15 € jusqu'à la veille du départ. Billet nominatif valable sur tous les TGV INOUI du jour, en 2nde classe.</div></div><div class="tl-point"><span class="tl-time">10:30</span><span class="tl-station">Lyon Part-Dieu</span></div></div></div>
      </div>
      <div class="dp-section"><div class="dp-section-title">Tarifs</div><div class="tariff-cards">
        <div class="tariff-card selected"><div class="tf-left"><div class="tf-name">2nde Classe</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span></div></div><div class="tf-right"><div class="tf-price">159 €</div></div></div>
        <div class="tariff-card"><div class="tf-left"><div class="tf-name">1ère Classe</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span></div></div><div class="tf-right"><div class="tf-price">248 €</div><div class="tf-delta">+89 €</div></div></div>
      </div></div>
    </div>
    <div class="drawer-cta"><div class="cta-price-summary">Aller : <strong>159 €</strong> · 2nde</div><button class="btn-primary" onclick="selectTrainLeg('outbound','train3-out','TGV INOUI','159 €','08:30→10:30','2nde')">Sélectionner cet aller →</button></div>`
};
panels['train3-out-1ere'] = {
  title: '🚄 TGV INOUI 7841 · Aller · 1ère', type: 'transport', subtype: 'train-outbound',
  name: 'TGV INOUI', price: '248 €', legTimes: '08:30→10:30', legClass: '1ère',
  html: `
    <div class="dp-content">
      <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#e3f2fd">🚄</div><div class="dp-title">TGV INOUI 7841</div></div><div class="dp-subtitle">Paris GdL → Lyon Part-Dieu · Aller · 1ère Classe</div></div><div class="dp-price-box"><div class="dp-price-big">248 €</div><div class="dp-price-info">83 €/p · 3 voy.</div></div></div>
      <div class="dp-section"><div class="dp-section-title">Itinéraire</div>
        <div class="journey-leg"><div class="journey-label">Aller <span class="journey-date">· Ven. 16 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">08:30</span><span class="tl-station">Paris Gare de Lyon</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e3f2fd">🚄</div> 2h · Direct · TGV 7841 · 1ère</div><div class="leg-comfort">💺 1ère, large, repose-pieds · 🔌 Prise individuelle · 📶 WiFi premium · 🍽️ Service à la place</div><div class="leg-ratrules"><strong>TARIF 1ÈRE CLASSE</strong> — Échangeable sans frais jusqu'à 30 minutes après le départ. Remboursable sans frais jusqu'à la veille du départ. Accès salon Grand Voyageur sous conditions. Billet valable sur tous les TGV INOUI du jour, en 1ère classe.</div></div><div class="tl-point"><span class="tl-time">10:30</span><span class="tl-station">Lyon Part-Dieu</span></div></div></div>
      </div>
      <div class="dp-section"><div class="dp-section-title">Tarif sélectionné</div><div class="tariff-cards">
        <div class="tariff-card selected"><div class="tf-left"><div class="tf-name">1ère Classe</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span></div></div><div class="tf-right"><div class="tf-price">248 €</div></div></div>
      </div></div>
    </div>
    <div class="drawer-cta"><div class="cta-price-summary">Aller : <strong>248 €</strong> · 1ère</div><button class="btn-primary" onclick="selectTrainLeg('outbound','train3-out-1ere','TGV INOUI','248 €','08:30→10:30','1ère')">Sélectionner cet aller →</button></div>`
};

// ===== RETURN TRAIN PANELS (single-leg) =====
panels['train1-ret'] = {
  title: '🚄 TGV INOUI 6640 · Retour', type: 'transport', subtype: 'train-return',
  name: 'TGV INOUI', price: '145 €', legTimes: '17:00→19:00', legClass: '2nde',
  html: `
    <div class="dp-content">
      <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#e3f2fd">🚄</div><div class="dp-title">TGV INOUI 6640</div></div><div class="dp-subtitle">Lyon Part-Dieu → Paris GdL · Retour · 2nde</div></div><div class="dp-price-box"><div class="dp-price-big">145 €</div><div class="dp-price-info">48 €/p · 3 voy.</div></div></div>
      <div class="dp-section"><div class="dp-section-title">Itinéraire</div>
        <div class="journey-leg"><div class="journey-label">Retour <span class="journey-date">· Ven. 23 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">17:00</span><span class="tl-station">Lyon Part-Dieu</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e3f2fd">🚄</div> 2h · Direct · TGV 6640 · 2nde</div><div class="leg-comfort">💺 Standard, inclinable · 🔌 Prise (selon place) · 📶 WiFi TGV Connect · 🍽️ Bar</div><div class="leg-ratrules"><strong>TARIF 2NDE CLASSE</strong> — Échangeable avec retenue de 15 € jusqu'à la veille du départ. Non remboursable. Billet nominatif valable uniquement sur ce train, en 2nde classe.</div></div><div class="tl-point"><span class="tl-time">19:00</span><span class="tl-station">Paris Gare de Lyon</span></div></div></div>
      </div>
      <div class="dp-section"><div class="dp-section-title">Tarifs</div><div class="tariff-cards">
        <div class="tariff-card selected"><div class="tf-left"><div class="tf-name">2nde Classe</div><div class="tf-conditions"><span class="tf-tag yes">Modif. avec frais</span><span class="tf-tag no">Non remboursable</span></div></div><div class="tf-right"><div class="tf-price">145 €</div></div></div>
        <div class="tariff-card"><div class="tf-left"><div class="tf-name">1ère Classe</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span></div></div><div class="tf-right"><div class="tf-price">230 €</div><div class="tf-delta">+85 €</div></div></div>
      </div></div>
    </div>
    <div class="drawer-cta"><div class="cta-price-summary">Retour : <strong>145 €</strong> · 2nde</div><button class="btn-primary" onclick="selectTrainLeg('return','train1-ret','TGV INOUI','145 €','17:00→19:00','2nde')">Sélectionner ce retour →</button></div>`
};
panels['train1-ret-1ere'] = {
  title: '🚄 TGV INOUI 6640 · Retour · 1ère', type: 'transport', subtype: 'train-return',
  name: 'TGV INOUI', price: '230 €', legTimes: '17:00→19:00', legClass: '1ère',
  html: `
    <div class="dp-content">
      <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#e3f2fd">🚄</div><div class="dp-title">TGV INOUI 6640</div></div><div class="dp-subtitle">Lyon Part-Dieu → Paris GdL · Retour · 1ère Classe</div></div><div class="dp-price-box"><div class="dp-price-big">230 €</div><div class="dp-price-info">77 €/p · 3 voy.</div></div></div>
      <div class="dp-section"><div class="dp-section-title">Itinéraire</div>
        <div class="journey-leg"><div class="journey-label">Retour <span class="journey-date">· Ven. 23 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">17:00</span><span class="tl-station">Lyon Part-Dieu</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e3f2fd">🚄</div> 2h · Direct · TGV 6640 · 1ère</div><div class="leg-comfort">💺 1ère, large, repose-pieds · 🔌 Prise individuelle · 📶 WiFi premium · 🍽️ Service à la place</div><div class="leg-ratrules"><strong>TARIF 1ÈRE CLASSE</strong> — Échangeable sans frais jusqu'à 30 minutes après le départ. Remboursable sans frais jusqu'à la veille du départ. Accès salon Grand Voyageur sous conditions. Billet valable sur tous les TGV INOUI du jour, en 1ère classe.</div></div><div class="tl-point"><span class="tl-time">19:00</span><span class="tl-station">Paris Gare de Lyon</span></div></div></div>
      </div>
      <div class="dp-section"><div class="dp-section-title">Tarif sélectionné</div><div class="tariff-cards">
        <div class="tariff-card selected"><div class="tf-left"><div class="tf-name">1ère Classe</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span></div></div><div class="tf-right"><div class="tf-price">230 €</div></div></div>
      </div></div>
    </div>
    <div class="drawer-cta"><div class="cta-price-summary">Retour : <strong>230 €</strong> · 1ère</div><button class="btn-primary" onclick="selectTrainLeg('return','train1-ret-1ere','TGV INOUI','230 €','17:00→19:00','1ère')">Sélectionner ce retour →</button></div>`
};
panels['train2-ret'] = {
  title: '🚄 TGV INOUI 6642 · Retour', type: 'transport', subtype: 'train-return',
  name: 'TGV INOUI', price: '159 €', legTimes: '18:00→20:00', legClass: '2nde',
  html: `
    <div class="dp-content">
      <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#e3f2fd">🚄</div><div class="dp-title">TGV INOUI 6642</div></div><div class="dp-subtitle">Lyon Part-Dieu → Paris GdL · Retour · 2nde</div></div><div class="dp-price-box"><div class="dp-price-big">159 €</div><div class="dp-price-info">53 €/p · 3 voy.</div></div></div>
      <div class="dp-section"><div class="dp-section-title">Itinéraire</div>
        <div class="journey-leg"><div class="journey-label">Retour <span class="journey-date">· Ven. 23 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">18:00</span><span class="tl-station">Lyon Part-Dieu</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e3f2fd">🚄</div> 2h · Direct · TGV 6642 · 2nde</div><div class="leg-comfort">💺 Standard, inclinable · 🔌 Prise · 📶 WiFi TGV Connect · 🍽️ Bar</div><div class="leg-ratrules"><strong>TARIF 2NDE CLASSE</strong> — Échangeable sans frais jusqu'à 30 minutes après le départ. Remboursable avec retenue de 15 € jusqu'à la veille du départ. Billet nominatif valable sur tous les TGV INOUI du jour, en 2nde classe.</div></div><div class="tl-point"><span class="tl-time">20:00</span><span class="tl-station">Paris Gare de Lyon</span></div></div></div>
      </div>
      <div class="dp-section"><div class="dp-section-title">Tarifs</div><div class="tariff-cards">
        <div class="tariff-card selected"><div class="tf-left"><div class="tf-name">2nde Classe</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span></div></div><div class="tf-right"><div class="tf-price">159 €</div></div></div>
        <div class="tariff-card"><div class="tf-left"><div class="tf-name">1ère Classe</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span></div></div><div class="tf-right"><div class="tf-price">248 €</div><div class="tf-delta">+89 €</div></div></div>
      </div></div>
    </div>
    <div class="drawer-cta"><div class="cta-price-summary">Retour : <strong>159 €</strong> · 2nde</div><button class="btn-primary" onclick="selectTrainLeg('return','train2-ret','TGV INOUI','159 €','18:00→20:00','2nde')">Sélectionner ce retour →</button></div>`
};
panels['train2-ret-1ere'] = {
  title: '🚄 TGV INOUI 6642 · Retour · 1ère', type: 'transport', subtype: 'train-return',
  name: 'TGV INOUI', price: '248 €', legTimes: '18:00→20:00', legClass: '1ère',
  html: `
    <div class="dp-content">
      <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#e3f2fd">🚄</div><div class="dp-title">TGV INOUI 6642</div></div><div class="dp-subtitle">Lyon Part-Dieu → Paris GdL · Retour · 1ère Classe</div></div><div class="dp-price-box"><div class="dp-price-big">248 €</div><div class="dp-price-info">83 €/p · 3 voy.</div></div></div>
      <div class="dp-section"><div class="dp-section-title">Itinéraire</div>
        <div class="journey-leg"><div class="journey-label">Retour <span class="journey-date">· Ven. 23 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">18:00</span><span class="tl-station">Lyon Part-Dieu</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e3f2fd">🚄</div> 2h · Direct · TGV 6642 · 1ère</div><div class="leg-comfort">💺 1ère, large, repose-pieds · 🔌 Prise individuelle · 📶 WiFi premium · 🍽️ Service à la place</div><div class="leg-ratrules"><strong>TARIF 1ÈRE CLASSE</strong> — Échangeable sans frais jusqu'à 30 minutes après le départ. Remboursable sans frais jusqu'à la veille du départ. Accès salon Grand Voyageur sous conditions. Billet valable sur tous les TGV INOUI du jour, en 1ère classe.</div></div><div class="tl-point"><span class="tl-time">20:00</span><span class="tl-station">Paris Gare de Lyon</span></div></div></div>
      </div>
      <div class="dp-section"><div class="dp-section-title">Tarif sélectionné</div><div class="tariff-cards">
        <div class="tariff-card selected"><div class="tf-left"><div class="tf-name">1ère Classe</div><div class="tf-conditions"><span class="tf-tag yes">Modif. sans frais</span><span class="tf-tag yes">Remboursable</span></div></div><div class="tf-right"><div class="tf-price">248 €</div></div></div>
      </div></div>
    </div>
    <div class="drawer-cta"><div class="cta-price-summary">Retour : <strong>248 €</strong> · 1ère</div><button class="btn-primary" onclick="selectTrainLeg('return','train2-ret-1ere','TGV INOUI','248 €','18:00→20:00','1ère')">Sélectionner ce retour →</button></div>`
};
panels['train3-ret'] = {
  title: '🚄 OuiGo 7908 · Retour', type: 'transport', subtype: 'train-return',
  name: 'OuiGo', price: '98 €', legTimes: '19:30→22:00', legClass: 'Standard',
  html: `
    <div class="dp-content">
      <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#e8f5e9">🚄</div><div class="dp-title">OuiGo 7908</div></div><div class="dp-subtitle">Lyon Part-Dieu → Paris GdL · Retour</div></div><div class="dp-price-box"><div class="dp-price-big">98 €</div><div class="dp-price-info">33 €/p · 3 voy.</div></div></div>
      <div class="dp-section"><div class="dp-section-title">Itinéraire</div>
        <div class="journey-leg"><div class="journey-label">Retour <span class="journey-date">· Ven. 23 jan.</span></div><div class="tl"><div class="tl-point"><span class="tl-time">19:30</span><span class="tl-station">Lyon Part-Dieu</span></div><div class="tl-connector"><div class="tl-connector-info"><div class="tl-op-dot" style="background:#e8f5e9">🚄</div> 2h30 · Direct · OuiGo 7908</div><div class="leg-comfort">💺 Standard, non inclinable · 🔌 Non · 📶 Non · 🍽️ Non</div><div class="leg-ratrules"><strong>TARIF OUIGO</strong> — Billet non modifiable et non remboursable. Aucun échange ni remboursement possible après l'achat. Billet valable uniquement sur ce train et à cette date.</div></div><div class="tl-point"><span class="tl-time">22:00</span><span class="tl-station">Paris Gare de Lyon</span></div></div></div>
      </div>
      <div class="dp-section"><div class="dp-section-title">Tarifs</div><div class="tariff-cards"><div class="tariff-card selected"><div class="tf-left"><div class="tf-name">OuiGo Standard</div><div class="tf-conditions"><span class="tf-tag no">Non modifiable</span><span class="tf-tag no">Non remboursable</span></div></div><div class="tf-right"><div class="tf-price">98 €</div></div></div></div></div>
    </div>
    <div class="drawer-cta"><div class="cta-price-summary">Retour : <strong>98 €</strong></div><button class="btn-primary" onclick="selectTrainLeg('return','train3-ret','OuiGo','98 €','19:30→22:00','Standard')">Sélectionner ce retour →</button></div>`
};

// ===== TAB FILTERS =====
const tabFilters = {
  trains: [],
  flights: ['Prix ▾', 'Durée ▾', 'Escales ▾', 'Compagnie ▾', 'Bagages ▾', 'Horaire ▾']
};

// ===== STEP NAVIGATION =====
function goToStep(step) {
  const prev = document.getElementById('step-' + currentStep);
  const next = document.getElementById('step-' + step);
  prev.classList.add('exiting');
  prev.classList.remove('active');
  setTimeout(() => {
    prev.classList.remove('exiting');
    next.classList.add('active');
    currentStep = step;
    updateStepper();
    updateTransportBar();
    updateSelectionFooter();
  }, 100);
}

var hotelSkipped = false;
const checkSvg = '<svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.5 12L13 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function updateStepper() {
  const steps = { transport: 'st-transport', hotel: 'st-hotel', recap: 'st-recap', confirm: 'st-confirm' };
  const lines = { 2: 'wf-line-2', 3: 'wf-line-3', 4: 'wf-line-4' };
  const order = ['transport', 'hotel', 'recap', 'confirm'];
  const nums = { transport: '2', hotel: '3', recap: '4', confirm: '5' };
  const idx = order.indexOf(currentStep === 'confirmation' ? 'confirm' : currentStep);

  order.forEach((key, i) => {
    const el = document.getElementById(steps[key]);
    const circle = el.querySelector('.wf-step-circle');
    const label = el.querySelector('.wf-step-label');
    el.className = 'wf-step';
    el.onclick = null;

    if (key === 'hotel' && hotelSkipped) {
      el.className = 'wf-step skipped';
      circle.textContent = '—';
      el.onclick = function() { unskipHotel(); };
      return;
    }

    if (i < idx) {
      el.className = 'wf-step done';
      circle.innerHTML = checkSvg;
      el.onclick = function() { goToStep(key === 'confirm' ? 'confirmation' : key); };
    } else if (i === idx) {
      el.className = 'wf-step active';
      circle.innerHTML = nums[key];
    } else {
      circle.innerHTML = nums[key];
    }
  });

  // Lines: done if both sides are done
  [2, 3, 4].forEach(n => {
    const lineEl = document.getElementById(lines[n]);
    if (lineEl) lineEl.className = (n - 1) < idx ? 'wf-line done' : 'wf-line';
  });

  // Running total
  const total = document.getElementById('stepper-total');
  if (currentStep === 'hotel' || currentStep === 'recap') {
    const tPrice = document.getElementById('recap-t-price') ? document.getElementById('recap-t-price').textContent : '';
    total.textContent = tPrice && tPrice !== '—' ? tPrice : '';
  } else { total.textContent = ''; }

  // Mobile stepper
  const msLabel = document.getElementById('ms-label');
  const dots = [document.getElementById('ms-dot-2'), document.getElementById('ms-dot-3'), document.getElementById('ms-dot-4'), document.getElementById('ms-dot-5')];
  dots.forEach(d => d.className = 'ms-dot');
  if (currentStep === 'transport') { msLabel.textContent = 'Étape 2/5 · Transport'; dots[0].className = 'ms-dot active'; }
  else if (currentStep === 'hotel') { msLabel.textContent = 'Étape 3/5 · Hôtel'; dots[0].className = 'ms-dot done'; dots[1].className = 'ms-dot active'; }
  else if (currentStep === 'recap') { msLabel.textContent = 'Étape 4/5 · Review'; dots[0].className = 'ms-dot done'; dots[1].className = 'ms-dot done'; dots[2].className = 'ms-dot active'; }
  else if (currentStep === 'confirmation') { msLabel.textContent = 'Étape 5/5 · Confirmation'; dots[0].className = 'ms-dot done'; dots[1].className = 'ms-dot done'; dots[2].className = 'ms-dot done'; dots[3].className = 'ms-dot active'; }
}

function updateTransportBar() {
  // Transport summary now lives inside hotel-split-list header — no global bar needed
}

// ===== DRAWER =====
function openDrawer(id) {
  const panel = panels[id];
  if (!panel) return;

  // V0.1: transport uses master-detail, not drawer
  if (panel.type === 'transport') return;

  const body = document.getElementById('drawer-body');
  // Show skeleton loading state first
  const skeletonHtml = `<div class="drawer-skeleton"><div class="skeleton-block skeleton-header"></div><div class="skeleton-block skeleton-body"></div><div class="skeleton-block skeleton-tariffs"></div><div class="skeleton-block skeleton-footer"></div></div>`;
  body.innerHTML = skeletonHtml;
  document.getElementById('drawer-title').textContent = panel.title;
  document.getElementById('drawer-overlay').classList.add('open');
  document.getElementById('detail-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';

  // After 300ms, replace skeleton with actual content
  setTimeout(() => {
    // Budget info line: show only for flights (trains are leg-by-leg, A/R budget can't be compared)
    let budgetHtml = '';
    if (panel.budgetLine && panel.type === 'transport' && id.startsWith('flight')) {
      budgetHtml = `<div class="budget-info-line">${panel.budgetLine}</div>`;
    }
    let finalHtml = panel.html;
    body.innerHTML = budgetHtml + finalHtml;
  }, 300);

  // Highlight in list (use base id so list card gets highlighted)
  const baseId = id.replace(/-(out-1ere|ret-1ere|1ere|business|out|ret)$/, '');
  highlightCard(baseId);
  // Highlight map pin
  highlightMapPin(id);
}

// ===== ACCORDION TOGGLE =====
function toggleAccordion(el) {
  el.classList.toggle('open');
  // Stop propagation so drawer doesn't close
  event.stopPropagation();
}

function closeDrawer() {
  document.getElementById('drawer-overlay').classList.remove('open');
  document.getElementById('detail-drawer').classList.remove('open');
  document.body.style.overflow = '';
  // Remove card highlight when drawer is closed (no selection made)
  document.querySelectorAll('.list-card, .reco-card, .d-reco-card, .hotel-list-card').forEach(c => c.classList.remove('selected-card'));
  document.querySelectorAll('.map-pin').forEach(p => p.classList.remove('active'));
}

// ===== TRAIN LEG-BY-LEG SELECTION =====
function selectTrainLeg(direction, id, name, price, times, cls) {
  // V0.1: works in master-detail context (no drawer)
  if (direction === 'outbound') {
    trainOutboundSelection = { id, name, price, times, cls };
    trainPhase = 'return';
    updateMdTrainPhaseUI();
    // Clear right panel for return selection
    const detailPanel = document.getElementById('md-train-detail');
    if (detailPanel) detailPanel.innerHTML = '<div class="md-detail-placeholder">Sélectionnez un train retour pour voir les détails</div>';
    // Remove card highlights
    document.querySelectorAll('#md-train-list .list-card').forEach(c => c.classList.remove('selected-card'));
    // Scroll list to top
    const mdList = document.getElementById('md-train-list');
    if (mdList) mdList.scrollTop = 0;
  } else if (direction === 'return') {
    trainReturnSelection = { id, name, price, times, cls };
    trainPhase = 'complete';
    // Calculate total A/R price
    const parsePrice = (txt) => parseInt(txt.replace(/\s/g, '')) || 0;
    const outPrice = parsePrice(trainOutboundSelection.price);
    const retPrice = parsePrice(trainReturnSelection.price);
    const totalPrice = outPrice + retPrice;
    const totalPriceStr = totalPrice.toLocaleString('fr-FR') + ' €';
    const combinedName = trainOutboundSelection.name + ' · Aller ' + trainOutboundSelection.times + ' + Retour ' + trainReturnSelection.times;
    // Show selection footer with complete A/R summary
    const footer = document.getElementById('selection-footer');
    const budgetMax = 480; // Budget transport max
    let horsTag = '';
    if (totalPrice > budgetMax) {
      horsTag = ' <span class="tag tag-danger" style="margin-left:6px;font-size:10px">Hors budget</span>';
    }
    document.getElementById('sf-name').innerHTML = '🚄 ' + combinedName + horsTag;
    document.getElementById('sf-price').textContent = totalPriceStr;
    footer.classList.add('visible');
    currentSelection = { id: 'train-ar', name: combinedName, price: totalPriceStr, step: 'transport' };
    updateMdTrainPhaseUI();
  }
}

function resetTrainOutbound() {
  trainPhase = 'outbound';
  trainOutboundSelection = null;
  trainReturnSelection = null;
  currentSelection = { id: null, name: '', price: '', step: '' };
  document.getElementById('selection-footer').classList.remove('visible');
  updateTrainPhaseUI();
}

function updateTrainPhaseUI() {
  // V0.1: delegate to master-detail version (old DOM IDs no longer exist)
  updateMdTrainPhaseUI();
}

// ===== V0.1: RECO INLINE DETAIL =====
function toggleRecoDetail(id) {
  const detailEl = document.getElementById('reco-detail-' + id);
  const card = document.querySelector('.d-reco-card[data-id="' + id + '"]');
  const ctaBar = document.getElementById('reco-cta-bar');
  const grid = document.querySelector('.d-reco-grid');
  if (!detailEl) return;

  if (expandedRecoId === id) {
    // Collapse current
    detailEl.style.display = 'none';
    detailEl.innerHTML = '';
    if (card) card.classList.remove('expanded');
    expandedRecoId = null;
    // Remove compact mode
    if (grid) grid.classList.remove('compact');
    // Hide CTA bar
    if (ctaBar) ctaBar.classList.remove('visible');
  } else {
    // Collapse previous if any
    if (expandedRecoId) {
      const prevDetail = document.getElementById('reco-detail-' + expandedRecoId);
      const prevCard = document.querySelector('.d-reco-card[data-id="' + expandedRecoId + '"]');
      if (prevDetail) { prevDetail.style.display = 'none'; prevDetail.innerHTML = ''; }
      if (prevCard) prevCard.classList.remove('expanded');
    }
    // Expand new — inject panel HTML (same content as md-detail / drawer)
    const panel = panels[id];
    if (panel) {
      detailEl.innerHTML = panel.html;
      // Flights: lock tariff to selected only + info card
      if (id.startsWith('flight')) {
        _lockFlightTariffs(detailEl);
      }
      // Trains: add info card (tariff changeable here + at Review & Options)
      if (id.startsWith('train')) {
        _addTrainTariffInfo(detailEl);
      }
    }
    detailEl.style.display = '';
    if (card) card.classList.add('expanded');
    expandedRecoId = id;
    // Enter compact mode
    if (grid) grid.classList.add('compact');

    // Update CTA bar
    const recoData = _getRecoData(id);
    if (ctaBar && recoData) {
      document.getElementById('rcb-summary').innerHTML = recoData.icon + ' <strong>' + recoData.name + '</strong> · ' + recoData.price;
      ctaBar.dataset.id = id;
      ctaBar.dataset.name = recoData.selectName;
      ctaBar.dataset.price = recoData.price;
      ctaBar.classList.add('visible');
    }

    // Smooth scroll: position the detail zone just below the compact cards
    setTimeout(() => {
      const detailZone = document.getElementById('reco-detail-zone');
      if (detailZone) {
        const zoneRect = detailZone.getBoundingClientRect();
        const targetTop = window.scrollY + zoneRect.top - 80;
        window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
      }
    }, 120);
  }
}

// Helper: get reco data for CTA bar display
function _getRecoData(id) {
  const map = {
    train1: { icon: '🚄', name: 'TGV INOUI · 2nde', price: '290 €', selectName: 'TGV INOUI 7835 · 2nde' },
    flight1: { icon: '✈️', name: 'Air France · Economy', price: '378 €', selectName: 'Air France AF7524 · Economy' },
    train2: { icon: '🚄', name: 'OuiGo · Standard', price: '196 €', selectName: 'OuiGo 7901 · Standard' }
  };
  return map[id] || null;
}

// Helper: for trains in reco detail, inject fare conditions into timeline + add info card
function _addTrainTariffInfo(el) {
  // 1) Inject leg-ratrules into each timeline leg (same component as All Trains)
  const selected = el.querySelector('.tariff-card.selected');
  if (selected) {
    const fareName = selected.querySelector('.tf-name')?.textContent || '';
    const detailPanel = selected.nextElementSibling;
    let condLines = [];
    if (detailPanel && detailPanel.classList.contains('tf-detail-panel')) {
      detailPanel.querySelectorAll('.tf-detail-line').forEach(l => condLines.push(l.textContent.replace(/^·\s*/, '')));
    }
    if (condLines.length) {
      const rulesText = '<strong>TARIF ' + fareName.toUpperCase() + '</strong> — ' + condLines.join('. ') + '.';
      el.querySelectorAll('.tl-connector').forEach(conn => {
        if (!conn.querySelector('.leg-ratrules')) {
          const div = document.createElement('div');
          div.className = 'leg-ratrules';
          div.innerHTML = rulesText;
          conn.appendChild(div);
        }
      });
    }
  }
  // 2) Add info card about Review & Options
  const tariffCards = el.querySelector('.tariff-cards');
  if (!tariffCards) return;
  const tariffSection = tariffCards.closest('.dp-section');
  if (tariffSection) {
    const infoCard = document.createElement('div');
    infoCard.className = 'no-fare-info-card';
    infoCard.style.marginTop = '10px';
    infoCard.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><circle cx="8" cy="8" r="7" stroke="var(--text-tag-info)" stroke-width="1.5"/><path d="M8 5V5.01M8 7V11" stroke="var(--text-tag-info)" stroke-width="1.5" stroke-linecap="round"/></svg><span>Vous pouvez aussi <strong>ajuster votre tarif</strong> et ajouter des extras à l\'étape Revue &amp; Options.</span>';
    tariffSection.appendChild(infoCard);
  }
}

// Helper: for flights in reco detail, keep only the selected tariff (read-only) + info card
function _lockFlightTariffs(el) {
  const tariffCards = el.querySelector('.tariff-cards');
  if (!tariffCards) return;
  // Keep only the selected tariff card, remove others
  tariffCards.querySelectorAll('.tariff-card:not(.selected)').forEach(c => c.remove());
  // Make selected card read-only
  const selected = tariffCards.querySelector('.tariff-card.selected');
  if (selected) selected.style.cursor = 'default';
  // Hide the guidance card about Light tariff (already in the section)
  const guidance = el.querySelector('.guidance-card');
  if (guidance) guidance.remove();
  // Add info card after tariff section
  const tariffSection = tariffCards.closest('.dp-section');
  if (tariffSection) {
    const infoCard = document.createElement('div');
    infoCard.className = 'no-fare-info-card';
    infoCard.style.marginTop = '10px';
    infoCard.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0"><circle cx="8" cy="8" r="7" stroke="var(--text-tag-info)" stroke-width="1.5"/><path d="M8 5V5.01M8 7V11" stroke="var(--text-tag-info)" stroke-width="1.5" stroke-linecap="round"/></svg><span>Vous pourrez <strong>ajuster votre tarif</strong> et ajouter des extras à la prochaine étape.</span>';
    tariffSection.appendChild(infoCard);
  }
}

function selectRecoFromBar() {
  const ctaBar = document.getElementById('reco-cta-bar');
  if (!ctaBar) return;
  const id = ctaBar.dataset.id;
  const name = ctaBar.dataset.name;
  const price = ctaBar.dataset.price;
  ctaBar.classList.remove('visible');
  selectRecoTransport(id, name, price);
}

function selectRecoTransport(id, name, price) {
  currentSelection = { id, name, price, step: 'transport' };
  // Update recap data
  document.getElementById('hts-label').textContent = name;
  document.getElementById('hts-price').textContent = price;
  document.getElementById('recap-transport-name').textContent = name;
  document.getElementById('recap-transport-price').textContent = price;
  document.getElementById('recap-t-price').textContent = price;
  updateRecapTotal();
  // Go to hotel
  setTimeout(() => {
    goToStep('hotel');
    currentSelection = { id: null, name: '', price: '', step: '' };
  }, 200);
}

// ===== V0.1: VIEW SWITCHING =====
function showAllView(mode) {
  // mode: 'trains' or 'flights'
  document.getElementById('view-recos').style.display = 'none';
  document.getElementById('view-all-trains').style.display = mode === 'trains' ? '' : 'none';
  document.getElementById('view-all-flights').style.display = mode === 'flights' ? '' : 'none';
  currentTransportView = 'all-' + mode;

  if (mode === 'trains') {
    // Reset train phase to outbound
    trainPhase = 'outbound';
    trainOutboundSelection = null;
    trainReturnSelection = null;
    updateMdTrainPhaseUI();
    // Clear right panel
    document.getElementById('md-train-detail').innerHTML = '<div class="md-detail-placeholder">Sélectionnez un train pour voir les détails</div>';
    // Remove card highlights
    document.querySelectorAll('#md-train-list .list-card').forEach(c => c.classList.remove('selected-card'));
  }
  if (mode === 'flights') {
    // Reset train state if coming from All Trains
    trainPhase = 'outbound';
    trainOutboundSelection = null;
    trainReturnSelection = null;
    // Clear right panel
    document.getElementById('md-flight-detail').innerHTML = '<div class="md-detail-placeholder">Sélectionnez un vol pour voir les détails</div>';
    document.querySelectorAll('#md-flight-list .list-card').forEach(c => c.classList.remove('selected-card'));
  }
  // Hide selection footer + reco CTA bar
  document.getElementById('selection-footer').classList.remove('visible');
  const ctaBar = document.getElementById('reco-cta-bar');
  if (ctaBar) ctaBar.classList.remove('visible');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showRecoView() {
  document.getElementById('view-recos').style.display = '';
  document.getElementById('view-all-trains').style.display = 'none';
  document.getElementById('view-all-flights').style.display = 'none';
  currentTransportView = 'recos';

  // Reset train state
  trainPhase = 'outbound';
  trainOutboundSelection = null;
  trainReturnSelection = null;
  document.getElementById('selection-footer').classList.remove('visible');

  // Restore reco CTA bar if a reco is still expanded
  if (expandedRecoId) {
    const ctaBar = document.getElementById('reco-cta-bar');
    if (ctaBar) ctaBar.classList.add('visible');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== V0.1: MASTER-DETAIL ITEM SELECTION =====
function selectMdItem(mode, panelId) {
  const panel = panels[panelId];
  const detailContainer = mode === 'trains'
    ? document.getElementById('md-train-detail')
    : document.getElementById('md-flight-detail');

  if (!detailContainer) return;

  // Highlight card in list
  const listContainer = mode === 'trains'
    ? document.getElementById('md-train-list')
    : document.getElementById('md-flight-list');
  if (listContainer) {
    listContainer.querySelectorAll('.list-card').forEach(c => c.classList.remove('selected-card'));
  }
  // Find and highlight the clicked card (match by panelId in onclick)
  const baseId = panelId.replace(/-(out|ret|1ere|out-1ere|ret-1ere)$/, '');
  if (listContainer) {
    const card = listContainer.querySelector('.list-card[data-id="' + baseId + '"]') ||
                 listContainer.querySelector('.list-card[data-id="' + panelId.replace(/-out.*|-ret.*/, '') + '"]');
    if (card) card.classList.add('selected-card');
  }

  if (panel) {
    // Inject panel HTML with skeleton loading
    detailContainer.innerHTML = '<div class="drawer-skeleton"><div class="skeleton-block skeleton-header"></div><div class="skeleton-block skeleton-body"></div><div class="skeleton-block skeleton-tariffs"></div></div>';
    setTimeout(() => {
      let html = panel.html;
      detailContainer.innerHTML = html;
    }, 200);
  } else {
    // Panel data not available — show wireframe placeholder
    detailContainer.innerHTML = `
      <div class="dp-content" style="padding:24px">
        <div class="dp-header"><div><div class="dp-title-row"><div class="dp-icon" style="background:#e3f2fd">🚄</div><div class="dp-title">Détail train</div></div><div class="dp-subtitle">Données non disponibles dans ce wireframe</div></div></div>
        <div style="padding:40px 20px;text-align:center;color:var(--text-muted)">
          <p>Le détail de ce train serait affiché ici en production.</p>
          <p style="font-size:11px;margin-top:8px">Panel ID : ${panelId}</p>
        </div>
      </div>`;
  }
}

function resetMdTrainOutbound() {
  trainPhase = 'outbound';
  trainOutboundSelection = null;
  trainReturnSelection = null;
  currentSelection = { id: null, name: '', price: '', step: '' };
  document.getElementById('selection-footer').classList.remove('visible');
  updateMdTrainPhaseUI();
  // Clear right panel
  document.getElementById('md-train-detail').innerHTML = '<div class="md-detail-placeholder">Sélectionnez un train pour voir les détails</div>';
  // Remove card highlights
  document.querySelectorAll('#md-train-list .list-card').forEach(c => c.classList.remove('selected-card'));
}

// ===== V0.1: MASTER-DETAIL TRAIN PHASE UI =====
function updateMdTrainPhaseUI() {
  const outList = document.getElementById('md-train-outbound-list');
  const retList = document.getElementById('md-train-return-list');
  const legSummary = document.getElementById('md-leg-summary');
  const instruction = document.getElementById('md-stepper-instruction');
  const ctxOut = document.getElementById('md-context-trains-out');
  const ctxRet = document.getElementById('md-context-trains-ret');
  const guidanceTrains = document.getElementById('md-guidance-trains');
  if (!guidanceTrains) return;

  if (trainPhase === 'outbound') {
    if (outList) outList.style.display = '';
    if (retList) retList.style.display = 'none';
    if (legSummary) legSummary.style.display = 'none';
    if (instruction) instruction.innerHTML = 'Choix de l\u2019aller, puis du retour.';
    if (ctxOut) ctxOut.style.display = '';
    if (ctxRet) ctxRet.style.display = 'none';
    guidanceTrains.style.display = '';
  } else if (trainPhase === 'return') {
    if (outList) outList.style.display = 'none';
    if (retList) retList.style.display = '';
    if (legSummary) legSummary.style.display = 'inline-flex';
    const summaryText = document.getElementById('md-leg-summary-text');
    if (summaryText && trainOutboundSelection) {
      summaryText.textContent = 'Aller : ' + trainOutboundSelection.name + ' ' + trainOutboundSelection.times + ' \u00B7 ' + trainOutboundSelection.cls + ' \u00B7 ' + trainOutboundSelection.price;
    }
    if (instruction) instruction.innerHTML = '<strong>Choisissez votre retour</strong>';
    if (ctxOut) ctxOut.style.display = 'none';
    if (ctxRet) ctxRet.style.display = '';
    guidanceTrains.style.display = '';
  } else if (trainPhase === 'complete') {
    if (outList) outList.style.display = 'none';
    if (retList) retList.style.display = 'none';
    if (legSummary) legSummary.style.display = 'none';
    if (ctxOut) ctxOut.style.display = 'none';
    if (ctxRet) ctxRet.style.display = 'none';
    guidanceTrains.style.display = 'none';
  }
}

// ===== SELECT + CONTINUE =====
function selectItem(id, name, price, step) {
  currentSelection = { id, name, price, step };
  closeDrawer();
  highlightCard(id);
  // Update recap data
  if (step === 'transport') {
    // Update hotel-step transport summary
    document.getElementById('hts-label').textContent = name;
    document.getElementById('hts-price').textContent = price;
    document.getElementById('recap-transport-name').textContent = name;
    document.getElementById('recap-transport-price').textContent = price;
    document.getElementById('recap-t-price').textContent = price;
  } else if (step === 'hotel') {
    document.getElementById('recap-hotel-name').textContent = name;
    document.getElementById('recap-hotel-price').textContent = price;
    document.getElementById('recap-h-price').textContent = price;
  }
  updateRecapTotal();
  // Auto-advance to next step
  setTimeout(() => {
    if (step === 'transport') {
      goToStep('hotel');
      currentSelection = { id: null, name: '', price: '', step: '' };
    } else if (step === 'hotel') {
      goToStep('recap');
    }
  }, 200);
}

function continueToNext() {
  if (currentStep === 'transport') {
    // Update recap data from train or flight selection
    if (currentSelection.step === 'transport') {
      document.getElementById('hts-label').textContent = currentSelection.name;
      document.getElementById('hts-price').textContent = currentSelection.price;
      document.getElementById('recap-transport-name').textContent = currentSelection.name;
      document.getElementById('recap-transport-price').textContent = currentSelection.price;
      document.getElementById('recap-t-price').textContent = currentSelection.price;
      updateRecapTotal();
    }
    goToStep('hotel');
    currentSelection = { id: null, name: '', price: '', step: '' };
    // Reset train phase for when user comes back
  } else if (currentStep === 'hotel') {
    goToStep('recap');
  }
}

function skipHotel() {
  hotelSkipped = true;
  document.getElementById('recap-hotel-card').style.display = 'none';
  document.getElementById('recap-h-price').textContent = '—';
  goToStep('recap');
}

function unskipHotel() {
  hotelSkipped = false;
  goToStep('hotel');
}

function updateSelectionFooter() {
  // Footer only visible when train A/R is complete (user must click Continuer)
  // For flights/hotels, select auto-advances to next step
  if (trainPhase === 'complete' && currentStep === 'transport') {
    document.getElementById('selection-footer').classList.add('visible');
  } else {
    document.getElementById('selection-footer').classList.remove('visible');
  }
}

function updateRecapTotal() {
  const parsePrice = (txt) => parseInt(txt.replace(/\s/g, '')) || 0;
  const tVal = parsePrice(document.getElementById('recap-t-price').textContent);
  const hVal = parsePrice(document.getElementById('recap-h-price').textContent);
  const total = tVal + hVal;
  document.getElementById('recap-total').textContent = total.toLocaleString('fr-FR') + ' €';
}

// ===== GUIDANCE CARDS (dismiss) =====
function dismissGuidance(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('dismissed');
}

// ===== HIGHLIGHT CARDS + PINS =====
function highlightCard(id) {
  // Remove all highlights
  document.querySelectorAll('.list-card, .reco-card, .d-reco-card, .hotel-list-card').forEach(c => c.classList.remove('selected-card'));
  // Add highlight to matching cards
  document.querySelectorAll('[data-id="' + id + '"]').forEach(c => c.classList.add('selected-card'));
}

function highlightMapPin(id) {
  document.querySelectorAll('.map-pin').forEach(p => p.classList.remove('active'));
  const pin = document.querySelector('.map-pin[data-hotel="' + id + '"]');
  if (pin) pin.classList.add('active');
}

// ===== RECO ZONE COLLAPSE/EXPAND =====
function toggleRecos() {
  const recoZone = document.getElementById('d-reco-zone');
  if (recoZone) recoZone.classList.toggle('collapsed');
}
function expandRecos() {
  const recoZone = document.getElementById('d-reco-zone');
  if (recoZone) recoZone.classList.remove('collapsed');
}

// ===== TAB SWITCHING (D-style: trains/flights with chrome toggle) =====
function switchTab(tab) {
  // Update tab buttons (D-style IDs)
  const btnTrains = document.getElementById('d-tab-btn-trains');
  const btnFlights = document.getElementById('d-tab-btn-flights');
  if (btnTrains) btnTrains.classList.toggle('active', tab === 'trains');
  if (btnFlights) btnFlights.classList.toggle('active', tab === 'flights');

  // Show/hide tab content (D-style IDs)
  const tabTrains = document.getElementById('d-tab-trains');
  const tabFlights = document.getElementById('d-tab-flights');
  if (tabTrains) tabTrains.style.display = tab === 'trains' ? 'flex' : 'none';
  if (tabFlights) tabFlights.style.display = tab === 'flights' ? 'flex' : 'none';

  // Show/hide train-specific vs flight-specific chrome
  const trainsChrome = document.getElementById('d-trains-chrome');
  const flightsChrome = document.getElementById('d-flights-chrome');
  if (trainsChrome) trainsChrome.style.display = tab === 'trains' ? '' : 'none';
  if (flightsChrome) flightsChrome.style.display = tab === 'flights' ? '' : 'none';

  // Show/hide trains complets hint
  const trainsCompletsHint = document.getElementById('d-trains-complets-hint');
  if (trainsCompletsHint) trainsCompletsHint.style.display = tab === 'trains' ? '' : 'none';

  // Stepper is inside d-trains-chrome, so it auto-hides with the chrome

  // Switch context line (route info under title)
  const ctxTrainsOut = document.getElementById('d-context-trains-out');
  const ctxTrainsRet = document.getElementById('d-context-trains-ret');
  const ctxFlights = document.getElementById('d-context-flights');
  if (tab === 'trains') {
    if (ctxFlights) ctxFlights.style.display = 'none';
    // Show appropriate train context based on phase
    if (typeof dTrainPhase !== 'undefined' && dTrainPhase === 'return') {
      if (ctxTrainsOut) ctxTrainsOut.style.display = 'none';
      if (ctxTrainsRet) ctxTrainsRet.style.display = '';
    } else {
      if (ctxTrainsOut) ctxTrainsOut.style.display = '';
      if (ctxTrainsRet) ctxTrainsRet.style.display = 'none';
    }
  } else {
    if (ctxTrainsOut) ctxTrainsOut.style.display = 'none';
    if (ctxTrainsRet) ctxTrainsRet.style.display = 'none';
    if (ctxFlights) ctxFlights.style.display = '';
  }
}

// ===== PAGINATION =====
function loadMore(mode) {
  const tab = document.getElementById('d-tab-' + mode) || document.getElementById('tab-' + mode) || document.querySelector('.hotel-split-list');
  const hiddenCards = tab.querySelectorAll('.pagination-hidden');
  let shown = 0;
  hiddenCards.forEach(card => {
    if (shown < 5) { card.classList.remove('pagination-hidden'); shown++; }
  });
  const remaining = tab.querySelectorAll('.pagination-hidden').length;
  const btn = tab.querySelector('.pagination-btn');
  if (!btn) return;
  if (remaining === 0) { btn.style.display = 'none'; }
  else {
    const label = mode === 'hotels' ? 'hôtels' : mode === 'trains' ? 'trains' : 'vols';
    btn.innerHTML = 'Afficher les 5 ' + label + ' suivants ▾ <span style="color:var(--text-muted);font-weight:400">(' + remaining + ' restants)</span>';
  }
}

// ===== FLIGHTS EMPTY STATE TOGGLE (demo) =====
function toggleFlightsEmpty() {
  const empty = document.getElementById('flights-empty');
  const results = document.getElementById('flights-results');
  if (!empty || !results) return;
  const isEmpty = empty.style.display !== 'none';
  empty.style.display = isEmpty ? 'none' : '';
  results.style.display = isEmpty ? '' : 'none';
}

// ===== HOTEL MAP HOVER SYNC =====
document.addEventListener('DOMContentLoaded', () => {
  // Hover hotel card → highlight pin
  document.querySelectorAll('.hotel-list-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const id = card.dataset.id;
      if (id) highlightMapPin(id);
    });
    card.addEventListener('mouseleave', () => {
      // Restore active selection
      if (currentSelection.id) highlightMapPin(currentSelection.id);
      else document.querySelectorAll('.map-pin').forEach(p => p.classList.remove('active'));
    });
  });
});
