/* ============ MODO ON 633 · lógica de la aplicación ============
   Todo se guarda en localStorage (en el celular de cada estudiante).
   No hay servidor, cuentas ni contraseñas. */
'use strict';

/* ---------- Utilidades ---------- */
const KEY = 'modoon633_v1';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const fmtISO = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const todayStr = () => fmtISO(new Date());
const parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 864e5);
const addDays = (iso, n) => { const d = parseISO(iso); d.setDate(d.getDate() + n); return fmtISO(d); };
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DIAS = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const dateLong = iso => { const d = parseISO(iso); return d.getDate() + ' de ' + MESES[d.getMonth()]; };
const fmtAvg = n => n.toFixed(1).replace('.', ',');
const isCol = c => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c);
const str = (s, n) => String(s == null ? '' : s).slice(0, n);
const isDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(parseISO(s));
const cleanId = s => { const c = String(s || '').replace(/[^\w-]/g, '').slice(0, 24); return c || uid(); };

/* ---------- Catálogos ---------- */
const COLORS = ['#8b5cf6','#2f6bff','#22d3ee','#ff3dcb','#34d399','#fbbf24','#fb7185','#a3e635','#38bdf8','#f97316'];
const FREQ = ['Matemática','Lengua y Literatura','Inglés','Historia','Geografía','Biología','Física','Química','Educación Física','Educación Artística','Informática','Taller','Dibujo Técnico'];
const TYPES = {
  tp:   { n: 'Trabajo práctico', art: 'un trabajo práctico', ic: '📝' },
  eval: { n: 'Evaluación',       art: 'una evaluación',      ic: '🧪' },
  rec:  { n: 'Recuperatorio',    art: 'un recuperatorio',    ic: '🔁' },
  otra: { n: 'Otra actividad',   art: 'una actividad',       ic: '📌' }
};
const STATUS = { pend: 'Pendiente', proc: 'En proceso', ent: 'Entregado', real: 'Realizado' };
const isDone = a => a.status === 'ent' || a.status === 'real';

/* Avatares: 24 figuras vectoriales originales, sin rasgos de género */
const PAL = [['#8b5cf6','#22d3ee'],['#ff3dcb','#8b5cf6'],['#22d3ee','#2f6bff'],['#a3e635','#22d3ee'],['#fbbf24','#ff3dcb'],['#2f6bff','#ff3dcb'],['#34d399','#2f6bff'],['#fb7185','#fbbf24']];
const AV_NAMES = ['Neo Runner','Pixel','Glitch','Cyber Zen','Turbo','Nova','Byte','Kiddo 3D','Skater','Dron','Orbit','Rayo','Blocky','Survivor','Hacker Kid','Mecha','Ninja Neón','Piloto','Streamer','Beat','Cometa','Zeta','Vórtex','Aura'];
const HEADS = [
  '<circle cx="50" cy="43" r="17"/>',
  '<polygon points="50,24 66,33 66,52 50,61 34,52 34,33"/>',
  '<rect x="33" y="26" width="34" height="35" rx="10"/>',
  '<ellipse cx="50" cy="43" rx="15" ry="19"/>',
  '<path d="M33 28H67V46Q67 62 50 64Q33 62 33 46Z"/>',
  '<polygon points="50,22 68,43 50,64 32,43"/>'
];
function avatar(i, px) {
  i = ((parseInt(i) || 0) % 24 + 24) % 24; px = px || 48;
  const [c1, c2] = PAL[i % 8], head = i % 6, acc = Math.floor(i / 6) % 4;
  const eyes = '<circle cx="43" cy="46" r="2.6" fill="#0b0820"/><circle cx="57" cy="46" r="2.6" fill="#0b0820"/><path d="M44 53Q50 57 56 53" stroke="#0b0820" stroke-width="2" fill="none" stroke-linecap="round"/>';
  const accs = [
    '<rect x="35" y="38" width="30" height="9" rx="4.5" fill="#22d3ee"/><rect x="38" y="40" width="10" height="2" rx="1" fill="#fff" opacity=".7"/><path d="M45 54Q50 57 55 54" stroke="#0b0820" stroke-width="2" fill="none" stroke-linecap="round"/>',
    `<path d="M33 46V42A17 17 0 0 1 67 42V46" fill="none" stroke="${c2}" stroke-width="4"/><rect x="29" y="42" width="7" height="12" rx="3" fill="${c2}"/><rect x="64" y="42" width="7" height="12" rx="3" fill="${c2}"/>${eyes}`,
    `<path d="M32 38Q50 16 68 38Z" fill="${c2}"/><rect x="30" y="37" width="40" height="4" rx="2" fill="${c2}"/>${eyes}`,
    `<line x1="50" y1="26" x2="50" y2="13" stroke="${c2}" stroke-width="3"/><circle cx="50" cy="12" r="4" fill="${c2}"/>${eyes}`
  ];
  return `<svg class="av" width="${px}" height="${px}" viewBox="0 0 100 100" role="img" aria-label="Avatar ${esc(AV_NAMES[i])}">` +
    `<defs><linearGradient id="ag${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><clipPath id="ac${i}"><circle cx="50" cy="50" r="48"/></clipPath></defs>` +
    `<circle cx="50" cy="50" r="48" fill="#171347"/><g clip-path="url(#ac${i})"><path d="M22 100Q24 68 50 66Q76 68 78 100Z" fill="url(#ag${i})"/><path d="M40 68Q50 78 60 68" stroke="#fff" opacity=".55" fill="none" stroke-width="2"/>` +
    `<g fill="#dfe6ff" stroke="${c1}" stroke-width="2">${HEADS[head]}</g>${accs[acc]}</g><circle cx="50" cy="50" r="48" fill="none" stroke="${c1}" stroke-width="3"/></svg>`;
}

/* Íconos de la barra inferior */
const ICONS = {
  home: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  book: 'M4 4h11a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3zM4 17a3 3 0 0 1 3-3h11',
  check: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9',
  cal: 'M7 3v4M17 3v4M4 9h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0'
};
const icon = k => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[k]}"/></svg>`;

/* ---------- Estado ---------- */
const curTerm = () => { const m = new Date().getMonth(); return m <= 4 ? 1 : m <= 7 ? 2 : 3; };
function def() {
  return {
    v: 1, created: Date.now(),
    profile: { name: '', avatar: 0, color: COLORS[0] },
    subjects: [], grades: [], acts: [],
    schedule: { 1: [], 2: [], 3: [], 4: [], 5: [] },
    goals: [], xp: 0, xpLog: {}, badges: [], lastBackup: null,
    settings: { passMark: 6, minReg: 75, term: curTerm(), lowlight: false, logo: '' }
  };
}
const BADGES = [
  { id: 'first',  ic: '🚀', n: 'Primer paso',      d: 'Agregá tu 1ª materia',        ok: s => s.subjects.length >= 1 },
  { id: 'map',    ic: '🗺️', n: 'Mapa completo',    d: '5 materias cargadas',         ok: s => s.subjects.length >= 5 },
  { id: 'plan',   ic: '📅', n: 'Planificador',     d: '5 actividades planificadas',  ok: s => s.acts.length >= 5 },
  { id: 'done',   ic: '✅', n: 'Misión cumplida',  d: '5 actividades completadas',   ok: s => s.acts.filter(isDone).length >= 5 },
  { id: 'notes',  ic: '📚', n: 'Notas al día',     d: '5 notas registradas',         ok: s => s.grades.length >= 5 },
  { id: 'sched',  ic: '⏰', n: 'Horario listo',    d: 'Armá tu horario semanal',     ok: s => Object.values(s.schedule).some(a => a.length) },
  { id: 'goals',  ic: '🎯', n: 'Cazametas',        d: 'Cumplí 3 metas',              ok: s => s.goals.filter(g => g.done).length >= 3 },
  { id: 'safe',   ic: '💾', n: 'Datos seguros',    d: 'Guardá tu primera copia',     ok: s => !!s.lastBackup },
  { id: 'lvl5',   ic: '👑', n: 'Nivel 5',          d: 'Llegá al nivel 5',            ok: s => lvlOf(s.xp) >= 5 }
];
const BADGE_IDS = BADGES.map(b => b.id);

function normalize(d) {
  const b = def();
  if (!d || typeof d !== 'object') return b;
  const p = d.profile || {};
  b.profile = { name: str(p.name, 24).trim(), avatar: Number.isInteger(p.avatar) ? ((p.avatar % 24) + 24) % 24 : 0, color: isCol(p.color) ? p.color : COLORS[0] };
  b.subjects = (Array.isArray(d.subjects) ? d.subjects : []).filter(s => s && s.name).map(s => ({
    id: cleanId(s.id), name: str(s.name, 40), color: isCol(s.color) ? s.color : COLORS[0],
    att: { p: Math.max(0, parseInt(s.att && s.att.p) || 0), a: Math.max(0, parseInt(s.att && s.att.a) || 0) }
  }));
  const ids = new Set(b.subjects.map(s => s.id));
  b.grades = (Array.isArray(d.grades) ? d.grades : []).filter(g => g && ids.has(g.subjectId) && [1, 2, 3].includes(g.term) && Number.isInteger(g.value) && g.value >= 1 && g.value <= 10)
    .map(g => ({ id: cleanId(g.id), subjectId: g.subjectId, term: g.term, value: g.value, desc: str(g.desc, 80), date: isDate(g.date) ? g.date : todayStr() }));
  b.acts = (Array.isArray(d.acts) ? d.acts : []).filter(a => a && ids.has(a.subjectId) && a.title && isDate(a.date))
    .map(a => ({ id: cleanId(a.id), subjectId: a.subjectId, title: str(a.title, 80), type: TYPES[a.type] ? a.type : 'otra', date: a.date, status: STATUS[a.status] ? a.status : 'pend', notes: str(a.notes, 200), xpDone: !!a.xpDone }));
  for (let k = 1; k <= 5; k++) {
    const arr = d.schedule && Array.isArray(d.schedule[k]) ? d.schedule[k] : [];
    b.schedule[k] = arr.filter(x => ids.has(x)).slice(0, 12);
  }
  b.goals = (Array.isArray(d.goals) ? d.goals : []).filter(g => g && g.text).slice(0, 50).map(g => ({ id: cleanId(g.id), text: str(g.text, 80), done: !!g.done }));
  b.xp = Math.max(0, parseInt(d.xp) || 0);
  const today = todayStr();
  b.xpLog = {};
  if (d.xpLog && typeof d.xpLog === 'object') for (const k in d.xpLog) if (k.indexOf(today) === 0) b.xpLog[k] = parseInt(d.xpLog[k]) || 0;
  b.badges = (Array.isArray(d.badges) ? d.badges : []).filter(x => BADGE_IDS.includes(x));
  b.lastBackup = Number.isFinite(d.lastBackup) ? d.lastBackup : null;
  b.created = Number.isFinite(d.created) ? d.created : Date.now();
  const st = d.settings || {};
  b.settings = {
    passMark: Number.isInteger(st.passMark) && st.passMark >= 1 && st.passMark <= 10 ? st.passMark : 6,
    minReg: Number.isInteger(st.minReg) && st.minReg >= 0 && st.minReg <= 100 ? st.minReg : 75,
    term: [1, 2, 3].includes(st.term) ? st.term : curTerm(),
    lowlight: !!st.lowlight,
    logo: typeof st.logo === 'string' && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(st.logo) && st.logo.length < 400000 ? st.logo : ''
  };
  return b;
}
function load() {
  try { const raw = localStorage.getItem(KEY); if (raw) return normalize(JSON.parse(raw)); } catch (e) {}
  return def();
}
let S = load();
const ui = { tab: 'home', subj: null, term: null, cal: [new Date().getFullYear(), new Date().getMonth()], sel: todayStr(), filt: 'all', q: '', target: null, tmp: null, onYes: null };

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); return true; }
  catch (e) { toast('⚠️ No se pudo guardar en este navegador. Guardá una copia ahora.'); return false; }
}
function commit() { checkBadges(); persist(); render(); }

/* ---------- Mensajes ---------- */
let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- Niveles y XP (nunca restan puntos) ---------- */
const LEVELS = ['Novato','Explorador','Estratega','Organizador','Pro','Maestro','Leyenda'];
const lvlOf = x => Math.floor(Math.sqrt(x / 40)) + 1;
const lvlName = l => LEVELS[Math.min(l - 1, LEVELS.length - 1)];
const lvlStart = l => 40 * (l - 1) * (l - 1);
const lvlEnd = l => 40 * l * l;
function xp(type, amt, cap) {
  const k = todayStr() + ':' + type;
  S.xpLog[k] = (S.xpLog[k] || 0) + 1;
  if (S.xpLog[k] > cap) return;      // tope diario por acción: evita "farmear" puntos
  const l0 = lvlOf(S.xp); S.xp += amt; const l1 = lvlOf(S.xp);
  toast(l1 > l0 ? `🎉 ¡Subiste al nivel ${l1}! ${lvlName(l1)}` : `+${amt} XP`);
}
function checkBadges() {
  BADGES.forEach(b => {
    if (!S.badges.includes(b.id) && b.ok(S)) { S.badges.push(b.id); toast(`🏅 ¡Nueva insignia: ${b.n}!`); }
  });
}

/* ---------- Cálculos ---------- */
const subj = id => S.subjects.find(s => s.id === id);
const termGrades = (sid, t) => S.grades.filter(g => g.subjectId === sid && g.term === t);
const avg = a => a.length ? a.reduce((s, g) => s + g.value, 0) / a.length : null;
const attPct = s => { const t = s.att.p + s.att.a; return t ? Math.round(s.att.p / t * 100) : null; };
function attention(s, t) {
  const a = avg(termGrades(s.id, t)), p = attPct(s);
  return { grade: a !== null && a < S.settings.passMark, att: p !== null && p < S.settings.minReg };
}
const byDate = (x, y) => x.date < y.date ? -1 : x.date > y.date ? 1 : 0;
function reminders() {
  const t = todayStr();
  return S.acts.filter(a => !isDone(a)).map(a => ({ a, d: daysBetween(t, a.date) })).filter(x => x.d <= 3).sort((x, y) => x.d - y.d);
}
function remMsg(a, d) {
  const s = subj(a.subjectId), sn = s ? s.name : '', T = TYPES[a.type] || TYPES.otra, ds = dateLong(a.date);
  if (d < 0) return `Venció hace ${-d} ${-d === 1 ? 'día' : 'días'}: ${T.n} de ${sn} (${ds}). ¡Todavía podés ponerte al día!`;
  if (d === 0) return `¡Es hoy! Tenés ${T.art} de ${sn}. ¡Vos podés!`;
  if (d === 1) return `¡Falta 1 día! Tenés ${T.art} de ${sn} el ${ds}. ¡Organizate con tiempo!`;
  return `¡Faltan ${d} días! Tenés ${T.art} de ${sn} el ${ds}. ¡Organizate con tiempo!`;
}
const relTxt = d => d < 0 ? 'Vencida' : d === 0 ? 'Hoy' : d === 1 ? 'Mañana' : `En ${d} días`;
const hasData = () => S.subjects.length || S.grades.length || S.acts.length;
const daysSinceBackup = () => Math.floor((Date.now() - (S.lastBackup || S.created)) / 864e5);
const backupDue = () => hasData() && (!S.lastBackup || daysSinceBackup() >= 7);
const storageBytes = () => { try { return (localStorage.getItem(KEY) || '').length * 2; } catch (e) { return 0; } };

/* ---------- Vistas ---------- */
function render() {
  const y = window.scrollY;
  document.documentElement.style.setProperty('--acc', S.profile.color);
  document.body.classList.toggle('lowlight', !!S.settings.lowlight);
  if (!S.profile.name) { $('#app').innerHTML = vWelcome(); return; }
  const views = { home: vHome, subj: vSubjects, acts: vActs, cal: vCal, lvl: vLevel, prof: vProfile };
  $('#app').innerHTML = header() + `<main id="view">${views[ui.tab]()}</main>` + nav();
  window.scrollTo(0, y);
}
function header() {
  const l = lvlOf(S.xp);
  return `<header class="top"><div class="brand">${S.settings.logo ? `<img class="logo" alt="Logo" src="${esc(S.settings.logo)}">` : ''}<span class="t1">MODO ON</span><b>633</b></div>` +
    `<span class="chip-lvl">Nv ${l} · ${S.xp} XP</span><button class="avbtn" aria-label="Mi perfil" onclick="App.go('prof')">${avatar(S.profile.avatar, 34)}</button></header>`;
}
function nav() {
  const items = [['home', 'Inicio', 'home'], ['subj', 'Materias', 'book'], ['acts', 'Actividades', 'check'], ['cal', 'Calendario', 'cal'], ['lvl', 'LEVEL UP', 'bolt'], ['prof', 'Perfil', 'user']];
  const n = reminders().length;
  return `<nav class="nav" aria-label="Secciones"><div class="nav-in">` + items.map(([k, t, ic]) =>
    `<button class="${ui.tab === k ? 'on' : ''}" onclick="App.go('${k}')" aria-label="${t}">${icon(ic)}<span>${t}</span>${k === 'home' && n ? `<span class="nb">${n}</span>` : ''}</button>`).join('') + `</div></nav>`;
}

/* Bienvenida / primer ingreso */
function vWelcome() {
  if (!ui.tmp) ui.tmp = { av: S.profile.avatar, color: S.profile.color };
  return `<div class="welcome"><h1 class="big">MODO ON 633</h1><p class="lema">Activá tus metas. Subí de nivel.</p>
  <form class="card" onsubmit="return App.saveWelcome(event)">
    <h2>Creá tu perfil</h2>
    <label for="wn">¿Cómo te llamás? (nombre o apodo)</label>
    <input id="wn" name="name" type="text" maxlength="24" autocomplete="off" placeholder="Ej: Sofi, Leo, Neo…" required>
    <label>Elegí tu avatar</label>${avGrid()}
    <label>Elegí tu color</label>${swatches(ui.tmp.color, 'App.pickColor')}
    <div class="ferr" id="ferr"></div>
    <button class="btn block pink" style="margin-top:10px">¡Activar MODO ON!</button>
  </form>
  <p class="mut sm center">No pedimos fotos ni datos personales. Todo queda guardado solo en este celular.</p></div>`;
}
function avGrid() {
  const cur = ui.tmp ? ui.tmp.av : S.profile.avatar;
  return `<div class="avgrid" id="avgrid">` + AV_NAMES.map((n, i) =>
    `<button type="button" class="avopt ${i === cur ? 'on' : ''}" onclick="App.pickAv(${i})" aria-label="${esc(n)}">${avatar(i, 52)}<span>${esc(n)}</span></button>`).join('') + `</div>`;
}
function swatches(cur, fn, name) {
  return `<div class="swatches" ${name ? `id="${name}"` : ''}>` + COLORS.map(c =>
    `<button type="button" class="sw ${c === cur ? 'on' : ''}" style="background:${c};color:${c}" aria-label="Color ${c}" onclick="${fn}('${c}')"></button>`).join('') + `</div>`;
}

/* Fila de actividad */
function actRow(a, withDate) {
  const s = subj(a.subjectId), d = daysBetween(todayStr(), a.date), T = TYPES[a.type] || TYPES.otra, done = isDone(a);
  const rel = done ? `<span class="tag ok">${STATUS[a.status]}</span>` : `<span class="tag ${d < 0 ? 'bad' : d === 0 ? 'pk' : d <= 3 ? 'cy' : ''}">${relTxt(d)}</span>`;
  return `<div class="item ${done ? 'done' : ''}" onclick="App.actForm('${a.id}')">
    <button class="check ${done ? 'on' : ''}" aria-label="Marcar como completada" onclick="event.stopPropagation();App.toggleAct('${a.id}')">${done ? '✓' : ''}</button>
    <div class="grow"><div class="tt">${T.ic} ${esc(a.title)}</div>
    <div class="sm mut"><span class="dot" style="background:${s ? s.color : '#888'}"></span> ${esc(s ? s.name : '—')} · ${T.n}${withDate !== false ? ' · ' + dateLong(a.date) : ''}</div></div>${rel}</div>`;
}
function actList(arr, emptyMsg) {
  return arr.length ? arr.map(a => actRow(a)).join('') : `<div class="empty">${emptyMsg}</div>`;
}

/* INICIO */
function vHome() {
  const l = lvlOf(S.xp), pct = Math.round((S.xp - lvlStart(l)) / (lvlEnd(l) - lvlStart(l)) * 100), t = todayStr();
  let h = `<section class="card hero"><div class="row">${avatar(S.profile.avatar, 66)}<div class="grow"><h2>¡Hola, ${esc(S.profile.name)}!</h2>
    <div class="mut">Nivel ${l} · ${lvlName(l)}</div><div class="bar"><i style="width:${pct}%"></i></div>
    <div class="mut sm">${S.xp} XP · faltan ${lvlEnd(l) - S.xp} para el nivel ${l + 1}</div></div></div>
    <button class="btn sec sm block" style="margin-top:10px" onclick="App.go('lvl')">⚡ Ir a LEVEL UP</button></section>`;

  if (backupDue()) h += `<div class="alert info"><span class="ic">💾</span><div class="body"><b>¡Cuidá tus datos!</b><div class="sm">Todo se guarda en este celular. Si cambiás de dispositivo o borrás los datos del navegador, podés perder tu información. ${S.lastBackup ? `Pasaron ${daysSinceBackup()} días desde tu última copia.` : 'Todavía no guardaste ninguna copia.'} Guardá una copia para recuperarla.</div>
    <button class="btn sm cyan" style="margin-top:8px" onclick="App.exportJSON()">Guardar mi copia</button></div></div>`;

  const rem = reminders();
  if (rem.length) {
    h += `<section class="card"><div class="sec-title"><h2>⏰ Recordatorios</h2><span class="tag pk">${rem.length}</span></div>` + rem.map(({ a, d }) =>
      `<div class="alert ${d < 0 ? 'over' : d === 0 ? 'today' : 'soon'}"><span class="ic">${d < 0 ? '⚠️' : d === 0 ? '🔥' : '📣'}</span><div class="body">
      <div><b>${esc(remMsg(a, d))}</b></div><div class="sm mut">${esc(a.title)}</div>
      <button class="btn sm sec" style="margin-top:8px" onclick="App.toggleAct('${a.id}')">Marcar como completada</button></div></div>`).join('') + `</section>`;
  }

  if (!S.subjects.length) {
    h += `<section class="card"><h2>🚀 Empezá en 2 minutos</h2><p class="mut">Tocá las materias que cursás para agregarlas:</p>${freqChips()}
    <button class="btn block" style="margin-top:12px" onclick="App.subjectForm()">+ Agregar otra materia</button></section>`;
  } else {
    h += schedBlock();
    const pend = S.acts.filter(a => !isDone(a)).sort(byDate);
    h += `<section class="card"><div class="sec-title"><h3>🧪 Próximas evaluaciones</h3></div>${actList(pend.filter(a => a.type === 'eval' || a.type === 'rec').slice(0, 4), 'Sin evaluaciones cargadas.')}</section>`;
    h += `<section class="card"><div class="sec-title"><h3>📝 Trabajos prácticos pendientes</h3></div>${actList(pend.filter(a => a.type === 'tp').slice(0, 5), '¡Estás al día con los TP!')}</section>`;
    const otras = pend.filter(a => a.type === 'otra' && daysBetween(t, a.date) <= 7).slice(0, 4);
    if (otras.length) h += `<section class="card"><div class="sec-title"><h3>📌 Por vencer (7 días)</h3></div>${actList(otras)}</section>`;
    h += `<div class="row" style="margin-bottom:14px"><button class="btn sec grow" onclick="App.actForm()">+ Actividad</button><button class="btn sec grow" onclick="App.gradeForm()">+ Nota</button></div>`;

    const tm = S.settings.term;
    h += `<section class="card"><div class="sec-title"><h3>📊 Notas · ${tm}º trimestre</h3><span class="tag">orientativo</span></div>` + S.subjects.map(s => {
      const a = avg(termGrades(s.id, tm)), at = attention(s, tm);
      return `<div class="row" style="padding:6px 0;cursor:pointer" onclick="App.openSubj('${s.id}')">${ring(a === null ? 0 : a * 10, s.color, a === null ? '–' : fmtAvg(a))}
        <div class="grow"><div style="font-weight:700">${esc(s.name)}</div><div class="sm mut">${termGrades(s.id, tm).length} nota(s)</div></div>${at.grade ? '<span class="tag warn">Reforzar</span>' : ''}</div>`;
    }).join('') + `<p class="sm mut">Los promedios son orientativos: la nota del trimestre la define cada docente.</p></section>`;
  }

  h += `<section class="card"><div class="sec-title"><h3>🎯 Mis metas</h3></div>` +
    (S.goals.length ? S.goals.map(g => `<div class="item" onclick="App.toggleGoal('${g.id}')"><button class="check ${g.done ? 'on' : ''}" aria-label="Meta cumplida">${g.done ? '✓' : ''}</button>
      <div class="grow tt" style="${g.done ? 'text-decoration:line-through;opacity:.6' : ''}">${esc(g.text)}</div><button class="iconbtn" aria-label="Borrar meta" onclick="event.stopPropagation();App.delGoal('${g.id}')">×</button></div>`).join('') : '<div class="empty">Escribí una meta, por ejemplo: “Entregar todos los TP de Taller”.</div>') +
    `<form class="row" style="margin-top:10px" onsubmit="return App.addGoal(event)"><input type="text" name="g" maxlength="80" placeholder="Nueva meta…" aria-label="Nueva meta" style="flex:1"><button class="btn sm">Agregar</button></form></section>`;
  return h;
}
function ring(pct, color, label) {
  const r = 26, c = 2 * Math.PI * r;
  return `<svg class="ring" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="${r}" class="rb"/><circle cx="32" cy="32" r="${r}" class="rf" style="stroke:${color};stroke-dasharray:${c.toFixed(1)};stroke-dashoffset:${(c * (1 - Math.min(100, pct) / 100)).toFixed(1)}" transform="rotate(-90 32 32)"/><text x="32" y="38" text-anchor="middle">${label}</text></svg>`;
}
function freqChips() {
  const have = S.subjects.map(s => s.name.toLowerCase());
  return `<div class="chips">` + FREQ.filter(n => !have.includes(n.toLowerCase())).map(n => `<button class="chipb" onclick="App.quickSubject('${n}')">+ ${n}</button>`).join('') + `</div>`;
}
function schedBlock() {
  const any = Object.values(S.schedule).some(a => a.length);
  if (!any) return `<section class="card"><div class="sec-title"><h3>⏰ Mi horario</h3></div><p class="mut">Cargá tu horario semanal y te mostramos qué tenés hoy y qué llevar mañana.</p><button class="btn sec sm" onclick="App.schedForm()">Armar mi horario</button></section>`;
  const now = new Date(), dow = now.getDay();
  const todayL = dow >= 1 && dow <= 5 ? S.schedule[dow] : [];
  const n = new Date(now); n.setDate(n.getDate() + 1); while (n.getDay() === 0 || n.getDay() === 6) n.setDate(n.getDate() + 1);
  const nextL = S.schedule[n.getDay()] || [];
  const isTom = daysBetween(todayStr(), fmtISO(n)) === 1;
  const chips = ids => ids.length ? `<div class="chips">` + ids.map(id => { const s = subj(id); return s ? `<span class="chipb" style="border-color:${s.color}"><span class="dot" style="background:${s.color}"></span> ${esc(s.name)}</span>` : ''; }).join('') + `</div>` : `<span class="mut sm">Sin materias cargadas.</span>`;
  return `<section class="card"><div class="sec-title"><h3>⏰ Mi horario</h3><button class="link" onclick="App.schedForm()">Editar</button></div>
    <div class="sm mut" style="margin-bottom:4px">${dow >= 1 && dow <= 5 ? 'Hoy tenés' : 'Hoy no hay clases'}</div>${dow >= 1 && dow <= 5 ? chips(todayL) : ''}
    <div class="sm mut" style="margin:10px 0 4px">${isTom ? 'Mañana llevás' : 'El ' + DIAS[n.getDay()] + ' llevás'}</div>${chips(nextL)}</section>`;
}

/* MATERIAS */
function vSubjects() {
  if (ui.subj && subj(ui.subj)) return vSubjDetail(subj(ui.subj));
  ui.subj = null;
  const tm = S.settings.term;
  let h = `<div class="sec-title"><h2>📚 Mis materias</h2><button class="btn sm" onclick="App.subjectForm()">+ Materia</button></div>`;
  if (S.subjects.length > 6) h += `<input type="text" id="sq" placeholder="🔍 Buscar materia…" aria-label="Buscar materia" value="${esc(ui.q)}" oninput="App.searchSubj(this.value)" style="margin-bottom:12px">`;
  h += `<div id="slist">${subjList()}</div>`;
  const chips = freqChips();
  if (chips.indexOf('chipb') > -1) h += `<section class="card"><h3>Agregar rápido</h3><p class="mut sm">Tocá una materia frecuente (podés crear las tuyas con “+ Materia”).</p>${chips}</section>`;
  return h;
}
function subjList() {
  const tm = S.settings.term, q = ui.q.trim().toLowerCase();
  const list = S.subjects.filter(s => !q || s.name.toLowerCase().includes(q));
  if (!list.length) return `<div class="empty">${S.subjects.length ? 'No hay materias con ese nombre.' : 'Todavía no cargaste materias. ¡Agregá la primera!'}</div>`;
  return list.map(s => {
    const a = avg(termGrades(s.id, tm)), at = attention(s, tm), pend = S.acts.filter(x => x.subjectId === s.id && !isDone(x)).length;
    return `<section class="card subj" style="--sc:${s.color}" onclick="App.openSubj('${s.id}')">${ring(a === null ? 0 : a * 10, s.color, a === null ? '–' : fmtAvg(a))}
      <div class="grow"><div class="nm">${esc(s.name)}</div><div class="sm mut">${tm}º trim. · ${pend} pendiente(s)</div>
      <div style="margin-top:4px">${at.grade ? '<span class="tag warn">Reforzar notas</span> ' : ''}${at.att ? '<span class="tag bad">Asistencia baja</span>' : ''}</div></div>
      <button class="btn sm sec" onclick="event.stopPropagation();App.gradeForm(null,'${s.id}')">+ Nota</button></section>`;
  }).join('');
}
function vSubjDetail(s) {
  const t = ui.term || S.settings.term, gr = termGrades(s.id, t).sort(byDate), a = avg(gr), at = attention(s, t), ap = attPct(s);
  const tgt = ui.target || Math.min(10, S.settings.passMark + 1);
  let h = `<div class="row" style="margin-bottom:10px"><button class="iconbtn" aria-label="Volver" onclick="App.closeSubj()">←</button><h2 class="grow" style="margin:0;border-left:6px solid ${s.color};padding-left:10px">${esc(s.name)}</h2>
    <button class="iconbtn" aria-label="Editar materia" onclick="App.subjectForm('${s.id}')">✏️</button></div>`;
  h += `<div class="tabs">${[1, 2, 3].map(n => `<button class="${t === n ? 'on' : ''}" onclick="App.setTerm(${n})">${n}º trim.</button>`).join('')}</div>`;
  h += `<section class="card"><div class="row">${ring(a === null ? 0 : a * 10, s.color, a === null ? '–' : fmtAvg(a))}<div class="grow"><b>Promedio orientativo</b>
    <div class="sm mut">${gr.length} nota(s) en el ${t}º trimestre</div>${at.grade ? '<span class="tag warn">Conviene reforzar</span>' : ''}</div><button class="btn sm" onclick="App.gradeForm(null,'${s.id}',${t})">+ Nota</button></div>
    <div style="margin-top:8px">${gr.length ? gr.map(g => `<div class="grade" onclick="App.gradeForm('${g.id}')"><div class="gnum ${g.value < S.settings.passMark ? 'low' : ''}">${g.value}</div>
      <div class="grow"><div style="font-weight:700">${esc(g.desc || 'Evaluación')}</div><div class="sm mut">${dateLong(g.date)}</div></div></div>`).join('') : '<div class="empty">Sin notas en este trimestre.</div>'}</div>
    <p class="sm mut">Las notas son números enteros del 1 al 10. El promedio es una ayuda: la calificación trimestral definitiva depende del criterio docente.</p></section>`;
  // Calculadora de objetivo
  const n = gr.length, sum = gr.reduce((x, g) => x + g.value, 0);
  let calc;
  if (tgt < 1 || tgt > 10) calc = 'Elegí un objetivo entre 1 y 10.';
  else {
    const need = Math.ceil(tgt * (n + 1) - sum);
    if (need <= 1) calc = '¡Con tus notas actuales ya alcanzás ese promedio! Mantené el ritmo.';
    else if (need <= 10) calc = `Para llegar a un promedio de <b>${tgt}</b> necesitarías sacar aproximadamente <b>${need}</b> en la próxima evaluación.`;
    else if (tgt >= 10) calc = 'Para un promedio de 10 necesitarías 10 en todas las evaluaciones que vienen.';
    else { const k = Math.ceil((tgt * n - sum) / (10 - tgt)); calc = `Con una sola nota no alcanza. Necesitarías aproximadamente <b>${k}</b> notas de 10 seguidas.`; }
  }
  h += `<section class="card"><h3>🎯 Calculadora de objetivo</h3><div class="row"><label for="tg" style="margin:0">Quiero llegar a</label>
    <input id="tg" type="number" min="1" max="10" step="1" inputmode="numeric" value="${tgt}" style="width:80px" onchange="App.setTarget(this.value)"></div>
    <p>${calc}</p><p class="sm mut">Cálculo orientativo: no decide la aprobación.</p></section>`;
  // Asistencia
  h += `<section class="card"><div class="sec-title"><h3>🙋 Asistencia</h3>${ap === null ? '' : `<span class="tag ${at.att ? 'bad' : 'ok'}">Regularidad ${ap}%</span>`}</div>
    <div class="row between"><span>Presentes</span><div class="row"><button class="iconbtn" aria-label="Restar presente" onclick="App.att('${s.id}','p',-1)">−</button><b>${s.att.p}</b><button class="iconbtn" aria-label="Sumar presente" onclick="App.att('${s.id}','p',1)">+</button></div></div>
    <div class="row between" style="margin-top:8px"><span>Faltas</span><div class="row"><button class="iconbtn" aria-label="Restar falta" onclick="App.att('${s.id}','a',-1)">−</button><b>${s.att.a}</b><button class="iconbtn" aria-label="Sumar falta" onclick="App.att('${s.id}','a',1)">+</button></div></div>
    <p class="sm mut">Mínimo de regularidad configurado: ${S.settings.minReg}% (podés cambiarlo en Perfil).</p></section>`;
  const acts = S.acts.filter(x => x.subjectId === s.id).sort((x, y) => (isDone(x) - isDone(y)) || byDate(x, y));
  h += `<section class="card"><div class="sec-title"><h3>📝 Actividades</h3><button class="btn sm" onclick="App.actForm(null,null,'${s.id}')">+ Actividad</button></div>${actList(acts, 'Sin actividades para esta materia.')}</section>`;
  return h;
}

/* ACTIVIDADES */
function vActs() {
  const f = [['all', 'Todas'], ['week', 'Esta semana'], ['pend', 'Pendientes'], ['done', 'Hechas']];
  return `<div class="sec-title"><h2>📝 Actividades</h2><button class="btn sm" onclick="App.actForm()">+ Nueva</button></div>
    <div class="chips" style="margin-bottom:10px">${f.map(([k, n]) => `<button class="chipb ${ui.filt === k ? 'on' : ''}" onclick="App.setFilt('${k}')">${n}</button>`).join('')}</div>
    <input type="text" id="aq" placeholder="🔍 Buscar actividad o materia…" aria-label="Buscar actividad" value="${esc(ui.q)}" oninput="App.searchAct(this.value)" style="margin-bottom:12px">
    <section class="card" id="alist">${actsListHTML()}</section>`;
}
function actsListHTML() {
  const t = todayStr(), q = ui.q.trim().toLowerCase();
  let l = S.acts.slice();
  if (ui.filt === 'week') l = l.filter(a => !isDone(a) && daysBetween(t, a.date) <= 6);
  else if (ui.filt === 'pend') l = l.filter(a => !isDone(a));
  else if (ui.filt === 'done') l = l.filter(isDone);
  if (q) l = l.filter(a => a.title.toLowerCase().includes(q) || (subj(a.subjectId) || { name: '' }).name.toLowerCase().includes(q));
  l.sort((x, y) => (isDone(x) - isDone(y)) || byDate(x, y));
  const msg = S.acts.length ? 'No hay actividades para mostrar con este filtro.' : 'Todavía no planificaste actividades. ¡Cargá la primera!';
  return actList(l, msg);
}

/* CALENDARIO */
function vCal() {
  const [y, m] = ui.cal, first = new Date(y, m, 1), off = (first.getDay() + 6) % 7, dim = new Date(y, m + 1, 0).getDate(), t = todayStr();
  let cells = '';
  for (let i = 0; i < off; i++) cells += '<div class="cd e"></div>';
  for (let d = 1; d <= dim; d++) {
    const iso = y + '-' + pad(m + 1) + '-' + pad(d), as = S.acts.filter(a => a.date === iso);
    const ex = as.some(a => (a.type === 'eval' || a.type === 'rec') && !isDone(a));
    cells += `<div class="cd ${iso === t ? 'today' : ''} ${iso === ui.sel ? 'sel' : ''} ${ex ? 'ex' : ''}" onclick="App.selDay('${iso}')" role="button" aria-label="${d} de ${MESES[m]}">${d}<div class="dots">${as.slice(0, 3).map(a => `<span class="dot" style="background:${(subj(a.subjectId) || { color: '#fff' }).color}"></span>`).join('')}</div></div>`;
  }
  const dayActs = S.acts.filter(a => a.date === ui.sel).sort((x, y) => isDone(x) - isDone(y));
  return `<div class="sec-title"><h2>📅 Calendario</h2></div><section class="card">
    <div class="row between" style="margin-bottom:8px"><button class="iconbtn" aria-label="Mes anterior" onclick="App.calMove(-1)">‹</button><b style="text-transform:capitalize">${MESES[m]} ${y}</b><button class="iconbtn" aria-label="Mes siguiente" onclick="App.calMove(1)">›</button></div>
    <div class="calgrid">${['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(x => `<div class="calh">${x}</div>`).join('')}${cells}</div>
    <p class="sm mut">Borde fucsia: hay una evaluación ese día.</p></section>
    <section class="card"><div class="sec-title"><h3>${dateLong(ui.sel)}</h3><button class="btn sm" onclick="App.actForm(null,'${ui.sel}')">+ Actividad</button></div>${actList(dayActs, 'Nada planificado para este día.')}</section>`;
}

/* LEVEL UP */
function vLevel() {
  const l = lvlOf(S.xp), pct = Math.round((S.xp - lvlStart(l)) / (lvlEnd(l) - lvlStart(l)) * 100);
  return `<section class="card hero center">${avatar(S.profile.avatar, 90)}<h2 style="margin-top:8px">Nivel ${l} · ${lvlName(l)}</h2>
    <div class="bar" style="height:14px"><i style="width:${pct}%"></i></div><div class="mut sm">${S.xp} XP · faltan ${lvlEnd(l) - S.xp} XP para el nivel ${l + 1}</div></section>
    <section class="card"><h3>🏅 Insignias (${S.badges.length}/${BADGES.length})</h3><div class="badges">${BADGES.map(b => `<div class="badge ${S.badges.includes(b.id) ? '' : 'lock'}"><div class="bi">${b.ic}</div><div class="bn">${b.n}</div><div class="bd">${b.d}</div></div>`).join('')}</div></section>
    <section class="card"><h3>⚡ ¿Cómo gano XP?</h3><table class="xp">
    <tr><td>Registrar una materia</td><td>+10</td></tr><tr><td>Planificar una evaluación o TP</td><td>+5</td></tr><tr><td>Actualizar una actividad</td><td>+2</td></tr>
    <tr><td>Completar una actividad</td><td>+15</td></tr><tr><td>Cargar una nota</td><td>+5</td></tr><tr><td>Revisar tus metas</td><td>+5</td></tr>
    <tr><td>Armar tu horario</td><td>+10</td></tr><tr><td>Guardar una copia de seguridad</td><td>+20</td></tr></table>
    <p class="sm mut">Hay un tope diario por acción para que el progreso sea parejo. Las notas bajas nunca restan puntos y no hay rankings: competís solo con tu versión de ayer.</p></section>`;
}

/* PERFIL Y CONFIGURACIÓN */
function vProfile() {
  if (!ui.tmp) ui.tmp = { av: S.profile.avatar, color: S.profile.color };
  const kb = Math.round(storageBytes() / 1024), full = storageBytes() > 3.5 * 1024 * 1024;
  const last = S.lastBackup ? `Última copia: ${dateLong(fmtISO(new Date(S.lastBackup)))} (hace ${daysSinceBackup()} día(s))` : 'Todavía no guardaste ninguna copia.';
  const canShare = !!(navigator.canShare && typeof File === 'function');
  return `<div class="sec-title"><h2>👤 Perfil y configuración</h2></div>
  <form class="card" onsubmit="return App.saveProfile(event)"><h3>Mi perfil</h3>
    <label for="pn">Nombre o apodo</label><input id="pn" name="name" type="text" maxlength="24" value="${esc(S.profile.name)}" required>
    <label>Avatar</label>${avGrid()}<label>Color</label>${swatches(ui.tmp.color, 'App.pickColor')}
    <div class="ferr" id="ferr"></div><button class="btn block" style="margin-top:8px">Guardar perfil</button></form>

  <section class="card"><h3>💾 Mis datos</h3>
    <div class="alert info"><span class="ic">⚠️</span><div class="body"><b>¡Cuidá tus datos!</b> Todo se guarda en este celular. Si cambiás de dispositivo o borrás los datos del navegador, podés perder tu información. Guardá una copia para recuperarla.</div></div>
    <p class="sm mut">${last} Te recordamos hacer una copia cada 7 días.</p>
    <div class="row wrap"><button class="btn grow cyan" onclick="App.exportJSON()">Guardar mi copia</button>
    ${canShare ? `<button class="btn grow sec" onclick="App.shareJSON()">Compartir mi copia</button>` : ''}
    <button class="btn grow sec" onclick="document.getElementById('importFile').click()">Recuperar mis datos</button></div>
    <p class="sm mut" style="margin-top:10px">Espacio usado: ${kb} KB ${full ? '— <b style="color:var(--warn)">¡Casi lleno! Guardá una copia y borrá cosas que no uses.</b>' : '(hay lugar de sobra)'}</p></section>

  <section class="card"><h3>⏰ Mi horario</h3><p class="mut sm">Elegí qué materias tenés cada día.</p><button class="btn sec" onclick="App.schedForm()">Editar horario semanal</button></section>

  <section class="card"><h3>⚙️ Criterios y ajustes</h3>
    <label for="pm">Nota mínima de aprobación de tu escuela (1 a 10)</label>
    <input id="pm" type="number" min="1" max="10" step="1" inputmode="numeric" value="${S.settings.passMark}" onchange="App.setSetting('passMark',this.value,1,10)">
    <p class="sm mut">Se usa solo para marcar “Reforzar”. La app no aprueba ni desaprueba a nadie.</p>
    <label for="mr">Regularidad mínima de asistencia (%)</label>
    <input id="mr" type="number" min="0" max="100" step="1" inputmode="numeric" value="${S.settings.minReg}" onchange="App.setSetting('minReg',this.value,0,100)">
    <label>Trimestre actual</label><div class="tabs">${[1, 2, 3].map(n => `<button class="${S.settings.term === n ? 'on' : ''}" onclick="App.setSetting('term',${n},1,3)">${n}º</button>`).join('')}</div>
    <label class="row" style="margin-top:12px"><input type="checkbox" ${S.settings.lowlight ? 'checked' : ''} onchange="App.toggleLow(this.checked)" style="width:22px;height:22px"><span>Modo luz baja (menos brillos y animaciones)</span></label></section>

  <section class="card"><h3>🏫 Logo de la escuela</h3><div class="row">${S.settings.logo ? `<img class="logo" style="height:56px;width:56px" alt="Logo" src="${esc(S.settings.logo)}">` : '<span class="mut sm">Sin logo cargado.</span>'}
    <div class="grow"></div><button class="btn sm sec" onclick="document.getElementById('logoFile').click()">${S.settings.logo ? 'Cambiar' : 'Cargar logo'}</button>${S.settings.logo ? '<button class="btn sm danger" onclick="App.delLogo()">Quitar</button>' : ''}</div>
    <p class="sm mut">Se achica automáticamente para ocupar poco espacio.</p></section>

  <section class="card"><h3>🖨️ Resumen trimestral</h3><p class="mut sm">Para mostrar a tu familia. Se abre la impresión: elegí “Guardar como PDF” si querés un archivo.</p>
    <div class="row wrap">${[1, 2, 3].map(n => `<button class="btn sec grow" onclick="App.printSummary(${n})">${n}º trimestre</button>`).join('')}</div></section>

  <section class="card"><h3>🗑️ Borrar todo</h3><p class="mut sm">Elimina todos tus datos de este celular. Primero guardá una copia.</p><button class="btn danger" onclick="App.resetAll()">Borrar todos mis datos</button></section>
  <p class="center mut sm">MODO ON 633 · Activá tus metas. Subí de nivel.</p>`;
}

/* ---------- Hojas modales ---------- */
function sheet(html) {
  const box = $('#sheetBox'), st = box.scrollTop;
  box.innerHTML = html; $('#sheet').hidden = false; box.scrollTop = st;
}
function err(msg) { const e = $('#ferr'); if (e) e.textContent = msg; else toast(msg); }
const fd = e => Object.fromEntries(new FormData(e.target));
const subjOptions = sel => S.subjects.map(s => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${esc(s.name)}</option>`).join('');

/* ---------- Acciones (API usada por los botones) ---------- */
const App = {
  go(tab) { ui.tab = tab; if (tab !== 'subj') ui.subj = null; ui.q = ''; ui.tmp = null; render(); window.scrollTo(0, 0); },
  close() { $('#sheet').hidden = true; $('#sheetBox').innerHTML = ''; },

  /* Perfil */
  pickAv(i) { ui.tmp.av = i; document.querySelectorAll('#avgrid .avopt').forEach((b, k) => b.classList.toggle('on', k === i)); },
  pickColor(c) {
    ui.tmp.color = c; document.documentElement.style.setProperty('--acc', c);
    document.querySelectorAll('.sw').forEach(b => b.classList.toggle('on', b.getAttribute('aria-label') === 'Color ' + c));
  },
  saveWelcome(e) {
    e.preventDefault(); const name = (fd(e).name || '').trim().slice(0, 24);
    if (!name) { err('Escribí tu nombre o apodo.'); return false; }
    S.profile = { name, avatar: ui.tmp.av, color: ui.tmp.color }; ui.tmp = null; ui.tab = 'home';
    try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (x) {}
    commit(); toast('¡MODO ON activado! Agregá tus materias para empezar.'); return false;
  },
  saveProfile(e) {
    e.preventDefault(); const name = (fd(e).name || '').trim().slice(0, 24);
    if (!name) { err('Escribí tu nombre o apodo.'); return false; }
    S.profile = { name, avatar: ui.tmp.av, color: ui.tmp.color }; commit(); toast('Perfil guardado'); return false;
  },
  setSetting(k, v, min, max) {
    const n = parseInt(v);
    if (!Number.isInteger(n) || n < min || n > max || String(v).trim() !== String(n)) { toast(`Ingresá un número entero entre ${min} y ${max}`); render(); return; }
    S.settings[k] = n; commit();
  },
  toggleLow(on) { S.settings.lowlight = !!on; commit(); },

  /* Materias */
  subjectForm(id) {
    const s = id ? subj(id) : null, col = s ? s.color : COLORS[S.subjects.length % COLORS.length];
    ui.tmp = ui.tmp || {}; ui.tmp.sc = col;
    sheet(`<h2>${s ? 'Editar materia' : 'Nueva materia'}</h2><form onsubmit="return App.saveSubject(event,'${id || ''}')">
      <label for="sn">Nombre de la materia</label><input id="sn" name="name" type="text" maxlength="40" value="${esc(s ? s.name : '')}" required autocomplete="off">
      <label>Color</label>${swatches(col, 'App.subjColor', 'scs')}<div class="ferr" id="ferr"></div>
      <div class="row" style="margin-top:10px"><button class="btn grow">Guardar</button>${s ? `<button type="button" class="btn danger" onclick="App.delSubject('${s.id}')">Eliminar</button>` : ''}</div></form>`);
  },
  subjColor(c) { ui.tmp.sc = c; document.querySelectorAll('#scs .sw').forEach(b => b.classList.toggle('on', b.getAttribute('aria-label') === 'Color ' + c)); },
  saveSubject(e, id) {
    e.preventDefault(); const name = (fd(e).name || '').trim().slice(0, 40);
    if (!name) { err('Escribí el nombre de la materia.'); return false; }
    if (S.subjects.some(s => s.id !== id && s.name.toLowerCase() === name.toLowerCase())) { err('Ya tenés una materia con ese nombre.'); return false; }
    if (id) { const s = subj(id); s.name = name; s.color = ui.tmp.sc; }
    else { S.subjects.push({ id: uid(), name, color: ui.tmp.sc, att: { p: 0, a: 0 } }); xp('subj', 10, 5); }
    ui.tmp = null; App.close(); commit(); return false;
  },
  quickSubject(name) {
    if (S.subjects.some(s => s.name.toLowerCase() === name.toLowerCase())) return;
    S.subjects.push({ id: uid(), name, color: COLORS[S.subjects.length % COLORS.length], att: { p: 0, a: 0 } });
    xp('subj', 10, 5); commit();
  },
  delSubject(id) {
    const s = subj(id); if (!s) return;
    App.confirm(`¿Eliminar “${s.name}”? También se borrarán sus notas y actividades.`, () => {
      S.subjects = S.subjects.filter(x => x.id !== id); S.grades = S.grades.filter(g => g.subjectId !== id); S.acts = S.acts.filter(a => a.subjectId !== id);
      for (const k in S.schedule) S.schedule[k] = S.schedule[k].filter(x => x !== id);
      ui.subj = null; App.close(); commit(); toast('Materia eliminada');
    });
  },
  openSubj(id) { ui.tab = 'subj'; ui.subj = id; ui.term = S.settings.term; ui.target = null; render(); window.scrollTo(0, 0); },
  closeSubj() { ui.subj = null; render(); },
  setTerm(n) { ui.term = n; render(); },
  setTarget(v) { const n = parseInt(v); ui.target = Number.isInteger(n) && n >= 1 && n <= 10 ? n : null; if (ui.target === null) toast('Elegí un entero del 1 al 10'); render(); },
  searchSubj(v) { ui.q = v; $('#slist').innerHTML = subjList(); },
  att(id, k, d) { const s = subj(id); s.att[k] = Math.max(0, s.att[k] + d); commit(); },

  /* Notas */
  gradeForm(id, sid, term) {
    if (!S.subjects.length) { toast('Primero agregá una materia'); App.go('subj'); return; }
    const g = id ? S.grades.find(x => x.id === id) : null, ssel = g ? g.subjectId : (sid || ui.subj || S.subjects[0].id), t = g ? g.term : (term || ui.term || S.settings.term);
    sheet(`<h2>${g ? 'Editar nota' : 'Nueva nota'}</h2><form onsubmit="return App.saveGrade(event,'${id || ''}')">
      <label for="gs">Materia</label><select id="gs" name="subjectId">${subjOptions(ssel)}</select>
      <label for="gt">Trimestre</label><select id="gt" name="term">${[1, 2, 3].map(n => `<option value="${n}" ${n === t ? 'selected' : ''}>${n}º trimestre</option>`).join('')}</select>
      <label for="gv">Nota (número entero del 1 al 10)</label><input id="gv" name="value" type="number" min="1" max="10" step="1" inputmode="numeric" value="${g ? g.value : ''}" required>
      <label for="gd">Descripción (opcional)</label><input id="gd" name="desc" type="text" maxlength="80" placeholder="Ej: Prueba de fracciones" value="${esc(g ? g.desc : '')}">
      <label for="gf">Fecha</label><input id="gf" name="date" type="date" value="${g ? g.date : todayStr()}" required><div class="ferr" id="ferr"></div>
      <div class="row" style="margin-top:10px"><button class="btn grow">Guardar</button>${g ? `<button type="button" class="btn danger" onclick="App.delGrade('${g.id}')">Eliminar</button>` : ''}</div></form>`);
  },
  saveGrade(e, id) {
    e.preventDefault(); const f = fd(e), raw = String(f.value).trim();
    if (!/^(10|[1-9])$/.test(raw)) { err('La nota debe ser un número entero del 1 al 10 (sin decimales).'); return false; }
    if (!subj(f.subjectId)) { err('Elegí una materia.'); return false; }
    if (!isDate(f.date)) { err('Elegí una fecha válida.'); return false; }
    const o = { subjectId: f.subjectId, term: parseInt(f.term), value: parseInt(raw), desc: str(f.desc, 80).trim(), date: f.date };
    if (id) Object.assign(S.grades.find(x => x.id === id), o); else { S.grades.push(Object.assign({ id: uid() }, o)); xp('grade', 5, 5); }
    App.close(); commit(); return false;
  },
  delGrade(id) { App.confirm('¿Eliminar esta nota?', () => { S.grades = S.grades.filter(g => g.id !== id); App.close(); commit(); }); },

  /* Actividades */
  actForm(id, date, sid) {
    if (!S.subjects.length) { toast('Primero agregá una materia'); App.go('subj'); return; }
    const a = id ? S.acts.find(x => x.id === id) : null, ssel = a ? a.subjectId : (sid || ui.subj || S.subjects[0].id);
    sheet(`<h2>${a ? 'Editar actividad' : 'Nueva actividad'}</h2><form onsubmit="return App.saveAct(event,'${id || ''}')">
      <label for="at">Nombre de la actividad</label><input id="at" name="title" type="text" maxlength="80" value="${esc(a ? a.title : '')}" required autocomplete="off">
      <label for="as">Materia</label><select id="as" name="subjectId">${subjOptions(ssel)}</select>
      <label for="ay">Tipo</label><select id="ay" name="type">${Object.keys(TYPES).map(k => `<option value="${k}" ${a && a.type === k ? 'selected' : ''}>${TYPES[k].n}</option>`).join('')}</select>
      <label for="ad">Fecha de entrega o evaluación</label><input id="ad" name="date" type="date" value="${a ? a.date : (date || todayStr())}" required>
      <label for="ast">Estado</label><select id="ast" name="status">${Object.keys(STATUS).map(k => `<option value="${k}" ${a && a.status === k ? 'selected' : ''}>${STATUS[k]}</option>`).join('')}</select>
      <label for="an">Observaciones (opcional)</label><textarea id="an" name="notes" maxlength="200">${esc(a ? a.notes : '')}</textarea><div class="ferr" id="ferr"></div>
      <div class="row" style="margin-top:10px"><button class="btn grow">Guardar</button>${a ? `<button type="button" class="btn danger" onclick="App.delAct('${a.id}')">Eliminar</button>` : ''}</div></form>`);
  },
  saveAct(e, id) {
    e.preventDefault(); const f = fd(e), title = (f.title || '').trim();
    if (!title) { err('Escribile un nombre a la actividad.'); return false; }
    if (!subj(f.subjectId)) { err('Elegí una materia.'); return false; }
    if (!isDate(f.date)) { err('Elegí una fecha válida.'); return false; }
    const o = { subjectId: f.subjectId, title: title.slice(0, 80), type: TYPES[f.type] ? f.type : 'otra', date: f.date, status: STATUS[f.status] ? f.status : 'pend', notes: str(f.notes, 200) };
    if (id) { const a = S.acts.find(x => x.id === id); Object.assign(a, o); if (isDone(a)) App.reward(a); else xp('upd', 2, 5); }
    else { const a = Object.assign({ id: uid(), xpDone: false }, o); S.acts.push(a); if (isDone(a)) App.reward(a); else xp('plan', 5, 6); }
    App.close(); commit(); return false;
  },
  reward(a) { if (!a.xpDone) { a.xpDone = true; xp('done', 15, 99); } },   // +XP por completar, una sola vez por actividad
  toggleAct(id) {
    const a = S.acts.find(x => x.id === id); if (!a) return;
    if (isDone(a)) { a.status = 'pend'; xp('upd', 2, 5); }
    else { a.status = a.type === 'tp' ? 'ent' : 'real'; App.reward(a); }
    commit();
  },
  delAct(id) { App.confirm('¿Eliminar esta actividad?', () => { S.acts = S.acts.filter(a => a.id !== id); App.close(); commit(); }); },
  setFilt(k) { ui.filt = k; render(); },
  searchAct(v) { ui.q = v; $('#alist').innerHTML = actsListHTML(); },

  /* Calendario */
  selDay(iso) { ui.sel = iso; render(); },
  calMove(d) { let [y, m] = ui.cal; m += d; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; } ui.cal = [y, m]; render(); },

  /* Metas */
  addGoal(e) {
    e.preventDefault(); const t = (fd(e).g || '').trim(); if (!t) return false;
    S.goals.push({ id: uid(), text: t.slice(0, 80), done: false }); xp('goal', 5, 2); commit(); return false;
  },
  toggleGoal(id) { const g = S.goals.find(x => x.id === id); g.done = !g.done; xp('goal', 5, 2); commit(); },
  delGoal(id) { S.goals = S.goals.filter(g => g.id !== id); commit(); },

  /* Horario */
  schedForm() {
    if (!S.subjects.length) { toast('Primero agregá tus materias'); App.go('subj'); return; }
    const days = [1, 2, 3, 4, 5];
    sheet(`<h2>⏰ Mi horario</h2><p class="mut sm">Tocá las materias en el orden en que las tenés cada día. Volvé a tocar para quitarlas.</p>` +
      days.map(d => `<h3 style="margin-top:12px;text-transform:capitalize">${DIAS[d]}</h3><div class="chips">` + S.subjects.map(s => {
        const i = S.schedule[d].indexOf(s.id);
        return `<button class="chipb ${i > -1 ? 'on' : ''}" onclick="App.toggleSched(${d},'${s.id}')">${i > -1 ? (i + 1) + '. ' : ''}${esc(s.name)}</button>`;
      }).join('') + `</div>`).join('') + `<button class="btn block" style="margin-top:16px" onclick="App.close()">Listo</button>`);
  },
  toggleSched(d, id) {
    const a = S.schedule[d], i = a.indexOf(id);
    if (i > -1) a.splice(i, 1); else a.push(id);
    if (Object.values(S.schedule).some(x => x.length)) xp('sched', 10, 1);
    checkBadges(); persist(); App.schedForm(); render();
  },

  /* Copias de seguridad */
  json() { return JSON.stringify(S, null, 1); },
  markBackup() { S.lastBackup = Date.now(); xp('backup', 20, 1); commit(); },
  exportJSON() {
    try {
      const blob = new Blob([App.json()], { type: 'application/json' }), url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = 'modo-on-633_' + todayStr() + '.json'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      App.markBackup(); toast('✅ Copia guardada. Revisá la carpeta Descargas.');
    } catch (e) { toast('No se pudo guardar la copia'); }
  },
  async shareJSON() {
    const file = new File([App.json()], 'modo-on-633_' + todayStr() + '.json', { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: 'Mi copia de MODO ON 633' }); App.markBackup(); }
      catch (e) { if (e && e.name !== 'AbortError') App.exportJSON(); }
    } else App.exportJSON();
  },
  importFile(inp) {
    const f = inp.files[0]; inp.value = ''; if (!f) return;
    if (f.size > 8e6) { toast('El archivo es demasiado grande'); return; }
    const r = new FileReader();
    r.onload = () => {
      let d; try { d = JSON.parse(r.result); } catch (e) { toast('El archivo no es una copia válida'); return; }
      if (!d || typeof d !== 'object' || !Array.isArray(d.subjects) || !Array.isArray(d.acts) || !Array.isArray(d.grades)) { toast('El archivo no es una copia de MODO ON 633'); return; }
      const n = normalize(d);
      App.confirm(`Se reemplazarán los datos de este celular por la copia (${n.subjects.length} materias, ${n.grades.length} notas, ${n.acts.length} actividades). ¿Continuar?`, () => {
        S = n; if (!S.profile.name) S.profile.name = 'Jugador'; ui.tab = 'home'; ui.subj = null; ui.tmp = null; App.close(); commit(); toast('✅ Datos recuperados');
      });
    };
    r.onerror = () => toast('No se pudo leer el archivo');
    r.readAsText(f);
  },
  resetAll() {
    App.confirm('¿Borrar TODOS tus datos de este celular? Esta acción no se puede deshacer.', () => {
      App.close(); setTimeout(() => App.confirm('Última confirmación: se perderán materias, notas, actividades y XP. ¿Borrar todo?', () => {
        S = def(); ui.tab = 'home'; ui.subj = null; ui.tmp = null; try { localStorage.removeItem(KEY); } catch (e) {} App.close(); persist(); render();
      }), 50);
    });
  },

  /* Logo */
  setLogo(inp) {
    const f = inp.files[0]; inp.value = ''; if (!f) return;
    if (!/^image\//.test(f.type)) { toast('Elegí un archivo de imagen'); return; }
    const url = URL.createObjectURL(f), img = new Image();
    img.onload = () => {
      const k = Math.min(1, 192 / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); S.settings.logo = c.toDataURL('image/png'); commit(); toast('Logo guardado');
    };
    img.onerror = () => { URL.revokeObjectURL(url); toast('No se pudo leer la imagen'); };
    img.src = url;
  },
  delLogo() { S.settings.logo = ''; commit(); },

  /* Resumen imprimible */
  printSummary(t) {
    const rows = S.subjects.map(s => {
      const g = termGrades(s.id, t).sort(byDate), a = avg(g), p = attPct(s);
      return `<tr><td>${esc(s.name)}</td><td>${g.length ? g.map(x => x.value).join(' · ') : '—'}</td><td>${a === null ? '—' : fmtAvg(a)}</td><td>${p === null ? '—' : p + '%'}</td></tr>`;
    }).join('');
    const pend = S.acts.filter(a => !isDone(a)).sort(byDate).map(a => `<tr><td>${esc(a.title)}</td><td>${esc((subj(a.subjectId) || {}).name || '')}</td><td>${TYPES[a.type].n}</td><td>${dateLong(a.date)}</td></tr>`).join('');
    $('#printArea').innerHTML = `${S.settings.logo ? `<img src="${esc(S.settings.logo)}" alt="" style="height:50px;float:right">` : ''}<h1>MODO ON 633 · Resumen del ${t}º trimestre</h1>
      <p>Estudiante: <b>${esc(S.profile.name)}</b> · Fecha: ${dateLong(todayStr())} de ${new Date().getFullYear()}</p>
      <h2>Notas por materia</h2><table><tr><th>Materia</th><th>Notas (enteros 1–10)</th><th>Promedio orientativo</th><th>Asistencia</th></tr>${rows || '<tr><td colspan="4">Sin materias</td></tr>'}</table>
      <p class="small">El promedio es solo orientativo. La calificación trimestral definitiva la determina cada docente según el criterio institucional.</p>
      <h2>Actividades pendientes</h2><table><tr><th>Actividad</th><th>Materia</th><th>Tipo</th><th>Fecha</th></tr>${pend || '<tr><td colspan="4">Sin pendientes</td></tr>'}</table>`;
    window.print();
  },

  /* Confirmación genérica */
  confirm(msg, yes) {
    ui.onYes = yes;
    sheet(`<h2>¿Seguro?</h2><p>${esc(msg)}</p><div class="row" style="margin-top:14px"><button class="btn sec grow" onclick="App.close()">Cancelar</button><button class="btn danger grow" onclick="App.yes()">Sí, continuar</button></div>`);
  },
  yes() { const f = ui.onYes; ui.onYes = null; if (f) f(); }
};
window.App = App;

/* ---------- Inicio ---------- */
render();
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
