import { useEffect, useState } from "react";
import "./App.css";

const STORAGE_KEY = "taskflow-tasks";
const SAMPLE_TASKS = [
  {
    id: "sample-requirements",
    title: "Review project requirements",
    completed: false,
  },
  {
    id: "sample-layout",
    title: "Finish the dashboard layout",
    completed: false,
  },
  {
    id: "sample-persistence",
    title: "Test task persistence",
    completed: false,
  },
];
const FILTERS = ["All", "Active", "Completed"];

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    // An empty saved array is intentional; only missing or invalid data uses samples.
    if (savedTasks === null) return SAMPLE_TASKS;

    const parsedTasks = JSON.parse(savedTasks);
    const isValid =
      Array.isArray(parsedTasks) &&
      parsedTasks.every(
        (task) =>
          task !== null &&
          typeof task.id === "string" &&
          task.id.length > 0 &&
          typeof task.title === "string" &&
          task.title.trim().length > 0 &&
          typeof task.completed === "boolean",
      );

    return isValid &&
      new Set(parsedTasks.map((task) => task.id)).size === parsedTasks.length
      ? parsedTasks
      : SAMPLE_TASKS;
  } catch {
    return SAMPLE_TASKS;
  }
}

function createTaskId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  // getRandomValues also works when the app is opened over a local HTTP network.
  return Array.from(crypto.getRandomValues(new Uint32Array(4)), (value) =>
    value.toString(16),
  ).join("-");
}

function Icon({ name, ...props }) {
  const paths = {
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    trash: <path d="M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6M14 10v6" />,
    list: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="3" />
        <path d="m8 9 1 1 2-2M14 9h2M8 15h8" />
      </>
    ),
  };

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(loadTasks);
  const [taskTitle, setTaskTitle] = useState("");
  const [filter, setFilter] = useState("All");
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("taskflow-task", JSON.stringify(tasks));
      setSaveFailed(false);
    } catch {
      setSaveFailed(true);
    }
  }, [tasks]);

  const completedCount = tasks.filter((task) => task.completed).length;
  const activeCount = tasks.length - completedCount;
  const filterCounts = {
    All: tasks.length,
    Active: activeCount,
    Completed: completedCount,
  };
  const visibleTasks = tasks.filter((task) => {
    if (filter === "Active") return !task.completed;
    if (filter === "Completed") return task.completed;
    return true;
  });
  const progress =
    tasks.length === 0 ? 0 : (completedCount / tasks.length) * 100;

  function addTask(event) {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;

    const newTask = { id: createTaskId(), title, completed: false };
    setTasks((currentTasks) => [...currentTasks, newTask]);
    setTaskTitle("");
    if (filter === "Completed") setFilter("All");
    event.currentTarget.elements.title.focus();
  }

  function toggleTask(taskId) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function deleteTask(taskId) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId),
    );
  }

  const emptyTitle =
    tasks.length === 0
      ? "A fresh start."
      : filter === "Active"
        ? "You’re all caught up."
        : "Progress starts with one task.";
  const emptyDescription =
    tasks.length === 0
      ? "Add your first task and take it one step at a time."
      : filter === "Active"
        ? "Every task is checked off. Enjoy a little breathing room."
        : "Check off a task and you’ll find it here.";

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <span className="brand-mark">
              <Icon name="check" />
            </span>
            <span>
              taskflow<span className="brand-dot">.</span>
            </span>
          </div>
          <span className="topbar-note">A space to get things done</span>
        </div>
      </header>

      <main className="workspace">
        <section className="page-heading" aria-labelledby="page-title">
          <div>
            <p className="eyebrow">A LITTLE FOCUS GOES A LONG WAY</p>
            <h1 id="page-title">My Tasks</h1>
            <p className="subtitle">A little progress every day.</p>
          </div>
          <div
            className="progress-summary"
            aria-live="polite"
            aria-atomic="true"
          >
            <svg
              className="progress-ring"
              viewBox="0 0 40 40"
              aria-hidden="true"
            >
              <circle className="progress-track" cx="20" cy="20" r="16" />
              <circle
                className="progress-value"
                cx="20"
                cy="20"
                r="16"
                pathLength="100"
                strokeDasharray={`${progress} 100`}
              />
            </svg>
            <div>
              <p className="progress-count">
                {completedCount}
                <span> / {tasks.length}</span>
              </p>
              <p className="progress-label">tasks completed</p>
            </div>
          </div>
        </section>

        <form className="task-form" onSubmit={addTask}>
          <label htmlFor="task-title">What’s next?</label>
          <div className="task-form-row">
            <input
              id="task-title"
              name="title"
              type="text"
              placeholder="Add a task to your list…"
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              autoComplete="off"
              required
            />
            <button
              className="add-button"
              type="submit"
              disabled={!taskTitle.trim()}
            >
              <Icon name="plus" />
              Add Task
            </button>
          </div>
          <p className="input-hint">Big plans start with small tasks.</p>
        </form>

        {saveFailed && (
          <p className="save-warning" role="alert">
            Your changes couldn’t be saved in this browser. Keep this page open
            to avoid losing them.
          </p>
        )}

        <section className="task-section" aria-label="Your tasks">
          <div className="list-toolbar">
            <div className="filters" role="group" aria-label="Filter tasks">
              {FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`filter-button${filter === option ? " is-selected" : ""}`}
                  aria-pressed={filter === option}
                  onClick={() => setFilter(option)}
                >
                  {option}
                  <span className="filter-count">{filterCounts[option]}</span>
                </button>
              ))}
            </div>
            <p className="remaining-count">
              {activeCount} {activeCount === 1 ? "task" : "tasks"} left
            </p>
          </div>

          {visibleTasks.length > 0 ? (
            <ul className="task-list">
              {visibleTasks.map((task) => (
                <li
                  className={`task-card${task.completed ? " is-completed" : ""}`}
                  key={task.id}
                >
                  <label className="task-label">
                    <input
                      className="task-checkbox"
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span className="checkbox-visual">
                      <Icon name="check" />
                    </span>
                    <span className="task-title">{task.title}</span>
                  </label>
                  <button
                    type="button"
                    className="delete-button"
                    aria-label={`Delete ${task.title}`}
                    title={`Delete ${task.title}`}
                    onClick={() => deleteTask(task.id)}
                  >
                    <Icon name="trash" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">
                <Icon
                  name={
                    filter === "Active" && tasks.length > 0 ? "check" : "list"
                  }
                  width="27"
                  height="27"
                />
              </span>
              <h2>{emptyTitle}</h2>
              <p>{emptyDescription}</p>
            </div>
          )}
        </section>
        <p className="list-hint">
          <Icon name="check" width="14" height="14" />
          One task at a time. You’ve got this.
        </p>
      </main>
    </div>
  );
}
