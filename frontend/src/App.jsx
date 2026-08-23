import React, { useState, useEffect } from 'react';
import { TaskInput } from './components/TaskInput';
import { TaskList } from './components/TaskList';
import { fetchTasks, createTask, toggleTask, deleteTask, updateTaskTitle } from './api/client';

export function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorToast, setErrorToast] = useState(null);

  useEffect(() => {
    fetchTasks()
      .then((data) => {
        setTasks(data);
        setLoading(false);
      })
      .catch(() => {
        showError('Could not load tasks. Please refresh.');
        setLoading(false);
      });
  }, []);

  const showError = (msg) => {
    setErrorToast(msg);
    setTimeout(() => {
      setErrorToast(null);
    }, 3000);
  };

  const handleAddTask = async (title) => {
    try {
      const newTask = await createTask(title);
      setTasks((prev) => [...prev, newTask]);
    } catch (err) {
      showError(err.message || 'Failed to add task.');
    }
  };

  const handleToggleTask = async (taskToToggle) => {
    const originalState = taskToToggle.is_completed;
    const targetState = !originalState;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskToToggle.id ? { ...t, is_completed: targetState } : t))
    );

    try {
      await toggleTask(taskToToggle.id, targetState);
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskToToggle.id ? { ...t, is_completed: originalState } : t))
      );
      showError('Failed to update task.');
    }
  };

  const handleUpdateTitle = async (id, newTitle) => {
    const originalTask = tasks.find((t) => t.id === id);
    if (!originalTask) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, title: newTitle } : t))
    );

    try {
      await updateTaskTitle(id, newTitle);
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, title: originalTask.title } : t))
      );
      showError('Failed to edit task title.');
    }
  };

  const handleDeleteTask = async (idToDelete) => {
    const deletedIndex = tasks.findIndex((t) => t.id === idToDelete);
    if (deletedIndex === -1) return;
    const taskToDelete = tasks[deletedIndex];

    setTasks((prev) => prev.filter((t) => t.id !== idToDelete));

    try {
      await deleteTask(idToDelete);
    } catch (err) {
      setTasks((prev) => {
        const restored = [...prev];
        restored.splice(deletedIndex, 0, taskToDelete);
        return restored;
      });
      showError('Failed to delete task.');
    }
  };

  return (
    <div className="main-wrapper">
      {/* Decorative Dot Matrices */}
      <div className="dot-grid-top-left">
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>

      <div className="dot-row-bottom-left">
        <span />
        <span />
        <span />
      </div>

      {/* Left Hero Column */}
      <div className="hero-section">
        <h1 className="hero-title">ToDo App</h1>
        <p className="hero-subtitle">Let's Accomplish Tasks Together!</p>
        <div className="hero-mascot-container">
          <img src="/owl_mascot.png" alt="Owl Mascot" className="hero-mascot-img" />
        </div>
      </div>

      {/* Right Dark Card App Section */}
      <div className="app-card">
        <h2 className="app-card-title">Get Things Done !</h2>

        <TaskInput onAddTask={handleAddTask} />

        {loading ? (
          <div className="empty-tasks-msg">Loading tasks...</div>
        ) : (
          <TaskList
            tasks={tasks}
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
            onUpdateTitle={handleUpdateTitle}
          />
        )}
      </div>

      {errorToast && <div className="toast-msg">{errorToast}</div>}
    </div>
  );
}

export default App;
