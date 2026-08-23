import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { TaskItem } from './TaskItem';

export function CompletedSection({ tasks, onToggle, onDelete }) {
  const [isOpen, setIsOpen] = useState(true);

  if (tasks.length === 0) return null;

  return (
    <div className="completed-section">
      <button
        type="button"
        className="completed-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="completed-toggle-info">
          Completed ({tasks.length})
        </span>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {isOpen && (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
