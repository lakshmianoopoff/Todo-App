const rawApiUrl = import.meta.env.VITE_API_URL;

function getApiBase() {
  if (rawApiUrl) {
    const cleanUrl = rawApiUrl.replace(/\/+$/, '');
    if (cleanUrl.endsWith('/api/tasks')) {
      return `${cleanUrl}/`;
    }
    if (cleanUrl.endsWith('/api')) {
      return `${cleanUrl}/tasks/`;
    }
    return `${cleanUrl}/api/tasks/`;
  }

  if (import.meta.env.DEV) {
    return '/api/tasks/';
  }

  return 'https://todo-app-backend-h1pr.onrender.com/api/tasks/';
}

const API_BASE = getApiBase();

export async function fetchTasks() {
  const res = await fetch(API_BASE, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return res.json();
}

export async function createTask(title) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.title ? errorData.title[0] : 'Failed to create task';
    throw new Error(message);
  }
  return res.json();
}

export async function toggleTask(id, isCompleted) {
  const res = await fetch(`${API_BASE}${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ is_completed: isCompleted }),
  });
  if (!res.ok) {
    throw new Error('Failed to update task');
  }
  return res.json();
}

export async function updateTaskTitle(id, title) {
  const res = await fetch(`${API_BASE}${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.title ? errorData.title[0] : 'Failed to update task';
    throw new Error(message);
  }
  return res.json();
}

export async function deleteTask(id) {
  const res = await fetch(`${API_BASE}${id}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error('Failed to delete task');
  }
  return true;
}
