/**
 * Page-scoped CSS tokens and component classes that mirror
 * `html_files/wallet (1).html` verbatim. All rules are scoped under
 * `.wallet-root` so they cannot leak into the rest of the app.
 *
 * UI-only — no business logic.
 */
export function WalletThemeStyles() {
  return (
    <style>{`
/* Hide MainLayout chrome while wallet is mounted */
body.wallet-active .fixed.top-0.left-0.right-0.z-20,
body.wallet-active .fixed.top-\\[60px\\].left-0.bottom-0 { display: none !important; }
body.wallet-active .flex.flex-1.pt-\\[90px\\] { padding-top: 0 !important; }
body.wallet-active .flex-1.md\\:ml-\\[80px\\] { margin-left: 0 !important; }

.wallet-root {
  --accent:#3DDBA9; --accent-light:#6EECC4; --accent-dark:#1A9E78;
  --accent-glass:rgba(61,219,169,0.08);
  --accent-glass-border:rgba(61,219,169,0.18);
  --accent-glass-glow:rgba(61,219,169,0.12);
  --bg:#07080c; --bg2:#0a0d15;
  --t1:#eef2f7; --t2:#a3adbf; --t3:#6b7a90; --t4:#4d5b6e;
  --glass-bg:rgba(255,255,255,0.035);
  --glass-border:rgba(255,255,255,0.07);
  --glass-highlight:rgba(255,255,255,0.09);
  --bonus-accent:#c8e64e;
  --green:#34C77B; --green-dim:rgba(52,199,123,.08); --green-b:rgba(52,199,123,.2);
  --red:#E85D5D; --orange:#E8A94D; --orange-dim:rgba(232,169,77,.07);
  --blue:#5B8DEF; --blue-dim:rgba(91,141,239,.08);
  --sans:'Inter',-apple-system,sans-serif;
  --heading:'Outfit',sans-serif;
  --mono:'JetBrains Mono',monospace;
  --radius:8px; --radius-lg:12px; --radius-xl:16px;
  color: var(--t1);
  font-family: var(--sans);
}

/* MAIN */
.wallet-root .wmain { padding:20px 24px; }
@media (max-width:768px) { .wallet-root .wmain { padding:14px 12px; } }

/* PAGE HEAD */
.wallet-root .pg-head { margin-bottom:16px; }
.wallet-root .pg-head h1 { font-size:1.2rem; font-weight:800; letter-spacing:-.03em; margin-bottom:2px; display:flex; align-items:center; gap:8px; }
.wallet-root .pg-head p  { font-size:.78rem; color:var(--t3); }

/* MODE SWITCH */
.wallet-root .mode-switch {
  display:inline-flex;
  background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 10px;
  padding: 3px;
  gap: 0;
  margin-bottom: 16px;
  backdrop-filter: blur(40px);
}
.wallet-root .ms-btn {
  display:inline-flex; align-items:center; gap:5px;
  padding:7px 16px;
  border:none; border-radius:7px;
  font-size:.75rem; font-weight:700;
  cursor:pointer; font-family:var(--sans);
  transition: all .2s;
  background:transparent; color:var(--t3);
  position:relative;
}
.wallet-root .ms-btn:hover { color: var(--t1); }
.wallet-root .ms-btn.on {
  background: linear-gradient(145deg, var(--accent-light), var(--accent), var(--accent-dark));
  color:#07080c; font-weight:800;
  box-shadow: 0 2px 10px rgba(61,219,169,0.2), inset 0 1px 2px rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.15);
}
.wallet-root .ms-tag {
  font-size:.62rem; padding:2px 7px;
  background: rgba(61,219,169,0.1);
  border:1px solid rgba(61,219,169,0.3);
  border-radius:20px;
  color: var(--accent);
  margin-left:4px;
}
.wallet-root .ms-btn.on .ms-tag { background: rgba(0,0,0,0.18); color:#07080c; border-color:rgba(0,0,0,0.18); }

/* BALANCE CARDS */
.wallet-root .bal-row { display:grid; grid-template-columns: repeat(4,1fr); gap:10px; margin-bottom:16px; }
@media(max-width:1100px) { .wallet-root .bal-row { grid-template-columns: 1fr 1fr; } }
@media(max-width:500px)  { .wallet-root .bal-row { grid-template-columns: 1fr; } }
.wallet-root .bal-card {
  background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015), rgba(61,219,169,0.01));
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  padding: 14px 16px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
}
.wallet-root .bal-card::before {
  content:''; position:absolute; top:0; left:0; right:0; height:50%;
  background: linear-gradient(175deg, rgba(255,255,255,0.04), transparent);
  border-radius:12px; pointer-events:none;
}
.wallet-root .bal-card::after {
  content:''; position:absolute; top:0; left:0; right:0; height:2px;
  border-radius:12px 12px 0 0;
  background: linear-gradient(90deg, var(--accent), var(--accent-light));
}
.wallet-root .bal-card .bci {
  position:absolute; top:12px; right:12px;
  width:28px; height:28px; border-radius:8px;
  display:flex; align-items:center; justify-content:center;
  font-size:.72rem;
  background: rgba(61,219,169,0.1); color: var(--accent);
}
.wallet-root .bal-card .bc-lbl { font-size:.62rem; font-weight:700; color:var(--t4); text-transform:uppercase; letter-spacing:.08em; margin-bottom:5px; position:relative; }
.wallet-root .bal-card .bc-num { font-family:var(--mono); font-size:1.1rem; font-weight:700; line-height:1; margin-bottom:2px; position:relative; }
.wallet-root .bal-card .bc-sub { font-size:.65rem; color:var(--t3); position:relative; }

/* SECTION CARD */
.wallet-root .scard {
  background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015), rgba(61,219,169,0.008));
  backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
  border:1px solid rgba(255,255,255,0.06);
  border-radius:12px;
  padding:16px 18px;
  margin-bottom:14px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
  position:relative; overflow:hidden;
}
.wallet-root .scard::before {
  content:''; position:absolute; top:0; left:0; right:0; height:50%;
  background: linear-gradient(175deg, rgba(255,255,255,0.04), transparent);
  pointer-events:none; border-radius:12px;
}
.wallet-root .scard-title {
  font-size:.82rem; font-weight:800;
  display:flex; align-items:center; gap:7px;
  margin-bottom:12px; padding-bottom:10px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  position:relative;
}
.wallet-root .scard-step {
  width:24px; height:24px; border-radius:50%;
  background:rgba(61,219,169,.1); border:1.5px solid rgba(61,219,169,.25);
  color:var(--accent);
  display:flex; align-items:center; justify-content:center;
  font-size:.72rem; font-weight:800;
  flex-shrink:0;
}

/* FIELD */
.wallet-root .field { margin-bottom:16px; position:relative; }
.wallet-root .flabel {
  font-size:.72rem; font-weight:700; color:var(--t3);
  text-transform:uppercase; letter-spacing:.07em;
  margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;
}
.wallet-root .flabel small { font-size:.7rem; color:var(--t4); text-transform:none; letter-spacing:0; font-weight:400; }
.wallet-root .finput { position:relative; }
.wallet-root .finput input,
.wallet-root .finput select,
.wallet-root .finput textarea {
  width:100%;
  padding:9px 36px 9px 12px;
  background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
  border:1px solid rgba(255,255,255,0.08);
  border-radius:8px;
  color:var(--t1);
  font-size:.82rem;
  font-family:var(--sans);
  outline:none;
  transition: all .2s;
  -webkit-appearance:none;
}
.wallet-root .finput input::placeholder,
.wallet-root .finput textarea::placeholder { color: var(--t4); }
.wallet-root .finput input:focus,
.wallet-root .finput select:focus,
.wallet-root .finput textarea:focus {
  border-color: rgba(61,219,169,0.5);
  box-shadow: 0 0 0 3px rgba(61,219,169,0.1), inset 0 1px 3px rgba(0,0,0,0.3);
}
.wallet-root .fi-i { position:absolute; right:13px; top:50%; transform:translateY(-50%); color:var(--t4); font-size:.83rem; pointer-events:none; }
.wallet-root .input-max {
  position:absolute; right:10px; top:50%; transform:translateY(-50%);
  font-size:.7rem; font-weight:800; color:var(--accent);
  cursor:pointer; padding:3px 9px;
  background:rgba(61,219,169,0.1);
  border-radius:6px; border:1px solid rgba(61,219,169,.2);
  transition: all .15s;
}
.wallet-root .input-max:hover { background: var(--accent); color:#fff; }

/* NETWORK TABS */
.wallet-root .net-tabs { display:flex; gap:8px; flex-wrap:wrap; }
.wallet-root .ntab {
  padding:7px 14px;
  background: var(--bg2);
  border:1.5px solid rgba(255,255,255,0.08);
  border-radius:8px;
  font-size:.75rem; font-weight:700;
  color:var(--t3); cursor:pointer;
  transition: all .18s;
  font-family:var(--mono);
}
.wallet-root .ntab:hover { border-color: rgba(255,255,255,0.1); color: var(--t2); }
.wallet-root .ntab.on { border-color: var(--accent); color: var(--accent); background: rgba(61,219,169,0.08); }

/* AMOUNT PRESETS */
.wallet-root .presets { display:flex; gap:7px; margin-top:7px; flex-wrap:wrap; }
.wallet-root .preset {
  padding:5px 13px;
  background: var(--bg2);
  border:1px solid rgba(255,255,255,0.08);
  border-radius:7px;
  font-size:.75rem; font-weight:700; color:var(--t3);
  cursor:pointer; font-family:var(--mono);
  transition: all .15s;
}
.wallet-root .preset:hover { border-color: rgba(255,255,255,0.1); color: var(--t2); }
.wallet-root .preset.on { border-color: var(--accent); color: var(--accent); background: rgba(61,219,169,0.1); }

/* FEE BOX */
.wallet-root .fee-box {
  background: var(--bg2);
  border:1px solid rgba(255,255,255,0.05);
  border-radius:8px;
  padding:10px 12px;
  margin-bottom:12px;
}
.wallet-root .fb-row { display:flex; justify-content:space-between; align-items:center; font-size:.82rem; padding:4px 0; }
.wallet-root .fb-row:not(:last-child) { border-bottom:1px solid rgba(255,255,255,0.06); margin-bottom:4px; }
.wallet-root .fb-k { color:var(--t3); }
.wallet-root .fb-val { font-family:var(--mono); font-weight:600; }

/* INFO SIDEBAR CARD (right column) */
.wallet-root .icard {
  background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
  border:1px solid rgba(255,255,255,0.06);
  border-radius:10px;
  padding:14px 16px;
  margin-bottom:12px;
}
.wallet-root .icard-title {
  font-size:.78rem; font-weight:800;
  display:flex; align-items:center; gap:7px;
  margin-bottom:10px; padding-bottom:8px;
  border-bottom:1px solid rgba(255,255,255,0.05);
}
.wallet-root .ic-row {
  display:flex; justify-content:space-between; align-items:center;
  padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.06);
  font-size:.82rem;
}
.wallet-root .ic-row:last-child { border-bottom:none; }
.wallet-root .ic-k { color:var(--t3); }
.wallet-root .ic-v { font-family:var(--mono); font-weight:600; }

/* LIMIT BAR */
.wallet-root .lbar-wrap { margin-top:12px; }
.wallet-root .lb-head { display:flex; justify-content:space-between; font-size:.73rem; margin-bottom:5px; }
.wallet-root .lb-lbl { color:var(--t4); }
.wallet-root .lb-val { font-family:var(--mono); color:var(--t2); font-weight:600; }
.wallet-root .lb-track { height:6px; background:rgba(255,255,255,0.06); border-radius:3px; overflow:hidden; }
.wallet-root .lb-fill { height:100%; border-radius:3px; background:linear-gradient(90deg,var(--accent),var(--accent-dark)); }

/* SUBMIT BTN */
.wallet-root .btn-sub {
  width:100%; padding:10px;
  border:none; border-radius:8px;
  font-size:.82rem; font-weight:800;
  cursor:pointer; font-family:var(--sans);
  letter-spacing:.02em; transition: all .25s;
  margin-top:4px;
  display:inline-flex; align-items:center; justify-content:center; gap:8px;
}
.wallet-root .btn-dep { background: linear-gradient(135deg, var(--accent-light), var(--accent), var(--accent-dark)); color:#07080c; box-shadow: 0 2px 12px rgba(61,219,169,.15), inset 0 1px 2px rgba(255,255,255,.3); }
.wallet-root .btn-dep:hover { transform: translateY(-1px); box-shadow: 0 4px 18px rgba(61,219,169,.22), inset 0 1px 2px rgba(255,255,255,.35); }
.wallet-root .btn-wit { background: linear-gradient(135deg, #FF6B35, #E64A19); color:#fff; box-shadow: 0 6px 20px rgba(230,74,25,.25); }
.wallet-root .btn-wit:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(230,74,25,.38); }

.wallet-root .btn-sub.btn-outline {
  background: rgba(255,255,255,.04); color:var(--t2);
  border:1px solid rgba(255,255,255,.08); box-shadow:none;
}
.wallet-root .btn-sub.btn-outline:hover { background: rgba(255,255,255,.08); color: var(--t1); }

/* TIER UPGRADE BANNER */
.wallet-root .tier-upgrade-alert {
  margin-bottom: 14px; border-radius: 10px; overflow: hidden;
  border: 1.5px solid rgba(61,219,169,0.25);
  position: relative; box-shadow: 0 4px 20px rgba(61,219,169,0.08);
}
.wallet-root .tier-upgrade-alert::before {
  content:''; position:absolute; top:0; left:0; right:0; height:3px;
  background: linear-gradient(90deg, var(--accent-light), var(--accent), var(--accent-light));
  z-index:1;
}
.wallet-root .tua-topbar { display:flex; align-items:center; justify-content:space-between; padding:10px 16px 0; background: linear-gradient(135deg, rgba(61,219,169,0.06), rgba(61,219,169,0.03)); }
.wallet-root .tua-label-pill { display:inline-flex; align-items:center; gap:5px; background:rgba(61,219,169,0.1); border:1px solid rgba(61,219,169,0.25); border-radius:16px; padding:3px 10px; font-size:.65rem; font-weight:700; text-transform:uppercase; letter-spacing:.09em; color:var(--accent); }
.wallet-root .tua-close { background:none; border:1px solid rgba(255,255,255,0.07); color:var(--t3); cursor:pointer; font-size:.72rem; padding:3px 8px; border-radius:6px; font-family:var(--sans); transition: all .15s; display:flex; align-items:center; gap:4px; }
.wallet-root .tua-close:hover { color: var(--t1); border-color: var(--t3); }
.wallet-root .tua-body { display:grid; grid-template-columns: 1fr auto; gap:14px; align-items:center; padding:12px 16px 14px; background: linear-gradient(135deg, rgba(61,219,169,0.06), rgba(61,219,169,0.03)); }
@media(max-width:700px){ .wallet-root .tua-body{ grid-template-columns:1fr; } }
.wallet-root .tua-left { display:flex; align-items:center; gap:12px; }
.wallet-root .tua-icon { font-size:1.4rem; width:42px; height:42px; display:flex; align-items:center; justify-content:center; background:rgba(61,219,169,0.1); border:1px solid rgba(61,219,169,0.25); border-radius:10px; flex-shrink:0; color: var(--accent); }
.wallet-root .tua-heading { font-size:.88rem; font-weight:800; color:var(--t1); margin-bottom:2px; }
.wallet-root .tua-sub { font-size:.75rem; color:var(--t3); line-height:1.5; }
.wallet-root .tua-amtbox { background:rgba(0,0,0,.35); border:1px solid rgba(61,219,169,0.25); border-radius:10px; padding:12px 18px; text-align:center; min-width:180px; }
.wallet-root .tua-amt-label { font-size:.62rem; font-weight:700; text-transform:uppercase; letter-spacing:.1em; color:var(--accent); margin-bottom:4px; }
.wallet-root .tua-amount { font-family:var(--mono); font-size:1.4rem; font-weight:700; color:var(--accent-light); letter-spacing:-.02em; line-height:1.1; }
.wallet-root .tua-amt-note { font-size:.68rem; color:var(--t3); margin-top:4px; }
.wallet-root .tua-strip { background:rgba(61,219,169,.04); border-top:1px solid rgba(61,219,169,0.25); padding:8px 16px; display:flex; align-items:center; gap:8px; font-size:.72rem; color:var(--t3); }
.wallet-root .tua-strip strong { color: var(--t1); }

/* GOLD TIER BANNER */
.wallet-root .gold-tier-banner {
  background: linear-gradient(135deg, rgba(61,219,169,.08), rgba(61,219,169,.03));
  border: 1px solid rgba(61,219,169,0.25);
  border-radius:10px;
  padding:12px 16px;
  margin-bottom:14px;
  display:flex; align-items:center; gap:12px;
}
.wallet-root .gtb-icon { width:36px; height:36px; border-radius:9px; background: linear-gradient(135deg, var(--accent), var(--accent-light)); display:flex; align-items:center; justify-content:center; color:#060A14; flex-shrink:0; box-shadow: 0 3px 10px rgba(61,219,169,.25); }
.wallet-root .gtb-text { flex:1; }
.wallet-root .gtb-title { font-size:.82rem; font-weight:800; color:var(--accent-light); margin-bottom:2px; }
.wallet-root .gtb-desc { font-size:.7rem; color:var(--t3); line-height:1.5; }
.wallet-root .gtb-badge { padding:4px 12px; background: linear-gradient(135deg, var(--accent), var(--accent-light)); border-radius:16px; font-size:.65rem; font-weight:800; color:#000; white-space:nowrap; flex-shrink:0; }

/* WIT ACCT GRID */
.wallet-root .wit-acct-grid { display:flex; flex-direction:column; gap:6px; margin-bottom:14px; }
.wallet-root .wit-acct-opt {
  display:flex; align-items:center; gap:10px;
  padding:10px 12px;
  background: linear-gradient(145deg, rgba(255,255,255,.03), rgba(255,255,255,.015));
  border: 1.5px solid rgba(255,255,255,.07);
  border-radius:10px;
  cursor:pointer;
  transition: all .2s;
  position:relative;
}
.wallet-root .wit-acct-opt:hover { border-color: rgba(255,255,255,.12); background: linear-gradient(145deg, rgba(255,255,255,.05), rgba(255,255,255,.025)); }
.wallet-root .wit-acct-opt.on { border-color: rgba(61,219,169,.35); background: linear-gradient(145deg, rgba(61,219,169,.06), rgba(61,219,169,.02)); box-shadow: 0 0 16px rgba(61,219,169,.08); }
.wallet-root .wit-acct-opt.on .wao-check { opacity:1; color: var(--accent); }
.wallet-root .wao-icon {
  width:36px; height:36px; border-radius:10px;
  border:1px solid;
  display:flex; align-items:center; justify-content:center;
  font-size:.85rem; flex-shrink:0;
  position:relative;
  box-shadow: 0 4px 12px rgba(0,0,0,.25), inset 0 1px 1px rgba(255,255,255,.15);
  overflow:hidden;
}
.wallet-root .wao-info { flex:1; min-width:0; }
.wallet-root .wao-name { font-size:.75rem; font-weight:700; color: var(--t1); }
.wallet-root .wao-desc { font-size:.6rem; color: var(--t4); margin-top:1px; }
.wallet-root .wao-amount { font-family:var(--mono); font-size:.78rem; font-weight:700; color: var(--accent); flex-shrink:0; }
.wallet-root .wao-check { font-size:.7rem; color: var(--t4); opacity:0; transition: all .2s; flex-shrink:0; }

/* HISTORY */
.wallet-root .hist-section { margin-top:32px; }
.wallet-root .hist-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:10px; }
.wallet-root .hist-title { font-size:1rem; font-weight:800; display:flex; align-items:center; gap:8px; }
.wallet-root .hist-filters { display:flex; gap:6px; flex-wrap:wrap; }
.wallet-root .hf { padding:5px 13px; background: var(--bg2); border:1px solid rgba(255,255,255,0.08); border-radius:7px; font-size:.75rem; font-weight:600; color: var(--t3); cursor:pointer; transition: all .15s; font-family: var(--sans); }
.wallet-root .hf:hover { border-color: rgba(255,255,255,0.1); color: var(--t2); }
.wallet-root .hf.on { border-color: var(--accent); color: var(--accent); background: rgba(61,219,169,0.1); }
.wallet-root .hist-table-wrap { background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); border:1px solid rgba(255,255,255,0.06); border-radius:10px; overflow:auto; }
.wallet-root table.htbl { width:100%; border-collapse:collapse; min-width:700px; }
.wallet-root .htbl th { text-align:left; padding:11px 16px; font-size:.68rem; font-weight:700; color:var(--t4); text-transform:uppercase; letter-spacing:.08em; border-bottom: 1px solid rgba(255,255,255,0.06); background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); }
.wallet-root .htbl td { padding:14px 16px; font-size:.82rem; border-bottom: 1px solid rgba(255,255,255,0.06); }
.wallet-root .htbl tr:last-child td { border-bottom:none; }
.wallet-root .htbl tr:hover td { background: rgba(255,255,255,.01); }
.wallet-root .type-dep { display:inline-flex; align-items:center; gap:5px; font-size:.78rem; font-weight:700; color: var(--accent); }
.wallet-root .type-wit { display:inline-flex; align-items:center; gap:5px; font-size:.78rem; font-weight:700; color: var(--accent); }
.wallet-root .type-gold { display:inline-flex; align-items:center; gap:5px; font-size:.78rem; font-weight:700; color: var(--accent-light); }
.wallet-root .sbadge { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:20px; font-size:.7rem; font-weight:700; }
.wallet-root .sb-done { background: rgba(61,219,169,.08); color: var(--accent); border:1px solid rgba(61,219,169,.25); }
.wallet-root .sb-pend { background: rgba(232,169,77,.08); color: var(--orange); border:1px solid rgba(232,169,77,.2); }
.wallet-root .sb-fail { background: rgba(232,93,93,.08); color: var(--red); border:1px solid rgba(232,93,93,.2); }
.wallet-root .mono { font-family:var(--mono); }

/* RISK BAR */
.wallet-root .risk-bar { margin-top:32px; background: rgba(255,152,0,.04); border:1px solid rgba(255,152,0,.14); border-radius:12px; padding:14px 18px; display:flex; gap:11px; align-items:flex-start; }
.wallet-root .risk-bar p { font-size:.74rem; color: var(--t4); line-height:1.75; }

/* GOLD CARD */
.wallet-root .gold-card {
  background: linear-gradient(145deg, rgba(61,219,169,.05), rgba(61,219,169,.02), rgba(255,255,255,.02));
  backdrop-filter: blur(30px);
  border:1px solid rgba(61,219,169,0.18);
  border-radius:10px;
  padding:14px;
  position:relative; overflow:hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.05);
}
.wallet-root .gold-card::before { content:''; position:absolute; top:0; left:0; right:0; height:50%; background: linear-gradient(175deg, rgba(61,219,169,.06), transparent); pointer-events:none; }
.wallet-root .gc-header { display:flex; align-items:center; gap:10px; margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid rgba(61,219,169,0.2); position:relative; }
.wallet-root .gc-icon { width:32px; height:32px; border-radius:8px; background: linear-gradient(135deg, var(--accent), var(--accent-light)); display:flex; align-items:center; justify-content:center; color:#060A14; box-shadow: 0 3px 10px rgba(61,219,169,.25); flex-shrink:0; }
.wallet-root .gc-title { font-size:.82rem; font-weight:800; color: var(--accent-light); letter-spacing:-.02em; }
.wallet-root .gc-sub { font-size:.68rem; color: var(--t3); margin-top:1px; }
.wallet-root .gc-badge { margin-left:auto; padding:4px 10px; background: linear-gradient(135deg, var(--accent), var(--accent-light)); border-radius:16px; font-size:.62rem; font-weight:800; color:#060A14; flex-shrink:0; }
.wallet-root .gold-specs { display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:14px; position:relative; }
@media(max-width:600px){ .wallet-root .gold-specs{ grid-template-columns:1fr; } }
.wallet-root .gs-item { background: rgba(7,12,24,.4); border:1px solid rgba(61,219,169,0.3); border-radius:8px; padding:10px; }
.wallet-root .gs-label { font-size:.6rem; font-weight:700; color: var(--accent); text-transform:uppercase; letter-spacing:.07em; margin-bottom:3px; }
.wallet-root .gs-val { font-size:.82rem; font-weight:700; color: var(--t1); }
.wallet-root .gs-sub { font-size:.62rem; color: var(--t4); margin-top:1px; }
.wallet-root .gold-qty { display:flex; gap:8px; margin-bottom:14px; position:relative; }
.wallet-root .gq-opt { flex:1; padding:10px 8px; text-align:center; background: rgba(7,12,24,.5); border: 1.5px solid rgba(61,219,169,0.3); border-radius:10px; cursor:pointer; transition: all .2s; }
.wallet-root .gq-opt.on { border-color: var(--accent-light); background: rgba(61,219,169,0.1); box-shadow: 0 0 16px rgba(61,219,169,.12); }
.wallet-root .gq-weight { font-family: var(--mono); font-size:.88rem; font-weight:800; color: var(--accent-light); }
.wallet-root .gq-desc { font-size:.62rem; color: var(--t3); margin-top:2px; }
.wallet-root .gq-price { font-size:.68rem; font-weight:700; color: var(--accent); margin-top:3px; }
.wallet-root .gq-premium { display:inline-block; font-size:.58rem; font-weight:700; padding:2px 5px; background: rgba(61,219,169,0.1); color: var(--accent); border-radius:4px; margin-top:3px; }
.wallet-root .gold-delivery-steps { display:flex; flex-direction:column; }
.wallet-root .gds-item { display:flex; gap:10px; padding:8px 0; position:relative; }
.wallet-root .gds-item:not(:last-child)::after { content:''; position:absolute; left:11px; top:34px; bottom:0; width:1.5px; background: rgba(61,219,169,0.3); }
.wallet-root .gds-num { width:24px; height:24px; border-radius:50%; background: rgba(61,219,169,0.1); border:1.5px solid rgba(61,219,169,0.3); display:flex; align-items:center; justify-content:center; font-size:.62rem; font-weight:800; color: var(--accent-light); flex-shrink:0; }
.wallet-root .gds-title { font-size:.75rem; font-weight:700; color: var(--t1); margin-bottom:1px; }
.wallet-root .gds-desc { font-size:.65rem; color: var(--t4); line-height:1.5; }
.wallet-root .gold-locked { background: linear-gradient(135deg, rgba(61,219,169,.04), rgba(61,219,169,.02)); border:1px dashed rgba(61,219,169,0.25); border-radius:12px; padding:20px; text-align:center; }
.wallet-root .gl-icon { width:44px; height:44px; border-radius:50%; background: rgba(61,219,169,0.1); border:1.5px solid rgba(61,219,169,0.25); display:flex; align-items:center; justify-content:center; color:var(--accent); margin:0 auto 10px; }
.wallet-root .gl-title { font-size:.88rem; font-weight:800; color: var(--accent-light); margin-bottom:6px; }
.wallet-root .gl-desc { font-size:.75rem; color: var(--t3); line-height:1.6; max-width:360px; margin:0 auto 14px; }
.wallet-root .gl-progress { background: rgba(255,255,255,0.05); border-radius:7px; padding:10px 14px; text-align:left; margin-bottom:12px; max-width:380px; margin-left:auto; margin-right:auto; }
.wallet-root .glp-row { display:flex; justify-content:space-between; font-size:.78rem; margin-bottom:6px; }
.wallet-root .glp-label { color: var(--t3); }
.wallet-root .glp-val { font-family: var(--mono); font-weight:700; color: var(--accent-light); }
.wallet-root .glp-bar { height:7px; background:rgba(255,255,255,0.08); border-radius:4px; overflow:hidden; }
.wallet-root .glp-fill { height:100%; background: linear-gradient(90deg, var(--accent), var(--accent-light)); border-radius:4px; transition: width .8s; }

/* small util classes used in the page shell */
.wallet-root .wgrid-split { display:grid; grid-template-columns: 1fr 380px; gap:24px; align-items:start; }
@media(max-width:1100px){ .wallet-root .wgrid-split { grid-template-columns: 1fr; } }
.wallet-root .wgrid-2 { display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
@media(max-width:600px){ .wallet-root .wgrid-2 { grid-template-columns: 1fr; } }
.wallet-root .step-nav { display:flex; gap:8px; align-items:center; margin-top:12px; }

/* STEP DOTS (wizard indicator) */
.wallet-root .step-dots { display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:18px; }
.wallet-root .step-dot { width:10px; height:10px; border-radius:50%; background:rgba(255,255,255,0.1); transition: all .2s; }
.wallet-root .step-dot.active { background: var(--accent); box-shadow: 0 0 8px rgba(61,219,169,.4); }
.wallet-root .step-dot.done { background: var(--accent); opacity:.5; }

/* STEP NAV BUTTONS */
.wallet-root .step-nav .sn-back {
  flex:1; padding:9px;
  background: var(--bg2);
  border:1px solid rgba(255,255,255,0.07);
  color: var(--t2);
  border-radius:8px;
  font-size:.76rem; font-weight:700;
  cursor:pointer; font-family: var(--sans);
  display:flex; align-items:center; justify-content:center; gap:6px;
  transition: all .15s;
}
.wallet-root .step-nav .sn-back:hover { border-color: var(--t3); color: var(--t1); }
.wallet-root .step-nav .sn-next {
  flex:2; padding:9px;
  background: linear-gradient(135deg, var(--accent-light), var(--accent), var(--accent-dark));
  border:none; color:#07080c;
  border-radius:8px;
  font-size:.78rem; font-weight:800;
  cursor:pointer; font-family: var(--sans);
  display:flex; align-items:center; justify-content:center; gap:6px;
  transition: all .15s;
  box-shadow: inset 0 1px 2px rgba(255,255,255,.25);
}
.wallet-root .step-nav .sn-next:hover { box-shadow: 0 3px 12px rgba(61,219,169,.2), inset 0 1px 2px rgba(255,255,255,.3); }
.wallet-root .step-nav .sn-next:disabled { opacity:.6; cursor:not-allowed; }

/* PASTE/INPUT TRAILING BUTTON */
.wallet-root .fi-btn {
  position:absolute; right:13px; top:50%; transform: translateY(-50%);
  cursor:pointer; color: var(--t3); font-size:.83rem;
  transition: color .15s; background:none; border:none; padding:0;
}
.wallet-root .fi-btn:hover { color: var(--t1); }

/* legacy shadcn inputs inside forms — match wallet field look */
.wallet-root .field [data-slot="form-label"] {
  font-size:.72rem; font-weight:700; color:var(--t3);
  text-transform:uppercase; letter-spacing:.07em; margin-bottom:6px;
}
.wallet-root .field input[type="text"],
.wallet-root .field input[type="number"],
.wallet-root .field input:not([type]) {
  background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
  border:1px solid rgba(255,255,255,0.08);
  color:var(--t1);
}
.wallet-root .field input:focus-visible {
  border-color: rgba(61,219,169,0.5) !important;
  box-shadow: 0 0 0 3px rgba(61,219,169,0.1), inset 0 1px 3px rgba(0,0,0,0.3) !important;
}
`}</style>
  );
}
