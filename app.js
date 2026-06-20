/* =========================================================================
   EBONY & IVORY — app.js (Unified Logic Module)
   ========================================================================= */
(function () {
  "use strict";

  const CONFIG = window.EI_CONFIG;
  let currentLang = "en";
  let currentScore = null;     
  let editorState = { activeMeasure: 0, activeStaff: "treble", duration: "q", dotted: false };
  let libraryState = { query: "", sortBy: "numAsc", filterTime: "all", filterKey: "all", filterHands: "all" };
  let saveTimeout = null;

  /* ----------------------------- i18n ----------------------------- */
  const keysDB = [
    { val: "C", us: "C / Am", eu: "Do / La m" }, { val: "G", us: "G / Em", eu: "Sol / Mi m" },
    { val: "D", us: "D / Bm", eu: "Re / Si m" }, { val: "A", us: "A / F#m", eu: "La / Fa# m" },
    { val: "E", us: "E / C#m", eu: "Mi / Do# m" }, { val: "B", us: "B / G#m", eu: "Si / Sol# m" },
    { val: "F", us: "F / Dm", eu: "Fa / Re m" }, { val: "Bb", us: "Bb / Gm", eu: "Sib / Sol m" },
    { val: "Eb", us: "Eb / Cm", eu: "Mib / Do m" }, { val: "Ab", us: "Ab / Fm", eu: "Lab / Fa m" }
  ];

  window.EI = {
    setLang: function(lang) {
      currentLang = lang;
      document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = Array.from(document.querySelectorAll('.lang-btn')).find(btn => btn.textContent.toLowerCase() === lang);
      if(activeBtn) activeBtn.classList.add('active');
      
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n'); if (CONFIG.i18n[lang][key]) el.innerHTML = CONFIG.i18n[lang][key];
      });
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder'); if (CONFIG.i18n[lang][key]) el.setAttribute('placeholder', CONFIG.i18n[lang][key]);
      });
      
      renderCustomSelects(); 
      if (document.getElementById("viewLibrary") && !document.getElementById("viewLibrary").hidden) renderLibrary();
      if (document.getElementById("viewEditor") && !document.getElementById("viewEditor").hidden) renderScore();
    }
  };

  function t(key) { return CONFIG.i18n[currentLang][key] || key; }

  function renderCustomSelects() {
    const buildOptions = (isFilter) => {
        let html = isFilter ? `<div data-val="all"><span>${t('optKeyAll')}</span></div>` : '';
        keysDB.forEach(k => {
            const left = currentLang === 'es' ? k.eu : k.us;
            const right = currentLang === 'es' ? k.us : k.eu;
            html += `<div data-val="${k.val}"><span>${left}</span><span class="translucent">${right}</span></div>`;
        }); return html;
    };
    if(document.getElementById('customKeySigOptions')) {
      document.getElementById('customKeySigOptions').innerHTML = buildOptions(false);
      updateCustomSelectUI('customKeySig', document.getElementById('keySig').value, false);
      document.getElementById('customFilterKeyOptions').innerHTML = buildOptions(true);
      updateCustomSelectUI('customFilterKeySig', document.getElementById('filterKeySig').value, true);
    }
  }

  function setupCustomSelect(wrapperId, inputId, isFilter) {
      const wrapper = document.getElementById(wrapperId); if(!wrapper) return;
      const selected = wrapper.querySelector('.select-selected');
      const options = wrapper.querySelector('.select-items'); const hiddenInput = document.getElementById(inputId);
      selected.addEventListener('click', function(e) { e.stopPropagation(); wrapper.classList.toggle('active'); });
      options.addEventListener('click', function(e) {
          const item = e.target.closest('div');
          if (item && item.hasAttribute('data-val')) {
              const val = item.getAttribute('data-val'); hiddenInput.value = val; updateCustomSelectUI(wrapperId, val, isFilter);
              wrapper.classList.remove('active');
              if (isFilter) { libraryState.filterKey = val; renderLibrary(); } else if (currentScore) { currentScore.keySig = val; renderScore(); }
          }
      });
  }

  function updateCustomSelectUI(wrapperId, val, isFilter) {
      const wrapper = document.getElementById(wrapperId); if(!wrapper) return;
      const selected = wrapper.querySelector('.select-selected');
      const option = wrapper.querySelector(`.select-items div[data-val="${val}"]`);
      if (option) { selected.innerHTML = option.innerHTML; document.getElementById(wrapperId === 'customKeySig' ? 'keySig' : 'filterKeySig').value = val; }
  }

  /* ----------------------------- Database & Utils ----------------------------- */
  const STORAGE_KEY = "ebony_ivory:scores";
  const DURATION_QUARTERS = { w: 4, h: 2, q: 1, "8": 0.5, "16": 0.25, "32": 0.125 };
  
  function uid() { return "s_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function loadAll() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch (e) { return {}; } }
  function saveAll(map) { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); }
  function nextPlateNumber() { const scores = Object.values(loadAll()); if (scores.length === 0) return 1; return Math.max(...scores.map(s => s.plate || 0)) + 1; }
  function plateLabel(n) { return "E&I " + String(n).padStart(3, "0"); }
  function slugify(str) { return (str || "score").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "score"; }
  function formatDate(ts) { try { return new Date(ts).toLocaleDateString(currentLang === 'es' ? "es-ES" : "en-US", { day: "2-digit", month: "short", year: "numeric" }); } catch (e) { return ""; } }
  function escapeHtml(str) { const d = document.createElement("div"); d.textContent = str; return d.innerHTML; }
  
  function newMeasure() { return { treble: [], bass: [], repeatStart: false, repeatEnd: false, directive: "" }; }
  function newScore() { return { id: uid(), plate: nextPlateNumber(), title: "", composer: "", timeSig: "4/4", keySig: "C", bpm: 100, measures: [newMeasure()], createdAt: Date.now(), updatedAt: Date.now() }; }
  
  function persistScore(score) { 
    if (score.isExample) return; 
    score.updatedAt = Date.now(); 
    const all = loadAll(); all[score.id] = score; saveAll(all); 
    const ind = document.getElementById('saveIndicator'); 
    if(ind) { ind.classList.add('show'); clearTimeout(saveTimeout); saveTimeout = setTimeout(() => ind.classList.remove('show'), 1500); }
  }

  function deleteScoreById(id) { 
    const all = loadAll(); delete all[id]; 
    const scores = Object.values(all).sort((a, b) => a.plate - b.plate);
    const newAll = {}; scores.forEach((s, index) => { s.plate = index + 1; newAll[s.id] = s; });
    saveAll(newAll); 
  }

  /* ----------------------------- Cloud Sync (Firebase) ----------------------------- */
  let auth = null, db = null, currentUser = null, unsubscribeSnapshot = null, pollTimer = null, lastSnapshotMap = {};

  function initFirebase() {
    try {
      firebase.initializeApp(CONFIG.firebase); auth = firebase.auth(); db = firebase.firestore();
      auth.onAuthStateChanged((user) => {
        currentUser = user; updateAccountUI();
        if (user) {
          lastSnapshotMap = {}; const coll = db.collection('users').doc(user.uid).collection('scores');
          unsubscribeSnapshot = coll.onSnapshot((snap) => {
            const cloudMap = {}; snap.forEach((doc) => { cloudMap[doc.id] = doc.data(); });
            const localAll = loadAll(); let changed = false;
            Object.keys(cloudMap).forEach((id) => {
              if (!localAll[id] || (cloudMap[id].updatedAt || 0) > (localAll[id].updatedAt || 0)) { localAll[id] = cloudMap[id]; changed = true; }
            });
            if (changed) { saveAll(localAll); lastSnapshotMap = snapshotOf(localAll); if (document.getElementById("viewLibrary") && !document.getElementById("viewLibrary").hidden) renderLibrary(); }
          });
          pollTimer = setInterval(() => {
            const all = loadAll(); const batch = db.batch(); let writes = 0;
            Object.keys(all).forEach((id) => { if (!lastSnapshotMap[id] || lastSnapshotMap[id] !== (all[id].updatedAt || 0)) { batch.set(coll.doc(id), all[id]); writes++; } });
            Object.keys(lastSnapshotMap).forEach((id) => { if (!all[id]) { batch.delete(coll.doc(id)); writes++; } });
            lastSnapshotMap = snapshotOf(all); if (writes > 0) batch.commit();
          }, 4000);
        } else {
          if (unsubscribeSnapshot) { unsubscribeSnapshot(); unsubscribeSnapshot = null; }
          if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
        }
      });
    } catch (e) { console.warn('Firebase error:', e); }
  }

  function snapshotOf(map) { const out = {}; Object.keys(map).forEach((id) => { out[id] = map[id].updatedAt || 0; }); return out; }
  
  function updateAccountUI() {
    const loginBtn = document.getElementById('btnAccountLogin'); const loggedBox = document.getElementById('accountLogged');
    if(!loginBtn) return;
    if (currentUser) {
      loginBtn.hidden = true; loggedBox.hidden = false;
      document.getElementById('acctEmail').textContent = currentUser.email || '';
      document.getElementById('acctAvatar').textContent = (currentUser.email || '?').charAt(0).toUpperCase();
    } else { loginBtn.hidden = false; loggedBox.hidden = true; }
  }

  const authOverlay = document.getElementById('authModalOverlay');
  if(authOverlay) {
    document.getElementById('btnAccountLogin').addEventListener('click', () => { authOverlay.hidden = false; document.getElementById('authError').hidden = true; });
    document.getElementById('authModalClose').addEventListener('click', () => authOverlay.hidden = true);
    document.getElementById('btnAccountLogout').addEventListener('click', () => { if (auth) auth.signOut(); });
    
    document.getElementById('authForm').addEventListener('submit', (e) => {
      e.preventDefault(); const errBox = document.getElementById('authError'); errBox.hidden = true;
      const isReg = document.getElementById('authTabRegister').classList.contains('is-active');
      const p = isReg ? auth.createUserWithEmailAndPassword(document.getElementById('authEmail').value, document.getElementById('authPassword').value) : auth.signInWithEmailAndPassword(document.getElementById('authEmail').value, document.getElementById('authPassword').value);
      p.then(() => authOverlay.hidden = true).catch(err => { errBox.hidden = false; errBox.textContent = `${t('genericError')} (Detalle: ${err.message || err.code})`; });
    });
    document.getElementById('authGoogleBtn').addEventListener('click', () => {
      const errBox = document.getElementById('authError'); errBox.hidden = true;
      auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(() => authOverlay.hidden = true).catch(err => { errBox.hidden = false; errBox.textContent = `${t('genericError')} (Detalle: ${err.message || err.code})`; });
    });
  }

  /* ----------------------------- Navigation & Library ----------------------------- */
  function handleNavigation() {
    const hash = window.location.hash; document.body.classList.remove('is-home', 'is-viewer');
    document.getElementById("viewHome").hidden = true; document.getElementById("viewLibrary").hidden = true; document.getElementById("viewEditor").hidden = true;
    document.getElementById("libraryActions").hidden = true; document.getElementById("editorActions").hidden = true;
    stopAudio();

    if (hash.startsWith("#editor/")) {
      currentScore = loadAll()[hash.split("/")[1]];
      if (currentScore) { document.body.classList.remove('is-viewer'); initEditor(); } else { window.location.hash = "#catalogo"; }
    } else if (hash.startsWith("#viewer/")) {
      currentScore = loadAll()[hash.split("/")[1]];
      if (currentScore) { document.body.classList.add('is-viewer'); initEditor(); } else { window.location.hash = "#catalogo"; }
    } else if (hash === "#ejemplo") {
      currentScore = CONFIG.getExampleScore(currentLang); document.body.classList.add('is-viewer', 'is-example-score'); initEditor();
    } else if (hash === "#catalogo") {
      currentScore = null; document.getElementById("viewLibrary").hidden = false; document.getElementById("libraryActions").hidden = false;
      document.title = t('catalogTitle') + " — Ebony & Ivory"; renderLibrary(); window.scrollTo(0,0);
    } else {
      currentScore = null; document.getElementById("viewHome").hidden = false; document.body.classList.add('is-home'); document.title = "Ebony & Ivory"; window.scrollTo(0,0);
    }
  }

  function initEditor() {
    editorState = { activeMeasure: 0, activeStaff: "treble", duration: "q", dotted: false };
    document.getElementById("viewEditor").hidden = false; document.getElementById("editorActions").hidden = false;
    document.title = (currentScore.title || t('untitled')) + " — Ebony & Ivory";
    document.getElementById("scoreTitle").value = currentScore.title || ""; 
    document.getElementById("scoreComposer").value = currentScore.composer || ""; 
    document.getElementById("timeSig").value = currentScore.timeSig || "4/4"; 
    updateCustomSelectUI('customKeySig', currentScore.keySig || "C", false); 
    document.getElementById("scoreBpm").value = currentScore.bpm || 100;
    syncMeasureControls(); renderScore(); window.scrollTo(0,0);
  }

  function renderLibrary() {
    let scores = Object.values(loadAll());
    if (libraryState.query) { scores = scores.filter(s => (s.title || "").toLowerCase().includes(libraryState.query) || (s.composer || "").toLowerCase().includes(libraryState.query) || plateLabel(s.plate).toLowerCase().includes(libraryState.query)); }
    scores = scores.filter(s => {
        if (libraryState.filterTime !== "all" && s.timeSig !== libraryState.filterTime) return false;
        if (libraryState.filterKey !== "all" && s.keySig !== libraryState.filterKey) return false;
        if (libraryState.filterHands !== "all") {
            let hasTreble = s.measures.some(m => m.treble && m.treble.length > 0); let hasBass = s.measures.some(m => m.bass && m.bass.length > 0);
            if (libraryState.filterHands === "both" && (!hasTreble || !hasBass)) return false;
            if (libraryState.filterHands === "treble" && hasBass) return false;
            if (libraryState.filterHands === "bass" && hasTreble) return false;
        } return true;
    });
    scores.sort((a, b) => {
        if (libraryState.sortBy === "numAsc") return a.plate - b.plate; if (libraryState.sortBy === "numDesc") return b.plate - a.plate;
        if (libraryState.sortBy === "dateDesc") return b.updatedAt - a.updatedAt; if (libraryState.sortBy === "dateAsc") return a.updatedAt - b.updatedAt;
        if (libraryState.sortBy === "titleAsc") return (a.title || "").localeCompare(b.title || ""); if (libraryState.sortBy === "authorAsc") return (a.composer || "").localeCompare(b.composer || ""); return 0;
    });

    const grid = document.getElementById("libraryGrid"); grid.innerHTML = "";
    if (scores.length === 0) { document.getElementById("libraryEmpty").hidden = false; grid.hidden = true; } else {
        document.getElementById("libraryEmpty").hidden = true; grid.hidden = false;
        scores.forEach((score) => {
          const card = document.createElement("div"); card.className = "score-card";
          card.innerHTML = `<span class="card-eyebrow">${plateLabel(score.plate)} · ${score.timeSig}</span><h3>${escapeHtml(score.title || t('untitled'))}</h3><p class="composer">${escapeHtml(score.composer || t('unknownAuthor'))}</p><div class="meta"><span>${score.measures.length} ${t('measuresTxt')}</span><span>${formatDate(score.updatedAt)}</span></div>
            <div class="card-actions-row">
              <button class="btn-card" data-action="view">${t('viewBtn')}</button>
              <button class="btn-card" data-action="edit">${t('editBtn')}</button>
              <button class="btn-card" data-action="duplicate">${t('copyBtn')}</button>
              <button class="btn-card btn-danger-card" data-action="delete">${t('deleteBtn')}</button>
            </div>`;
          card.addEventListener("click", (e) => {
            const action = e.target.closest("[data-action]");
            if (action) {
              e.stopPropagation();
              if (action.dataset.action === "delete") { if (confirm(t('delConfirm'))) { deleteScoreById(score.id); renderLibrary(); } } 
              else if (action.dataset.action === "duplicate") { const copy = JSON.parse(JSON.stringify(score)); copy.id = uid(); copy.plate = nextPlateNumber(); copy.title = (score.title || t('untitled')) + " " + t('copySuffix'); copy.createdAt = copy.updatedAt = Date.now(); persistScore(copy); renderLibrary(); } 
              else if (action.dataset.action === "edit") { window.location.hash = "#editor/" + score.id; }
              else if (action.dataset.action === "view") { window.location.hash = "#viewer/" + score.id; }
            } else { window.location.hash = "#viewer/" + score.id; }
          }); grid.appendChild(card);
        });
    }
  }

  /* ----------------------------- Editor Logic ----------------------------- */
  if(document.getElementById("scoreTitle")) {
    document.getElementById("scoreTitle").addEventListener("input", (e) => { currentScore.title = e.target.value; renderScore(); });
    document.getElementById("scoreComposer").addEventListener("input", (e) => { currentScore.composer = e.target.value; renderScore(); });
    document.getElementById("timeSig").addEventListener("change", (e) => { currentScore.timeSig = e.target.value; renderScore(); });
    document.getElementById("scoreBpm").addEventListener("change", (e) => { currentScore.bpm = parseInt(e.target.value, 10) || 100; renderScore(); updateAudioBPM(); });
    
    document.getElementById("btnPrevMeasure").addEventListener("click", () => { editorState.activeMeasure--; syncMeasureControls(); renderScore(); });
    document.getElementById("btnNextMeasure").addEventListener("click", () => { editorState.activeMeasure++; syncMeasureControls(); renderScore(); });
    document.getElementById("btnAddMeasure").addEventListener("click", () => { currentScore.measures.push(newMeasure()); editorState.activeMeasure = currentScore.measures.length - 1; syncMeasureControls(); renderScore(); });
    document.getElementById("btnDeleteMeasure").addEventListener("click", () => {
      if (currentScore.measures.length <= 1) { alert(t('minMeasureAlert')); return; }
      if (!confirm(t('delMeasureConfirm'))) return;
      currentScore.measures.splice(editorState.activeMeasure, 1); syncMeasureControls(); renderScore();
    });

    document.getElementById("repeatStart").addEventListener("change", (e) => { currentScore.measures[editorState.activeMeasure].repeatStart = e.target.checked; renderScore(); });
    document.getElementById("repeatEnd").addEventListener("change", (e) => { currentScore.measures[editorState.activeMeasure].repeatEnd = e.target.checked; renderScore(); });
    document.getElementById("directiveSelect").addEventListener("change", (e) => { currentScore.measures[editorState.activeMeasure].directive = e.target.value; renderScore(); });

    ['Treble', 'Bass'].forEach(clef => {
      document.getElementById("btnStaff" + clef).addEventListener("click", (e) => { 
        editorState.activeStaff = clef.toLowerCase(); 
        document.getElementById("btnStaffTreble").classList.toggle("is-active", clef === 'Treble'); 
        document.getElementById("btnStaffBass").classList.toggle("is-active", clef === 'Bass'); 
      });
    });

    document.getElementById("isRest").addEventListener("change", (e) => { 
      document.getElementById("pitchFields").style.opacity = e.target.checked ? 0.4 : 1; 
      document.getElementById("pitchFields").querySelectorAll("select").forEach(s => s.disabled = e.target.checked); 
    });
    document.getElementById("durationGrid").addEventListener("click", (e) => { 
      const btn = e.target.closest(".dur-btn"); if (!btn) return; editorState.duration = btn.dataset.dur; 
      document.getElementById("durationGrid").querySelectorAll(".dur-btn").forEach(b => b.classList.toggle("is-active", b === btn)); 
    });

    document.getElementById("btnAddNote").addEventListener("click", () => {
      currentScore.measures[editorState.activeMeasure][editorState.activeStaff].push({
        rest: document.getElementById("isRest").checked, letter: document.getElementById("pitchLetter").value, accidental: document.getElementById("pitchAccidental").value, 
        octave: parseInt(document.getElementById("pitchOctave").value, 10), duration: editorState.duration, dotted: document.getElementById("isDotted").checked, dynamic: document.getElementById("dynamicSelect").value
      }); document.getElementById("dynamicSelect").value = ""; renderScore();
    });
    document.getElementById("btnUndoNote").addEventListener("click", () => {
      if (currentScore.measures[editorState.activeMeasure][editorState.activeStaff].length > 0) { currentScore.measures[editorState.activeMeasure][editorState.activeStaff].pop(); renderScore(); }
    });
  }

  function syncMeasureControls() {
    editorState.activeMeasure = Math.max(0, Math.min(editorState.activeMeasure, currentScore.measures.length - 1));
    const m = currentScore.measures[editorState.activeMeasure];
    document.getElementById("activeMeasureLabel").textContent = `${editorState.activeMeasure + 1} / ${currentScore.measures.length}`;
    document.getElementById("repeatStart").checked = !!m.repeatStart; document.getElementById("repeatEnd").checked = !!m.repeatEnd; 
    document.getElementById("directiveSelect").value = m.directive || "";
  }

  /* ----------------------------- VexFlow Renderer ----------------------------- */
  const MEASURES_PER_LINE = 4;
  const LINES_PER_PAGE = 5;
  const TOTAL_WIDTH = 1050; // Lienzo expandido para matemáticas perfectas
  const LEFT_MARGIN = 50; 
  const RIGHT_MARGIN = 50;
  const FIRST_OF_LINE_WIDTH = 250; 
  const REST_OF_LINE_WIDTH = (TOTAL_WIDTH - LEFT_MARGIN - RIGHT_MARGIN - FIRST_OF_LINE_WIDTH) / (MEASURES_PER_LINE - 1); 
  const STAVE_GAP = 92; const LINE_GAP = 180; const TOP_MARGIN = 20;

  function noteToVexKey(n) { return n.letter.toLowerCase() + (n.accidental === "#" || n.accidental === "b" ? n.accidental : "") + "/" + n.octave; }
  function measureNeededQuarters(timeSig) { const [num, den] = timeSig.split("/").map(Number); return num * (4 / den); }
  function quartersUsed(staffNotes) { return staffNotes.reduce((sum, n) => sum + (DURATION_QUARTERS[n.duration] || 0) * (n.dotted ? 1.5 : 1), 0); }

  function renderScore() {
    if (!currentScore) return; persistScore(currentScore); 
    const container = document.getElementById("vexPagesContainer"); container.innerHTML = "";

    if (typeof Vex === "undefined") { container.innerHTML = '<p style="padding:40px;color:#8C2F39;font-weight:bold;">No se ha podido cargar VexFlow.</p>'; return; }

    try {
      const VF = Vex.Flow; const measures = currentScore.measures; const [num, den] = currentScore.timeSig.split("/").map(Number);
      const totalLines = Math.ceil(measures.length / MEASURES_PER_LINE);
      const totalPages = Math.ceil(totalLines / LINES_PER_PAGE) || 1;
      
      for (let p = 0; p < totalPages; p++) {
          const pageDiv = document.createElement('div'); pageDiv.className = 'paper-page';
          
          const printHeader = document.createElement('div'); printHeader.className = 'print-header-content';
          printHeader.innerHTML = `<span>${escapeHtml(currentScore.title || t('untitled'))} — ${escapeHtml(currentScore.composer)}</span> <span>${plateLabel(currentScore.plate)}</span>`;
          pageDiv.appendChild(printHeader);

          let startY = TOP_MARGIN;
          if (p === 0) {
              const head = document.createElement("div"); head.className = "score-letterhead";
              head.innerHTML = `<h2>${escapeHtml(currentScore.title || t('untitled'))}</h2><p>${escapeHtml(currentScore.composer || "")}</p>`;
              pageDiv.appendChild(head); startY += 100;
          }

          const printFooter = document.createElement('div'); printFooter.className = 'print-footer-content';
          printFooter.innerHTML = `<span><img src="assets/isotipo.png" class="print-logo-isotipo"></span> <span>${p + 1} / ${totalPages}</span>`;
          pageDiv.appendChild(printFooter);

          const svgWrap = document.createElement('div'); pageDiv.appendChild(svgWrap); container.appendChild(pageDiv);

          const linesOnThisPage = Math.min(LINES_PER_PAGE, totalLines - (p * LINES_PER_PAGE));
          const pageHeight = startY + (linesOnThisPage * LINE_GAP) + 20;

          const renderer = new VF.Renderer(svgWrap, VF.Renderer.Backends.SVG); renderer.resize(TOTAL_WIDTH, pageHeight);
          const ctx = renderer.getContext(); const hitRects = [];

          for (let l = 0; l < linesOnThisPage; l++) {
              const globalLineIdx = (p * LINES_PER_PAGE) + l;
              for (let m = 0; m < MEASURES_PER_LINE; m++) {
                  const idx = (globalLineIdx * MEASURES_PER_LINE) + m; if (idx >= measures.length) break;
                  
                  const measure = measures[idx]; const isFirstOfLine = (m === 0);
                  const width = isFirstOfLine ? FIRST_OF_LINE_WIDTH : REST_OF_LINE_WIDTH;
                  const x = LEFT_MARGIN + (isFirstOfLine ? 0 : FIRST_OF_LINE_WIDTH + (REST_OF_LINE_WIDTH * (m - 1)));
                  const yTreble = startY + (l * LINE_GAP); const yBass = yTreble + STAVE_GAP;

                  const staveTreble = new VF.Stave(x, yTreble, width); const staveBass = new VF.Stave(x, yBass, width);

                  if (isFirstOfLine) {
                    staveTreble.addClef("treble"); staveBass.addClef("bass");
                    if (currentScore.keySig && currentScore.keySig !== "C") { staveTreble.addKeySignature(currentScore.keySig); staveBass.addKeySignature(currentScore.keySig); }
                  }
                  if (idx === 0) { 
                    staveTreble.addTimeSignature(currentScore.timeSig); staveBass.addTimeSignature(currentScore.timeSig); 
                    staveTreble.setTempo({ duration: 'q', dots: 0, bpm: currentScore.bpm || 100 }, 0); // Tempo nativo alineado a la izquierda
                  }

                  staveTreble.setBegBarType(measure.repeatStart ? VF.Barline.type.REPEAT_BEGIN : VF.Barline.type.SINGLE);
                  staveBass.setBegBarType(measure.repeatStart ? VF.Barline.type.REPEAT_BEGIN : VF.Barline.type.SINGLE);
                  let endType = VF.Barline.type.SINGLE;
                  if (measure.repeatEnd) endType = VF.Barline.type.REPEAT_END;
                  if (idx === measures.length - 1 && !measure.repeatEnd) endType = VF.Barline.type.END;
                  staveTreble.setEndBarType(endType); staveBass.setEndBarType(endType);

                  staveTreble.setContext(ctx).draw(); staveBass.setContext(ctx).draw();

                  if (isFirstOfLine) {
                    new VF.StaveConnector(staveTreble, staveBass).setType(VF.StaveConnector.type.BRACE).setContext(ctx).draw();
                    new VF.StaveConnector(staveTreble, staveBass).setType(VF.StaveConnector.type.SINGLE_LEFT).setContext(ctx).draw();
                  }
                  new VF.StaveConnector(staveTreble, staveBass).setType(VF.StaveConnector.type.SINGLE_RIGHT).setContext(ctx).draw();

                  const buildNotes = (staffNotes, clef) => {
                    const out = []; const restKey = clef === "bass" ? "d/3" : "b/4";
                    staffNotes.forEach((n) => {
                      const durStr = n.duration + (n.dotted ? "d" : "") + (n.rest ? "r" : "");
                      const keys = n.rest ? [restKey] : [noteToVexKey(n)];
                      const sn = new VF.StaveNote({ clef: clef, keys: keys, duration: durStr });
                      if (n.dotted) VF.Dot.buildAndAttach([sn], { all: true });
                      if (!n.rest && n.accidental) sn.addModifier(new VF.Accidental(n.accidental), 0);
                      if (n.dynamic) { sn.addModifier(new VF.Annotation(n.dynamic).setFont("Times", 12, "italic bold").setVerticalJustification( clef === "bass" ? VF.Annotation.VerticalJustify.TOP : VF.Annotation.VerticalJustify.BOTTOM ), 0); }
                      out.push(sn);
                    }); return out;
                  };

                  const trebleNotes = buildNotes(measure.treble, "treble"); const bassNotes = buildNotes(measure.bass, "bass");

                  if (trebleNotes.length > 0) {
                    const vTreble = new VF.Voice({ num_beats: num, beat_value: den }).setMode(VF.Voice.Mode.SOFT); vTreble.addTickables(trebleNotes);
                    try { VF.Beam.generateBeams(trebleNotes, { beam_rests: false }).forEach(b => b.setContext(ctx).draw()); } catch(e) {}
                    new VF.Formatter().joinVoices([vTreble]).format([vTreble], width - 30); vTreble.draw(ctx, staveTreble);
                  }
                  if (bassNotes.length > 0) {
                    const vBass = new VF.Voice({ num_beats: num, beat_value: den }).setMode(VF.Voice.Mode.SOFT); vBass.addTickables(bassNotes);
                    try { VF.Beam.generateBeams(bassNotes, { beam_rests: false }).forEach(b => b.setContext(ctx).draw()); } catch(e) {}
                    new VF.Formatter().joinVoices([vBass]).format([vBass], width - 30); vBass.draw(ctx, staveBass);
                  }

                  if (measure.directive) {
                    const targetArr = trebleNotes.length ? trebleNotes : bassNotes;
                    if (targetArr.length) targetArr[targetArr.length - 1].addModifier(new VF.Annotation(measure.directive).setFont("Cormorant Garamond", 15, "italic").setVerticalJustification(VF.Annotation.VerticalJustify.TOP), 0);
                  }
                  
                  // Caja de selección encajada matemáticamente con las líneas del pentagrama
                  hitRects.push({ 
                    x: staveTreble.getX(), y: staveTreble.getYForLine(0) - 25, 
                    width: staveTreble.getWidth(), height: staveBass.getYForLine(4) - staveTreble.getYForLine(0) + 50, idx 
                  });
              }
          }

          const svg = svgWrap.querySelector("svg");
          if (svg) {
            svg.setAttribute("viewBox", `0 0 ${TOTAL_WIDTH} ${pageHeight}`); svg.removeAttribute("width"); svg.removeAttribute("height");
            const ns = "http://www.w3.org/2000/svg";
            hitRects.forEach((hr) => {
              const g = document.createElementNS(ns, "g"); g.setAttribute("class", "measure-hit" + (hr.idx === editorState.activeMeasure ? " active" : "")); g.setAttribute("data-measure-idx", hr.idx);
              const rect = document.createElementNS(ns, "rect");
              rect.setAttribute("x", hr.x); rect.setAttribute("y", hr.y); rect.setAttribute("width", hr.width); rect.setAttribute("height", hr.height);
              rect.setAttribute("fill", hr.idx === editorState.activeMeasure ? "rgba(179, 142, 80, 0.15)" : "transparent"); rect.setAttribute("rx", "4");
              g.appendChild(rect); g.addEventListener("click", () => { editorState.activeMeasure = hr.idx; syncMeasureControls(); renderScore(); });
              svg.insertBefore(g, svg.firstChild);
            });
          }
      }
      const needed = measureNeededQuarters(currentScore.timeSig); const m = currentScore.measures[editorState.activeMeasure];
      document.getElementById("activeMeasureLabel").textContent = `${editorState.activeMeasure + 1}/${currentScore.measures.length} · ♩ Sol ${trim(quartersUsed(m.treble))}/${trim(needed)} · Fa ${trim(quartersUsed(m.bass))}/${trim(needed)}`;
    } catch (err) { console.error(err); container.innerHTML = `<p style="padding:40px;color:#8C2F39;font-weight:bold;">Error matemático crítico al renderizar.</p>`; }
  }

  function trim(n) { return Number.isInteger(n) ? n : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, ""); }

  /* ----------------------------- Audio Player (Tone.js Acoustic Piano) ----------------------------- */
  let acousticPiano = null;
  let isPlaying = false, rafId = null, part = null, measurePart = null, builtForScoreKey = null, totalQuarters = 0, speedFactor = 1;

  function ensureAcousticPiano() {
    if (acousticPiano) return;
    acousticPiano = new Tone.Sampler({
        urls: { A0: "A0.mp3", C2: "C2.mp3", C4: "C4.mp3", C6: "C6.mp3" },
        release: 1.2,
        baseUrl: "https://tonejs.github.io/audio/salamander/"
    }).toDestination();
    acousticPiano.volume.value = -2;
  }

  function quarterToBBS(q) { const bars = Math.floor(q / 4); const beatsFloat = q - bars * 4; const beat = Math.floor(beatsFloat); return bars + ':' + beat + ':' + ((beatsFloat - beat) * 4).toFixed(3); }
  function updateAudioBPM() { Tone.Transport.bpm.value = (currentScore.bpm || 100) * speedFactor; }

  function buildTimeline() {
    if (!currentScore) return false; ensureAcousticPiano(); teardownAudio();
    const events = [], measureEvents = []; let pos = 0;
    currentScore.measures.forEach((measure, idx) => {
      measureEvents.push({ time: quarterToBBS(pos), idx });
      ['treble', 'bass'].forEach((staffName) => {
        let cursor = pos;
        (measure[staffName] || []).forEach((n) => {
          const durQ = (DURATION_QUARTERS[n.duration] || 0) * (n.dotted ? 1.5 : 1);
          if (!n.rest && durQ > 0) events.push({ time: quarterToBBS(cursor), note: n.letter.toUpperCase() + (n.accidental.replace('b', 'b') || "") + n.octave, durQ: durQ });
          cursor += durQ;
        });
      });
      pos += measureNeededQuarters(currentScore.timeSig);
    });

    totalQuarters = pos; updateAudioBPM();
    part = new Tone.Part((time, ev) => { acousticPiano.triggerAttackRelease(ev.note, Math.max(0.05, ev.durQ * (60 / Tone.Transport.bpm.value) * 0.92), time); }, events).start(0);
    measurePart = new Tone.Part((time, ev) => { Tone.Draw.schedule(() => highlightMeasure(ev.idx), time); }, measureEvents).start(0);
    Tone.Transport.scheduleOnce(() => { Tone.Draw.schedule(() => stopAudio(true), Tone.now()); }, quarterToBBS(totalQuarters));
    builtForScoreKey = currentScore.id + ':' + currentScore.measures.length + ':' + currentScore.timeSig; return true;
  }

  function teardownAudio() { if (part) { part.dispose(); part = null; } if (measurePart) { measurePart.dispose(); measurePart = null; } }
  
  let lastHighlighted = null;
  function highlightMeasure(idx) {
    if (lastHighlighted !== null) document.querySelectorAll('[data-measure-idx="' + lastHighlighted + '"]').forEach((el) => el.classList.remove('playing'));
    document.querySelectorAll('[data-measure-idx="' + idx + '"]').forEach((el) => el.classList.add('playing')); lastHighlighted = idx;
  }
  function clearHighlight() { if (lastHighlighted !== null) document.querySelectorAll('[data-measure-idx="' + lastHighlighted + '"]').forEach((el) => el.classList.remove('playing')); lastHighlighted = null; }

  function playAudio() {
    if (!currentScore) return;
    Tone.start().then(() => {
      if ((currentScore.id + ':' + currentScore.measures.length + ':' + currentScore.timeSig) !== builtForScoreKey) { if (!buildTimeline()) return; }
      Tone.Transport.start(); isPlaying = true; updatePlayerUI(); tickProgress();
    });
  }
  function pauseAudio() { Tone.Transport.pause(); isPlaying = false; updatePlayerUI(); cancelAnimationFrame(rafId); }
  function stopAudio(reachedEnd) { Tone.Transport.stop(); isPlaying = false; updatePlayerUI(); cancelAnimationFrame(rafId); clearHighlight(); if(document.getElementById('plProgressFill')) document.getElementById('plProgressFill').style.width = '0%'; }

  function updatePlayerUI() {
    const btn = document.getElementById('plBtnPlay'); if(!btn) return;
    btn.textContent = isPlaying ? '⏸' : '▶'; document.getElementById('playerBar').classList.toggle('is-playing', isPlaying);
  }

  function tickProgress() {
    if (!isPlaying) return;
    const elapsedQ = Tone.Transport.seconds * (Tone.Transport.bpm.value / 60); const frac = totalQuarters > 0 ? Math.min(1, elapsedQ / totalQuarters) : 0;
    document.getElementById('plProgressFill').style.width = (frac * 100).toFixed(2) + '%';
    const secPerQ = 60 / Tone.Transport.bpm.value;
    document.getElementById('plTimeLabel').textContent = formatTime(frac * totalQuarters * secPerQ) + ' / ' + formatTime(totalQuarters * secPerQ);
    rafId = requestAnimationFrame(tickProgress);
  }
  function formatTime(sec) { if (!isFinite(sec) || sec < 0) sec = 0; return Math.floor(sec / 60) + ':' + String(Math.floor(sec % 60)).padStart(2, '0'); }

  if(document.getElementById('plBtnPlay')) {
    document.getElementById('plBtnPlay').addEventListener('click', () => isPlaying ? pauseAudio() : playAudio());
    document.getElementById('plBtnRewind').addEventListener('click', () => stopAudio(false));
    document.querySelectorAll('.pl-speed-btn').forEach((b) => b.addEventListener('click', () => { 
      speedFactor = parseFloat(b.dataset.speed); updateAudioBPM(); 
      document.querySelectorAll('.pl-speed-btn').forEach(btn => btn.classList.toggle('is-active', parseFloat(btn.dataset.speed) === speedFactor));
    }));
    document.addEventListener('click', (e) => { if (isPlaying && (e.target.closest('#engraveDesk') || e.target.closest('.measure-hit'))) pauseAudio(); });
  }

  /* ----------------------------- Export & Init ----------------------------- */
  document.getElementById("btnExportJson").addEventListener("click", () => { downloadBlob(slugify(currentScore.title) + ".json", JSON.stringify(currentScore, null, 2)); });
  document.getElementById("btnExportPdf").addEventListener("click", () => { 
      const oTitle = document.title; document.title = `${(currentScore.title || t('untitled')).trim()} — ${(currentScore.composer || t('unknownAuthor')).trim()}`;
      window.print(); setTimeout(() => { document.title = oTitle; }, 500);
  });
  document.getElementById("btnImport").addEventListener("click", () => document.getElementById("fileImport").click());
  document.getElementById("fileImport").addEventListener("change", (e) => {
    const file = e.target.files[0]; if (!file) return; const reader = new FileReader();
    reader.onload = () => {
      try { const data = JSON.parse(reader.result); if (!data.measures) throw new Error("Format error");
        data.id = uid(); data.plate = nextPlateNumber(); data.updatedAt = Date.now(); persistScore(data); 
        if (window.location.hash === "#catalogo") { renderLibrary(); } else { window.location.hash = "#catalogo"; }
      } catch (err) { alert("Error: " + err.message); } e.target.value = ""; 
    }; reader.readAsText(file);
  });

  document.getElementById("btnNewScore").addEventListener("click", () => { const score = newScore(); persistScore(score); window.location.hash = "#editor/" + score.id; });
  document.getElementById("btnBackLibrary").addEventListener("click", () => { window.location.hash = "#catalogo"; });
  document.getElementById("brandHome").addEventListener("click", () => { window.location.hash = "#inicio"; });
  document.getElementById("btnToggleViewer").addEventListener("click", () => { window.location.hash = (document.body.classList.contains('is-viewer') ? "#editor/" : "#viewer/") + currentScore.id; });

  const userLang = navigator.language || navigator.userLanguage;
  EI.setLang((userLang && userLang.toLowerCase().startsWith('es')) ? 'es' : 'en');
  initFirebase();
  if(!window.location.hash || window.location.hash === "#" || window.location.hash === "") { window.location.hash = "#inicio"; } else { handleNavigation(); }

})();