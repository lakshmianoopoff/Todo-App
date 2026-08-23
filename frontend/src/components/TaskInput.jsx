import React, { useState } from 'react';

export function TaskInput({ onAddTask }) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAddTask(trimmed);
    setTitle('');
  };

  return (
    <form className="task-input-box" onSubmit={handleSubmit}>
      <input
        type="text"
        className="task-input-field"
        placeholder="What is the task today?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      <button
        type="submit"
        className="task-input-btn"
        disabled={!title.trim()}
      >
        Add Task
      </button>
    </form>
  );
}
