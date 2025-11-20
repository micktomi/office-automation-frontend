const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

// --- Task Endpoints ---

export async function getTasks() {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

// --- Email Agent Endpoints ---

export async function getEmails() {
  const response = await fetch(`${API_BASE_URL}/emails`);
  if (!response.ok) {
    console.error('Failed to fetch emails', response);
    throw new Error('Failed to fetch emails');
  }
  return response.json();
}

export async function syncEmails() {
  const response = await fetch(`${API_BASE_URL}/sync-emails`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    console.error('Failed to sync emails', response);
    throw new Error('Failed to sync emails');
  }
  return response.json();
}

export async function archiveEmail(emailId: number) {
  const response = await fetch(`${API_BASE_URL}/emails/${emailId}/archive`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    console.error('Failed to archive email', response);
    throw new Error('Failed to archive email');
  }
  // status 204 No Content doesn't have a body to parse
  return;
}
