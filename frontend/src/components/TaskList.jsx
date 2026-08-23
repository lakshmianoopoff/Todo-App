import React from 'react';
import { TaskItem } from './TaskItem';

export function TaskList({ tasks, onToggle, onDelete, onUpdateTitle }) {
  if (!tasks || tasks.length === 0) {
    return <div className="empty-tasks-msg">No tasks added yet!</div>;
  }

  const notCompleted = tasks.filter((t) => !t.is_completed);
  const completed = tasks.filter((t) => t.is_completed);

  return (
    <div className="task-list-container">
      {notCompleted.length > 0 && (
        <div className="task-section">
          <h3 className="section-subtitle">Not Completed ({notCompleted.length})</h3>
          <div className="task-group">
            {notCompleted.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdateTitle={onUpdateTitle}
              />
            ))}
          </div>
        </div>
      )}

      {completed.length > 0 && (
        <div className="task-section">
          <h3 className="section-subtitle">Completed ({completed.length})</h3>
          <div className="task-group">
            {completed.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdateTitle={onUpdateTitle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
