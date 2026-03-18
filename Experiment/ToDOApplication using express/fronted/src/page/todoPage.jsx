import { useState, useEffect, useRef, useCallback } from "react";

const API = "http://localhost:3400/api/todo";

// ── Cursor glow + particle canvas ──────────────────────────────────────────
function CursorCanvas() {
  const canvasRef = useRef();
  const mouse = useRef({ x: -999, y: -999 });
  const particles = useRef([]);
  const trails = useRef([]);
  const raf = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e) => {
      const px = e.clientX, py = e.clientY;
      trails.current.push({ x: px, y: py, life: 1 });
      if (Math.random() < 0.3) {
        particles.current.push({
          x: px, y: py,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2 - 1,
          life: 1,
          size: Math.random() * 3 + 1,
          hue: Math.random() < 0.7 ? 165 : 200,
        });
      }
      mouse.current = { x: px, y: py };
    };

    const onClick = (e) => {
      for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2;
        const speed = Math.random() * 4 + 2;
        particles.current.push({
          x: e.clientX, y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          size: Math.random() * 4 + 2,
          hue: Math.random() < 0.5 ? 165 : 0,
        });
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // cursor glow
      const g = ctx.createRadialGradient(
        mouse.current.x, mouse.current.y, 0,
        mouse.current.x, mouse.current.y, 120
      );
      g.addColorStop(0, "rgba(0,255,200,0.06)");
      g.addColorStop(1, "rgba(0,255,200,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // trails
      trails.current = trails.current.filter(t => t.life > 0.01);
      trails.current.forEach(t => {
        ctx.beginPath();
        ctx.arc(t.x, t.y, 3 * t.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,200,${t.life * 0.4})`;
        ctx.fill();
        t.life *= 0.88;
      });

      // particles
      particles.current = particles.current.filter(p => p.life > 0.01);
      particles.current.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},100%,60%,${p.life * 0.8})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life *= 0.92;
      });

      raf.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        zIndex: 50, mixBlendMode: "screen",
      }}
    />
  );
}

// ── Live clock ──────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");
  const ss = String(time.getSeconds()).padStart(2, "0");
  return (
    <div className="clock">
      <span className="clock-hm">{hh}:{mm}</span>
      <span className="clock-s">:{ss}</span>
    </div>
  );
}

// ── Ambient data ticker ─────────────────────────────────────────────────────
function Ticker({ todos }) {
  const msgs = [
    "SYSTEM NOMINAL", "ALL NODES CONNECTED", "DATA STREAM ACTIVE",
    `${todos.length} RECORDS LOADED`, "ENCRYPTION OK", "LATENCY < 2MS",
    "UPTIME 99.9%", "MEMORY STABLE",
  ];
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % msgs.length); setVisible(true); }, 400);
    }, 3000);
    return () => clearInterval(t);
  }, [todos.length]);
  return (
    <div className="ticker">
      <span className="ticker-dot" />
      <span className={`ticker-msg ${visible ? "tick-in" : "tick-out"}`}>{msgs[idx]}</span>
    </div>
  );
}

// ── Ripple on button click ──────────────────────────────────────────────────
function useRipple() {
  const [ripples, setRipples] = useState([]);
  const trigger = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(r => [...r, { x, y, id }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 600);
  }, []);
  return [ripples, trigger];
}

// ── Main App ────────────────────────────────────────────────────────────────
export default function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const [glitchActive, setGlitchActive] = useState(false);
  const [addFlash, setAddFlash] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ripples, triggerRipple] = useRipple();
  const inputRef = useRef();
  const containerRef = useRef();

  // periodic glitch
  useEffect(() => {
    const t = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 300);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  // mouse parallax on container
  useEffect(() => {
    const onMove = (e) => setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => { fetchTodos(); }, []);

  async function fetchTodos() {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setTodos(Array.isArray(data) ? data : []);
    } catch { setError("CONNECTION FAILED"); }
    finally { setLoading(false); }
  }

  async function addTodo() {
    if (!input.trim()) return;
    setAddFlash(true);
    setTimeout(() => setAddFlash(false), 700);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: input.trim() }),
      });
      const newTodo = await res.json();
      setTodos(prev => [newTodo, ...prev]);
      setInput("");
    } catch { setError("WRITE ERROR"); }
  }

  async function deleteTodo(id) {
    setDeletingId(id);
    setTimeout(async () => {
      try {
        await fetch(`${API}/${id}`, { method: "DELETE" });
        setTodos(prev => prev.filter(t => t.id !== id));
      } catch { setError("DELETE FAILED"); }
      finally { setDeletingId(null); }
    }, 500);
  }

  async function saveEdit(id) {
    if (!editText.trim()) return;
    try {
      await fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: editText.trim() }),
      });
      setTodos(prev => prev.map(t => t.id === id ? { ...t, task: editText.trim() } : t));
      setEditId(null); setEditText("");
    } catch { setError("UPDATE FAILED"); }
  }

  const px = (mousePos.x - 0.5) * 20;
  const py = (mousePos.y - 0.5) * 20;

  const pending = todos.filter(t => !t.completed);
  const done = todos.filter(t => t.completed);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --cyan: #00ffc8;
          --red: #ff003c;
          --blue: #0080ff;
          --bg: #040609;
          --surface: rgba(255,255,255,0.025);
          --border: rgba(0,255,200,0.12);
        }

        html { cursor: none; }

        body { background: var(--bg); min-height: 100vh; overflow-x: hidden; }

        /* ── Custom cursor ── */
        .cursor-dot {
          position: fixed; width: 8px; height: 8px;
          background: var(--cyan); border-radius: 50%;
          pointer-events: none; z-index: 9999;
          transform: translate(-50%, -50%);
          transition: transform 0.05s, background 0.2s;
          box-shadow: 0 0 10px var(--cyan), 0 0 20px var(--cyan);
        }
        .cursor-ring {
          position: fixed; width: 36px; height: 36px;
          border: 1px solid rgba(0,255,200,0.5);
          border-radius: 50%; pointer-events: none; z-index: 9998;
          transform: translate(-50%, -50%);
          transition: transform 0.12s ease-out, width 0.2s, height 0.2s, border-color 0.2s;
        }
        .cursor-ring.hovering {
          width: 54px; height: 54px;
          border-color: var(--cyan);
        }

        /* ── Scanlines ── */
        .scanlines {
          position: fixed; inset: 0; pointer-events: none; z-index: 200;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 3px,
            rgba(0,255,200,0.012) 3px, rgba(0,255,200,0.012) 4px
          );
        }

        /* ── Animated grid bg ── */
        .grid-bg {
          position: fixed; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(0,255,180,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,180,0.035) 1px, transparent 1px);
          background-size: 48px 48px;
          animation: grid-drift 20s linear infinite;
        }
        @keyframes grid-drift {
          from { background-position: 0 0; }
          to   { background-position: 48px 48px; }
        }

        /* ── Orbs ── */
        .orb { position: fixed; border-radius: 50%; filter: blur(90px); pointer-events: none; }
        .orb-1 {
          width: 600px; height: 600px; background: var(--cyan);
          top: -250px; right: -150px; opacity: 0.1;
          animation: orb1 14s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 450px; height: 450px; background: var(--blue);
          bottom: -150px; left: -180px; opacity: 0.12;
          animation: orb2 18s ease-in-out infinite alternate;
        }
        .orb-3 {
          width: 300px; height: 300px; background: var(--red);
          top: 40%; left: 50%; opacity: 0.04;
          animation: orb3 10s ease-in-out infinite alternate;
        }
        @keyframes orb1 { to { transform: translate(-80px, 100px) scale(1.2); } }
        @keyframes orb2 { to { transform: translate(100px, -80px) scale(1.15); } }
        @keyframes orb3 { to { transform: translate(-60px, 60px) scale(1.3); } }

        /* ── Corner brackets ── */
        .corner { position: fixed; width: 50px; height: 50px; pointer-events: none; opacity: 0.4; }
        .corner-tl { top: 16px; left: 16px; border-top: 1px solid var(--cyan); border-left: 1px solid var(--cyan); animation: corner-pulse 3s ease-in-out infinite; }
        .corner-tr { top: 16px; right: 16px; border-top: 1px solid var(--cyan); border-right: 1px solid var(--cyan); animation: corner-pulse 3s ease-in-out infinite 0.75s; }
        .corner-bl { bottom: 16px; left: 16px; border-bottom: 1px solid var(--cyan); border-left: 1px solid var(--cyan); animation: corner-pulse 3s ease-in-out infinite 1.5s; }
        .corner-br { bottom: 16px; right: 16px; border-bottom: 1px solid var(--cyan); border-right: 1px solid var(--cyan); animation: corner-pulse 3s ease-in-out infinite 2.25s; }
        @keyframes corner-pulse { 0%,100%{opacity:0.25} 50%{opacity:0.7} }

        /* ── Top bar ── */
        .topbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 80px;
          background: rgba(4,6,9,0.7);
          border-bottom: 1px solid var(--border);
          backdrop-filter: blur(12px);
        }
        .topbar-logo {
          font-family: 'Orbitron', sans-serif; font-weight: 900;
          font-size: 13px; letter-spacing: 4px; color: var(--cyan);
        }
        .topbar-right { display: flex; align-items: center; gap: 24px; }

        /* ── Clock ── */
        .clock { font-family: 'Share Tech Mono', monospace; }
        .clock-hm { font-size: 18px; color: var(--cyan); letter-spacing: 2px; }
        .clock-s { font-size: 14px; color: rgba(0,255,200,0.4); }

        /* ── Ticker ── */
        .ticker { display: flex; align-items: center; gap: 8px; }
        .ticker-dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--cyan);
          animation: blink 1s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        .ticker-msg {
          font-family: 'Share Tech Mono', monospace; font-size: 10px;
          letter-spacing: 3px; color: rgba(0,255,200,0.5); text-transform: uppercase;
          transition: opacity 0.4s, transform 0.4s;
        }
        .tick-in  { opacity: 1; transform: translateY(0); }
        .tick-out { opacity: 0; transform: translateY(-6px); }

        /* ── Container ── */
        .app-root { min-height: 100vh; position: relative; }

        .container {
          position: relative; z-index: 10;
          max-width: 700px; margin: 0 auto;
          padding: 120px 24px 80px;
          will-change: transform;
          transition: transform 0.1s ease-out;
        }

        /* ── Header ── */
        .header { margin-bottom: 52px; }
        .header-eyebrow {
          font-family: 'Share Tech Mono', monospace; font-size: 10px;
          letter-spacing: 6px; color: rgba(0,255,200,0.5); margin-bottom: 12px;
        }
        .header-title {
          font-family: 'Orbitron', sans-serif; font-weight: 900;
          font-size: clamp(48px, 10vw, 72px); line-height: 0.95;
          color: #fff; display: block; position: relative;
        }
        .header-title .acc { color: var(--cyan); }

        /* glitch layers */
        .header-title.glitch::before,
        .header-title.glitch::after {
          content: attr(data-text);
          position: absolute; top: 0; left: 0;
          font-family: 'Orbitron', sans-serif; font-weight: 900;
          font-size: inherit;
        }
        .header-title.glitch::before {
          color: var(--red); clip-path: polygon(0 20%,100% 20%,100% 40%,0 40%);
          animation: glitch-a 0.3s steps(2) forwards;
        }
        .header-title.glitch::after {
          color: var(--cyan); clip-path: polygon(0 60%,100% 60%,100% 80%,0 80%);
          animation: glitch-b 0.3s steps(2) forwards;
        }
        @keyframes glitch-a { 0%{transform:translate(3px,-1px)} 50%{transform:translate(-3px,1px)} 100%{transform:translate(0)} }
        @keyframes glitch-b { 0%{transform:translate(-2px,2px)} 50%{transform:translate(2px,-2px)} 100%{transform:translate(0)} }

        .header-rule {
          width: 100%; height: 1px; margin-top: 24px;
          background: linear-gradient(90deg, var(--cyan), transparent);
          position: relative; overflow: visible;
        }
        .header-rule::after {
          content: ''; position: absolute; left: 0; top: -2px;
          width: 6px; height: 6px; background: var(--cyan);
          border-radius: 50%;
          animation: rule-scan 4s linear infinite;
          box-shadow: 0 0 10px var(--cyan);
        }
        @keyframes rule-scan { from{left:0;opacity:1} 80%{opacity:1} to{left:100%;opacity:0} }

        /* ── Stats ── */
        .stats-row { display: flex; gap: 40px; margin-top: 20px; }
        .stat { display: flex; flex-direction: column; gap: 4px; position: relative; }
        .stat-value {
          font-family: 'Orbitron', sans-serif; font-size: 28px; font-weight: 900;
          color: var(--cyan);
          animation: count-pop 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes count-pop { from{transform:scale(0.8)} to{transform:scale(1)} }
        .stat-label {
          font-family: 'Share Tech Mono', monospace; font-size: 9px;
          letter-spacing: 4px; color: rgba(224,240,255,0.3); text-transform: uppercase;
        }
        .stat::after {
          content: ''; position: absolute; bottom: -8px; left: 0;
          width: 20px; height: 1px; background: var(--cyan); opacity: 0.4;
        }

        /* ── Progress bar ── */
        .progress-wrap { margin-top: 32px; }
        .progress-label {
          display: flex; justify-content: space-between; margin-bottom: 6px;
          font-family: 'Share Tech Mono', monospace; font-size: 10px;
          letter-spacing: 3px; color: rgba(224,240,255,0.3);
        }
        .progress-track {
          height: 2px; background: rgba(0,255,200,0.1);
          position: relative; overflow: hidden;
        }
        .progress-fill {
          height: 100%; background: linear-gradient(90deg, var(--cyan), var(--blue));
          transition: width 0.8s cubic-bezier(0.16,1,0.3,1);
          position: relative;
        }
        .progress-fill::after {
          content: ''; position: absolute; right: 0; top: -3px;
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--cyan); box-shadow: 0 0 8px var(--cyan);
        }

        /* ── Input ── */
        .input-area { margin-bottom: 44px; position: relative; }
        .input-wrap {
          display: flex; align-items: stretch;
          border: 1px solid var(--border);
          background: var(--surface);
          position: relative; overflow: hidden;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .input-wrap.flash {
          animation: input-flash 0.6s ease-out;
        }
        @keyframes input-flash {
          0%  { box-shadow: 0 0 0 rgba(0,255,200,0); border-color: var(--cyan); }
          40% { box-shadow: 0 0 40px rgba(0,255,200,0.3); }
          100%{ box-shadow: 0 0 0 rgba(0,255,200,0); border-color: var(--border); }
        }
        .input-wrap::before {
          content: ''; position: absolute; left: 0; top: 0;
          width: 2px; height: 100%; background: var(--cyan);
          transform: scaleY(0); transform-origin: bottom;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .input-wrap:focus-within::before { transform: scaleY(1); }
        .input-wrap:focus-within {
          border-color: rgba(0,255,200,0.4);
          box-shadow: 0 0 0 1px rgba(0,255,200,0.08), 0 8px 40px rgba(0,255,200,0.06);
        }
        .input-prompt {
          padding: 20px 16px; color: var(--cyan);
          font-family: 'Share Tech Mono', monospace; font-size: 13px;
          opacity: 0.5; user-select: none;
          animation: cursor-blink 1.2s step-end infinite;
        }
        @keyframes cursor-blink { 0%,100%{opacity:0.5} 50%{opacity:0.15} }
        .task-input {
          flex: 1; background: transparent; border: none; outline: none;
          color: #e0f0ff; font-family: 'Share Tech Mono', monospace;
          font-size: 14px; padding: 20px 0; caret-color: var(--cyan);
          letter-spacing: 0.5px;
        }
        .task-input::placeholder { color: rgba(224,240,255,0.18); }

        .add-btn {
          padding: 20px 32px; background: transparent; border: none;
          border-left: 1px solid var(--border);
          color: var(--cyan);
          font-family: 'Orbitron', sans-serif; font-size: 10px;
          font-weight: 700; letter-spacing: 4px; cursor: none;
          text-transform: uppercase; position: relative; overflow: hidden;
          transition: color 0.25s;
        }
        .add-btn::before {
          content: ''; position: absolute; inset: 0;
          background: var(--cyan); transform: scaleX(0);
          transform-origin: left; transition: transform 0.25s cubic-bezier(0.16,1,0.3,1);
          z-index: 0;
        }
        .add-btn:hover::before { transform: scaleX(1); }
        .add-btn:hover { color: #040609; }
        .add-btn span { position: relative; z-index: 1; }

        /* ripple */
        .ripple {
          position: absolute; border-radius: 50%;
          background: rgba(0,255,200,0.3);
          width: 10px; height: 10px;
          transform: translate(-50%,-50%) scale(0);
          animation: ripple-anim 0.6s ease-out forwards;
          pointer-events: none; z-index: 2;
        }
        @keyframes ripple-anim {
          to { transform: translate(-50%,-50%) scale(16); opacity: 0; }
        }

        /* ── Section ── */
        .section-header {
          display: flex; align-items: center; gap: 14px; margin-bottom: 14px;
        }
        .section-label {
          font-family: 'Share Tech Mono', monospace; font-size: 9px;
          letter-spacing: 6px; text-transform: uppercase;
          color: rgba(224,240,255,0.3); white-space: nowrap;
        }
        .section-line {
          flex: 1; height: 1px;
          background: linear-gradient(90deg, rgba(0,255,200,0.12), transparent);
        }
        .section-count {
          font-family: 'Orbitron', sans-serif; font-size: 10px;
          color: var(--cyan); opacity: 0.4;
        }

        /* ── Todo list ── */
        .todo-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 44px; }

        /* ── Todo item ── */
        .todo-item {
          position: relative; display: flex; align-items: center; gap: 16px;
          padding: 16px 20px;
          background: var(--surface);
          border: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
          animation: item-enter 0.5s cubic-bezier(0.16,1,0.3,1) both;
          transition: border-color 0.2s, background 0.2s;
        }

        @keyframes item-enter {
          from { opacity: 0; transform: translateX(-20px) scaleY(0.8); }
          to   { opacity: 1; transform: translateX(0) scaleY(1); }
        }

        /* shimmer on hover */
        .todo-item::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(0,255,200,0.04) 50%, transparent 100%);
          transform: translateX(-100%);
          transition: transform 0s;
        }
        .todo-item:hover::after {
          transform: translateX(100%);
          transition: transform 0.6s ease;
        }

        .todo-item:hover {
          border-color: rgba(0,255,200,0.18);
          background: rgba(0,255,200,0.025);
        }

        /* left accent bar */
        .todo-item::before {
          content: ''; position: absolute; left: 0; top: 0;
          width: 2px; height: 100%; background: var(--cyan);
          transform: scaleY(0); transition: transform 0.25s cubic-bezier(0.16,1,0.3,1);
        }
        .todo-item:hover::before { transform: scaleY(1); }

        .todo-item.deleting {
          animation: self-destruct 0.5s ease-in forwards !important;
        }
        @keyframes self-destruct {
          0%  { opacity:1; transform:translateX(0); border-color: var(--red); }
          30% { background: rgba(255,0,60,0.08); transform: translateX(6px); }
          100%{ opacity:0; transform: translateX(120%) scaleY(0); }
        }

        .todo-item.completed-item { opacity: 0.38; }
        .todo-item.completed-item::before { background: rgba(0,255,200,0.3); }

        /* ── Checkbox ── */
        .check-wrap {
          width: 20px; height: 20px;
          border: 1px solid rgba(0,255,200,0.3);
          cursor: none; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
          position: relative; overflow: hidden;
        }
        .check-wrap:hover { border-color: var(--cyan); transform: scale(1.1); }
        .check-wrap.checked { background: rgba(0,255,200,0.12); border-color: rgba(0,255,200,0.5); }
        .check-mark {
          color: var(--cyan); font-size: 11px;
          animation: pop 0.25s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes pop { from{transform:scale(0) rotate(-20deg)} to{transform:scale(1) rotate(0)} }

        /* ── Task text ── */
        .task-text {
          flex: 1; font-family: 'Share Tech Mono', monospace;
          font-size: 14px; color: #d8eeff; line-height: 1.5;
          word-break: break-word; letter-spacing: 0.3px;
        }
        .task-text.done-text { text-decoration: line-through; color: rgba(224,240,255,0.25); }

        /* ── Edit input ── */
        .edit-input {
          flex: 1; background: transparent; border: none;
          border-bottom: 1px solid var(--cyan); outline: none;
          color: var(--cyan); font-family: 'Share Tech Mono', monospace;
          font-size: 14px; padding: 2px 0; caret-color: var(--cyan);
          letter-spacing: 0.5px;
        }

        /* ── Actions ── */
        .actions {
          display: flex; gap: 6px; flex-shrink: 0;
          opacity: 0; transform: translateX(8px);
          transition: opacity 0.2s, transform 0.2s;
        }
        .todo-item:hover .actions { opacity: 1; transform: translateX(0); }

        .action-btn {
          width: 28px; height: 28px; border: 1px solid transparent;
          background: transparent; cursor: none;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; transition: all 0.15s;
          position: relative; overflow: hidden;
        }
        .action-btn:hover { transform: scale(1.2) rotate(-5deg); }
        .edit-btn  { border-color: rgba(0,150,255,0.25); color: #4af; }
        .edit-btn:hover  { background: rgba(0,150,255,0.12); border-color: rgba(0,150,255,0.6); }
        .delete-btn{ border-color: rgba(255,0,60,0.25); color: #f36; }
        .delete-btn:hover{ background: rgba(255,0,60,0.12); border-color: rgba(255,0,60,0.6); }
        .save-btn  { border-color: rgba(0,255,200,0.25); color: var(--cyan); }
        .save-btn:hover  { background: rgba(0,255,200,0.12); border-color: var(--cyan); }

        /* ── Loading ── */
        .loading-screen {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: 60vh; gap: 24px;
        }
        .loader-outer {
          width: 64px; height: 64px; position: relative;
        }
        .loader-ring-1 {
          position: absolute; inset: 0;
          border: 2px solid transparent; border-top-color: var(--cyan);
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }
        .loader-ring-2 {
          position: absolute; inset: 10px;
          border: 1px solid transparent; border-bottom-color: rgba(0,255,200,0.4);
          border-radius: 50%;
          animation: spin 1.4s linear infinite reverse;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loader-dot {
          position: absolute; inset: 0; display: flex;
          align-items: center; justify-content: center;
        }
        .loader-dot::after {
          content: ''; width: 6px; height: 6px; border-radius: 50%;
          background: var(--cyan); box-shadow: 0 0 12px var(--cyan);
          animation: dot-pulse 0.9s ease-in-out infinite;
        }
        @keyframes dot-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(0.4)} }
        .loader-text {
          font-family: 'Share Tech Mono', monospace; font-size: 10px;
          letter-spacing: 5px; color: rgba(0,255,200,0.4); text-transform: uppercase;
          animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }

        /* ── Error bar ── */
        .error-bar {
          position: fixed; top: 60px; right: 20px; z-index: 999;
          padding: 14px 20px;
          background: rgba(255,0,60,0.1);
          border: 1px solid rgba(255,0,60,0.4);
          font-family: 'Share Tech Mono', monospace; font-size: 11px;
          color: #ff3060; letter-spacing: 2px; cursor: none;
          animation: err-in 0.3s ease-out;
        }
        @keyframes err-in { from{transform:translateX(110%);opacity:0} to{transform:translateX(0);opacity:1} }

        /* ── Empty ── */
        .empty {
          padding: 40px 0; text-align: center;
          font-family: 'Share Tech Mono', monospace; font-size: 11px;
          letter-spacing: 4px; color: rgba(224,240,255,0.12); text-transform: uppercase;
        }
      `}</style>

      <CursorCanvas />
      <CustomCursor />

      <div className="app-root">
        <div className="scanlines" />
        <div className="grid-bg" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="corner corner-tl" />
        <div className="corner corner-tr" />
        <div className="corner corner-bl" />
        <div className="corner corner-br" />

        {/* Top bar */}
        <div className="topbar">
          <div className="topbar-logo">TODO_SYS</div>
          <div className="topbar-right">
            <Ticker todos={todos} />
            <LiveClock />
          </div>
        </div>

        {error && (
          <div className="error-bar" onClick={() => setError(null)}>
            ⚠ {error} — CLICK TO DISMISS
          </div>
        )}

        <div
          className="container"
          ref={containerRef}
          style={{ transform: `translate(${px * 0.015}px, ${py * 0.015}px)` }}
        >
          {/* Header */}
          <div className="header">
            <div className="header-eyebrow">// TASK MANAGEMENT SYSTEM v3.0</div>
            <div
              className={`header-title ${glitchActive ? "glitch" : ""}`}
              data-text="TODO_"
            >
              TODO<span className="acc">_</span>
            </div>
            <div className="header-rule" />
            <div className="stats-row">
              {[
                { val: pending.length, label: "Pending" },
                { val: done.length,    label: "Complete" },
                { val: todos.length,   label: "Total" },
              ].map(s => (
                <div className="stat" key={s.label}>
                  <span className="stat-value" key={s.val}>{s.val}</span>
                  <span className="stat-label">{s.label}</span>
                </div>
              ))}
            </div>
            {todos.length > 0 && (
              <div className="progress-wrap">
                <div className="progress-label">
                  <span>COMPLETION</span>
                  <span>{todos.length > 0 ? Math.round((done.length / todos.length) * 100) : 0}%</span>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${todos.length > 0 ? (done.length / todos.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="input-area">
            <div className={`input-wrap ${addFlash ? "flash" : ""}`}>
              <span className="input-prompt">&gt;_</span>
              <input
                ref={inputRef}
                className="task-input"
                placeholder="Enter new task and press Enter..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTodo()}
              />
              <button
                className="add-btn"
                onClick={e => { triggerRipple(e); addTodo(); }}
              >
                {ripples.map(r => (
                  <span key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />
                ))}
                <span>PUSH</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-screen">
              <div className="loader-outer">
                <div className="loader-ring-1" />
                <div className="loader-ring-2" />
                <div className="loader-dot" />
              </div>
              <div className="loader-text">Syncing data...</div>
            </div>
          ) : (
            <>
              <div className="section-header">
                <span className="section-label">Active tasks</span>
                <div className="section-line" />
                <span className="section-count">[{pending.length}]</span>
              </div>
              <div className="todo-list">
                {pending.length === 0 && <div className="empty">// No active tasks</div>}
                {pending.map((todo, i) => (
                  <TodoItem
                    key={todo.id} todo={todo} index={i}
                    deleting={deletingId === todo.id}
                    editing={editId === todo.id}
                    editText={editText}
                    onEditText={setEditText}
                    onStartEdit={() => { setEditId(todo.id); setEditText(todo.task); }}
                    onSaveEdit={() => saveEdit(todo.id)}
                    onDelete={() => deleteTodo(todo.id)}
                  />
                ))}
              </div>

              {done.length > 0 && (
                <>
                  <div className="section-header">
                    <span className="section-label">Completed</span>
                    <div className="section-line" />
                    <span className="section-count">[{done.length}]</span>
                  </div>
                  <div className="todo-list">
                    {done.map((todo, i) => (
                      <TodoItem
                        key={todo.id} todo={todo} index={i} completed
                        deleting={deletingId === todo.id}
                        editing={editId === todo.id}
                        editText={editText}
                        onEditText={setEditText}
                        onStartEdit={() => { setEditId(todo.id); setEditText(todo.task); }}
                        onSaveEdit={() => saveEdit(todo.id)}
                        onDelete={() => deleteTodo(todo.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Custom cursor component ─────────────────────────────────────────────────
function CustomCursor() {
  const dotRef = useRef();
  const ringRef = useRef();
  const pos = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });
  const raf = useRef();
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    const onMove = e => { pos.current = { x: e.clientX, y: e.clientY }; };
    const onOver = e => {
      if (e.target.matches("button,input,a,.check-wrap,.action-btn,.add-btn")) setHovering(true);
    };
    const onOut = () => setHovering(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mouseout", onOut);

    const animate = () => {
      if (dotRef.current) {
        dotRef.current.style.left = pos.current.x + "px";
        dotRef.current.style.top  = pos.current.y + "px";
      }
      if (ringRef.current) {
        ring.current.x += (pos.current.x - ring.current.x) * 0.12;
        ring.current.y += (pos.current.y - ring.current.y) * 0.12;
        ringRef.current.style.left = ring.current.x + "px";
        ringRef.current.style.top  = ring.current.y + "px";
      }
      raf.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className={`cursor-ring ${hovering ? "hovering" : ""}`} />
    </>
  );
}

// ── Todo item ───────────────────────────────────────────────────────────────
function TodoItem({ todo, completed, deleting, editing, editText, onEditText, onStartEdit, onSaveEdit, onDelete, index }) {
  return (
    <div
      className={`todo-item ${deleting ? "deleting" : ""} ${completed ? "completed-item" : ""}`}
      style={{ animationDelay: `${index * 55}ms` }}
    >
      <div className={`check-wrap ${completed ? "checked" : ""}`}>
        {completed && <span className="check-mark">✓</span>}
      </div>
      {editing ? (
        <input
          className="edit-input"
          value={editText}
          onChange={e => onEditText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") onSaveEdit(); if (e.key === "Escape") { onEditText(""); } }}
          autoFocus
        />
      ) : (
        <span className={`task-text ${completed ? "done-text" : ""}`}>{todo.task}</span>
      )}
      <div className="actions">
        {editing
          ? <button className="action-btn save-btn" onClick={onSaveEdit}>✓</button>
          : <button className="action-btn edit-btn" onClick={onStartEdit}>✎</button>
        }
        <button className="action-btn delete-btn" onClick={onDelete}>✕</button>
      </div>
    </div>
  );
}