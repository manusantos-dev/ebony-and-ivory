/* =========================================================
   EBONY & IVORY — components.css
   Componentes reutilizables: topbar, botones, inputs, selects,
   home, catálogo, footer y modales de cuenta.
   ========================================================= */

/* --- TOPBAR --- */
.topbar{ display:flex; align-items:center; justify-content:space-between; padding: 14px 28px; background: var(--paper); border-bottom: 1px solid var(--line); position: sticky; top:0; z-index: 50; box-shadow: 0 1px 4px rgba(0,0,0,0.03); transition: transform 0.3s ease; }
.brand{ display:flex; align-items:center; gap:10px; cursor:pointer; user-select:none; transition: opacity 0.2s; }
.brand:hover { opacity: 0.7; }
.brand-img { height: 32px; width: auto; object-fit: contain; }
body.is-home .topbar { background: transparent; border: none; box-shadow: none; position: absolute; width: 100%; }
body.is-home .brand { opacity: 0; pointer-events: none; visibility: hidden; }

/* ESPACIADO DE LOS BOTONES SUPERIORES */
.topbar-right { display:flex; align-items:center; gap: 14px; margin-left: auto; justify-content: flex-end; }
.topbar-actions { display:flex; gap: 10px; align-items:center; }
.lang-switch { display: flex; gap: 4px; border: 1px solid var(--line-strong); border-radius: var(--radius); padding: 2px; background: var(--paper);}
.lang-btn { background: transparent; border: none; font-size: 11px; font-weight: 600; cursor: pointer; padding: 4px 8px; border-radius: 4px; color: var(--ink-soft); }
.lang-btn.active { background: var(--gold-wash); color: var(--ink); }
.save-indicator { font-size: 12px; font-weight: 600; color: #2D5A38; font-family: var(--font-mono); opacity: 0; transition: opacity 0.3s; pointer-events: none; margin-right: 4px; }
.save-indicator.show { opacity: 1; }

/* --- BUTTONS & INPUTS --- */
.btn{ font-family: var(--font-body); font-size: 13px; font-weight: 600; padding: 9px 16px; border-radius: var(--radius); border: 1px solid var(--line-strong); background: var(--paper); color: var(--ink); cursor: pointer; transition: all .15s ease; white-space: nowrap; }
.btn:hover{ border-color: var(--brass); background: #fff; }
.btn-primary{ background: var(--accent); border-color: var(--accent); color: #fff; }
.btn-primary:hover{ background: #333; border-color:#333; }
.btn-ghost{ background: transparent; border-color: transparent; }
.btn-ghost:hover{ background: var(--gold-wash); border-color: transparent; }
.btn-ghost-small{ background: transparent; border: none; font-weight: 600; cursor: pointer; padding: 8px 12px; border-radius: var(--radius); color: var(--ink-soft); transition: background 0.15s; }
.btn-ghost-small:hover { background: var(--line); color: var(--ink); }
.btn-huge { font-size: 16px; padding: 16px 40px; border-radius: 8px; margin-top: 24px; border: none; }
.btn-small{ font-size: 12px; padding: 7px 10px; flex:1; }
.btn-block{ width:100%; margin-top:8px; }
.btn-add{ color:#2D5A38; border-color:#2D5A3833; }
.btn-danger{ color: var(--danger); }

.field-label{ display:block; font-family: var(--font-mono); font-size: 10.5px; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-soft); margin: 12px 0 4px; }
.field-input{ width:100%; font-family: var(--font-body); font-size: 14px; padding: 8px 10px; border: 1px solid var(--line-strong); border-radius: var(--radius); background: #fff; color: var(--ink); }
.field-input[type="file"] { padding: 5px; font-size: 12px; }
.field-input:focus { border-color: var(--brass); outline: none; box-shadow: 0 0 0 2px var(--gold-wash); }
.field-input--title{ font-family: var(--font-display); font-size: 20px; font-weight:600; }
.field-row{ display:flex; gap:10px; }
.field-row > div{ flex:1; }
.check-inline{ display:flex; align-items:center; gap:7px; font-size:13px; margin: 10px 0 0; color: var(--ink-soft); }

.custom-select { position: relative; width: 100%; user-select: none; font-family: var(--font-body); font-size: 14px; }
.select-selected { background: #fff; border: 1px solid var(--line-strong); border-radius: var(--radius); padding: 8px 10px; cursor: pointer; display: flex; justify-content: space-between; color: var(--ink); }
.select-selected:focus { border-color: var(--brass); outline: none; box-shadow: 0 0 0 2px var(--gold-wash); }
.select-items { position: absolute; background: #fff; top: 100%; left: 0; right: 0; z-index: 99; border: 1px solid var(--line-strong); border-radius: var(--radius); box-shadow: var(--shadow-card); margin-top: 4px; display: none; max-height: 200px; overflow-y: auto; }
.custom-select.active .select-items { display: block; }
.select-items div { padding: 8px 10px; cursor: pointer; display: flex; justify-content: space-between; border-bottom: 1px solid var(--paper-edge); }
.select-items div:hover { background-color: var(--gold-wash); }
.translucent { opacity: 0.4; font-size: 12px; font-family: var(--font-mono); }

/* --- HOME --- */
.view{ flex: 1; max-width: 1180px; margin: 0 auto; width: 100%; padding: 40px 28px 64px; }

.home-hero { text-align: center; max-width: 800px; padding: 60px 40px; background: rgba(250, 248, 245, 0.95); border-radius: 16px; box-shadow: var(--shadow-paper); border: 1px solid var(--line); position: relative; z-index: 2; backdrop-filter: blur(4px); }
.hero-logo-img { height: 260px; max-width: 100%; width: auto; object-fit: contain; margin-bottom: 10px; }
.home-hero h1 { font-family: var(--font-display); font-size: 32px; font-weight: 600; font-style: italic; margin: 0 0 20px; color: var(--brass); }
.home-hero .hero-sub { font-size: 18px; color: var(--ink-soft); margin: 0 auto 32px; line-height: 1.6; max-width: 600px; }
.hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
.floating-notes { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; pointer-events: none; overflow: hidden; }
.note-anim { position: absolute; font-size: 40px; color: var(--brass); opacity: 0.12; animation: floatUp linear infinite; }
@keyframes floatUp { 0% { transform: translateY(100vh) rotate(0deg); } 100% { transform: translateY(-100px) rotate(360deg); } }
body.is-home .view {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 0; 
  padding-bottom: 0;
}

/* --- CATALOGO --- */
.catalog-header { display: flex; flex-direction: column; gap: 20px; margin-bottom: 32px; }
.catalog-header h2 { font-family: var(--font-display); font-size: 40px; margin: 0; color: var(--ink); font-weight: 700; }
.catalog-toolbar { display: flex; gap: 16px; align-items: center; background: var(--paper); padding: 16px 24px; border-radius: 8px; border: 1px solid var(--line); box-shadow: var(--shadow-card); flex-wrap: wrap; }
.search-input { flex: 3; font-size: 15px; padding: 10px 16px; min-width: 250px; }
.sort-select { flex: 1.5; font-size: 14px; padding: 10px 12px; cursor: pointer; min-width: 200px; }
.catalog-filters { background: var(--gold-wash); padding: 20px 24px; border-radius: 8px; border: 1px solid var(--line-strong); display: flex; gap: 24px; flex-wrap: wrap; margin-top: -10px; }
.filter-group { flex: 1; min-width: 200px; }
.filter-group .field-label { color: var(--ink); font-weight: 600; }

.library-grid{ display:grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 24px; }
.library-empty{ background: var(--paper); color: var(--ink-soft); padding: 80px 20px; text-align:center; border: 2px dashed var(--line-strong); border-radius: 12px; margin-top: 20px; }
.library-empty h3 { font-family: var(--font-display); font-size: 28px; color: var(--ink); margin-top: 0; margin-bottom: 8px; }

.score-card{ background: var(--paper); border:1px solid var(--line); border-radius: 8px; padding: 24px; box-shadow: var(--shadow-card); display:flex; flex-direction:column; min-height: 200px; transition: transform .15s ease, box-shadow .15s ease; }
.score-card:hover{ transform: translateY(-4px); box-shadow: 0 20px 40px -16px rgba(18,18,18,.25); border-color: var(--brass); }
.score-card .card-eyebrow{ font-family: var(--font-mono); font-size:11px; color:var(--brass); letter-spacing:.08em; text-transform:uppercase; font-weight: 600; }
.score-card h3{ font-family: var(--font-display); font-size:26px; font-weight:700; margin: 8px 0 4px; line-height: 1.2; }
.score-card .composer{ color: var(--ink-soft); font-size: 15px; font-style: italic; }
.score-card .meta{ padding-top:16px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color: var(--ink-soft); }
.card-actions-row { display: flex; gap: 8px; margin-top: auto; padding-top: 16px; border-top: 1px dashed var(--line); }
.btn-card { background: var(--paper-edge); border: 1px solid transparent; padding: 8px 12px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--ink-soft); flex: 1; transition: all 0.15s; }
.btn-card:hover { background: #fff; border-color: var(--brass); color: var(--ink); }
.btn-danger-card { flex: 0.5; background: transparent; border-color: var(--line); }
.btn-danger-card:hover { background: #ffebee; border-color: var(--danger); color: var(--danger); }

.sitefooter{ max-width: 1180px; margin: 0 auto; padding: 24px 28px 40px; color: var(--ink-soft); font-size: 12px; border-top: 1px solid var(--line); text-align: center; margin-top: auto;}

/* =========================================================
   MODAL DE AUTENTICACIÓN & PERFIL
   ========================================================= */
.account-logged { display: flex; align-items: center; gap: 8px; background: var(--paper); border: 1px solid var(--line-strong); border-radius: 999px; padding: 4px; cursor: pointer; transition: background 0.15s; }
.account-logged:hover { background: var(--gold-wash); border-color: var(--brass); }
.account-avatar { width: 24px; height: 24px; border-radius: 50%; background: var(--brass); color: #fff; font-family: var(--font-mono); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; flex-shrink: 0; }
.account-email { font-size: 12px; font-weight: 600; color: var(--ink); max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-right: 6px;}

.modal-overlay { position: fixed; inset: 0; background: rgba(18,18,18,.45); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 20px; }
.modal-card { position: relative; background: var(--paper); border: 1px solid var(--line); border-radius: 12px; box-shadow: var(--shadow-paper); width: 100%; max-width: 380px; padding: 32px 28px 28px; }
.modal-close { position: absolute; top: 14px; right: 14px; background: transparent; border: none; font-size: 20px; line-height: 1; cursor: pointer; color: var(--ink-soft); padding: 4px 8px; border-radius: 4px; }
.modal-close:hover { background: var(--gold-wash); color: var(--ink); }

.auth-tabs { display: flex; border-bottom: 1px solid var(--line); margin-bottom: 14px; }
.auth-tab { flex: 1; background: transparent; border: none; padding: 10px 4px; font-family: var(--font-body); font-size: 14px; font-weight: 600; color: var(--ink-soft); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -1px; }
.auth-tab.is-active { color: var(--ink); border-bottom-color: var(--brass); }
.auth-subtitle { font-size: 13px; color: var(--ink-soft); margin: 0 0 18px; line-height: 1.5; }
.auth-error { font-size: 12.5px; color: var(--danger); background: #fdecec; border: 1px solid #f3c9c9; border-radius: var(--radius); padding: 8px 10px; margin: 10px 0 0; }
.auth-divider { display: flex; align-items: center; text-align: center; color: var(--ink-soft); font-size: 11px; text-transform: uppercase; letter-spacing: .06em; margin: 18px 0; }
.auth-divider::before, .auth-divider::after { content: ""; flex: 1; border-bottom: 1px solid var(--line); }
.auth-divider span { padding: 0 10px; }
.auth-google-btn { display: flex; align-items: center; justify-content: center; gap: 10px; }

/* Perfil Modal */
.profile-header { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
.profile-avatar-large { width: 56px; height: 56px; border-radius: 50%; background: var(--brass); color: #fff; font-size: 24px; font-weight: 700; display: flex; align-items: center; justify-content: center; background-size: cover; background-position: center; border: 2px solid var(--line-strong); }
.profile-info h3 { margin: 0; font-family: var(--font-display); font-size: 22px; color: var(--ink); }
.profile-info p { margin: 0; font-size: 13px; color: var(--ink-soft); font-family: var(--font-mono); }
.profile-danger-zone { margin-top: 24px; padding-top: 12px; border-top: 1px dashed var(--danger); }

@media (max-width: 720px) {
  .topbar { padding: 12px 14px; flex-wrap: wrap; gap: 10px; }
  .topbar-right { gap: 12px; flex-wrap: wrap; }
}
