/* FULL FILE – RESTORED UI + NOTES + TASKS + LEAD ASSIGNMENT (FIXED) */

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import { getLead, updateLead } from "@/api/leads";
import {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
  LeadNote,
} from "@/api/leadNotes";
import {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  Task,
} from "@/api/tasks";

import { listUsers, User } from "@/api/users";
import { assignLead } from "@/api/leadAssignments";

type TaskFilter = "all" | "today" | "overdue";

function formatIST(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9]{7,15}$/;

  const [lead, setLead] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);

  // NOTES
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [noteText, setNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  // TASKS
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskNote, setTaskNote] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState("");
  const [editingTaskNote, setEditingTaskNote] = useState("");
  const [editingTaskDueAt, setEditingTaskDueAt] = useState("");

  async function loadAll() {
    if (!id) return;
    const [l, n, t, u] = await Promise.all([
      getLead(id),
      listNotes(id),
      listTasks(id),
      listUsers(),
    ]);
    setLead(l);
    setNotes(n);
    setTasks(t);
    setUsers(u);
  }

  useEffect(() => {
    loadAll();
  }, [id]);

  async function saveLead() {
    await updateLead(id!, lead);
    navigate("/");
  }

  async function changeOwner(newOwnerId: string) {
    if (newOwnerId === lead.ownerId) return;
    await assignLead(id!, newOwnerId);
    loadAll();
  }

  /* ---------- NOTES ---------- */

  async function addNote() {
    if (!noteText.trim()) return;
    await createNote(id!, noteText);
    setNoteText("");
    await loadAll(); // force canonical data
  }


  async function saveNote(noteId: string) {
    await updateNote(noteId, editingNoteText);
    setEditingNoteId(null);
    loadAll();
  }

  async function removeNote(noteId: string) {
    if (!confirm("Delete this note?")) return;
    await deleteNote(noteId);
    loadAll();
  }

  /* ---------- TASKS ---------- */

  async function addTask() {
    if (!taskTitle || !dueAt) return;
    await createTask(id!, { title: taskTitle, note: taskNote, dueAt });
    setTaskTitle("");
    setTaskNote("");
    setDueAt("");
    loadAll();
  }

  async function saveTask(taskId: string) {
    await updateTask(id!, taskId, {
      title: editingTaskTitle,
      note: editingTaskNote,
      dueAt: editingTaskDueAt,
    });
    setEditingTaskId(null);
    loadAll();
  }

  async function removeTask(taskId: string) {
    if (!confirm("Delete this task?")) return;
    await deleteTask(id!, taskId);
    loadAll();
  }

  async function toggle(taskId: string) {
    await completeTask(id!, taskId);
    await loadAll();
  }

  const filteredTasks = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return tasks.filter((t) => {
      if (t.completed) return taskFilter === "all";
      if (taskFilter === "today") return t.dueAt.startsWith(today);
      if (taskFilter === "overdue") return t.dueAt < today;
      return true;
    });
  }, [tasks, taskFilter]);

  if (!lead) return null;

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* EDIT LEAD */}
          <div className="rounded bg-white p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">Edit Lead</h2>

            <label className="text-sm font-medium">Assigned to</label>
            <select
              className="mb-4 w-full rounded border px-3 py-2"
              value={lead.ownerId}
              onChange={(e) => changeOwner(e.target.value)}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>

            {["name", "email", "phone", "company"].map((f) => (
              <input
                key={f}
                className="mb-3 w-full rounded border px-3 py-2"
                value={lead[f] || ""}
                placeholder={f}
                onChange={(e) =>
                  setLead({ ...lead, [f]: e.target.value })
                }
              />
            ))}

            <button
              onClick={saveLead}
              className="rounded bg-slate-900 px-4 py-2 text-white"
            >
              Save
            </button>
          </div>

          {/* NOTES */}
          <div className="rounded bg-white p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">Notes</h2>

            <textarea
              className="w-full rounded border px-3 py-2"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />

            <button
              onClick={addNote}
              className="mt-2 rounded bg-slate-900 px-4 py-2 text-white"
            >
              Add Note
            </button>

            <div className="mt-4 space-y-3">
              {notes.map((n) => (
                <div key={n.id} className="rounded border p-3">
                  {editingNoteId === n.id ? (
                    <div className="rounded bg-slate-50 p-3 border">
                      <textarea
                        autoFocus
                        className="mb-2 w-full rounded border px-3 py-2 text-sm"
                        value={editingNoteText}
                        onChange={(e) =>
                          setEditingNoteText(e.target.value)
                        }
                      />

                      <div className="flex gap-3">
                        <button
                          className="rounded bg-slate-900 px-4 py-1.5 text-sm text-white"
                          onClick={() => saveNote(n.id)}
                        >
                          Save changes
                        </button>
                        <button
                          className="text-sm text-slate-500 hover:underline"
                          onClick={() => {
                            setEditingNoteId(null);
                            setEditingNoteText("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (

                    <>
                      <div className="whitespace-pre-wrap text-sm">{n.content}</div>

                      <div className="mt-1 text-xs text-slate-500">
                        {formatIST(n.createdAt)}
                      </div>

                      <div className="mt-2 flex gap-3 text-sm">
                        <button
                          className="text-slate-600 hover:underline"
                          onClick={() => {
                            setEditingNoteId(n.id);
                            setEditingNoteText(n.content);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-600 hover:underline"
                          onClick={() => removeNote(n.id)}
                        >
                          Delete
                        </button>
                      </div>

                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TASKS */}
        <div className="space-y-6">
          <div className="rounded bg-white p-6 shadow">
            <h2 className="text-lg font-semibold mb-4">Tasks</h2>
            {/* TASK FILTERS */}
            <div className="mb-4 flex gap-2">
              <button
                onClick={() => setTaskFilter("all")}
                className={`rounded px-3 py-1 text-sm ${taskFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "border"
                  }`}
              >
                ALL
              </button>

              <button
                onClick={() => setTaskFilter("today")}
                className={`rounded px-3 py-1 text-sm ${taskFilter === "today"
                  ? "bg-slate-900 text-white"
                  : "border"
                  }`}
              >
                TODAY
              </button>

              <button
                onClick={() => setTaskFilter("overdue")}
                className={`rounded px-3 py-1 text-sm ${taskFilter === "overdue"
                  ? "bg-slate-900 text-white"
                  : "border"
                  }`}
              >
                OVERDUE
              </button>
            </div>


            <div className="rounded border bg-slate-50 p-3">
              <input
                className="mb-2 w-full rounded border px-3 py-2 text-sm"
                placeholder="Task title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />

              <textarea
                className="mb-2 w-full rounded border px-3 py-2 text-sm"
                placeholder="Optional description"
                value={taskNote}
                onChange={(e) => setTaskNote(e.target.value)}
              />

              <input
                type="date"
                className="mb-3 w-full rounded border px-3 py-2 text-sm"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />

              <button
                onClick={addTask}
                className="rounded bg-slate-900 px-4 py-2 text-sm text-white"
              >
                Add Task
              </button>
            </div>


            <div className="mt-4 space-y-3">
              {filteredTasks.map((t) => (
                <div key={t.id} className="rounded border p-3">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={t.completed}
                      onChange={() => toggle(t.id)}
                    />

                    <div className="flex-1">
                      {editingTaskId === t.id ? (
                        <>
                          <div className="rounded bg-white p-2 shadow-sm">
                            <input
                              autoFocus
                              className="mb-2 w-full rounded border px-2 py-1 text-sm"
                              value={editingTaskTitle}
                              onChange={(e) =>
                                setEditingTaskTitle(e.target.value)
                              }
                            />
                            <textarea
                              className="mb-2 w-full rounded border px-2 py-1 text-sm"
                              value={editingTaskNote}
                              onChange={(e) =>
                                setEditingTaskNote(e.target.value)
                              }
                            />
                            <button
                              className="rounded bg-slate-900 px-3 py-1 text-sm text-white"
                              onClick={() => saveTask(t.id)}
                            >
                              Save changes
                            </button>
                          </div>

                        </>
                      ) : (
                        <>
                          <div
                            className={`text-sm font-medium ${t.completed ? "line-through text-slate-400" : ""
                              }`}
                          >
                            {t.title}
                          </div>

                          {t.note && (
                            <div
                              className={`mt-1 whitespace-pre-wrap text-sm ${t.completed ? "text-slate-400 line-through" : "text-slate-600"
                                }`}
                            >
                              {t.note}
                            </div>
                          )}

                          <div className="mt-1 text-xs text-slate-500">
                            {t.completed ? "Completed" : `Due on ${formatIST(t.dueAt)}`}
                          </div>

                          <div className="mt-1 flex gap-3 text-sm">
                            <button
                              className="text-slate-600 hover:underline"
                              onClick={() => {
                                setEditingTaskId(t.id);
                                setEditingTaskTitle(t.title);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 hover:underline"
                              onClick={() => removeTask(t.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
