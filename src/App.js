import React, { useState, useEffect } from "react";

var LOGO_SRC = {LOGO_SRC};

// ── Supabase config ───────────────────────────────────────────────────────────
const SUPABASE_URL = "https://koqzsgdhblebzjdsrsxw.supabase.co";
const SUPABASE_KEY = "sb_publishable_-mud-2dtJoSK8Zq1yN-NLA_xnZUXUEy";

async function db(path, options = {}) {
  var url = SUPABASE_URL + "/rest/v1/" + path;
  var res = await fetch(url, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": "Bearer " + SUPABASE_KEY,
      "Content-Type": "application/json",
      "Prefer": options.prefer || "return=representation",
    },
    ...options,
  });
  if (!res.ok) {
    var err = await res.text();
    throw new Error(err);
  }
  var text = await res.text();
  return text ? JSON.parse(text) : [];
}

function get(table, query) { return db(table + (query ? "?" + query : ""), { method: "GET" }); }
function post(table, body) { return db(table, { method: "POST", body: JSON.stringify(body) }); }
function patch(table, query, body) { return db(table + "?" + query, { method: "PATCH", body: JSON.stringify(body), prefer: "return=representation" }); }
function del(table, query) { return db(table + "?" + query, { method: "DELETE", prefer: "return=minimal" }); }

// ── Tokens ────────────────────────────────────────────────────────────────────
var C = {
  bg: "#F7F8FA", surface: "#FFFFFF", border: "#E4E7EC",
  primary: "#2563EB", primaryLight: "#EFF6FF", primaryMid: "#BFDBFE",
  success: "#16A34A", successLight: "#F0FDF4",
  warning: "#D97706", warningLight: "#FFFBEB",
  danger: "#DC2626", dangerLight: "#FEF2F2",
  gray: "#6B7280", grayLight: "#F3F4F6",
  text: "#111827", textMid: "#374151", textLight: "#9CA3AF",
  sidebar: "#1E2A3B", sidebarText: "#CBD5E1",
  gold: "#B45309", goldLight: "#FEF3C7",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function calcProgress(stages) {
  if (!stages || stages.length === 0) return 0;
  var done = stages.filter(function(s) { return s.status === "Concluido"; }).length;
  return Math.round((done / stages.length) * 100);
}

function getStatusStyle(s) {
  var map = {
    "Concluido":      { bg: "#F0FDF4", color: "#16A34A" },
    "Em andamento":   { bg: "#EFF6FF", color: "#2563EB" },
    "Em aprovacao":   { bg: "#FFFBEB", color: "#D97706" },
    "Nao iniciado":   { bg: "#F3F4F6", color: "#6B7280" },
    "Novo":           { bg: "#FFFBEB", color: "#D97706" },
    "Em atendimento": { bg: "#EFF6FF", color: "#2563EB" },
    "Resolvido":      { bg: "#F0FDF4", color: "#16A34A" },
    "Encerrado":      { bg: "#F3F4F6", color: "#6B7280" },
    "Ativo":          { bg: "#F0FDF4", color: "#16A34A" },
    "Inativo":        { bg: "#F3F4F6", color: "#6B7280" },
    "Alta":           { bg: "#FEF2F2", color: "#DC2626" },
    "Media":          { bg: "#FFFBEB", color: "#D97706" },
    "Baixa":          { bg: "#F3F4F6", color: "#6B7280" },
  };
  return map[s] || { bg: "#F3F4F6", color: "#6B7280" };
}

function initials(name) {
  if (!name) return "?";
  var p = name.trim().split(" ");
  return ((p[0] ? p[0][0] : "") + (p[1] ? p[1][0] : "")).toUpperCase();
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

// ── UI Atoms ──────────────────────────────────────────────────────────────────
function Badge(props) {
  var s = getStatusStyle(props.label);
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
      {props.label}
    </span>
  );
}

function ProgressBar(props) {
  var v = props.value || 0;
  var h = props.height || 8;
  var color = v >= 100 ? C.success : v >= 50 ? C.primary : C.warning;
  return (
    <div style={{ background: C.border, borderRadius: 99, height: h, overflow: "hidden", flex: 1 }}>
      <div style={{ width: v + "%", background: color, height: "100%", borderRadius: 99 }} />
    </div>
  );
}

function Card(props) {
  return (
    <div style={Object.assign({ background: C.surface, border: "1px solid " + C.border, borderRadius: 12, padding: 20 }, props.style || {})}>
      {props.children}
    </div>
  );
}

function Btn(props) {
  var variant = props.variant || "primary";
  var size = props.size || "md";
  var szMap = { sm: { padding: "5px 12px", fontSize: 12 }, md: { padding: "9px 18px", fontSize: 14 }, lg: { padding: "11px 24px", fontSize: 15 } };
  var varMap = {
    primary: { background: C.primary, color: "#fff", border: "none" },
    ghost:   { background: C.grayLight, color: C.textMid, border: "1px solid " + C.border },
    danger:  { background: C.dangerLight, color: C.danger, border: "none" },
    success: { background: C.successLight, color: C.success, border: "none" },
    gold:    { background: C.goldLight, color: C.gold, border: "none" },
  };
  var style = Object.assign({ borderRadius: 8, fontWeight: 600, cursor: "pointer" }, szMap[size] || szMap.md, varMap[variant] || varMap.primary, props.style || {});
  return <button onClick={props.onClick} style={style}>{props.children}</button>;
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
      <div style={{ width: 36, height: 36, border: "4px solid " + C.border, borderTop: "4px solid " + C.primary, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar(props) {
  var u = props.user;
  var isAdmin = u.role === "master" || u.role === "admin";
  var [mobileOpen, setMobileOpen] = useState(false);
  var nav = isAdmin
    ? [
        { id: "dashboard", icon: "▤", label: "Dashboard" },
        { id: "clients",   icon: "👥", label: "Clientes" },
        { id: "tickets",   icon: "🎫", label: "Chamados" },
        u.role === "master" ? { id: "users", icon: "🔑", label: "Usuarios" } : null,
      ].filter(Boolean)
    : [
        { id: "project", icon: "📋", label: "Meu Projeto" },
        { id: "tickets", icon: "🎫", label: "Chamados" },
      ];

  return (
    <div>
      {/* Mobile top bar */}
      <div style={{ display: "none", position: "fixed", top: 0, left: 0, right: 0, height: 54, background: C.sidebar, zIndex: 100, alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid #2D3A4E" }} className="mobile-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, overflow: "hidden" }}>
            <img src={props.logoSrc} alt="Artilidade" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Artilidade</span>
        </div>
        <button onClick={function() { setMobileOpen(function(v) { return !v; }); }}
          style={{ background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", padding: "4px 8px" }}>
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>
      {/* Overlay */}
      {mobileOpen && <div onClick={function() { setMobileOpen(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 101 }} />}
    <div style={{ width: 220, background: C.sidebar, display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0, flexShrink: 0 }} className={"desktop-sidebar" + (mobileOpen ? " mobile-open" : "")}>
      <div style={{ padding: "22px 20px 14px", borderBottom: "1px solid #2D3A4E" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
            <img src={LOGO_SRC} alt="Artilidade" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Artilidade</span>
        </div>
        <div style={{ marginTop: 6, color: C.sidebarText, fontSize: 11 }}>
          {u.role === "master" ? "Acesso Master" : u.role === "admin" ? "Gestor" : "Portal do Cliente"}
        </div>
      </div>
      <nav style={{ flex: 1, padding: "10px 10px" }}>
        {nav.map(function(item) {
          var active = props.active === item.id;
          return (
            <button key={item.id} onClick={function() { props.onNav(item.id); setMobileOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 8, background: active ? C.primary : "transparent", color: active ? "#fff" : C.sidebarText, border: "none", cursor: "pointer", fontSize: 13.5, fontWeight: active ? 600 : 400, marginBottom: 2, textAlign: "left" }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "12px 14px", borderTop: "1px solid #2D3A4E" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 99, background: u.role === "master" ? C.gold : "#2D3A4E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>
            {initials(u.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#E2E8F0", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
            <div style={{ color: C.sidebarText, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</div>
          </div>
        </div>
        <button onClick={props.onLogout} style={{ width: "100%", padding: 7, background: "#2D3A4E", border: "none", borderRadius: 7, color: C.sidebarText, fontSize: 12, cursor: "pointer" }}>Sair</button>
      </div>
    </div>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginScreen(props) {
  var [email, setEmail] = useState("");
  var [pass, setPass] = useState("");
  var [show, setShow] = useState(false);
  var [err, setErr] = useState("");
  var [loading, setLoading] = useState(false);

  async function attempt() {
    if (!email || !pass) { setErr("Preencha e-mail e senha."); return; }
    setLoading(true); setErr("");
    try {
      var users = await get("users", "email=eq." + encodeURIComponent(email.trim().toLowerCase()) + "&active=eq.true");
      var found = users.find(function(u) { return u.password === pass; });
      if (found) { props.onLogin(found); }
      else { setErr("E-mail ou senha incorretos."); }
    } catch(e) { setErr("Erro de conexao. Tente novamente."); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1E2A3B 0%,#2563EB 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter,system-ui,sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, overflow: "hidden", margin: "0 auto 14px", boxShadow: "0 4px 20px rgba(0,0,0,.2)" }}>
            <img src={LOGO_SRC} alt="Artilidade" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "#fff" }}>Artilidade</h1>
          <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,.65)", fontSize: 14 }}>Sistema de gestao de clientes</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: "28px 28px" }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.textMid, marginBottom: 5 }}>E-mail</label>
            <input type="text" value={email} onChange={function(e) { setEmail(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") attempt(); }} placeholder="seu@email.com"
              autoComplete="off" autoCorrect="off" autoCapitalize="none"
              style={{ width: "100%", padding: "9px 12px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.textMid, marginBottom: 5 }}>Senha</label>
            <div style={{ position: "relative" }}>
              <input type={show ? "text" : "password"} value={pass} onChange={function(e) { setPass(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") attempt(); }} placeholder="••••••••"
                autoComplete="current-password" autoCorrect="off" autoCapitalize="none"
                style={{ width: "100%", padding: "9px 40px 9px 12px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
              <button onClick={function() { setShow(function(v) { return !v; }); }} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>{show ? "🙈" : "👁"}</button>
            </div>
          </div>
          {err && <div style={{ background: C.dangerLight, color: C.danger, borderRadius: 8, padding: "9px 12px", fontSize: 13, marginBottom: 14 }}>⚠ {err}</div>}
          <button onClick={attempt} disabled={loading}
            style={{ width: "100%", padding: "11px", background: C.primary, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── User Management ───────────────────────────────────────────────────────────
function UserManagement(props) {
  var [users, setUsers] = useState([]);
  var [clients, setClients] = useState([]);
  var [loading, setLoading] = useState(true);
  var [tab, setTab] = useState("list");
  var [editId, setEditId] = useState(null);
  var [form, setForm] = useState({ name: "", email: "", password: "", role: "admin", client_id: "", active: true });
  var [pwdId, setPwdId] = useState(null);
  var [p1, setP1] = useState(""); var [p2, setP2] = useState("");
  var [showPwd, setShowPwd] = useState(false);
  var [err, setErr] = useState(""); var [pwdErr, setPwdErr] = useState("");

  useEffect(function() { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      var u = await get("users", "order=created_at.asc");
      var c = await get("clients", "order=name.asc");
      setUsers(u); setClients(c);
    } catch(e) {}
    setLoading(false);
  }

  function setF(k, v) { setForm(function(f) { return Object.assign({}, f, { [k]: v }); }); }

  function openNew() { setForm({ name: "", email: "", password: "", role: "admin", client_id: "", active: true }); setErr(""); setEditId(null); setTab("new"); }
  function openEdit(u) { setForm({ name: u.name, email: u.email, password: "", role: u.role, client_id: u.client_id || "", active: u.active }); setErr(""); setEditId(u.id); setTab("new"); }

  async function save() {
    if (!form.name || !form.email) { setErr("Nome e e-mail sao obrigatorios."); return; }
    if (!editId && !form.password) { setErr("Defina uma senha."); return; }
    if (form.role === "client" && !form.client_id) { setErr("Selecione o cliente."); return; }
    try {
      if (editId) {
        await patch("users", "id=eq." + editId, { name: form.name, email: form.email, role: form.role, client_id: form.client_id || null, active: form.active });
      } else {
        await post("users", { name: form.name, email: form.email, password: form.password, role: form.role, client_id: form.client_id || null, active: form.active });
      }
      await load(); setTab("list"); setEditId(null);
    } catch(e) { setErr("Erro ao salvar. E-mail pode ja estar em uso."); }
  }

  async function savePwd() {
    if (p1.length < 6) { setPwdErr("Minimo 6 caracteres."); return; }
    if (p1 !== p2) { setPwdErr("Senhas nao coincidem."); return; }
    try {
      await patch("users", "id=eq." + pwdId, { password: p1 });
      setPwdId(null); setP1(""); setP2(""); setPwdErr("");
    } catch(e) { setPwdErr("Erro ao salvar."); }
  }

  async function toggleActive(u) {
    if (u.role === "master") return;
    await patch("users", "id=eq." + u.id, { active: !u.active });
    await load();
  }

  if (loading) return <Spinner />;

  if (pwdId !== null) {
    var pu = users.find(function(u) { return u.id === pwdId; });
    return (
      <div style={{ maxWidth: 440 }}>
        <button onClick={function() { setPwdId(null); }} style={{ background: "none", border: "none", color: C.primary, cursor: "pointer", fontSize: 14, marginBottom: 16 }}>Voltar</button>
        <Card>
          <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>Alterar senha</h3>
          <p style={{ color: C.gray, fontSize: 13, margin: "0 0 16px" }}>Usuario: <strong>{pu ? pu.name : ""}</strong></p>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.textMid, marginBottom: 5 }}>Nova senha</label>
            <div style={{ position: "relative" }}>
              <input type={showPwd ? "text" : "password"} value={p1} onChange={function(e) { setP1(e.target.value); }} placeholder="Minimo 6 caracteres"
                style={{ width: "100%", padding: "9px 40px 9px 12px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
              <button onClick={function() { setShowPwd(function(v) { return !v; }); }} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>{showPwd ? "🙈" : "👁"}</button>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.textMid, marginBottom: 5 }}>Confirmar</label>
            <input type={showPwd ? "text" : "password"} value={p2} onChange={function(e) { setP2(e.target.value); }} placeholder="Repita a senha"
              style={{ width: "100%", padding: "9px 12px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
          </div>
          {pwdErr && <div style={{ background: C.dangerLight, color: C.danger, borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12 }}>{pwdErr}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={savePwd}>Salvar senha</Btn>
            <Btn variant="ghost" onClick={function() { setPwdId(null); }}>Cancelar</Btn>
          </div>
        </Card>
      </div>
    );
  }

  if (tab === "new") return (
    <div style={{ maxWidth: 500 }}>
      <button onClick={function() { setTab("list"); }} style={{ background: "none", border: "none", color: C.primary, cursor: "pointer", fontSize: 14, marginBottom: 16 }}>Voltar</button>
      <Card>
        <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700 }}>{editId ? "Editar usuario" : "Novo usuario"}</h3>
        {[["Nome completo","name","text","Nome do usuario"],["E-mail (login)","email","email","usuario@email.com"]].map(function(f) {
          return (
            <div key={f[1]} style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.textMid, marginBottom: 5 }}>{f[0]}</label>
              <input type={f[2]} value={form[f[1]]} onChange={function(e) { setF(f[1], e.target.value); }} placeholder={f[3]}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
            </div>
          );
        })}
        {!editId && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.textMid, marginBottom: 5 }}>Senha inicial</label>
            <input type="password" value={form.password} onChange={function(e) { setF("password", e.target.value); }} placeholder="Defina uma senha"
              style={{ width: "100%", padding: "9px 12px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none" }} />
          </div>
        )}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.textMid, marginBottom: 5 }}>Tipo de acesso</label>
          <select value={form.role} onChange={function(e) { setF("role", e.target.value); setF("client_id", ""); }}
            style={{ width: "100%", padding: "9px 12px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, outline: "none", background: "#fff" }}>
            <option value="admin">Gestor</option>
            <option value="client">Cliente</option>
          </select>
        </div>
        {form.role === "client" && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.textMid, marginBottom: 5 }}>Vincular ao cliente</label>
            <select value={form.client_id} onChange={function(e) { setF("client_id", e.target.value); }}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 14, outline: "none", background: "#fff" }}>
              <option value="">Selecione o cliente</option>
              {clients.map(function(c) { return <option key={c.id} value={c.id}>{c.name} - {c.company}</option>; })}
            </select>
          </div>
        )}
        {editId && (
          <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: C.textMid }}>Status:</span>
            <button onClick={function() { setF("active", !form.active); }}
              style={{ padding: "5px 14px", borderRadius: 6, background: form.active ? C.successLight : C.grayLight, color: form.active ? C.success : C.gray, border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              {form.active ? "Ativo" : "Inativo"}
            </button>
          </div>
        )}
        {err && <div style={{ background: C.dangerLight, color: C.danger, borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12 }}>{err}</div>}
        <div style={{ display: "flex", gap: 8 }}>
          <Btn onClick={save}>{editId ? "Salvar" : "Criar usuario"}</Btn>
          <Btn variant="ghost" onClick={function() { setTab("list"); }}>Cancelar</Btn>
        </div>
      </Card>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Gestao de Usuarios</h2>
          <p style={{ color: C.gray, fontSize: 14, margin: "4px 0 0" }}>Crie e gerencie acessos</p>
        </div>
        <Btn onClick={openNew}>+ Novo usuario</Btn>
      </div>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 600 }}>
          <thead>
            <tr style={{ background: C.grayLight, borderBottom: "1px solid " + C.border }}>
              {["Usuario","E-mail","Tipo","Status","Acoes"].map(function(h) {
                return <th key={h} style={{ padding: "11px 16px", textAlign: "left", color: C.gray, fontWeight: 600, fontSize: 12 }}>{h}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {users.map(function(u, i) {
              return (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? "1px solid " + C.border : "none" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 99, background: u.role === "master" ? C.goldLight : C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: u.role === "master" ? C.gold : C.primary }}>
                        {initials(u.name)}
                      </div>
                      <span style={{ fontWeight: 600, color: C.text }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: C.textMid }}>{u.email}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ background: u.role === "master" ? C.goldLight : C.primaryLight, color: u.role === "master" ? C.gold : C.primary, borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
                      {u.role === "master" ? "Master" : u.role === "admin" ? "Gestor" : "Cliente"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}><Badge label={u.active ? "Ativo" : "Inativo"} /></td>
                  <td style={{ padding: "12px 16px" }}>
                    {u.role === "master"
                      ? <span style={{ fontSize: 12, color: C.gold }}>Conta protegida</span>
                      : (
                        <div style={{ display: "flex", gap: 6 }}>
                          <Btn size="sm" variant="ghost" onClick={function() { openEdit(u); }}>Editar</Btn>
                          <Btn size="sm" variant="gold" onClick={function() { setPwdId(u.id); }}>Senha</Btn>
                          <Btn size="sm" variant={u.active ? "danger" : "success"} onClick={function() { toggleActive(u); }}>{u.active ? "Desativar" : "Ativar"}</Btn>
                        </div>
                      )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

// ── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminDashboard(props) {
  var [clients, setClients] = useState([]);
  var [tickets, setTickets] = useState([]);
  var [stages, setStages] = useState([]);
  var [loading, setLoading] = useState(true);
  var [search, setSearch] = useState("");
  var [filter, setFilter] = useState("Todos");
  var [showNew, setShowNew] = useState(false);
  var [nf, setNf] = useState({ name: "", company: "", email: "", phone: "", responsible: "" });
  var [confirmDelId, setConfirmDelId] = useState(null);

  useEffect(function() { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      var c = await get("clients", "order=name.asc");
      var t = await get("tickets", "order=created_at.desc");
      var s = await get("stages");
      setClients(c); setTickets(t); setStages(s);
    } catch(e) {}
    setLoading(false);
  }

  function setNF(k, v) { setNf(function(f) { return Object.assign({}, f, { [k]: v }); }); }

  async function createClient() {
    if (!nf.name || !nf.company) return;
    try {
      await post("clients", { name: nf.name, company: nf.company, email: nf.email, phone: nf.phone, responsible: nf.responsible || props.user.email, status: "Em andamento", start_date: todayStr() });
      setNf({ name: "", company: "", email: "", phone: "", responsible: "" });
      setShowNew(false);
      await load();
    } catch(e) {}
  }

  async function deleteClient(id) {
    try { await del("clients", "id=eq." + id); setConfirmDelId(null); await load(); } catch(e) {}
  }

  function getClientProgress(clientId) {
    var cs = stages.filter(function(s) { return s.client_id === clientId; });
    return calcProgress(cs);
  }

  if (loading) return <Spinner />;

  var filtered = clients.filter(function(c) {
    var q = search.toLowerCase();
    var matchQ = !q || c.name.toLowerCase().indexOf(q) !== -1 || c.company.toLowerCase().indexOf(q) !== -1;
    var matchF = filter === "Todos" || c.status === filter;
    return matchQ && matchF;
  });

  var newTickets = tickets.filter(function(t) { return t.status === "Novo"; }).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Dashboard</h2>
          <p style={{ color: C.gray, fontSize: 14, margin: "4px 0 0" }}>Bem-vindo(a), {props.user.name}</p>
        </div>
        <Btn onClick={function() { setShowNew(function(v) { return !v; }); }}>+ Novo cliente</Btn>
      </div>

      {showNew && (
        <Card style={{ margin: "16px 0", background: C.primaryLight, border: "1px solid " + C.primaryMid }}>
          <h4 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: C.primary }}>Cadastrar novo cliente</h4>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            {[["Nome *","name"],["Empresa *","company"],["E-mail","email"],["Telefone","phone"],["Responsavel","responsible"]].map(function(f) {
              return <input key={f[1]} value={nf[f[1]]} onChange={function(e) { setNF(f[1], e.target.value); }} placeholder={f[0]}
                style={{ flex: "1 1 140px", padding: "8px 10px", border: "1px solid " + C.primaryMid, borderRadius: 7, fontSize: 13, outline: "none" }} />;
            })}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn size="sm" onClick={createClient}>Cadastrar</Btn>
            <Btn size="sm" variant="ghost" onClick={function() { setShowNew(false); }}>Cancelar</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, margin: "20px 0" }}>
        {[
          { icon: "👥", label: "Total de clientes", value: clients.length, color: C.primary },
          { icon: "🔄", label: "Em andamento", value: clients.filter(function(c) { return c.status === "Em andamento"; }).length, color: C.primary },
          { icon: "✅", label: "Concluidos", value: clients.filter(function(c) { return c.status === "Concluido"; }).length, color: C.success },
          { icon: "🎫", label: "Chamados novos", value: newTickets, color: C.warning },
        ].map(function(m) {
          return (
            <div key={m.label} style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, flex: "1 1 140px" }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: m.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{m.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.text }}>{m.value}</div>
                <div style={{ fontSize: 12, color: C.gray }}>{m.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <input value={search} onChange={function(e) { setSearch(e.target.value); }} placeholder="Buscar cliente ou empresa..."
          style={{ flex: "1 1 200px", padding: "8px 12px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13.5, outline: "none", background: C.surface }} />
        {["Todos","Em andamento","Concluido"].map(function(s) {
          var active = filter === s;
          return <button key={s} onClick={function() { setFilter(s); }}
            style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid " + (active ? C.primary : C.border), background: active ? C.primaryLight : C.surface, color: active ? C.primary : C.gray, fontWeight: active ? 600 : 400, fontSize: 13, cursor: "pointer" }}>{s}</button>;
        })}
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, minWidth: 600 }}>
          <thead>
            <tr style={{ background: C.grayLight, borderBottom: "1px solid " + C.border }}>
              {["Cliente","Empresa","Responsavel","Progresso","Status",""].map(function(h) {
                return <th key={h} style={{ padding: "11px 16px", textAlign: "left", color: C.gray, fontWeight: 600, fontSize: 12 }}>{h}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: C.gray }}>Nenhum cliente encontrado.</td></tr>}
            {filtered.map(function(c, i) {
              var pct = getClientProgress(c.id);
              return (
                <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid " + C.border : "none" }}
                  onMouseEnter={function(e) { e.currentTarget.style.background = C.bg; }}
                  onMouseLeave={function(e) { e.currentTarget.style.background = "transparent"; }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 99, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.primary }}>{initials(c.name)}</div>
                      <span style={{ fontWeight: 600, color: C.text }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: C.textMid }}>{c.company}</td>
                  <td style={{ padding: "12px 16px", color: C.textMid }}>{c.responsible}</td>
                  <td style={{ padding: "12px 16px", minWidth: 130 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ProgressBar value={pct} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.gray, width: 36, textAlign: "right" }}>{pct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}><Badge label={c.status} /></td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={function() { props.onSelect(c); }}
                        style={{ padding: "5px 12px", borderRadius: 7, background: C.primaryLight, color: C.primary, border: "1px solid " + C.primaryMid, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Ver</button>
                      {props.isMaster && (confirmDelId === c.id ? (
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: C.danger, fontWeight: 600 }}>Confirmar?</span>
                          <button onClick={function() { deleteClient(c.id); }} style={{ padding: "4px 8px", borderRadius: 6, background: C.dangerLight, color: C.danger, border: "none", fontWeight: 700, fontSize: 11, cursor: "pointer" }}>Sim</button>
                          <button onClick={function() { setConfirmDelId(null); }} style={{ padding: "4px 8px", borderRadius: 6, background: C.grayLight, color: C.gray, border: "none", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>Nao</button>
                        </div>
                      ) : (
                        <button onClick={function() { setConfirmDelId(c.id); }}
                          style={{ padding: "5px 10px", borderRadius: 7, background: C.dangerLight, color: C.danger, border: "none", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Excluir</button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}

// ── Admin Client Detail ───────────────────────────────────────────────────────
function AdminClientDetail(props) {
  var [client, setClient] = useState(null);
  var [stages, setStages] = useState([]);
  var [loading, setLoading] = useState(true);
  var [showAdd, setShowAdd] = useState(false);
  var [ns, setNs] = useState({ name: "", description: "", responsible: "", due_date: "" });
  var [noteText, setNoteText] = useState("");
  var [noteSaved, setNoteSaved] = useState(false);

  useEffect(function() { load(); }, [props.clientId]);

  async function load() {
    setLoading(true);
    try {
      var c = await get("clients", "id=eq." + props.clientId);
      var s = await get("stages", "client_id=eq." + props.clientId + "&order=stage_order.asc");
      setClient(c[0]); setStages(s); setNoteText((c[0] && c[0].notes) || "");
    } catch(e) {}
    setLoading(false);
  }

  function setNS(k, v) { setNs(function(f) { return Object.assign({}, f, { [k]: v }); }); }

  async function addStage() {
    if (!ns.name) return;
    try {
      await post("stages", { client_id: props.clientId, name: ns.name, description: ns.description, responsible: ns.responsible, due_date: ns.due_date || null, status: "Nao iniciado", stage_order: stages.length + 1 });
      setNs({ name: "", description: "", responsible: "", due_date: "" });
      setShowAdd(false); await load();
    } catch(e) {}
  }

  async function toggleDone(s) {
    var next = s.status === "Concluido" ? "Nao iniciado" : "Concluido";
    var completed = next === "Concluido" ? todayStr() : null;
    try { await patch("stages", "id=eq." + s.id, { status: next, completed_date: completed }); await load(); } catch(e) {}
  }

  async function deleteStage(id) {
    try { await del("stages", "id=eq." + id); await load(); } catch(e) {}
  }

  async function saveNote() {
    try {
      await patch("clients", "id=eq." + props.clientId, { notes: noteText });
      setNoteSaved(true);
      setTimeout(function() { setNoteSaved(false); }, 2000);
    } catch(e) {}
  }

  if (loading) return <Spinner />;
  if (!client) return <div style={{ padding: 40, color: C.gray }}>Cliente nao encontrado.</div>;

  var pct = calcProgress(stages);

  return (
    <div>
      <button onClick={props.onBack} style={{ background: "none", border: "none", color: C.primary, cursor: "pointer", fontSize: 14, marginBottom: 16 }}>Voltar</button>
      <div style={{ display: "flex", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
        <Card style={{ flex: "1 1 280px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 99, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, color: C.primary }}>{initials(client.name)}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>{client.name}</div>
              <div style={{ color: C.gray, fontSize: 13 }}>{client.company}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 12px", fontSize: 13 }}>
            <div><span style={{ color: C.gray }}>E-mail: </span><span style={{ color: C.textMid }}>{client.email}</span></div>
            <div><span style={{ color: C.gray }}>Telefone: </span><span style={{ color: C.textMid }}>{client.phone}</span></div>
            <div><span style={{ color: C.gray }}>Responsavel: </span><span style={{ color: C.textMid }}>{client.responsible}</span></div>
            <div><span style={{ color: C.gray }}>Inicio: </span><span style={{ color: C.textMid }}>{client.start_date}</span></div>
          </div>
        </Card>
        <Card style={{ flex: "0 0 200px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: pct >= 100 ? C.success : C.primary }}>{pct}%</div>
          <ProgressBar value={pct} height={10} />
          <div style={{ fontSize: 12, color: C.gray }}>{stages.filter(function(s) { return s.status === "Concluido"; }).length} de {stages.length} etapas</div>
        </Card>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Etapas do Projeto</h3>
        <Btn size="sm" onClick={function() { setShowAdd(function(v) { return !v; }); }}>+ Nova Etapa</Btn>
      </div>

      {showAdd && (
        <Card style={{ marginBottom: 12, background: C.primaryLight, border: "1px solid " + C.primaryMid }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <input value={ns.name} onChange={function(e) { setNS("name", e.target.value); }} placeholder="Nome da etapa *"
              style={{ flex: "1 1 150px", padding: "8px 10px", border: "1px solid " + C.primaryMid, borderRadius: 7, fontSize: 13, outline: "none" }} />
            <input value={ns.responsible} onChange={function(e) { setNS("responsible", e.target.value); }} placeholder="Responsavel"
              style={{ flex: "1 1 150px", padding: "8px 10px", border: "1px solid " + C.primaryMid, borderRadius: 7, fontSize: 13, outline: "none" }} />
            <input type="date" value={ns.due_date} onChange={function(e) { setNS("due_date", e.target.value); }}
              style={{ flex: "1 1 130px", padding: "8px 10px", border: "1px solid " + C.primaryMid, borderRadius: 7, fontSize: 13, outline: "none" }} />
            <input value={ns.description} onChange={function(e) { setNS("description", e.target.value); }} placeholder="Descricao"
              style={{ flex: "1 1 100%", padding: "8px 10px", border: "1px solid " + C.primaryMid, borderRadius: 7, fontSize: 13, outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn size="sm" onClick={addStage}>Salvar</Btn>
            <Btn size="sm" variant="ghost" onClick={function() { setShowAdd(false); }}>Cancelar</Btn>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {stages.length === 0 && <div style={{ textAlign: "center", color: C.gray, padding: 32, background: C.grayLight, borderRadius: 10, fontSize: 14 }}>Nenhuma etapa. Clique em "+ Nova Etapa".</div>}
        {stages.map(function(s) {
          return (
            <Card key={s.id} style={{ padding: "13px 16px", borderLeft: "4px solid " + getStatusStyle(s.status).color }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ color: C.gray, minWidth: 20, fontSize: 13, marginTop: 2 }}>{s.stage_order}.</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, color: C.text, fontSize: 14 }}>{s.name}</span>
                    <Badge label={s.status} />
                  </div>
                  {s.description && <div style={{ color: C.gray, fontSize: 13, marginTop: 3 }}>{s.description}</div>}
                  <div style={{ display: "flex", gap: 12, marginTop: 5, fontSize: 12, color: C.textLight, flexWrap: "wrap" }}>
                    {s.responsible && <span>👤 {s.responsible}</span>}
                    {s.due_date && <span>📅 {s.due_date}</span>}
                    {s.completed_date && <span>✅ {s.completed_date}</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <Btn size="sm" variant={s.status === "Concluido" ? "ghost" : "success"} onClick={function() { toggleDone(s); }}>
                    {s.status === "Concluido" ? "Desfazer" : "Concluir"}
                  </Btn>
                  {props.isMaster && <Btn size="sm" variant="danger" onClick={function() { deleteStage(s.id); }}>Excluir</Btn>}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div style={{ marginTop: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 1 }}>Anotacoes internas</span>
          <span style={{ fontSize: 11, color: C.gray }}>(visivel apenas ao admin)</span>
        </div>
        {props.isMaster ? (
          <div style={{ background: C.goldLight, border: "1px solid #F59E0B44", borderRadius: 12, padding: 16 }}>
            <textarea value={noteText} onChange={function(e) { setNoteText(e.target.value); setNoteSaved(false); }}
              placeholder="Dados de acesso, logins, senhas, observacoes..."
              style={{ width: "100%", minHeight: 140, padding: "12px 14px", border: "1px solid #F59E0B88", borderRadius: 8, fontSize: 13.5, lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box", background: "#FFFDF0", fontFamily: "Inter, system-ui, sans-serif" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <button onClick={saveNote} style={{ padding: "6px 16px", borderRadius: 8, background: C.goldLight, color: C.gold, border: "1px solid #F59E0B88", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                {noteSaved ? "✓ Salvo!" : "Salvar anotacoes"}
              </button>
              {noteSaved && <span style={{ fontSize: 12, color: C.success, fontWeight: 600 }}>Salvo com sucesso</span>}
            </div>
          </div>
        ) : (
          <div>
            {noteText && (
              <div style={{ background: C.goldLight, border: "1px solid #F59E0B44", borderRadius: 12, padding: 16, marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, marginBottom: 8 }}>Anotacoes do Master (somente leitura)</div>
                <div style={{ background: "#FFFDF0", border: "1px solid #F59E0B44", borderRadius: 8, padding: "12px 14px", fontSize: 13.5, lineHeight: 1.6, color: C.text, whiteSpace: "pre-wrap" }}>{noteText}</div>
              </div>
            )}
            <AdminNotesGestor clientId={props.clientId} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Admin Tickets ─────────────────────────────────────────────────────────────
function AdminTickets(props) {
  var [tickets, setTickets] = useState([]);
  var [clients, setClients] = useState([]);
  var [loading, setLoading] = useState(true);
  var [expandedId, setExpandedId] = useState(null);
  var [replies, setReplies] = useState({});
  var [notes, setNotes] = useState({});

  useEffect(function() { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      var t = await get("tickets", "order=created_at.desc");
      var c = await get("clients", "order=name.asc");
      setTickets(t); setClients(c);
    } catch(e) {}
    setLoading(false);
  }

  async function updateTicket(id, patch_data) {
    try { await patch("tickets", "id=eq." + id, patch_data); await load(); } catch(e) {}
  }

  if (loading) return <Spinner />;

  var sorted = tickets.slice().sort(function(a, b) {
    if (a.status === "Novo" && b.status !== "Novo") return -1;
    if (b.status === "Novo" && a.status !== "Novo") return 1;
    return 0;
  });

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 4 }}>Chamados</h2>
      <p style={{ color: C.gray, fontSize: 14, marginBottom: 18 }}>Solicitacoes abertas pelos clientes</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.length === 0 && <div style={{ textAlign: "center", color: C.gray, padding: 40 }}>Nenhum chamado ainda.</div>}
        {sorted.map(function(t) {
          var c = clients.find(function(x) { return x.id === t.client_id; });
          var isOpen = expandedId === t.id;
          return (
            <div key={t.id}>
              <Card style={{ borderLeft: "4px solid " + getStatusStyle(t.status).color, borderBottomLeftRadius: isOpen ? 0 : 12, borderBottomRightRadius: isOpen ? 0 : 12, borderBottom: isOpen ? "none" : "1px solid " + C.border }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: C.text }}>{t.subject}</span>
                      <Badge label={t.status} /><Badge label={t.priority} />
                    </div>
                    <div style={{ fontSize: 13, color: C.gray, marginTop: 4 }}>👤 {c ? c.name + " · " + c.company : "Cliente"} · 📅 {t.created_at}</div>
                  </div>
                  <button onClick={function() { setExpandedId(isOpen ? null : t.id); }}
                    style={{ padding: "5px 14px", borderRadius: 7, background: isOpen ? C.grayLight : C.primaryLight, color: isOpen ? C.gray : C.primary, border: "1px solid " + (isOpen ? C.border : C.primaryMid), fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    {isOpen ? "Fechar ▲" : "Ver ▼"}
                  </button>
                </div>
              </Card>
              {isOpen && (
                <div style={{ border: "1px solid " + C.border, borderTop: "none", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, background: "#FAFBFC", padding: "0 20px 20px" }}>
                  <div style={{ paddingTop: 16, marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Dados do Cliente</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "8px 20px", background: C.surface, border: "1px solid " + C.border, borderRadius: 10, padding: "14px 16px" }}>
                      {[["Nome", c ? c.name : "-"],["Empresa", c ? c.company : "-"],["E-mail", c ? c.email : "-"],["Telefone", c ? c.phone : "-"]].map(function(row) {
                        return <div key={row[0]}><div style={{ fontSize: 11, color: C.gray, fontWeight: 600, marginBottom: 2 }}>{row[0]}</div><div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{row[1]}</div></div>;
                      })}
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Mensagem</div>
                    <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: 10, padding: "12px 14px", fontSize: 14, color: C.textMid }}>{t.description || "Sem descricao."}</div>
                  </div>
                  {t.response && (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Resposta Enviada</div>
                      <div style={{ background: C.primaryLight, border: "1px solid " + C.primaryMid, borderRadius: 10, padding: "12px 14px", fontSize: 14 }}>{t.response}</div>
                    </div>
                  )}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Responder ao cliente</div>
                    <textarea value={replies[t.id] || ""} onChange={function(e) { var v = e.target.value; setReplies(function(prev) { return Object.assign({}, prev, { [t.id]: v }); }); }} placeholder="Escreva sua resposta..."
                      style={{ width: "100%", minHeight: 80, padding: "9px 10px", border: "1px solid " + C.border, borderRadius: 8, fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box", background: "#fff" }} />
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <Btn size="sm" onClick={function() {
                        var r = replies[t.id] || "";
                        if (!r.trim()) return;
                        updateTicket(t.id, { response: r, status: "Em atendimento" });
                        setReplies(function(prev) { return Object.assign({}, prev, { [t.id]: "" }); });
                      }}>Enviar resposta</Btn>
                      <Btn size="sm" variant="success" onClick={function() { updateTicket(t.id, { status: "Resolvido" }); }}>Marcar resolvido</Btn>
                      <Btn size="sm" variant="danger" onClick={function() { updateTicket(t.id, { status: "Encerrado" }); }}>Encerrar</Btn>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.gold, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Anotacoes internas</div>
                    <textarea value={notes[t.id] || ""} onChange={function(e) { var v = e.target.value; setNotes(function(prev) { return Object.assign({}, prev, { [t.id]: v }); }); }} placeholder="Anotacoes privadas sobre este chamado..."
                      style={{ width: "100%", minHeight: 70, padding: "9px 10px", border: "1px solid #F59E0B44", borderRadius: 8, fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box", background: C.goldLight }} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Client Project ────────────────────────────────────────────────────────────
function ClientProject(props) {
  var [client, setClient] = useState(null);
  var [stages, setStages] = useState([]);
  var [loading, setLoading] = useState(true);

  useEffect(function() {
    if (!props.clientId) return;
    (async function() {
      setLoading(true);
      try {
        var c = await get("clients", "id=eq." + props.clientId);
        var s = await get("stages", "client_id=eq." + props.clientId + "&order=stage_order.asc");
        setClient(c[0]); setStages(s);
      } catch(e) {}
      setLoading(false);
    })();
  }, [props.clientId]);

  if (loading) return <Spinner />;
  if (!client) return <div style={{ padding: 40, color: C.gray }}>Projeto nao encontrado.</div>;

  var pct = calcProgress(stages);
  return (
    <div>
      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 99, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: C.primary }}>{initials(client.name)}</div>
          <div>
            <div style={{ fontSize: 12, color: C.gray }}>Bem-vindo(a)</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: C.text }}>{client.name}</div>
            <div style={{ color: C.gray, fontSize: 13 }}>{client.company}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 30, fontWeight: 800, color: pct >= 100 ? C.success : C.primary, minWidth: 56 }}>{pct}%</div>
          <div style={{ flex: 1 }}>
            <ProgressBar value={pct} height={10} />
            <div style={{ fontSize: 12, color: C.gray, marginTop: 4 }}>{stages.filter(function(s) { return s.status === "Concluido"; }).length} de {stages.length} etapas concluidas</div>
          </div>
        </div>
      </Card>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 10 }}>Etapas do Projeto</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {stages.length === 0 && <div style={{ textAlign: "center", color: C.gray, padding: 32, background: C.grayLight, borderRadius: 10 }}>Nenhuma etapa cadastrada ainda.</div>}
        {stages.map(function(s) {
          var bc = s.status === "Concluido" ? C.success : s.status === "Em andamento" ? C.primary : C.border;
          var bg = s.status === "Concluido" ? C.successLight : s.status === "Em andamento" ? C.primaryLight : "#fff";
          return (
            <Card key={s.id} style={{ padding: "12px 16px", borderLeft: "4px solid " + bc, background: bg }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ color: C.gray, fontSize: 13 }}>{s.stage_order}.</span>
                <span style={{ fontWeight: 600, color: C.text, flex: 1, fontSize: 14 }}>{s.name}</span>
                <Badge label={s.status} />
              </div>
              <div style={{ display: "flex", gap: 14, marginTop: 5, fontSize: 12, color: C.textLight, paddingLeft: 20, flexWrap: "wrap" }}>
                {s.due_date && <span>📅 Previsto: {s.due_date}</span>}
                {s.completed_date && <span>✅ Concluido: {s.completed_date}</span>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Client Tickets ────────────────────────────────────────────────────────────
function ClientTickets(props) {
  var [tickets, setTickets] = useState([]);
  var [loading, setLoading] = useState(true);
  var [showForm, setShowForm] = useState(false);
  var [subject, setSubject] = useState("");
  var [desc, setDesc] = useState("");
  var [priority, setPriority] = useState("Media");

  useEffect(function() { load(); }, [props.clientId]);

  async function load() {
    if (!props.clientId) return;
    setLoading(true);
    try {
      var t = await get("tickets", "client_id=eq." + props.clientId + "&order=created_at.desc");
      setTickets(t);
    } catch(e) {}
    setLoading(false);
  }

  async function submit() {
    if (!subject.trim()) return;
    try {
      await post("tickets", { client_id: props.clientId, subject: subject, description: desc, priority: priority, status: "Novo", created_at: todayStr() });
      setSubject(""); setDesc(""); setPriority("Media"); setShowForm(false);
      await load();
    } catch(e) {}
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, margin: 0 }}>Chamados</h2>
          <p style={{ color: C.gray, fontSize: 14, margin: "4px 0 0" }}>Suas solicitacoes e respostas</p>
        </div>
        <Btn onClick={function() { setShowForm(function(v) { return !v; }); }}>+ Abrir Chamado</Btn>
      </div>
      {showForm && (
        <Card style={{ marginBottom: 14, background: C.primaryLight, border: "1px solid " + C.primaryMid }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: C.primary }}>Nova Solicitacao</h4>
          <input value={subject} onChange={function(e) { setSubject(e.target.value); }} placeholder="Assunto *"
            style={{ width: "100%", padding: "8px 10px", border: "1px solid " + C.primaryMid, borderRadius: 7, fontSize: 13, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
          <textarea value={desc} onChange={function(e) { setDesc(e.target.value); }} placeholder="Descreva sua solicitacao..."
            style={{ width: "100%", minHeight: 72, padding: "8px 10px", border: "1px solid " + C.primaryMid, borderRadius: 7, fontSize: 13, outline: "none", resize: "vertical", marginBottom: 8, boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 8 }}>
            <select value={priority} onChange={function(e) { setPriority(e.target.value); }} style={{ padding: "7px 10px", border: "1px solid " + C.primaryMid, borderRadius: 7, fontSize: 13, outline: "none" }}>
              <option value="Baixa">Baixa</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
            </select>
            <Btn size="sm" onClick={submit}>Enviar</Btn>
            <Btn size="sm" variant="ghost" onClick={function() { setShowForm(false); }}>Cancelar</Btn>
          </div>
        </Card>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tickets.length === 0 && <div style={{ textAlign: "center", color: C.gray, padding: 40 }}>Nenhum chamado aberto ainda.</div>}
        {tickets.map(function(t) {
          return (
            <Card key={t.id} style={{ borderLeft: "4px solid " + getStatusStyle(t.status).color }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 14, color: C.text, flex: 1 }}>{t.subject}</span>
                <Badge label={t.status} /><Badge label={t.priority} />
              </div>
              <div style={{ fontSize: 13, color: C.gray, marginBottom: 6 }}>📅 {t.created_at}</div>
              {t.description && <div style={{ fontSize: 13, color: C.textMid }}>{t.description}</div>}
              {t.response && (
                <div style={{ background: C.primaryLight, border: "1px solid " + C.primaryMid, borderRadius: 8, padding: "10px 12px", marginTop: 10, fontSize: 13 }}>
                  <span style={{ fontSize: 11, color: C.primary, fontWeight: 600, display: "block", marginBottom: 3 }}>Resposta:</span>
                  {t.response}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}


// ── Notas do Gestor (nao pode editar notas do Master) ─────────────────────────
function AdminNotesGestor(props) {
  var [notes, setNotes] = useState([]);
  var [text, setText] = useState("");
  var [saved, setSaved] = useState(false);
  var [loading, setLoading] = useState(true);

  useEffect(function() { loadNotes(); }, [props.clientId]);

  async function loadNotes() {
    setLoading(true);
    try {
      var n = await get("gestor_notes", "client_id=eq." + props.clientId + "&order=created_at.asc");
      setNotes(n);
    } catch(e) { setNotes([]); }
    setLoading(false);
  }

  async function saveNote() {
    if (!text.trim()) return;
    try {
      await post("gestor_notes", { client_id: props.clientId, content: text, created_at: new Date().toISOString().slice(0,10) });
      setText(""); setSaved(true);
      setTimeout(function() { setSaved(false); }, 2000);
      await loadNotes();
    } catch(e) {}
  }

  return (
    <div style={{ background: "#F0F9FF", border: "1px solid #BAE6FD", borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.primary, marginBottom: 10 }}>Suas anotacoes</div>
      {!loading && notes.map(function(n) {
        return (
          <div key={n.id} style={{ background: "#fff", border: "1px solid #BAE6FD", borderRadius: 8, padding: "10px 12px", marginBottom: 8, fontSize: 13, color: C.text, lineHeight: 1.5 }}>
            <div style={{ fontSize: 11, color: C.gray, marginBottom: 4 }}>📅 {n.created_at}</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{n.content}</div>
          </div>
        );
      })}
      {!loading && notes.length === 0 && <div style={{ fontSize: 13, color: C.gray, marginBottom: 10 }}>Nenhuma anotacao ainda.</div>}
      <textarea value={text} onChange={function(e) { setText(e.target.value); }} placeholder="Adicionar nova anotacao..."
        style={{ width: "100%", minHeight: 100, padding: "10px 12px", border: "1px solid #BAE6FD", borderRadius: 8, fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box", background: "#fff", fontFamily: "Inter, system-ui, sans-serif" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
        <button onClick={saveNote} style={{ padding: "6px 16px", borderRadius: 8, background: C.primaryLight, color: C.primary, border: "1px solid " + C.primaryMid, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          {saved ? "✓ Salvo!" : "Adicionar anotacao"}
        </button>
        {saved && <span style={{ fontSize: 12, color: C.success, fontWeight: 600 }}>Salvo com sucesso</span>}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  var [currentUser, setCurrentUser] = useState(null);
  var [page, setPage] = useState("dashboard");
  var [selectedClientId, setSelectedClientId] = useState(null);

  function login(u) { setCurrentUser(u); setPage(u.role === "client" ? "project" : "dashboard"); setSelectedClientId(null); }
  function logout() { setCurrentUser(null); setPage("dashboard"); setSelectedClientId(null); }
  function nav(p) { setPage(p); setSelectedClientId(null); }

  if (!currentUser) return <LoginScreen onLogin={login} />;

  var isAdmin = currentUser.role === "master" || currentUser.role === "admin";
  var activeNav = selectedClientId ? "clients" : page;

  function renderContent() {
    if (isAdmin) {
      if (page === "users") return <UserManagement />;
      if (page === "tickets") return <AdminTickets />;
      if (selectedClientId) return <AdminClientDetail clientId={selectedClientId} isMaster={currentUser.role === "master"} onBack={function() { setSelectedClientId(null); }} />;
      return <AdminDashboard user={currentUser} isMaster={currentUser.role === "master"} onSelect={function(c) { setSelectedClientId(c.id); }} />;
    }
    if (page === "tickets") return <ClientTickets clientId={currentUser.client_id} />;
    return <ClientProject clientId={currentUser.client_id} />;
  }

  return (
    <div style={{ display: "flex", fontFamily: "Inter,system-ui,sans-serif", background: C.bg, minHeight: "100vh" }}>
      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar {
            position: fixed !important;
            left: -220px !important;
            top: 0 !important;
            height: 100vh !important;
            z-index: 102 !important;
            transition: left 0.25s ease !important;
          }
          .desktop-sidebar.mobile-open {
            left: 0 !important;
          }
          .mobile-topbar {
            display: flex !important;
          }
          .main-content {
            margin-left: 0 !important;
            padding: 70px 14px 24px !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-topbar { display: none !important; }
          .desktop-sidebar { position: sticky !important; left: auto !important; }
        }
      `}</style>
      <Sidebar user={currentUser} active={activeNav} onNav={nav} onLogout={logout} logoSrc={LOGO_SRC} />
      <main className="main-content" style={{ flex: 1, padding: "28px 28px", overflowY: "auto" }}>{renderContent()}</main>
    </div>
  );
}
