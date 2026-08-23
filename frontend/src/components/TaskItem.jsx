import React, { useState } from 'react';
import { SquarePen, Trash2, Check, X } from 'lucide-react';

export function TaskItem({ task, onToggle, onDelete, onUpdateTitle }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleSaveEdit = (e) => {
    e.stopPropagation();
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== task.title) {
      onUpdateTitle(task.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditTitle(task.title);
    setIsEditing(false);
  };

  return (
    <div className={`task-item-card ${task.is_completed ? 'completed' : ''}`}>
      <div className="task-main-content" onClick={() => !isEditing && onToggle(task)}>
        <button
          type="button"
          className={`task-tick-btn ${task.is_completed ? 'checked' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task);
          }}
          title={task.is_completed ? "Mark as pending" : "Tick as completed"}
          aria-label={task.is_completed ? "Mark as pending" : "Tick as completed"}
        >
          <Check size={14} strokeWidth={3} />
        </button>

        {isEditing ? (
          <input
            type="text"
            className="task-edit-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit(e);
              if (e.key === 'Escape') handleCancelEdit(e);
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span className="task-text">{task.title}</span>
        )}
      </div>

      <div className="task-actions">
        {isEditing ? (
          <>
            <button
              type="button"
              className="action-icon-btn save"
              onClick={handleSaveEdit}
              title="Save"
            >
              <Check size={18} />
            </button>
            <button
              type="button"
              className="action-icon-btn"
              onClick={handleCancelEdit}
              title="Cancel"
            >
              <X size={18} />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="action-icon-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              title="Edit task"
            >
              <SquarePen size={18} />
            </button>
            <button
              type="button"
              className="action-icon-btn delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              title="Delete task"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
