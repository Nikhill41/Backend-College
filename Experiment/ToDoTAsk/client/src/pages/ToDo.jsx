// import { useState, useEffect } from "react";

// // ─── Backend URL ──────────────────────────────────────────────────────────────
// const API_URL = "http://localhost:5600/tasks";

// // ─── Main App Component ────────────────────────────────────────────────────────
// export default function TodoApp() {

//   const [tasks,            setTasks]            = useState([]);
//   const [taskName,         setTaskName]         = useState("");
//   const [selectedPriority, setSelectedPriority] = useState(null);
//   const [activeFilter,     setActiveFilter]     = useState("all");
//   const [loading,          setLoading]          = useState(false);
//   const [error,            setError]            = useState("");

//   // ── Load all tasks when page opens ────────────────────────────────────────
//   useEffect(() => {
//     fetchTasks();
//   }, []);

//   // ── GET /tasks ─────────────────────────────────────────────────────────────
//   async function fetchTasks() {
//     setLoading(true);
//     try {
//       const res  = await fetch(API_URL);
//       const data = await res.json();
//       setTasks(data);
//       setError("");
//     } catch (err) {
//       setError("Cannot connect to server. Make sure backend is running on port 5600.");
//     }
//     setLoading(false);
//   }

//   // ── POST /tasks ────────────────────────────────────────────────────────────
//   async function handleAddTask() {
//     if (!taskName.trim()) return;
//     if (!selectedPriority) { alert("Please select High or Low priority."); return; }

//     setLoading(true);
//     try {
//       const res     = await fetch(API_URL, {
//         method:  "POST",
//         headers: { "Content-Type": "application/json" },
//         body:    JSON.stringify({ name: taskName.trim(), priority: selectedPriority }),
//       });
//       const newTask = await res.json();
//       setTasks([newTask, ...tasks]);
//       setTaskName("");
//       setSelectedPriority(null);
//       setError("");
//     } catch (err) {
//       setError("Failed to add task.");
//     }
//     setLoading(false);
//   }

//   // ── PATCH /tasks/:id/toggle ────────────────────────────────────────────────
//   async function handleToggleDone(taskId) {
//     try {
//       const res         = await fetch(`${API_URL}/${taskId}/toggle`, { method: "PATCH" });
//       const updatedTask = await res.json();
//       setTasks(tasks.map((t) => (t._id === taskId ? updatedTask : t)));
//     } catch (err) {
//       setError("Failed to update task.");
//     }
//   }

//   // ── DELETE /tasks/:id ──────────────────────────────────────────────────────
//   async function handleDeleteTask(taskId) {
//     try {
//       await fetch(`${API_URL}/${taskId}`, { method: "DELETE" });
//       setTasks(tasks.filter((t) => t._id !== taskId));
//     } catch (err) {
//       setError("Failed to delete task.");
//     }
//   }

//   // ── Filter ─────────────────────────────────────────────────────────────────
//   function getFilteredTasks() {
//     if (activeFilter === "high") return tasks.filter((t) => t.priority === "high" && !t.done);
//     if (activeFilter === "low")  return tasks.filter((t) => t.priority === "low"  && !t.done);
//     if (activeFilter === "done") return tasks.filter((t) => t.done);
//     return tasks;
//   }

//   const filteredTasks = getFilteredTasks();

//   // ── Render ─────────────────────────────────────────────────────────────────
//   return (
//     <div style={css.page}>

//       {/* Header */}
//       <div style={css.header}>
//         <h1 style={css.title}>My Tasks</h1>
//         <p style={css.subtitle}>Stay on top of what matters</p>
//       </div>

//       <div style={css.app}>

//         {/* Error */}
//         {error && <div style={css.errorMsg}>⚠️ {error}</div>}

//         {/* Input Card */}
//         <div style={css.card}>

//           <label style={css.label}>Task Name</label>
//           <input
//             style={css.input}
//             type="text"
//             placeholder="What needs to be done?"
//             value={taskName}
//             onChange={(e) => setTaskName(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
//             onFocus={(e)  => (e.target.style.borderColor = "#3d5afe")}
//             onBlur={(e)   => (e.target.style.borderColor = "#e2e0d8")}
//           />

//           <label style={{ ...css.label, marginTop: "14px" }}>Priority</label>
//           <div style={css.priorityRow}>
//             <button
//               style={{
//                 ...css.priorityBtn,
//                 ...(selectedPriority === "high" ? css.activeHigh : {}),
//               }}
//               onClick={() => setSelectedPriority("high")}
//             >
//               🔴 High Priority
//             </button>
//             <button
//               style={{
//                 ...css.priorityBtn,
//                 ...(selectedPriority === "low" ? css.activeLow : {}),
//               }}
//               onClick={() => setSelectedPriority("low")}
//             >
//               🟢 Low Priority
//             </button>
//           </div>

//           <button
//             style={{ ...css.addBtn, opacity: loading ? 0.5 : 1 }}
//             onClick={handleAddTask}
//             disabled={loading}
//           >
//             {loading ? "Adding..." : "+ Add Task"}
//           </button>

//         </div>

//         {/* Filter Tabs */}
//         <div style={css.filters}>
//           {["all", "high", "low", "done"].map((f) => (
//             <button
//               key={f}
//               style={{
//                 ...css.filterBtn,
//                 ...(activeFilter === f ? css.filterBtnActive : {}),
//               }}
//               onClick={() => setActiveFilter(f)}
//             >
//               {f.charAt(0).toUpperCase() + f.slice(1)}
//             </button>
//           ))}
//         </div>

//         {/* Task List */}
//         <div style={css.taskList}>
//           {loading && tasks.length === 0 && <div style={css.empty}>Loading tasks...</div>}
//           {!loading && filteredTasks.length === 0 && <div style={css.empty}>No tasks here yet.</div>}
//           {filteredTasks.map((task) => (
//             <TaskItem
//               key={task._id}
//               task={task}
//               onToggle={handleToggleDone}
//               onDelete={handleDeleteTask}
//             />
//           ))}
//         </div>

//       </div>
//     </div>
//   );
// }

// // ─── TaskItem Component ────────────────────────────────────────────────────────
// function TaskItem({ task, onToggle, onDelete }) {
//   return (
//     <div style={{ ...css.taskItem, opacity: task.done ? 0.5 : 1 }}>

//       {/* Checkbox */}
//       <div
//         style={{
//           ...css.checkbox,
//           background:   task.done ? "#1a1a18" : "transparent",
//           borderColor:  task.done ? "#1a1a18" : "#e2e0d8",
//         }}
//         onClick={() => onToggle(task._id)}
//       >
//         {task.done && <span style={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}>✓</span>}
//       </div>

//       {/* Info */}
//       <div style={{ flex: 1 }}>
//         <div style={{
//           ...css.taskName,
//           textDecoration: task.done ? "line-through" : "none",
//           color:          task.done ? "#888880" : "#1a1a18",
//         }}>
//           {task.name}
//         </div>
//         <span style={{
//           ...css.badge,
//           background: task.priority === "high" ? "#fff0f0" : "#edfaf4",
//           color:      task.priority === "high" ? "#e84040" : "#2b9e6e",
//         }}>
//           {task.priority === "high" ? "🔴 High" : "🟢 Low"}
//         </span>
//       </div>

//       {/* Delete */}
//       <button
//         style={css.deleteBtn}
//         onClick={() => onDelete(task._id)}
//         onMouseEnter={(e) => { e.target.style.color = "#e84040"; e.target.style.background = "#fff0f0"; }}
//         onMouseLeave={(e) => { e.target.style.color = "#888880"; e.target.style.background = "none"; }}
//       >
//         ✕
//       </button>

//     </div>
//   );
// }

// // ─── All styles as JS objects (no CSS string, no @import issues) ──────────────
// const css = {
//   page: {
//     fontFamily:     "system-ui, -apple-system, sans-serif",
//     background:     "#f5f4f0",
//     minHeight:      "100vh",
//     color:          "#1a1a18",
//     display:        "flex",
//     flexDirection:  "column",
//     alignItems:     "center",
//     padding:        "48px 16px",
//   },
//   header: {
//     textAlign:    "center",
//     marginBottom: "36px",
//   },
//   title: {
//     fontSize:      "2.4rem",
//     fontWeight:    800,
//     letterSpacing: "-1px",
//     margin:        0,
//   },
//   subtitle: {
//     color:     "#888880",
//     marginTop: "6px",
//     fontSize:  "0.95rem",
//   },
//   app: {
//     width:    "100%",
//     maxWidth: "540px",
//   },
//   errorMsg: {
//     textAlign:    "center",
//     padding:      "12px 16px",
//     background:   "#fff0f0",
//     color:        "#e84040",
//     borderRadius: "10px",
//     fontSize:     "0.9rem",
//     marginBottom: "16px",
//   },
//   card: {
//     background:    "#fff",
//     border:        "1px solid #e2e0d8",
//     borderRadius:  "16px",
//     padding:       "24px",
//     boxShadow:     "0 2px 16px rgba(0,0,0,0.07)",
//     marginBottom:  "24px",
//   },
//   label: {
//     display:       "block",
//     fontSize:      "0.8rem",
//     fontWeight:    600,
//     textTransform: "uppercase",
//     letterSpacing: "0.08em",
//     color:         "#888880",
//     marginBottom:  "8px",
//   },
//   input: {
//     width:        "100%",
//     padding:      "12px 16px",
//     border:       "1.5px solid #e2e0d8",
//     borderRadius: "10px",
//     fontSize:     "1rem",
//     color:        "#1a1a18",
//     background:   "#f5f4f0",
//     outline:      "none",
//     boxSizing:    "border-box",
//   },
//   priorityRow: {
//     display: "flex",
//     gap:     "10px",
//   },
//   priorityBtn: {
//     flex:          1,
//     padding:       "10px",
//     borderRadius:  "10px",
//     border:        "1.5px solid #e2e0d8",
//     background:    "#f5f4f0",
//     fontSize:      "0.9rem",
//     fontWeight:    500,
//     cursor:        "pointer",
//     display:       "flex",
//     alignItems:    "center",
//     justifyContent:"center",
//     gap:           "6px",
//     color:         "#888880",
//   },
//   activeHigh: {
//     borderColor: "#e84040",
//     background:  "#fff0f0",
//     color:       "#e84040",
//   },
//   activeLow: {
//     borderColor: "#2b9e6e",
//     background:  "#edfaf4",
//     color:       "#2b9e6e",
//   },
//   addBtn: {
//     width:        "100%",
//     marginTop:    "16px",
//     padding:      "13px",
//     background:   "#1a1a18",
//     color:        "#fff",
//     border:       "none",
//     borderRadius: "10px",
//     fontSize:     "1rem",
//     fontWeight:   600,
//     cursor:       "pointer",
//   },
//   filters: {
//     display:      "flex",
//     gap:          "8px",
//     marginBottom: "16px",
//   },
//   filterBtn: {
//     padding:      "7px 16px",
//     borderRadius: "20px",
//     border:       "1.5px solid #e2e0d8",
//     background:   "transparent",
//     fontSize:     "0.85rem",
//     fontWeight:   500,
//     cursor:       "pointer",
//     color:        "#888880",
//   },
//   filterBtnActive: {
//     background:  "#1a1a18",
//     color:       "#fff",
//     borderColor: "#1a1a18",
//   },
//   taskList: {
//     display:       "flex",
//     flexDirection: "column",
//     gap:           "10px",
//   },
//   taskItem: {
//     background:   "#fff",
//     border:       "1px solid #e2e0d8",
//     borderRadius: "12px",
//     padding:      "16px 18px",
//     display:      "flex",
//     alignItems:   "center",
//     gap:          "14px",
//     boxShadow:    "0 2px 16px rgba(0,0,0,0.07)",
//   },
//   checkbox: {
//     width:          "20px",
//     height:         "20px",
//     borderRadius:   "6px",
//     border:         "2px solid #e2e0d8",
//     cursor:         "pointer",
//     flexShrink:     0,
//     display:        "flex",
//     alignItems:     "center",
//     justifyContent: "center",
//   },
//   taskName: {
//     fontSize:   "0.97rem",
//     fontWeight: 500,
//   },
//   badge: {
//     display:       "inline-block",
//     marginTop:     "4px",
//     padding:       "2px 10px",
//     borderRadius:  "20px",
//     fontSize:      "0.72rem",
//     fontWeight:    600,
//     textTransform: "uppercase",
//     letterSpacing: "0.07em",
//   },
//   deleteBtn: {
//     background:   "none",
//     border:       "none",
//     color:        "#888880",
//     fontSize:     "1.1rem",
//     cursor:       "pointer",
//     padding:      "4px 8px",
//     borderRadius: "6px",
//   },
//   empty: {
//     textAlign: "center",
//     padding:   "40px 0",
//     color:     "#888880",
//     fontSize:  "0.95rem",
//   },
// };





import { useState, useEffect } from "react";

// ─── Backend URL ──────────────────────────────────────────────────────────────
const API_URL = "http://localhost:5600/tasks";

// ─── Main App Component ────────────────────────────────────────────────────────
export default function TodoApp() {

  const [tasks,            setTasks]            = useState([]);
  const [taskName,         setTaskName]         = useState("");
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [activeFilter,     setActiveFilter]     = useState("all");
  const [loading,          setLoading]          = useState(false);
  const [error,            setError]            = useState("");

  // ── Load all tasks when page opens ────────────────────────────────────────
  useEffect(() => {
    fetchTasks();
  }, []);

  // ── GET /tasks ─────────────────────────────────────────────────────────────
  async function fetchTasks() {
    setLoading(true);
    try {
      const res  = await fetch(API_URL);
      const data = await res.json();
      setTasks(data);
      setError("");
    } catch (err) {
      setError("Cannot connect to server. Make sure backend is running on port 5600.");
    }
    setLoading(false);
  }

  // ── POST /tasks ────────────────────────────────────────────────────────────
  async function handleAddTask() {
    if (!taskName.trim()) return;
    if (!selectedPriority) { alert("Please select High or Low priority."); return; }

    setLoading(true);
    try {
      const res     = await fetch(API_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: taskName.trim(), priority: selectedPriority }),
      });
      const newTask = await res.json();
      setTasks([newTask, ...tasks]);
      setTaskName("");
      setSelectedPriority(null);
      setError("");
    } catch (err) {
      setError("Failed to add task.");
    }
    setLoading(false);
  }

  // ── PATCH /tasks/:id/toggle ────────────────────────────────────────────────
  async function handleToggleDone(taskId) {
    try {
      const res         = await fetch(`${API_URL}/${taskId}/toggle`, { method: "PATCH" });
      const updatedTask = await res.json();
      setTasks(tasks.map((t) => (t._id === taskId ? updatedTask : t)));
    } catch (err) {
      setError("Failed to update task.");
    }
  }

  // ── DELETE /tasks/:id ──────────────────────────────────────────────────────
  async function handleDeleteTask(taskId) {
    try {
      await fetch(`${API_URL}/${taskId}`, { method: "DELETE" });
      setTasks(tasks.filter((t) => t._id !== taskId));
    } catch (err) {
      setError("Failed to delete task.");
    }
  }

  // ── Filter ─────────────────────────────────────────────────────────────────
  function getFilteredTasks() {
    if (activeFilter === "high") return tasks.filter((t) => t.priority === "high" && !t.done);
    if (activeFilter === "low")  return tasks.filter((t) => t.priority === "low"  && !t.done);
    if (activeFilter === "done") return tasks.filter((t) => t.done);
    return tasks;
  }

  const filteredTasks = getFilteredTasks();

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col items-center px-4 py-12">

      {/* ── Header ── */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight">My Tasks</h1>
        <p className="text-stone-500 mt-2 text-sm">Stay on top of what matters</p>
      </div>

      <div className="w-full max-w-xl">

        {/* ── Error Message ── */}
        {error && (
          <div className="bg-red-50 text-red-500 text-sm text-center px-4 py-3 rounded-xl mb-4">
            ⚠️ {error}
          </div>
        )}

        {/* ── Input Card ── */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm mb-6">

          {/* Task Name */}
          <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
            Task Name
          </label>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            className="w-full px-4 py-3 bg-stone-100 border border-stone-200 rounded-xl text-sm text-stone-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />

          {/* Priority Buttons */}
          <label className="block text-xs font-semibold uppercase tracking-widest text-stone-400 mt-4 mb-2">
            Priority
          </label>
          <div className="flex gap-3">

            {/* High Priority */}
            <button
              onClick={() => setSelectedPriority("high")}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition
                ${selectedPriority === "high"
                  ? "border-red-400 bg-red-50 text-red-500"
                  : "border-stone-200 bg-stone-100 text-stone-400 hover:border-red-300 hover:text-red-400"
                }`}
            >
              🔴 High Priority
            </button>

            {/* Low Priority */}
            <button
              onClick={() => setSelectedPriority("low")}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition
                ${selectedPriority === "low"
                  ? "border-emerald-400 bg-emerald-50 text-emerald-600"
                  : "border-stone-200 bg-stone-100 text-stone-400 hover:border-emerald-300 hover:text-emerald-500"
                }`}
            >
              🟢 Low Priority
            </button>

          </div>

          {/* Add Button */}
          <button
            onClick={handleAddTask}
            disabled={loading}
            className="w-full mt-4 py-3 bg-stone-900 text-white font-semibold rounded-xl hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "Adding..." : "+ Add Task"}
          </button>

        </div>

        {/* ── Filter Tabs ── */}
        <div className="flex gap-2 mb-4">
          {["all", "high", "low", "done"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full border text-sm font-medium transition
                ${activeFilter === filter
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-transparent text-stone-400 border-stone-200 hover:border-stone-400 hover:text-stone-600"
                }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Task List ── */}
        <div className="flex flex-col gap-3">

          {/* Loading */}
          {loading && tasks.length === 0 && (
            <p className="text-center py-10 text-stone-400 text-sm">Loading tasks...</p>
          )}

          {/* Empty */}
          {!loading && filteredTasks.length === 0 && (
            <p className="text-center py-10 text-stone-400 text-sm">No tasks here yet.</p>
          )}

          {/* Task Cards */}
          {filteredTasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              onToggle={handleToggleDone}
              onDelete={handleDeleteTask}
            />
          ))}

        </div>
      </div>
    </div>
  );
}

// ─── TaskItem Component ────────────────────────────────────────────────────────
function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div className={`bg-white border border-stone-200 rounded-xl px-4 py-4 flex items-center gap-4 shadow-sm transition ${task.done ? "opacity-50" : ""}`}>

      {/* Checkbox */}
      <div
        onClick={() => onToggle(task._id)}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition
          ${task.done
            ? "bg-stone-900 border-stone-900"
            : "bg-transparent border-stone-300 hover:border-stone-500"
          }`}
      >
        {task.done && <span className="text-white text-xs font-bold">✓</span>}
      </div>

      {/* Task Info */}
      <div className="flex-1">
        <p className={`text-sm font-medium ${task.done ? "line-through text-stone-400" : "text-stone-900"}`}>
          {task.name}
        </p>
        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide
          ${task.priority === "high"
            ? "bg-red-50 text-red-500"
            : "bg-emerald-50 text-emerald-600"
          }`}
        >
          {task.priority === "high" ? "🔴 High" : "🟢 Low"}
        </span>
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onDelete(task._id)}
        className="text-stone-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg text-base transition"
      >
        ✕
      </button>

    </div>
  );
}


