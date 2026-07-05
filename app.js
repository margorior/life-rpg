/* ============================================================
   LIFE RPG — v5
   Relations · édition quêtes/routines · listes-backlog 20% ·
   objectifs libres · historique/graphiques · taux de réussite ·
   mode vie réelle · compteurs jours-sans · check du soir
   ============================================================ */

/* ---------- NIVEAUX (50) ---------- */
const TITLES = [
  "Zombie du Canapé","Limace Horizontale","Larve en Éveil","Créature du Matin Difficile",
  "Humain Fonctionnel","Bipède Motivé","Apprenti du Quotidien","Recrue de la Routine",
  "Soldat de la Discipline","Éclaireur d'Objectifs","Artisan du Momentum","Combattant du Lundi",
  "Chasseur de Quêtes","Guerrier du Matin","Vétéran des Habitudes","Stratège de la Vie",
  "Capitaine Momentum","Chevalier des Neuf Fronts","Templier de la To-Do","Maître des Habitudes",
  "Champion du Quotidien","Gladiateur de l'Aube","Conquérant des Objectifs","Baron de la Discipline",
  "Héros du Quotidien","Duc du Dépassement","Seigneur des Routines","Paladin de la Constance",
  "Sentinelle Inarrêtable","Titan de la Discipline","Colosse du Momentum","Prince de la Progression",
  "Roi du Game","Archimage des Habitudes","Grand Maître de la Vie","Légende Vivante",
  "Mythe Ambulant","Empereur du Game","Avatar de la Volonté","Force de la Nature",
  "Semi-Légende Cosmique","Demi-Dieu du Quotidien","Gardien de l'Olympe","Immortel de la Routine",
  "Dieu de la Vie","Dieu Suprême du Momentum","Entité Transcendante","Maître de l'Univers",
  "Légende Absolue","Transcendant Ultime",
];
const MAX_LEVEL = TITLES.length;
const thr = (l) => Math.round(2.5 * Math.pow(l - 1, 1.9));
const rawLevel = (xp) => { let l = 1; while (l < MAX_LEVEL && xp >= thr(l + 1)) l++; return l; };

const GATES = [
  { lvl: 20, rank: 5,  streak: 0,  label: "Rang 5 dans TOUTES les catégories" },
  { lvl: 35, rank: 10, streak: 0,  label: "Rang 10 dans TOUTES les catégories" },
  { lvl: 45, rank: 15, streak: 30, label: "Rang 15 partout + streak de 30 jours" },
];
const rankOf = (xp) => Math.floor((xp || 0) / 10) + 1;
const gateOk = (g) => Object.keys(CATS).every((k) => rankOf(state.catXp[k]) >= g.rank) && (state.streak || 0) >= g.streak;
const gateMissing = (g) => {
  const cats = Object.keys(CATS).filter((k) => rankOf(state.catXp[k]) < g.rank).map((k) => CATS[k].icon);
  const parts = [];
  if (cats.length) parts.push(`Rang ${g.rank} requis : ${cats.join(" ")}`);
  if ((state.streak || 0) < g.streak) parts.push(`Streak ${state.streak || 0}/${g.streak}j`);
  return parts.join(" · ");
};
function levelFromXp(xp) {
  let l = rawLevel(xp);
  for (const g of GATES) if (l >= g.lvl && !gateOk(g)) l = Math.min(l, g.lvl - 1);
  return l;
}
function activeGate() {
  const raw = rawLevel(state.totalXp);
  for (const g of GATES) if (raw >= g.lvl && !gateOk(g)) return g;
  return null;
}
const stageFromLevel = (l) => (l <= 5 ? 1 : l <= 12 ? 2 : l <= 22 ? 3 : l <= 32 ? 4 : l <= 44 ? 5 : 6);

/* ---------- CATÉGORIES ---------- */
const CATS = {
  business:   { label: "Business",      icon: "📈", color: "#F2A33C" },
  finances:   { label: "Finances",      icon: "💰", color: "#E8B94A" },
  travail:    { label: "Travail",       icon: "⚡", color: "#4FC8D8" },
  couple:     { label: "Relations",     icon: "❤️", color: "#E86E9A" },
  sport:      { label: "Force",         icon: "💪", color: "#58C97B" },
  sante:      { label: "Santé",         icon: "🩺", color: "#4FCFA8" },
  esprit:     { label: "Esprit",        icon: "🧠", color: "#A784E8" },
  maison:     { label: "Projet de vie", icon: "🎯", color: "#ED8A4C" },
  discipline: { label: "Discipline",    icon: "🎖️", color: "#93A8C4" },
};
const DAY_LABELS = ["D","L","M","M","J","V","S"];
const DAY_FULL = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];

const DEFAULT_TASKS = [
  { id: "b1", name: "2h de travail business", cat: "business", subcat: null, xp: 1, days: [1,2,3,4,5], oneshot: false },
  { id: "b2", name: "4h de travail business", cat: "business", subcat: null, xp: 2, days: [0,6], oneshot: false },
  { id: "f1", name: "Point budget de la semaine", cat: "finances", subcat: null, xp: 1, days: [0], oneshot: false },
  { id: "s1", name: "Salle de sport", cat: "sport", subcat: "Salle", xp: 1, days: [1,3,5], oneshot: false },
  { id: "s2", name: "Course à pied", cat: "sport", subcat: "Course", xp: 1, days: [2,4,6], oneshot: false },
  { id: "h1", name: "7h+ de sommeil", cat: "sante", subcat: null, xp: 0.5, days: null, oneshot: false },
  { id: "h2", name: "2L d'eau", cat: "sante", subcat: null, xp: 0.5, days: null, oneshot: false },
  { id: "h3", name: "Alimentation propre", cat: "sante", subcat: null, xp: 0.5, days: null, oneshot: false },
  { id: "h4", name: "Se raser", cat: "sante", subcat: null, xp: 0.2, days: [5], oneshot: false },
  { id: "e1", name: "Partie d'échecs", cat: "esprit", subcat: "Échecs", xp: 0.5, days: null, oneshot: false },
  { id: "t1", name: "Organisation et rangement au travail", cat: "travail", subcat: null, xp: 0.2, days: [1,2,3,4,5], oneshot: false },
  { id: "t2", name: "Motivation", cat: "travail", subcat: null, xp: 0.2, days: [1,2,3,4,5], oneshot: false },
  { id: "c1", name: "Moment de qualité en couple", cat: "couple", subcat: null, xp: 1, days: null, oneshot: false },
  { id: "c2", name: "Sortie / activité à deux", cat: "couple", subcat: null, xp: 2, days: [6], oneshot: false },
  { id: "c3", name: "Prendre des nouvelles (famille / amis)", cat: "couple", subcat: null, xp: 0.5, days: [0], oneshot: false },
  { id: "m1", name: "Avancer sur la construction de la maison", cat: "maison", subcat: "Maison", xp: 1, days: [0,6], oneshot: false },
  { id: "m2", name: "Tâches à la maison (10-15 min)", cat: "maison", subcat: null, xp: 0.3, days: null, oneshot: false },
  { id: "m3", name: "Sortir les poubelles", cat: "maison", subcat: null, xp: 0.2, days: [3,4], oneshot: false },
];
const DEFAULT_SUBCATS = {
  business: [], finances: [], travail: [],
  couple: [], sport: ["Salle","Course"], sante: [], esprit: ["Échecs"], maison: ["Maison"], discipline: [],
};
const DEFAULT_ROUTINES = {
  matin: { label: "Routine matinale", icon: "🌅", total: "≈ 10 min", items: [
    { id: "rm1", name: "🧴 Déo + Parfum", dur: "20 s" },
    { id: "rm2", name: "👕 Habillage", dur: "45 s" },
    { id: "rm3", name: "🪥 Se brosser les dents", dur: "3 min 30" },
    { id: "rm4", name: "💊 Médicaments et vitamines", dur: "1 min" },
    { id: "rm5", name: "🫀 Tester la fréquence cardiaque", dur: "2 min" },
    { id: "rm6", name: "🩹 Soins des mains", dur: "15 s" },
    { id: "rm7", name: "🍱 Préparer le repas", dur: "1 min" },
    { id: "rm8", name: "🚗 Démarrage", dur: "1 min 30" },
  ], done: {} },
  soir: { label: "Routine du soir", icon: "🌙", total: "", items: [
    { id: "rs1", name: "🧹 Ranger le bas" },
    { id: "rs2", name: "🍱 Préparer le repas de demain midi" },
    { id: "rs3", name: "🫀 Prendre la tension" },
    { id: "rs4", name: "🪥 Se brosser les dents" },
    { id: "rs5", name: "😴 Dodo" },
  ], done: {} },
};

/* ---------- ÉTAT ---------- */
const KEY = "life-rpg-pwa-v1";
const todayStr = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const daysBetweenStr = (a, b) => Math.max(0, Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000));
const fmt = (n) => (Math.round(n * 10) / 10).toString().replace(".", ",");

const defaultState = () => ({
  version: 5, totalXp: 0, catXp: {}, subXp: {},
  subcats: JSON.parse(JSON.stringify(DEFAULT_SUBCATS)),
  tasks: JSON.parse(JSON.stringify(DEFAULT_TASKS)),
  routines: JSON.parse(JSON.stringify(DEFAULT_ROUTINES)),
  backlog: [],   // {id, name, cat, xp, status: wait|active|paused, activatedOn}
  goals: [],     // {id, name, cat, progress}
  counters: [],  // {id, name, cat, since, milestones: []}
  history: [],   // {d, xp, cats, sched, done, rm, rs}
  pause: { active: false, reason: "", since: null },
  doneToday: {}, lastDate: todayStr(), streak: 0,
  log: [{ ts: Date.now(), text: "🎮 Début de l'opération. Bonne chance, Zombie du Canapé.", xp: 0 }],
});

let state;
function normalize(s) {
  const d = defaultState();
  s.catXp = s.catXp || {}; s.subXp = s.subXp || {}; s.streak = s.streak || 0;
  if ((s.version || 0) < 4) {
    const userTasks = (s.tasks || []).filter((t) => String(t.id).length > 4);
    s.tasks = d.tasks.concat(userTasks);
    s.routines = JSON.parse(JSON.stringify(DEFAULT_ROUTINES));
    s.subcats = JSON.parse(JSON.stringify(DEFAULT_SUBCATS));
  }
  s.version = 5;
  s.subcats = Object.assign({}, d.subcats, s.subcats || {});
  if (!s.routines) s.routines = d.routines;
  for (const k of ["matin","soir"]) { s.routines[k] = s.routines[k] || d.routines[k]; s.routines[k].done = s.routines[k].done || {}; }
  if (!s.tasks) s.tasks = d.tasks;
  s.backlog = s.backlog || []; s.goals = s.goals || []; s.counters = s.counters || []; s.history = s.history || [];
  s.pause = s.pause || { active: false, reason: "", since: null };
  s.log = s.log || []; s.doneToday = s.doneToday || {}; s.lastDate = s.lastDate || todayStr();
  return s;
}
const load = () => { try { const raw = localStorage.getItem(KEY); state = normalize(raw ? JSON.parse(raw) : defaultState()); } catch { state = defaultState(); } };
const save = () => { state.savedAt = Date.now(); localStorage.setItem(KEY, JSON.stringify(state)); if (syncCfg && syncCfg.gistId) syncPushSoon(); };

/* ---------- SYNC GITHUB (Gist privé) ---------- */
const APP_VERSION = "5.2.0";
const SYNC_KEY = "life-rpg-sync";
const SYNC_DEBOUNCE = (typeof window !== "undefined" && window.__SYNC_DEBOUNCE) || 2500;
let syncCfg = null, syncStatus = "off", syncTimer = null, syncLast = null;

function loadSyncCfg() {
  try { syncCfg = JSON.parse(localStorage.getItem(SYNC_KEY)); } catch { syncCfg = null; }
  if (syncCfg && syncCfg.token) syncStatus = "idle";
}
function saveSyncCfg() {
  if (syncCfg) localStorage.setItem(SYNC_KEY, JSON.stringify(syncCfg));
  else localStorage.removeItem(SYNC_KEY);
}
function ghFetch(url, opts = {}) {
  return fetch("https://api.github.com" + url, { ...opts, headers: {
    "Authorization": "Bearer " + syncCfg.token,
    "Accept": "application/vnd.github+json",
    ...(opts.body ? { "Content-Type": "application/json" } : {}),
  }});
}
function setSyncStatus(s) {
  syncStatus = s;
  const el = document.getElementById("sync-dot");
  if (el) {
    el.textContent = s === "ok" ? "✓" : s === "syncing" ? "⟳" : s === "error" ? "⚠" : "";
    el.style.color = s === "ok" ? "var(--green)" : s === "error" ? "var(--red)" : "var(--muted)";
    el.title = s === "ok" ? "Synchronisé" : s === "syncing" ? "Synchronisation…" : s === "error" ? "Erreur de sync (hors ligne ou token invalide)" : "";
  }
}
async function syncConnect(token) {
  syncCfg = { token: token.trim(), gistId: null };
  setSyncStatus("syncing");
  try {
    const res = await ghFetch("/gists?per_page=100");
    if (!res.ok) throw new Error("auth");
    const gists = await res.json();
    const found = gists.find((g) => g.files && g.files["life-rpg.json"]);
    if (found) {
      syncCfg.gistId = found.id;
      saveSyncCfg();
      await syncPull(true); // une sauvegarde existe déjà -> on l adopte
    } else {
      const c = await ghFetch("/gists", { method: "POST", body: JSON.stringify({
        description: "Life RPG — sauvegarde automatique", public: false,
        files: { "life-rpg.json": { content: JSON.stringify(state) } } }) });
      if (!c.ok) throw new Error("create");
      syncCfg.gistId = (await c.json()).id;
      saveSyncCfg();
    }
    setSyncStatus("ok"); syncLast = Date.now();
    state.log.unshift({ ts: Date.now(), text: "☁ Sync GitHub connectée", xp: 0 });
    save(); render();
  } catch {
    syncCfg = null; saveSyncCfg(); setSyncStatus("error");
    alert("Connexion impossible. Vérifie le token (type classique, scope « gist » uniquement).");
    render();
  }
}
function syncDisconnect() {
  syncCfg = null; saveSyncCfg(); setSyncStatus("off"); render();
}
async function syncPull(force) {
  if (!syncCfg || !syncCfg.gistId) return;
  try {
    setSyncStatus("syncing");
    const res = await ghFetch("/gists/" + syncCfg.gistId);
    if (!res.ok) throw new Error();
    const g = await res.json();
    const content = g.files && g.files["life-rpg.json"] && g.files["life-rpg.json"].content;
    if (content) {
      const remote = JSON.parse(content);
      if (force || (remote.savedAt || 0) > (state.savedAt || 0)) {
        state = normalize(remote);
        processDayChange();
        prevLevel = levelFromXp(state.totalXp);
        localStorage.setItem(KEY, JSON.stringify(state));
        render();
      }
    }
    setSyncStatus("ok"); syncLast = Date.now();
  } catch { setSyncStatus("error"); }
}
function syncPushSoon() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(syncPushNow, SYNC_DEBOUNCE);
}
async function syncPushNow() {
  if (!syncCfg || !syncCfg.gistId) return;
  try {
    setSyncStatus("syncing");
    const res = await ghFetch("/gists/" + syncCfg.gistId, { method: "PATCH", body: JSON.stringify({
      files: { "life-rpg.json": { content: JSON.stringify(state) } } }) });
    if (!res.ok) throw new Error();
    setSyncStatus("ok"); syncLast = Date.now();
  } catch { setSyncStatus("error"); }
}

const scheduledOn = (t, wd) => !t.oneshot && (t.days === null || t.days.includes(wd));
const routineComplete = (r) => r.items.length > 0 && r.items.every((i) => r.done[i.id]);
const round2 = (n) => Math.round(n * 100) / 100;

function gainXp(cat, subKey, amount) {
  state.totalXp = round2(Math.max(0, state.totalXp + amount));
  state.catXp[cat] = round2(Math.max(0, (state.catXp[cat] || 0) + amount));
  if (subKey) state.subXp[subKey] = round2(Math.max(0, (state.subXp[subKey] || 0) + amount));
}

/* ---------- PASSAGE DE JOUR ---------- */
function processDayChange() {
  const today = todayStr();
  if (state.lastDate === today) return;
  const paused = state.pause.active;
  let lost = 0; const details = [];
  let d = new Date(state.lastDate + "T12:00:00");
  const end = new Date(today + "T12:00:00");
  let guard = 0;
  while (todayStr(d) !== todayStr(end) && guard < 7) {
    const ds = todayStr(d);
    const wd = d.getDay();
    const isLast = ds === state.lastDate;
    const sched = state.tasks.filter((t) => scheduledOn(t, wd)).map((t) => t.id);
    const doneIds = isLast ? sched.filter((id) => state.doneToday[id]) : [];
    if (!paused) {
      let missed = 0;
      state.tasks.forEach((t) => {
        if (scheduledOn(t, wd) && !(isLast && state.doneToday[t.id])) {
          missed++; lost += t.xp;
          gainXp(t.cat, t.subcat ? t.cat + "/" + t.subcat : null, -t.xp);
          details.push(t.name);
        }
      });
      for (const k of ["matin","soir"]) {
        const r = state.routines[k];
        if (r.items.length && !(isLast && routineComplete(r))) {
          lost += 0.5; gainXp("discipline", null, -0.5); details.push(r.label);
        }
      }
      // Décroissance des éléments de liste actifs : 20% de leur XP par jour (à partir du lendemain de l'activation)
      state.backlog.forEach((b) => {
        if (b.status === "active" && b.activatedOn && b.activatedOn < ds) {
          const pen = round2(b.xp * 0.2);
          lost += pen; gainXp(b.cat, null, -pen); details.push(b.name);
        }
      });
      if (sched.length > 0) {
        if (missed === 0) {
          state.streak = (state.streak || 0) + 1;
          const bonus = state.streak >= 30 ? 1.5 : state.streak >= 7 ? 1 : 0.5;
          gainXp("discipline", null, bonus);
          state.log.unshift({ ts: Date.now(), text: `⭐ Journée parfaite ! Streak ${state.streak}j`, xp: bonus });
        } else state.streak = 0;
      }
    }
    // Compteurs "jours sans" : bonus aux paliers (même en pause : c'est positif)
    state.counters.forEach((c) => {
      const days = daysBetweenStr(c.since, ds);
      c.milestones = c.milestones || [];
      for (const [ms, bonus] of [[7, 0.5], [30, 1], [100, 2]]) {
        if (days >= ms && !c.milestones.includes(ms)) {
          c.milestones.push(ms);
          gainXp(c.cat, null, bonus);
          state.log.unshift({ ts: Date.now(), text: `🚭 ${c.name} : ${ms} jours !`, xp: bonus });
        }
      }
    });
    // Instantané du jour clôturé (graphiques + taux de réussite)
    state.history.push({ d: ds, xp: state.totalXp, cats: { ...state.catXp }, sched, done: doneIds,
      rm: isLast && routineComplete(state.routines.matin), rs: isLast && routineComplete(state.routines.soir) });
    d.setDate(d.getDate() + 1); guard++;
  }
  state.history = state.history.slice(-400);
  if (lost > 0) {
    state.log.unshift({ ts: Date.now(), text: `💀 Manqué : ${[...new Set(details)].slice(0,4).join(", ")}${details.length>4?"…":""}`, xp: -round2(lost) });
  }
  if (paused && guard > 0) state.log.unshift({ ts: Date.now(), text: `⏸ Mode vie réelle : ${guard} jour(s) sans pénalité`, xp: 0 });
  state.doneToday = {};
  for (const k of ["matin","soir"]) state.routines[k].done = {};
  state.lastDate = today;
  save();
}

/* ---------- AVATAR SVG ---------- */
function drawAvatar(stage, muscle) {
  const m = muscle;
  const skin = "#E3B287", skinD = "#C99668", hair = "#4A3521";
  const O = {
    1: { top: "#5F72A8", top2: "#4E5F90", pants: "#5F72A8", shoes: "#B79878", shirt: null, tie: null },
    2: { top: "#7A828D", top2: "#666E79", pants: "#3B424C", shoes: "#E8E8E8", shirt: null, tie: null },
    3: { top: "#4E82B8", top2: "#3F6D9E", pants: "#2F4A66", shoes: "#7C6244", shirt: null, tie: null },
    4: { top: "#2C3850", top2: "#232D42", pants: "#2C3850", shoes: "#211C16", shirt: "#E7EDF5", tie: "#3E5A85" },
    5: { top: "#1C2333", top2: "#151B28", pants: "#1C2333", shoes: "#120F0C", shirt: "#F4F6FA", tie: "#A83240" },
    6: { top: "#B9922F", top2: "#9A7822", pants: "#B9922F", shoes: "#242424", shirt: "#FFF6D8", tie: "#6E5410" },
  }[stage];
  const shW = 34 + 14 * m, armW = 11 + 6 * m, chest = 30 + 12 * m, cx = 130;
  const px = (v) => (v).toFixed(1);
  return `
  <svg viewBox="0 0 260 340" width="230" height="300" xmlns="http://www.w3.org/2000/svg">
    ${stage === 6 ? `
      <g opacity="0.5">${[...Array(8)].map((_,i)=>{const a=i*Math.PI/4;return `<line x1="${cx+Math.cos(a)*70}" y1="${150+Math.sin(a)*70}" x2="${cx+Math.cos(a)*105}" y2="${150+Math.sin(a)*105}" stroke="#E8B94A" stroke-width="3" stroke-linecap="round"/>`;}).join("")}</g>
      <circle cx="${cx}" cy="150" r="92" fill="#E8B94A" opacity="0.07"/>` : ""}
    <ellipse cx="${cx}" cy="318" rx="62" ry="9" fill="#000" opacity="0.35"/>
    <path d="M${px(cx-24)} 200 L${px(cx-27)} 300 L${px(cx-9)} 300 L${px(cx-6)} 205 Z" fill="${O.pants}"/>
    <path d="M${px(cx+24)} 200 L${px(cx+27)} 300 L${px(cx+9)} 300 L${px(cx+6)} 205 Z" fill="${O.top2}"/>
    ${stage===1?`<circle cx="${cx-18}" cy="240" r="3" fill="#D8E0F2"/><circle cx="${cx+17}" cy="262" r="3" fill="#D8E0F2"/>`:""}
    <path d="M${px(cx-31)} 300 L${px(cx-31)} 310 L${px(cx-2)} 310 L${px(cx-4)} 300 Z" fill="${O.shoes}"/>
    <path d="M${px(cx+31)} 300 L${px(cx+31)} 310 L${px(cx+2)} 310 L${px(cx+4)} 300 Z" fill="${O.shoes}"/>
    <path d="M${px(cx-shW)} 120 q-${px(8+4*m)} 40 -${px(4+3*m)} 78 l${px(armW)} 2 q-2 -40 ${px(6)} -74 Z" fill="${O.top2}"/>
    <path d="M${px(cx+shW)} 120 q${px(8+4*m)} 40 ${px(4+3*m)} 78 l-${px(armW)} 2 q2 -40 -${px(6)} -74 Z" fill="${O.top2}"/>
    <circle cx="${px(cx-shW-1+armW/2-(4+3*m))}" cy="204" r="7.5" fill="${skin}"/>
    <circle cx="${px(cx+shW+1-armW/2+(4+3*m))}" cy="204" r="7.5" fill="${skin}"/>
    ${stage>=4?`<rect x="${px(cx+shW-4)}" y="188" width="11" height="5" rx="2.5" fill="${stage===6?"#E8B94A":"#9FB2CC"}"/>`:""}
    <path d="M${px(cx-shW)} 118 Q${cx} ${px(106-4*m)} ${px(cx+shW)} 118 L${px(cx+chest)} 205 L${px(cx-chest)} 205 Z" fill="${O.top}"/>
    <path d="M${px(cx-shW)} 118 Q${cx} ${px(106-4*m)} ${px(cx+shW)} 118 L${px(cx+shW-6)} 140 Q${cx} ${px(126-4*m)} ${px(cx-shW+6)} 140 Z" fill="${O.top2}" opacity="0.55"/>
    ${stage===1?[...Array(6)].map((_,i)=>`<circle cx="${cx-20+(i%3)*20}" cy="${145+Math.floor(i/3)*26}" r="3" fill="#D8E0F2" opacity="0.85"/>`).join(""):""}
    ${O.shirt?`
      <path d="M${cx} 118 L${px(cx-13)} 118 L${px(cx-2)} 168 L${cx} 178 L${px(cx+2)} 168 L${px(cx+13)} 118 Z" fill="${O.shirt}"/>
      <path d="M${cx} 121 L${px(cx-5)} 128 L${px(cx-1)} 166 L${cx} 172 L${px(cx+1)} 166 L${px(cx+5)} 128 Z" fill="${O.tie}"/>`
    : stage===3?`<path d="M${cx} 118 L${px(cx-11)} 118 L${cx} 142 L${px(cx+11)} 118 Z" fill="#DCE7F2"/>`:""}
    ${stage>=5?`<path d="M${px(cx-shW+4)} 122 L${px(cx-10)} 122 L${px(cx-16)} 170 L${px(cx-chest+4)} 200 Z" fill="${O.top2}"/>
      <path d="M${px(cx+shW-4)} 122 L${px(cx+10)} 122 L${px(cx+16)} 170 L${px(cx+chest-4)} 200 Z" fill="${O.top2}"/>`:""}
    <rect x="${px(cx-9)}" y="98" width="18" height="16" fill="${skin}"/>
    <rect x="${px(cx-9)}" y="98" width="18" height="6" fill="${skinD}" opacity="0.5"/>
    <circle cx="${cx}" cy="72" r="30" fill="${skin}"/>
    ${stage===1
      ? `<path d="M${cx-29} 66 Q${cx-31} 40 ${cx-16} 42 L${cx-19} 30 L${cx-8} 40 L${cx-3} 26 L${cx+4} 40 L${cx+13} 29 L${cx+14} 42 Q${cx+31} 41 ${cx+29} 66 Q${cx+22} 48 ${cx} 48 Q${cx-22} 48 ${cx-29} 66 Z" fill="${hair}"/>`
      : `<path d="M${cx-30} 68 Q${cx-32} 38 ${cx} 38 Q${cx+32} 38 ${cx+30} 68 Q${cx+24} 48 ${cx} 48 Q${cx-24} 48 ${cx-30} 68 Z" fill="${hair}"/>`}
    ${stage===6
      ? `<rect x="${cx-19}" y="64" width="38" height="10" rx="3" fill="#141414"/><rect x="${cx-19}" y="64" width="38" height="3" rx="1.5" fill="#3A3A3A"/>`
      : `<circle cx="${cx-11}" cy="69" r="3" fill="#26211C"/><circle cx="${cx+11}" cy="69" r="3" fill="#26211C"/>
         ${stage===1?`<path d="M${cx-16} 76 Q${cx-11} 79 ${cx-6} 76" stroke="#B08464" stroke-width="1.6" fill="none"/><path d="M${cx+6} 76 Q${cx+11} 79 ${cx+16} 76" stroke="#B08464" stroke-width="1.6" fill="none"/>`:""}`}
    ${stage===1
      ? `<path d="M${cx-8} 87 Q${cx} 83 ${cx+8} 87" stroke="#8A5A3A" stroke-width="2" fill="none" stroke-linecap="round"/>`
      : `<path d="M${cx-8} 85 Q${cx} 91 ${cx+8} 85" stroke="#8A5A3A" stroke-width="2" fill="none" stroke-linecap="round"/>`}
    <path d="M${cx-22} 76 Q${cx-20} 94 ${cx} 98 Q${cx+20} 94 ${cx+22} 76 Q${cx+17} 92 ${cx} 93 Q${cx-17} 92 ${cx-22} 76 Z" fill="${hair}" opacity="0.28"/>
  </svg>`;
}

function insignia(stage) {
  const gold = "#E8B94A";
  const chevrons = Math.min(stage, 5);
  let s = "";
  for (let i = 0; i < chevrons; i++) {
    const y = 34 - i * 6.5;
    s += `<path d="M8 ${y} L20 ${y-7} L32 ${y} L32 ${y-4} L20 ${y-11} L8 ${y-4} Z" fill="${i===chevrons-1?"#FFD97A":gold}"/>`;
  }
  if (stage === 6) s += `<path d="M20 2 l2.6 5.6 6.2 .7 -4.6 4.2 1.2 6.1 -5.4 -3.1 -5.4 3.1 1.2 -6.1 -4.6 -4.2 6.2 -.7 Z" fill="#FFD97A"/>`;
  return `<svg class="insignia" width="40" height="40" viewBox="0 0 40 40">${s}</svg>`;
}

/* ---------- RADAR ---------- */
function renderRadar() {
  const keys = Object.keys(CATS);
  const cx = 155, cy = 130, R = 86;
  const maxRef = Math.max(10, ...keys.map((k) => state.catXp[k] || 0));
  const pt = (i, r) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / keys.length;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const ring = (r) => keys.map((_, i) => pt(i, r).map((v) => v.toFixed(1)).join(",")).join(" ");
  const values = keys.map((k) => Math.max(0.04, (state.catXp[k] || 0) / maxRef));
  const poly = keys.map((_, i) => pt(i, R * values[i]).map((v) => v.toFixed(1)).join(",")).join(" ");
  const sorted = keys.map((k) => [k, state.catXp[k] || 0]).sort((a, b) => b[1] - a[1]);
  const best = CATS[sorted[0][0]], worst = CATS[sorted[sorted.length - 1][0]];
  return `<div class="radar-wrap"><svg viewBox="0 0 310 262" width="100%" style="max-width:330px">
    ${[0.33, 0.66, 1].map((f) => `<polygon points="${ring(R*f)}" fill="none" stroke="rgba(255,255,255,0.09)"/>`).join("")}
    ${keys.map((_, i) => { const [x, y] = pt(i, R); return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(255,255,255,0.07)"/>`; }).join("")}
    <polygon points="${poly}" fill="rgba(242,163,60,0.20)" stroke="#F2A33C" stroke-width="1.6"/>
    ${keys.map((k, i) => { const [x, y] = pt(i, R*values[i]); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" fill="${CATS[k].color}"/>`; }).join("")}
    ${keys.map((k, i) => { const [x, y] = pt(i, R + 20); return `<text x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}" text-anchor="middle" font-size="14">${CATS[k].icon}</text>`; }).join("")}
  </svg></div>
  <div class="radar-legend">Point fort : <b>${best.icon} ${best.label}</b> · Point faible : <b>${worst.icon} ${worst.label}</b></div>`;
}

/* ---------- GRAPHIQUE D'ÉVOLUTION ---------- */
let chartRange = 30;
function renderChart() {
  const pts = state.history.slice(-chartRange).map((h) => ({ d: h.d, xp: h.xp }));
  pts.push({ d: todayStr(), xp: state.totalXp }); // point du jour en cours
  const chips = [30, 90, 365].map((r) =>
    `<span class="chip ${chartRange===r?"on":""}" data-range="${r}">${r} J</span>`).join("");
  if (pts.length < 2) {
    return `<div style="margin-bottom:8px">${chips}</div>
      <div style="color:var(--muted);font-size:13px;padding:14px 0">La courbe apparaîtra à partir de demain — chaque jour clôturé ajoute un point. Reviens dans quelques jours.</div>`;
  }
  const W = 320, H = 130, P = 8;
  const min = Math.min(...pts.map((p) => p.xp)), max = Math.max(...pts.map((p) => p.xp));
  const span = Math.max(1, max - min);
  const X = (i) => P + (i * (W - 2*P)) / (pts.length - 1);
  const Y = (v) => H - P - ((v - min) * (H - 2*P)) / span;
  const line = pts.map((p, i) => `${X(i).toFixed(1)},${Y(p.xp).toFixed(1)}`).join(" ");
  const area = `${P},${H-P} ${line} ${(W-P).toFixed(1)},${H-P}`;
  return `<div style="margin-bottom:8px">${chips}</div>
    <svg viewBox="0 0 ${W} ${H}" width="100%">
      ${[0.25,0.5,0.75].map((f)=>`<line x1="${P}" y1="${(P+f*(H-2*P)).toFixed(1)}" x2="${W-P}" y2="${(P+f*(H-2*P)).toFixed(1)}" stroke="rgba(255,255,255,0.06)"/>`).join("")}
      <polygon points="${area}" fill="rgba(242,163,60,0.12)"/>
      <polyline points="${line}" fill="none" stroke="#F2A33C" stroke-width="2"/>
      <circle cx="${X(pts.length-1).toFixed(1)}" cy="${Y(pts[pts.length-1].xp).toFixed(1)}" r="3.5" fill="#FFC46B"/>
    </svg>
    <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--faint)">
      <span>${pts[0].d.slice(5).split("-").reverse().join("/")} · ${fmt(pts[0].xp)} XP</span>
      <span>Aujourd'hui · ${fmt(state.totalXp)} XP</span></div>`;
}

/* ---------- TAUX DE RÉUSSITE ---------- */
function renderSuccess() {
  const recent = state.history.slice(-30);
  if (!recent.length) return `<div style="color:var(--muted);font-size:13px">Les taux apparaîtront après quelques jours d'historique.</div>`;
  const agg = {};
  recent.forEach((h) => {
    (h.sched || []).forEach((id) => {
      agg[id] = agg[id] || { s: 0, d: 0 };
      agg[id].s++;
      if ((h.done || []).includes(id)) agg[id].d++;
    });
  });
  const rows = Object.entries(agg)
    .map(([id, v]) => ({ t: state.tasks.find((t) => t.id === id), rate: v.d / v.s, n: v.s }))
    .filter((r) => r.t)
    .sort((a, b) => a.rate - b.rate);
  if (!rows.length) return `<div style="color:var(--muted);font-size:13px">Pas encore de données.</div>`;
  const rm = recent.filter((h) => h.rm).length, rs = recent.filter((h) => h.rs).length;
  return rows.map((r) => {
    const pc = Math.round(r.rate * 100);
    const col = pc >= 80 ? "var(--green)" : pc >= 50 ? "var(--acc)" : "var(--red)";
    return `<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
      <div style="flex:1;font-size:13.5px">${CATS[r.t.cat].icon} ${r.t.name} <span style="color:var(--faint);font-size:11px">(${r.n}j)</span></div>
      <div style="width:70px" class="statbar"><div style="width:${pc}%;background:${col}"></div></div>
      <div class="rj" style="width:42px;text-align:right;font-weight:700;color:${col}">${pc}%</div></div>`;
  }).join("") + `<div style="font-size:12px;color:var(--muted);margin-top:8px">Routines sur ${recent.length}j : 🌅 ${Math.round(rm/recent.length*100)}% · 🌙 ${Math.round(rs/recent.length*100)}%</div>`;
}

/* ---------- UI ---------- */
const $ = (s) => document.querySelector(s);
let tab = "quests", editMode = false, editRoutines = false, showAdd = false, expandedCat = null;
let editingTaskId = null, editingRoutineItem = null, backlogEdit = null;
let form = { name: "", cat: "business", subcat: "", newSub: "", xp: 1, mode: "daily", days: [1] };
let prevLevel = null;

function toggleTask(id) {
  const t = state.tasks.find((x) => x.id === id); if (!t) return;
  const sk = t.subcat ? t.cat + "/" + t.subcat : null;
  if (state.doneToday[id]) {
    delete state.doneToday[id];
    gainXp(t.cat, sk, -t.xp);
    const i = state.log.findIndex((e) => e.tid === id && todayStr(new Date(e.ts)) === todayStr());
    if (i !== -1) state.log.splice(i, 1);
  } else {
    state.doneToday[id] = true;
    gainXp(t.cat, sk, t.xp);
    state.log.unshift({ ts: Date.now(), text: `${CATS[t.cat].icon} ${t.name}${t.subcat ? " · " + t.subcat : ""}`, xp: t.xp, tid: id });
    if (t.oneshot) state.tasks = state.tasks.filter((x) => x.id !== id);
  }
  state.log = state.log.slice(0, 120); save(); render();
}

function toggleRoutineItem(rk, iid) {
  const r = state.routines[rk];
  const wasComplete = routineComplete(r);
  r.done[iid] = !r.done[iid];
  if (!r.done[iid]) delete r.done[iid];
  const isComplete = routineComplete(r);
  if (!wasComplete && isComplete) {
    gainXp("discipline", null, 1);
    state.log.unshift({ ts: Date.now(), text: `${r.icon} ${r.label} complète`, xp: 1, rid: rk });
  } else if (wasComplete && !isComplete) {
    gainXp("discipline", null, -1);
    const i = state.log.findIndex((e) => e.rid === rk && todayStr(new Date(e.ts)) === todayStr());
    if (i !== -1) state.log.splice(i, 1);
  }
  save(); render();
}

function completeBacklog(id) {
  const b = state.backlog.find((x) => x.id === id); if (!b) return;
  gainXp(b.cat, null, b.xp);
  state.log.unshift({ ts: Date.now(), text: `📋 ${b.name}`, xp: b.xp });
  state.backlog = state.backlog.filter((x) => x.id !== id);
  save(); render();
}

function checkLevelUp() {
  const lvl = levelFromXp(state.totalXp);
  if (prevLevel !== null && lvl > prevLevel) {
    $("#overlay").innerHTML = `<div class="levelup">
      <div style="font-size:40px">▲</div>
      <div class="rj" style="font-size:13px;letter-spacing:4px;color:var(--acc);margin-top:8px;font-weight:700">PROMOTION — NIVEAU ${lvl}</div>
      <div class="rj" style="font-size:26px;font-weight:700;margin-top:6px;color:#fff;text-transform:uppercase;letter-spacing:1px">${TITLES[lvl-1]}</div>
      <div style="font-size:12px;color:var(--muted);margin-top:14px">Touche pour continuer</div></div>`;
    $("#overlay").classList.add("show");
  }
  prevLevel = lvl;
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `life-rpg-backup-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (typeof data.totalXp !== "number" || !Array.isArray(data.tasks)) throw new Error("format");
      state = normalize(data);
      processDayChange();
      prevLevel = levelFromXp(state.totalXp);
      state.log.unshift({ ts: Date.now(), text: "📦 Données importées", xp: 0 });
      save(); render();
    } catch { alert("Fichier invalide — utilise un export Life RPG (.json)."); }
  };
  reader.readAsText(file);
}

/* ---------- MODALES ---------- */
function openNightCheck() {
  const wd = new Date().getDay();
  const undoneQ = state.tasks.filter((t) => scheduledOn(t, wd) && !state.doneToday[t.id]);
  const undoneR = [];
  for (const rk of ["matin","soir"]) state.routines[rk].items.forEach((i) => { if (!state.routines[rk].done[i.id]) undoneR.push([rk, i]); });
  const activeB = state.backlog.filter((b) => b.status === "active");
  const rows =
    undoneQ.map((t) => `<div class="task" data-nq="${t.id}">
      <div class="check" style="border-color:${CATS[t.cat].color}"></div>
      <div style="flex:1"><div class="name">${t.name}</div><div class="meta">${CATS[t.cat].icon} ${CATS[t.cat].label}</div></div>
      <div class="xp-badge">+${fmt(t.xp)}</div></div>`).join("") +
    undoneR.map(([rk, i]) => `<div class="task" data-nr="${rk}:${i.id}">
      <div class="check" style="border-color:${rk==="matin"?"var(--acc)":"var(--purple)"}"></div>
      <div style="flex:1"><div class="name">${i.name}</div><div class="meta">${state.routines[rk].icon} ${state.routines[rk].label}</div></div></div>`).join("") +
    activeB.map((b) => `<div class="task" data-nb="${b.id}">
      <div class="check" style="border-color:${CATS[b.cat].color}"></div>
      <div style="flex:1"><div class="name">${b.name}</div><div class="meta">📋 Liste · ${CATS[b.cat].label}</div></div>
      <div class="xp-badge">+${fmt(b.xp)}</div></div>`).join("");
  $("#modal").innerHTML = `<div class="modal-card">
    <div class="modal-title">🌙 Check du soir <button class="x" id="modal-close">✕</button></div>
    <div style="font-size:12.5px;color:var(--muted);margin-bottom:8px">Tout ce qui reste à cocher aujourd'hui. Un tap = fait.</div>
    ${rows || `<div style="color:var(--green);font-size:15px;padding:14px 0">✓ Tout est fait. Journée parfaite, opérateur.</div>`}
  </div>`;
  $("#modal").classList.add("show");
  $("#modal-close").addEventListener("click", closeModal);
  document.querySelectorAll("[data-nq]").forEach((el) => el.addEventListener("click", () => { toggleTask(el.dataset.nq); openNightCheck(); }));
  document.querySelectorAll("[data-nr]").forEach((el) => el.addEventListener("click", () => { const [rk, iid] = el.dataset.nr.split(":"); toggleRoutineItem(rk, iid); openNightCheck(); }));
  document.querySelectorAll("[data-nb]").forEach((el) => el.addEventListener("click", () => { completeBacklog(el.dataset.nb); openNightCheck(); }));
}
function openPauseModal() {
  $("#modal").innerHTML = `<div class="modal-card">
    <div class="modal-title">⏸ Mode vie réelle <button class="x" id="modal-close">✕</button></div>
    <div style="font-size:13px;color:var(--muted);line-height:1.5;margin-bottom:10px">
      Gèle toutes les pénalités et le streak (maladie, vacances, imprévu). L'XP gagnée reste comptée.
      La discipline punit la flemme, pas la vie.</div>
    <input id="pause-reason" placeholder="Raison (ex: grippe, vacances Espagne…)" style="width:100%;background:#0C0E11;border:1px solid var(--line);color:var(--text);font-size:14px;padding:11px 12px;outline:none" />
    <button class="btn btn-primary" id="pause-go" style="width:100%;margin-top:12px">Activer la pause</button>
  </div>`;
  $("#modal").classList.add("show");
  $("#modal-close").addEventListener("click", closeModal);
  $("#pause-go").addEventListener("click", () => {
    state.pause = { active: true, reason: $("#pause-reason").value.trim() || "pause", since: todayStr() };
    state.log.unshift({ ts: Date.now(), text: `⏸ Mode vie réelle activé (${state.pause.reason})`, xp: 0 });
    save(); closeModal(); render();
  });
}
function resumePause() {
  state.log.unshift({ ts: Date.now(), text: `▶ Reprise après pause (${state.pause.reason})`, xp: 0 });
  state.pause = { active: false, reason: "", since: null };
  save(); render();
}
/* Remise à zéro totale — validation renforcée : il faut taper RESET */
function openResetModal() {
  $("#modal").innerHTML = `<div class="modal-card">
    <div class="modal-title" style="color:var(--red)">⚠ Remise à zéro totale <button class="x" id="modal-close">✕</button></div>
    <div style="font-size:13.5px;line-height:1.6;color:var(--muted)">
      Efface <b style="color:var(--text)">définitivement</b> toute ta progression : XP, niveaux, streak, quêtes,
      routines, listes, objectifs, compteurs, historique et journal. L'app repart au niveau 1, Zombie du Canapé.<br><br>
      Pense à <b style="color:var(--text)">exporter d'abord</b> si tu veux garder une trace.<br><br>
      Pour confirmer, tape <b style="color:var(--red)">RESET</b> :</div>
    <input id="reset-word" autocomplete="off" placeholder="Tape RESET" style="width:100%;background:#0C0E11;border:1px solid var(--line);color:var(--text);font-size:15px;padding:11px 12px;outline:none;margin-top:10px;letter-spacing:2px" />
    <div class="modal-actions">
      <button class="btn btn-ghost" id="reset-no" style="flex:1">Annuler</button>
      <button class="btn" id="reset-yes" disabled style="flex:1;background:var(--panel2);color:var(--faint);border:1px solid var(--line)">Tout effacer</button>
    </div></div>`;
  $("#modal").classList.add("show");
  $("#modal-close").addEventListener("click", closeModal);
  $("#reset-no").addEventListener("click", closeModal);
  const word = $("#reset-word"), yes = $("#reset-yes");
  word.addEventListener("input", () => {
    const ok = word.value.trim().toUpperCase() === "RESET";
    yes.disabled = !ok;
    yes.style.background = ok ? "var(--red)" : "var(--panel2)";
    yes.style.color = ok ? "#fff" : "var(--faint)";
    yes.style.border = ok ? "none" : "1px solid var(--line)";
  });
  yes.addEventListener("click", () => {
    if (word.value.trim().toUpperCase() !== "RESET") return;
    localStorage.removeItem(KEY);
    state = defaultState();
    save();
    prevLevel = 1;
    tab = "quests"; editMode = false; showAdd = false;
    closeModal(); render();
  });
}

function closeModal() { $("#modal").classList.remove("show"); $("#modal").innerHTML = ""; }

/* Confirmation avant toute suppression */
function confirmDialog(text, onYes) {
  $("#modal").innerHTML = `<div class="modal-card">
    <div class="modal-title">⚠ Confirmer <button class="x" id="modal-close">✕</button></div>
    <div style="font-size:14px;line-height:1.5;margin:4px 0 2px">${text}</div>
    <div class="modal-actions">
      <button class="btn btn-ghost" id="confirm-no" style="flex:1">Annuler</button>
      <button class="btn" id="confirm-yes" style="flex:1;background:var(--red);color:#fff">Supprimer</button>
    </div></div>`;
  $("#modal").classList.add("show");
  $("#modal-close").addEventListener("click", closeModal);
  $("#confirm-no").addEventListener("click", closeModal);
  $("#confirm-yes").addEventListener("click", () => { closeModal(); onYes(); });
}

/* ---------- RENDER ---------- */
function render() {
  checkLevelUp();
  const lvl = levelFromXp(state.totalXp);
  const cur = thr(lvl), next = lvl < MAX_LEVEL ? thr(lvl + 1) : null;
  const prog = next ? ((state.totalXp - cur) / (next - cur)) * 100 : 100;
  const wd = new Date().getDay();
  const muscle = Math.min(1, (state.catXp.sport || 0) / 120);
  const stage = stageFromLevel(lvl);
  const gate = activeGate();

  $("#header").innerHTML = `
    <div class="hdr-top">
      ${insignia(stage)}
      <div style="flex:1;min-width:0;padding-right:88px">
        <div class="lvl-eyebrow">NIV. ${lvl}/${MAX_LEVEL} — ${DAY_FULL[wd].toUpperCase()}</div>
        <div class="lvl-title">${TITLES[lvl-1]}</div>
      </div>
      <div class="hdr-actions">
        <span id="sync-dot" style="align-self:center;width:16px;text-align:center;font-size:14px"></span>
        <button id="btn-night" title="Check du soir">🌙</button>
        <button id="btn-pause" title="Mode vie réelle" style="${state.pause.active?"border-color:var(--acc);color:var(--acc)":""}">⏸</button>
      </div>
    </div>
    <div class="barline"><span class="lb">EXPÉRIENCE</span><span class="val">${fmt(state.totalXp)} / ${next ?? "MAX"}</span></div>
    <div class="xpbar"><div style="width:${Math.min(100,prog)}%"></div></div>
    ${gate ? `<div class="gate-lock">🔒 PALIER ${gate.lvl} VERROUILLÉ — ${gateMissing(gate)}</div>` : ""}
    ${state.pause.active ? `<div class="pause-banner">⏸ MODE VIE RÉELLE — pénalités gelées (${state.pause.reason})<button id="btn-resume">REPRENDRE</button></div>` : ""}`;
  $("#btn-night").addEventListener("click", openNightCheck);
  setSyncStatus(syncStatus);
  $("#btn-pause").addEventListener("click", () => state.pause.active ? resumePause() : openPauseModal());
  $("#btn-resume")?.addEventListener("click", resumePause);

  $("#nav").innerHTML = [["quests","🗡️","Quêtes"],["routines","☀️","Routines"],["lists","📋","Listes"],["hero","🎖️","Perso"],["track","📊","Suivi"]]
    .map(([id,ico,lb]) => `<button data-tab="${id}" class="${tab===id?"on":""}"><div class="ico">${ico}</div><div class="lb">${lb}</div></button>`).join("");

  const main = $("#main");

  /* ===== QUÊTES ===== */
  if (tab === "quests") {
    const todays = state.tasks.filter((t) => scheduledOn(t, wd));
    const ones = state.tasks.filter((t) => t.oneshot);
    const others = state.tasks.filter((t) => !t.oneshot && t.days !== null && !t.days.includes(wd));
    const activeB = state.backlog.filter((b) => b.status === "active");
    const done = todays.filter((t) => state.doneToday[t.id]).length;
    const t0 = new Date(); t0.setHours(0,0,0,0);
    const xpToday = round2(state.log.filter((e) => e.ts >= t0.getTime() && e.xp > 0).reduce((s, e) => s + e.xp, 0));
    const daysBadge = (t) => t.days === null ? "Tous les jours" : t.days.map((d) => DAY_LABELS[d]).join(" ");
    const card = (t, inactive = false) => {
      const isDone = !!state.doneToday[t.id]; const c = CATS[t.cat];
      return `<div class="task ${isDone?"done":""} ${inactive?"inactive":""}" data-task="${t.id}" data-inactive="${inactive?1:""}">
        ${inactive ? `<div style="width:22px;text-align:center;color:var(--faint)">▸</div>` : `<div class="check" style="border-color:${c.color};background:${isDone?c.color:"transparent"}">${isDone?"✓":""}</div>`}
        <div style="flex:1;min-width:0"><div class="name">${t.name}</div>
        <div class="meta">${c.icon} ${c.label}${t.subcat?" › "+t.subcat:""} · ${t.oneshot?"une fois":daysBadge(t)}</div></div>
        ${editMode ? `<span style="color:var(--acc);font-size:13px;margin-right:6px">✎</span><button class="btn-del" data-del="${t.id}">✕</button>`
          : `<div class="xp-badge ${isDone?"done":""}">${isDone?"+":"±"}${fmt(t.xp)}</div>`}</div>`;
    };
    main.innerHTML = `
      <div class="card">
        <div class="card-head"><div class="card-tag"></div><span class="card-title">Focus du jour</span></div>
        <div class="focus-grid">
          <div><div class="focus-num" style="color:var(--green)">${done}<small>/${todays.length}</small></div><div class="focus-lb">Quêtes</div></div>
          <div><div class="focus-num" style="color:var(--orange)">${state.streak || 0}<small>j</small></div><div class="focus-lb">🔥 Streak</div></div>
          <div><div class="focus-num" style="color:var(--acc2)">${fmt(xpToday)}</div><div class="focus-lb">XP du jour</div></div>
        </div>
      </div>
      ${activeB.length ? `<div class="card" style="border-color:rgba(242,163,60,.4)">
        <div class="card-head"><div class="card-tag"></div><span class="card-title">Objectifs actifs</span><span class="count">${activeB.length}</span></div>
        ${activeB.map((b) => {
          const days = b.activatedOn ? daysBetweenStr(b.activatedOn, todayStr()) : 0;
          return `<div class="task" data-bdone="${b.id}">
            <div class="check" style="border-color:${CATS[b.cat].color}"></div>
            <div style="flex:1"><div class="name">${b.name}</div>
            <div class="meta">${CATS[b.cat].icon} ${CATS[b.cat].label} · actif depuis ${days}j${days >= 1 ? ` · <span style="color:var(--red)">−${fmt(b.xp*0.2)}/j</span>` : ""}</div></div>
            <div class="xp-badge">+${fmt(b.xp)}</div></div>`;
        }).join("")}</div>` : ""}
      <div class="card">
        <div class="card-head"><div class="card-tag"></div><span class="card-title">Quêtes du jour</span><span class="count ${done===todays.length&&todays.length?"ok":""}">${done}/${todays.length}</span></div>
        ${todays.length ? todays.map((t)=>card(t)).join("") : `<div style="color:var(--muted)">Aucune quête prévue aujourd'hui.</div>`}
      </div>
      ${ones.length ? `<div class="card">
        <div class="card-head"><div class="card-tag" style="background:var(--cyan)"></div><span class="card-title">Quêtes ponctuelles</span><span class="count">${ones.length}</span></div>
        ${ones.map((t)=>card(t)).join("")}</div>` : ""}
      ${others.length ? `<div class="card" style="opacity:.85">
        <div class="card-head"><div class="card-tag" style="background:var(--faint)"></div><span class="card-title" style="color:var(--muted)">Autres jours</span></div>
        ${others.map((t)=>card(t,true)).join("")}</div>` : ""}
      <div class="btn-row">
        <button class="btn btn-primary" id="btn-add">${showAdd?"Fermer":"+ Nouvelle quête"}</button>
        <button class="btn btn-ghost" id="btn-edit">${editMode?"Terminé":"Modifier"}</button></div>
      ${showAdd ? renderAddForm() : ""}`;
    bindQuests();
    main.querySelectorAll("[data-bdone]").forEach((el) => el.addEventListener("click", () => completeBacklog(el.dataset.bdone)));
  }

  /* ===== ROUTINES ===== */
  if (tab === "routines") {
    const rcard = (rk) => {
      const r = state.routines[rk];
      const doneN = r.items.filter((i) => r.done[i.id]).length;
      const complete = routineComplete(r);
      const col = rk === "matin" ? "var(--acc)" : "var(--purple)";
      return `<div class="card">
        <div class="card-head routine-head">
          <div class="card-tag" style="background:${col}"></div>
          <span class="card-title">${r.icon} ${r.label}</span>
          ${r.total ? `<span style="font-size:12px;color:var(--faint)">${r.total}</span>` : ""}
          <span class="routine-status" style="color:${complete?"var(--green)":"var(--muted)"}">${complete?"✓ COMPLÈTE +1 XP":doneN+"/"+r.items.length}</span>
        </div>
        ${r.items.map((i, idx) => {
          if (editingRoutineItem === rk + ":" + i.id) {
            return `<div class="row" style="margin:6px 0">
              <input id="rin-name" value="${i.name.replace(/"/g,"&quot;")}" style="flex:2;background:#0C0E11;border:1px solid var(--acc);color:var(--text);padding:9px 10px;font-size:14px;outline:none" />
              <input id="rin-dur" value="${(i.dur||"").replace(/"/g,"&quot;")}" placeholder="durée" style="flex:1;background:#0C0E11;border:1px solid var(--line);color:var(--text);padding:9px 10px;font-size:13px;outline:none" />
              <button class="mini-btn" data-rsave="${rk}:${i.id}" style="color:var(--green);border-color:var(--green)">✓</button></div>`;
          }
          return `<div class="task ${r.done[i.id]?"done":""}" data-ritem="${rk}:${i.id}">
          <div class="check" style="border-color:${col};background:${r.done[i.id]?col:"transparent"}">${r.done[i.id]?"✓":""}</div>
          <div style="flex:1"><div class="name">${i.name}</div></div>
          ${editRoutines
            ? `<button class="mini-btn" data-rup="${rk}:${idx}" ${idx===0?"disabled style='opacity:.3'":""}>↑</button>
               <button class="mini-btn" data-rdown="${rk}:${idx}" ${idx===r.items.length-1?"disabled style='opacity:.3'":""}>↓</button>
               <button class="mini-btn" data-redit="${rk}:${i.id}" style="color:var(--acc)">✎</button>
               <button class="btn-del" data-rdel="${rk}:${i.id}" style="margin-left:0">✕</button>`
            : (i.dur ? `<span style="font-size:12px;color:var(--faint);white-space:nowrap">${i.dur}</span>` : "")}
        </div>`;}).join("")}
        ${editRoutines ? `<div class="row"><input placeholder="+ Ajouter une étape…" data-radd-input="${rk}"
          style="flex:1;background:#0C0E11;border:1px solid var(--line);color:var(--text);padding:10px 12px;font-size:14px;outline:none" />
          <button class="btn btn-ghost" data-radd="${rk}" style="padding:10px 14px">OK</button></div>` : ""}
      </div>`;
    };
    main.innerHTML = `
      ${rcard("matin")}
      ${rcard("soir")}
      <div class="hint" style="margin:2px 2px 12px">Routine 100% cochée = <b style="color:var(--green)">+1 XP Discipline</b>. Incomplète en fin de journée = <b style="color:var(--red)">−0,5 XP</b>.</div>
      <button class="btn btn-ghost" id="btn-edit-routines" style="width:100%">${editRoutines?"Terminé":"Modifier les routines"}</button>`;
    main.querySelectorAll("[data-ritem]").forEach((el) => el.addEventListener("click", (e) => {
      if (e.target.closest("[data-rdel],[data-redit],[data-rup],[data-rdown]")) return;
      if (editRoutines) return;
      const [rk, iid] = el.dataset.ritem.split(":"); toggleRoutineItem(rk, iid);
    }));
    main.querySelectorAll("[data-rdel]").forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      const [rk, iid] = b.dataset.rdel.split(":");
      const r = state.routines[rk];
      const item = r.items.find((i) => i.id === iid);
      confirmDialog(`Supprimer l'étape « ${item ? item.name : ""} » de la ${r.label.toLowerCase()} ?`, () => {
        r.items = r.items.filter((i) => i.id !== iid); delete r.done[iid];
        save(); render();
      });
    }));
    main.querySelectorAll("[data-redit]").forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation(); editingRoutineItem = b.dataset.redit; render();
    }));
    main.querySelectorAll("[data-rsave]").forEach((b) => b.addEventListener("click", () => {
      const [rk, iid] = b.dataset.rsave.split(":");
      const item = state.routines[rk].items.find((i) => i.id === iid);
      const nm = $("#rin-name").value.trim(); const du = $("#rin-dur").value.trim();
      if (nm) item.name = nm;
      if (du) item.dur = du; else delete item.dur;
      editingRoutineItem = null; save(); render();
    }));
    const move = (rk, idx, dir) => {
      const items = state.routines[rk].items;
      const j = idx + dir; if (j < 0 || j >= items.length) return;
      [items[idx], items[j]] = [items[j], items[idx]];
      save(); render();
    };
    main.querySelectorAll("[data-rup]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); const [rk, i] = b.dataset.rup.split(":"); move(rk, Number(i), -1); }));
    main.querySelectorAll("[data-rdown]").forEach((b) => b.addEventListener("click", (e) => { e.stopPropagation(); const [rk, i] = b.dataset.rdown.split(":"); move(rk, Number(i), 1); }));
    main.querySelectorAll("[data-radd]").forEach((b) => b.addEventListener("click", () => {
      const rk = b.dataset.radd;
      const input = main.querySelector(`[data-radd-input="${rk}"]`);
      if (!input.value.trim()) return;
      state.routines[rk].items.push({ id: "r" + Date.now(), name: input.value.trim() });
      save(); render();
    }));
    $("#btn-edit-routines").addEventListener("click", () => { editRoutines = !editRoutines; editingRoutineItem = null; render(); });
  }

  /* ===== LISTES (backlog + objectifs) ===== */
  if (tab === "lists") {
    const statusChip = (b) => b.status === "active"
      ? `<span class="status-chip" style="color:var(--green);border-color:var(--green)">ACTIF</span>`
      : b.status === "paused"
      ? `<span class="status-chip" style="color:var(--acc);border-color:var(--acc)">⏸ PAUSE</span>`
      : `<span class="status-chip" style="color:var(--faint);border-color:var(--line)">EN ATTENTE</span>`;
    const byCat = {};
    state.backlog.forEach((b) => { (byCat[b.cat] = byCat[b.cat] || []).push(b); });
    main.innerHTML = `
      <div class="card">
        <div class="card-head"><div class="card-tag"></div><span class="card-title">🎯 Objectifs</span></div>
        ${state.goals.length ? state.goals.map((g) => `
          <div style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <span style="flex:1;font-size:14px">${CATS[g.cat].icon} ${g.name}</span>
              <button class="mini-btn" data-gminus="${g.id}">−</button>
              <span class="rj" style="width:44px;text-align:center;font-weight:700;color:var(--acc2)">${g.progress}%</span>
              <button class="mini-btn" data-gplus="${g.id}">+</button>
              ${g.progress >= 100 ? `<button class="mini-btn" data-gdone="${g.id}" style="color:var(--green);border-color:var(--green)">✓</button>` : `<button class="btn-del" data-gdel="${g.id}" style="margin-left:0">✕</button>`}
            </div>
            <div class="goal-bar"><div style="width:${g.progress}%"></div></div>
          </div>`).join("") : `<div style="color:var(--muted);font-size:13px;margin-bottom:8px">Optionnel. Ajoute un objectif seulement si tu en as un (ex: « Gros œuvre terminé »). Terminé = +5 XP.</div>`}
        <div class="quickadd" style="margin-top:10px">
          <input id="goal-name" placeholder="+ Nouvel objectif (optionnel)" />
          <select id="goal-cat">${Object.entries(CATS).map(([k,c])=>`<option value="${k}">${c.icon} ${c.label}</option>`).join("")}</select>
          <button class="mini-btn" id="goal-add" style="width:40px;height:40px;color:var(--acc);border-color:var(--acc)">＋</button>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div class="card-tag" style="background:var(--cyan)"></div><span class="card-title">📋 Listes par catégorie</span></div>
        <div style="font-size:12.5px;color:var(--muted);margin-bottom:10px">Vide ta tête ici (1 XP par défaut, tap pour modifier). <b style="color:var(--text)">Activer</b> = passe dans tes quêtes du jour ; laissé traîner = <b style="color:var(--red)">−20% de son XP/jour</b> dès le lendemain. ⏸ = gelé sans pénalité.</div>
        <div class="quickadd">
          <input id="bl-name" placeholder="+ Ajouter (ex: Appeler le notaire)" />
          <select id="bl-cat">${Object.entries(CATS).map(([k,c])=>`<option value="${k}">${c.icon} ${c.label}</option>`).join("")}</select>
          <button class="mini-btn" id="bl-add" style="width:40px;height:40px;color:var(--acc);border-color:var(--acc)">＋</button>
        </div>
      </div>
      ${Object.entries(byCat).map(([k, items]) => `
        <div class="card">
          <div class="card-head"><div class="card-tag" style="background:${CATS[k].color}"></div><span class="card-title">${CATS[k].icon} ${CATS[k].label}</span><span class="count">${items.length}</span></div>
          ${items.map((b) => backlogEdit === b.id ? `
            <div class="row" style="margin:6px 0">
              <input id="bl-edit-name" value="${b.name.replace(/"/g,"&quot;")}" style="flex:2;background:#0C0E11;border:1px solid var(--acc);color:var(--text);padding:9px 10px;font-size:14px;outline:none" />
              <select id="bl-edit-xp" style="width:84px;background:#0C0E11;border:1px solid var(--line);color:var(--text);padding:9px 6px;font-size:13px">${[0.5,1,1.5,2,3,5].map((v)=>`<option value="${v}" ${b.xp==v?"selected":""}>${fmt(v)} XP</option>`).join("")}</select>
              <button class="mini-btn" data-blsave="${b.id}" style="color:var(--green);border-color:var(--green)">✓</button>
            </div>` : `
            <div class="task" data-bledit="${b.id}" style="cursor:pointer">
              <div style="flex:1;min-width:0"><div class="name" style="font-size:14px">${b.name}</div>
              <div class="meta">${statusChip(b)} · ${fmt(b.xp)} XP${b.status==="active"&&b.activatedOn?` · depuis ${daysBetweenStr(b.activatedOn, todayStr())}j`:""}</div></div>
              ${b.status !== "active" ? `<button class="mini-btn" data-blact="${b.id}" style="color:var(--green);border-color:var(--green)" title="Activer">▶</button>` : ""}
              ${b.status === "active" ? `<button class="mini-btn" data-blpause="${b.id}" style="color:var(--acc)" title="Pause">⏸</button>` : ""}
              ${b.status === "paused" ? "" : ""}
              <button class="btn-del" data-bldel="${b.id}" style="margin-left:0">✕</button>
            </div>`).join("")}
        </div>`).join("")}`;
    const addBl = () => {
      const name = $("#bl-name").value.trim(); if (!name) return;
      state.backlog.push({ id: "bl" + Date.now(), name, cat: $("#bl-cat").value, xp: 1, status: "wait", activatedOn: null });
      save(); render();
    };
    $("#bl-add").addEventListener("click", addBl);
    $("#bl-name").addEventListener("keydown", (e) => { if (e.key === "Enter") addBl(); });
    $("#goal-add").addEventListener("click", () => {
      const name = $("#goal-name").value.trim(); if (!name) return;
      state.goals.push({ id: "g" + Date.now(), name, cat: $("#goal-cat").value, progress: 0 });
      save(); render();
    });
    main.querySelectorAll("[data-blact]").forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      const item = state.backlog.find((x) => x.id === b.dataset.blact);
      item.status = "active"; item.activatedOn = todayStr();
      save(); render();
    }));
    main.querySelectorAll("[data-blpause]").forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      const item = state.backlog.find((x) => x.id === b.dataset.blpause);
      item.status = "paused"; item.activatedOn = null;
      save(); render();
    }));
    main.querySelectorAll("[data-bldel]").forEach((b) => b.addEventListener("click", (e) => {
      e.stopPropagation();
      const item = state.backlog.find((x) => x.id === b.dataset.bldel);
      confirmDialog(`Supprimer « ${item ? item.name : ""} » de la liste ?`, () => {
        state.backlog = state.backlog.filter((x) => x.id !== b.dataset.bldel); save(); render();
      });
    }));
    main.querySelectorAll("[data-bledit]").forEach((el) => el.addEventListener("click", (e) => {
      if (e.target.closest("[data-blact],[data-blpause],[data-bldel]")) return;
      backlogEdit = el.dataset.bledit; render();
    }));
    main.querySelectorAll("[data-blsave]").forEach((b) => b.addEventListener("click", () => {
      const item = state.backlog.find((x) => x.id === b.dataset.blsave);
      const nm = $("#bl-edit-name").value.trim();
      if (nm) item.name = nm;
      item.xp = Number($("#bl-edit-xp").value);
      backlogEdit = null; save(); render();
    }));
    main.querySelectorAll("[data-gplus]").forEach((b) => b.addEventListener("click", () => {
      const g = state.goals.find((x) => x.id === b.dataset.gplus);
      g.progress = Math.min(100, g.progress + 10); save(); render();
    }));
    main.querySelectorAll("[data-gminus]").forEach((b) => b.addEventListener("click", () => {
      const g = state.goals.find((x) => x.id === b.dataset.gminus);
      g.progress = Math.max(0, g.progress - 10); save(); render();
    }));
    main.querySelectorAll("[data-gdone]").forEach((b) => b.addEventListener("click", () => {
      const g = state.goals.find((x) => x.id === b.dataset.gdone);
      gainXp(g.cat, null, 5);
      state.log.unshift({ ts: Date.now(), text: `🎯 Objectif atteint : ${g.name}`, xp: 5 });
      state.goals = state.goals.filter((x) => x.id !== g.id);
      save(); render();
    }));
    main.querySelectorAll("[data-gdel]").forEach((b) => b.addEventListener("click", () => {
      const g = state.goals.find((x) => x.id === b.dataset.gdel);
      confirmDialog(`Abandonner l'objectif « ${g ? g.name : ""} » ?`, () => {
        state.goals = state.goals.filter((x) => x.id !== b.dataset.gdel); save(); render();
      });
    }));
  }

  /* ===== PERSO ===== */
  if (tab === "hero") {
    main.innerHTML = `
      <div class="card" style="padding:0;overflow:hidden">
        <div class="avatar-box">${drawAvatar(stage, muscle)}</div>
        <div style="padding:0 15px 14px">
          <div class="hero-title">${TITLES[lvl-1]}</div>
          <div class="hero-sub">💪 Carrure ${Math.round(muscle*100)}% (XP Force) · Tenue ${stage}/6${next ? ` · Prochain grade : ${TITLES[lvl]}` : " · GRADE MAXIMUM"}</div>
        </div>
      </div>
      ${gate ? `<div class="card" style="border-color:rgba(229,96,79,.5)">
        <div class="card-head"><div class="card-tag" style="background:var(--red)"></div><span class="card-title" style="color:var(--red)">Palier ${gate.lvl} verrouillé</span></div>
        <div style="font-size:13.5px;line-height:1.55;color:var(--muted)">Condition : <b style="color:var(--text)">${gate.label}</b>.<br>${gateMissing(gate)}</div>
      </div>` : ""}
      <div class="card">
        <div class="card-head"><div class="card-tag"></div><span class="card-title">Performance</span></div>
        ${renderRadar()}
      </div>
      <div class="card">
        <div class="card-head"><div class="card-tag" style="background:var(--purple)"></div><span class="card-title">Attributs</span></div>
        ${Object.entries(CATS).map(([k,c]) => {
          const xp = state.catXp[k] || 0, rank = rankOf(xp), pct = ((xp%10)/10)*100;
          const subs = state.subcats[k] || [];
          return `<div class="stat" data-cat="${k}">
            <div class="icon">${c.icon}</div>
            <div style="flex:1"><div class="top"><span class="nm">${c.label} ${subs.length?`<span style="color:var(--faint)">${expandedCat===k?"▾":"▸"}</span>`:""}</span>
            <span class="rk" style="color:${c.color}">RANG ${rank} · ${fmt(xp)} XP</span></div>
            <div class="statbar"><div style="width:${pct}%;background:${c.color}"></div></div></div></div>
            ${expandedCat===k ? subs.map((s)=>`<div class="substat"><span>› ${s}</span><span style="color:${c.color}">${fmt(state.subXp[k+"/"+s]||0)} XP</span></div>`).join("") : ""}`;
        }).join("")}
      </div>`;
    main.querySelectorAll(".stat").forEach((el) => el.addEventListener("click", () => { expandedCat = expandedCat===el.dataset.cat?null:el.dataset.cat; render(); }));
  }

  /* ===== SUIVI ===== */
  if (tab === "track") {
    main.innerHTML = `
      <div class="card">
        <div class="card-head"><div class="card-tag"></div><span class="card-title">📈 Évolution</span></div>
        <div id="chart-zone">${renderChart()}</div>
      </div>
      <div class="card">
        <div class="card-head"><div class="card-tag" style="background:var(--green)"></div><span class="card-title">Taux de réussite (30j)</span></div>
        ${renderSuccess()}
      </div>
      <div class="card">
        <div class="card-head"><div class="card-tag" style="background:var(--cyan)"></div><span class="card-title">Jours sans…</span></div>
        ${state.counters.length ? state.counters.map((c) => {
          const days = daysBetweenStr(c.since, todayStr());
          return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
            <div style="flex:1;font-size:14px">${CATS[c.cat].icon} ${c.name}</div>
            <div class="rj" style="font-size:22px;font-weight:700;color:var(--acc2)">${days}<span style="font-size:12px;color:var(--muted)">j</span></div>
            <button class="mini-btn" data-creset="${c.id}" title="J'ai craqué (remise à zéro)" style="color:var(--red)">↺</button>
            <button class="btn-del" data-cdel="${c.id}" style="margin-left:0">✕</button>
          </div>`;
        }).join("") : `<div style="color:var(--muted);font-size:13px;margin-bottom:8px">Pour casser une mauvaise habitude : « sans malbouffe », « sans excès WoW »… Bonus à 7 / 30 / 100 jours. Remise à zéro manuelle et honnête.</div>`}
        <div class="quickadd" style="margin-top:10px">
          <input id="cnt-name" placeholder="+ Jours sans… (ex: malbouffe)" />
          <select id="cnt-cat">${Object.entries(CATS).map(([k,c])=>`<option value="${k}" ${k==="sante"?"selected":""}>${c.icon} ${c.label}</option>`).join("")}</select>
          <button class="mini-btn" id="cnt-add" style="width:40px;height:40px;color:var(--acc);border-color:var(--acc)">＋</button>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><div class="card-tag" style="background:var(--gold)"></div><span class="card-title">Journal d'opération</span></div>
        ${state.log.slice(0, 30).map((e) => `<div class="logrow">
          <div style="flex:1"><div style="font-size:14px">${e.text}</div>
          <div class="when">${new Date(e.ts).toLocaleDateString("fr-BE",{day:"numeric",month:"short"})} · ${new Date(e.ts).toLocaleTimeString("fr-BE",{hour:"2-digit",minute:"2-digit"})}</div></div>
          ${e.xp ? `<div class="logxp" style="color:${e.xp>0?"var(--green)":"var(--red)"}">${e.xp>0?"+":""}${fmt(e.xp)}</div>` : ""}</div>`).join("")}
      </div>
      <div class="card">
        <div class="card-head"><div class="card-tag" style="background:var(--blue)"></div><span class="card-title">☁ Sauvegarde en ligne</span></div>
        ${syncCfg && syncCfg.gistId ? `
          <div style="font-size:13.5px;color:var(--green);margin-bottom:8px">✓ Connectée à ton compte GitHub${syncLast ? ` · dernière sync ${new Date(syncLast).toLocaleTimeString("fr-BE",{hour:"2-digit",minute:"2-digit"})}` : ""}</div>
          <div class="hint" style="margin:0 0 10px">Ta progression est sauvegardée automatiquement dans un Gist privé quelques secondes après chaque action, et récupérée à l'ouverture sur tous tes appareils connectés avec le même token.</div>
          <div class="row" style="margin-top:0">
            <button class="btn btn-ghost" id="btn-sync-now" style="flex:1">⟳ Forcer la sync</button>
            <button class="btn btn-ghost" id="btn-sync-off" style="flex:1;color:var(--red)">Déconnecter</button>
          </div>`
        : `
          <div class="hint" style="margin:0 0 10px">Sauvegarde automatique + même progression sur tous tes appareils, via un Gist GitHub <b style="color:var(--text)">privé</b>. Colle un token GitHub (classique, scope « gist » uniquement) — voir GUIDE-SYNC.md.</div>
          <div class="quickadd">
            <input id="sync-token" type="password" placeholder="ghp_… (token GitHub)" autocomplete="off" />
            <button class="mini-btn" id="btn-sync-connect" style="width:auto;padding:0 14px;color:var(--acc);border-color:var(--acc);font-family:'Rajdhani';font-weight:700;letter-spacing:1px">CONNECTER</button>
          </div>`}
      </div>
      <div class="card">
        <div class="card-head"><div class="card-tag" style="background:var(--steel)"></div><span class="card-title">Données</span></div>
        <div class="row" style="margin-top:0">
          <button class="btn btn-ghost" id="btn-export" style="flex:1">⬇ Exporter (.json)</button>
          <button class="btn btn-ghost" id="btn-import" style="flex:1">⬆ Importer</button>
        </div>
        <div class="hint">Sauvegarde complète. Transfert PC → téléphone, ou avant de vider le cache.</div>
        <div style="text-align:center;margin-top:14px">
          <button id="btn-reset" style="background:none;border:none;color:var(--faint);font-size:11.5px;text-decoration:underline;cursor:pointer;letter-spacing:.5px">Réinitialiser l'application</button>
          <div style="color:var(--faint);font-size:11px;margin-top:8px;letter-spacing:1px">LIFE RPG v${APP_VERSION}</div>
        </div>
      </div>`;
    main.querySelectorAll("[data-range]").forEach((c) => c.addEventListener("click", () => { chartRange = Number(c.dataset.range); render(); }));
    const addCnt = () => {
      const name = $("#cnt-name").value.trim(); if (!name) return;
      state.counters.push({ id: "c" + Date.now(), name, cat: $("#cnt-cat").value, since: todayStr(), milestones: [] });
      save(); render();
    };
    $("#cnt-add").addEventListener("click", addCnt);
    $("#cnt-name").addEventListener("keydown", (e) => { if (e.key === "Enter") addCnt(); });
    main.querySelectorAll("[data-creset]").forEach((b) => b.addEventListener("click", () => {
      const c = state.counters.find((x) => x.id === b.dataset.creset);
      confirmDialog(`Remettre « ${c.name} » à zéro (${daysBetweenStr(c.since, todayStr())} jours) ?`, () => {
        state.log.unshift({ ts: Date.now(), text: `↺ ${c.name} : remise à zéro après ${daysBetweenStr(c.since, todayStr())}j`, xp: 0 });
        c.since = todayStr(); c.milestones = [];
        save(); render();
      });
    }));
    main.querySelectorAll("[data-cdel]").forEach((b) => b.addEventListener("click", () => {
      const c = state.counters.find((x) => x.id === b.dataset.cdel);
      confirmDialog(`Supprimer le compteur « ${c ? c.name : ""} » ?`, () => {
        state.counters = state.counters.filter((x) => x.id !== b.dataset.cdel); save(); render();
      });
    }));
    $("#btn-export").addEventListener("click", exportData);
    $("#btn-import").addEventListener("click", () => $("#import-file").click());
    $("#btn-reset").addEventListener("click", openResetModal);
    $("#btn-sync-connect")?.addEventListener("click", () => {
      const tk = $("#sync-token").value.trim();
      if (tk) syncConnect(tk);
    });
    $("#btn-sync-now")?.addEventListener("click", async () => { await syncPushNow(); await syncPull(false); render(); });
    $("#btn-sync-off")?.addEventListener("click", () => confirmDialog("Déconnecter la sauvegarde en ligne ? (ta progression locale est conservée, le Gist n'est pas supprimé)", syncDisconnect));
  }

  $("#nav").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.tab; render(); }));
}

function renderAddForm() {
  const subs = state.subcats[form.cat] || [];
  return `<div class="card form" id="add-form" style="margin-top:12px">
    <div class="card-head"><div class="card-tag"></div><span class="card-title">${editingTaskId ? "Modifier la quête" : "Nouvelle quête"}</span></div>
    <input id="f-name" placeholder="Nom de la quête (ex: Fractionné piste)" value="${form.name.replace(/"/g,"&quot;")}" />
    <div class="row">
      <select id="f-cat" style="flex:1">${Object.entries(CATS).map(([k,c])=>`<option value="${k}" ${form.cat===k?"selected":""}>${c.icon} ${c.label}</option>`).join("")}</select>
      <select id="f-xp" style="width:96px">${[0.2,0.3,0.5,1,1.5,2,3,5].map((v)=>`<option value="${v}" ${form.xp==v?"selected":""}>${fmt(v)} XP</option>`).join("")}</select></div>
    <div class="row">
      <select id="f-sub" style="flex:1"><option value="">— Sans sous-catégorie —</option>${subs.map((s)=>`<option ${form.subcat===s?"selected":""}>${s}</option>`).join("")}</select>
      <input id="f-newsub" style="flex:1" placeholder="+ Nouvelle sous-cat." value="${form.newSub.replace(/"/g,"&quot;")}" /></div>
    <div class="row">${[["daily","Tous les jours"],["days","Jours précis"],["once","Une fois"]].map(([k,lb])=>`<button class="toggle ${form.mode===k?"on":""}" data-mode="${k}">${lb}</button>`).join("")}</div>
    ${form.mode==="days" ? `<div class="row" style="justify-content:space-between">${[1,2,3,4,5,6,0].map((d)=>`<button class="daychip ${form.days.includes(d)?"on":""}" data-day="${d}">${DAY_LABELS[d]}</button>`).join("")}</div>` : ""}
    <button class="btn btn-primary" id="f-submit" style="width:100%;margin-top:12px">${editingTaskId ? "Enregistrer" : "Ajouter la quête"}</button></div>`;
}

function bindQuests() {
  document.querySelectorAll("[data-task]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-del]")) return;
      const id = el.dataset.task;
      if (el.dataset.inactive && !editMode) return;
      if (editMode) { // édition : ouvrir le formulaire pré-rempli
        const t = state.tasks.find((x) => x.id === id); if (!t) return;
        editingTaskId = id;
        form = { name: t.name, cat: t.cat, subcat: t.subcat || "", newSub: "",
          xp: t.xp, mode: t.oneshot ? "once" : t.days === null ? "daily" : "days", days: t.days ? [...t.days] : [1] };
        showAdd = true; render();
        return;
      }
      toggleTask(id);
    });
  });
  document.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", (e) => {
    e.stopPropagation();
    const t = state.tasks.find((x) => x.id === b.dataset.del);
    confirmDialog(`Supprimer la quête « ${t ? t.name : ""} » ?`, () => {
      state.tasks = state.tasks.filter((x) => x.id !== b.dataset.del); save(); render();
    });
  }));
  $("#btn-add")?.addEventListener("click", () => { showAdd = !showAdd; if (!showAdd) editingTaskId = null; render(); });
  $("#btn-edit")?.addEventListener("click", () => { editMode = !editMode; if (!editMode) { editingTaskId = null; showAdd = false; } render(); });
  const f = $("#add-form"); if (!f) return;
  const grab = () => { form.name = $("#f-name").value; form.newSub = $("#f-newsub").value; form.subcat = $("#f-sub").value; form.xp = $("#f-xp").value; };
  $("#f-cat").addEventListener("change", (e) => { grab(); form.cat = e.target.value; form.subcat = ""; form.newSub = ""; render(); });
  f.querySelectorAll("[data-mode]").forEach((b) => b.addEventListener("click", () => { grab(); form.mode = b.dataset.mode; render(); }));
  f.querySelectorAll("[data-day]").forEach((b) => b.addEventListener("click", () => {
    grab(); const d = Number(b.dataset.day);
    form.days = form.days.includes(d) ? form.days.filter((x) => x !== d) : [...form.days, d];
    render();
  }));
  $("#f-submit").addEventListener("click", () => {
    grab(); if (!form.name.trim()) return;
    let subcat = form.subcat || null;
    if (form.newSub.trim()) {
      subcat = form.newSub.trim();
      const list = state.subcats[form.cat] || [];
      if (!list.includes(subcat)) state.subcats[form.cat] = [...list, subcat];
    }
    const fields = { name: form.name.trim(), cat: form.cat, subcat, xp: Number(form.xp),
      days: form.mode === "daily" ? null : form.mode === "days" ? [...form.days].sort() : [], oneshot: form.mode === "once" };
    if (editingTaskId) {
      const t = state.tasks.find((x) => x.id === editingTaskId);
      if (t) Object.assign(t, fields);
      editingTaskId = null;
    } else {
      state.tasks.push({ id: "t" + Date.now(), ...fields });
    }
    form = { name: "", cat: "business", subcat: "", newSub: "", xp: 1, mode: "daily", days: [1] };
    showAdd = false; save(); render();
  });
}

$("#overlay").addEventListener("click", () => $("#overlay").classList.remove("show"));
$("#import-file").addEventListener("change", (e) => { if (e.target.files[0]) importData(e.target.files[0]); e.target.value = ""; });

/* ---------- BOOT ---------- */
load();
loadSyncCfg();
processDayChange();
prevLevel = levelFromXp(state.totalXp);
render();
if (syncCfg && syncCfg.gistId) syncPull(false);
setInterval(() => { const b = state.lastDate; processDayChange(); if (state.lastDate !== b) render(); }, 60000);
document.addEventListener("visibilitychange", () => { if (!document.hidden) { const b = state.lastDate; processDayChange(); if (state.lastDate !== b) render(); if (syncCfg && syncCfg.gistId) syncPull(false); } });
