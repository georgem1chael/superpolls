const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http.//localhost:5001';
const API_AUTH_URL =import.meta.env.VITE_AUTH_URL || 'http://localhost:5007' 

export const getCurrentUser = async () => {
  const response = await fetch(`${API_AUTH_URL}/users/current`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Not authenticated');
  return response.json();
};

export const registerUser = async (name: string, email: string, password: string) => {
  const response = await fetch(`${API_AUTH_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password })
  });
  if (!response.ok) throw new Error('Registration failed');
  return response.json();
};

export const loginUser = async (email: string, password: string, remember: boolean = false) => {
  const response = await fetch(`${API_AUTH_URL}/users/logIn`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password, remember })
  });
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};

export const logoutUser = async () => {
  const response = await fetch(`${API_AUTH_URL}/users/logout`, {
    credentials: 'include'
  });
  return response.ok;
};

export const getSurveys = async () => {
  const response = await fetch(`${API_BASE_URL}/surveys`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch surveys');
  return response.json();
};

export const createSurvey = async (
  title: string,
  description?: string,
  participants?: string[],
  timeslots?: { slot_id: string; day: string; }[]
) => {
  const response = await fetch(`${API_BASE_URL}/add/survey-with-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      title,
      description,
      editable: true,
      public: true,
      participants: participants || [],
      timeslots: timeslots || []
    })
  });
  if (!response.ok) throw new Error('Failed to create survey');
  return response.json();
};

export const getSurvey = async (surveyId: number) => {
  const response = await fetch(`${API_BASE_URL}/survey/${surveyId}`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch survey');
  return response.json();
};

export const addAnswer = async (questionId: number, answer: string, name?: string) => {
  const response = await fetch(`${API_BASE_URL}/add/answer/${questionId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ answer, name })
  });
  if (!response.ok) throw new Error('Failed to submit answer');
  return response.json();
};

export const joinSurvey = async (surveyId: number) => {
  const response = await fetch(`${API_BASE_URL}/survey/${surveyId}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to join survey');
  return response.json();
};

export const getSurveyData = async (surveyId: number) => {
  const response = await fetch(`${API_BASE_URL}/survey/${surveyId}/data`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch survey data');
  return response.json();
};

export const updateAvailability = async (surveyId: number, participantId: number, timeSlotId: string, status: string) => {
  const response = await fetch(`${API_BASE_URL}/survey/${surveyId}/availability`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ participantId, timeSlotId, status })
  });
  if (!response.ok) throw new Error('Failed to update availability');
  return response.json();
};

export const addIdea = async (surveyId: number, text: string, author: string) => {
  const response = await fetch(`${API_BASE_URL}/survey/${surveyId}/ideas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ text, author })
  });
  if (!response.ok) throw new Error('Failed to add idea');
  return response.json();
};

export const voteIdea = async (ideaId: number, voteType: 'up' | 'down') => {
  const response = await fetch(`${API_BASE_URL}/idea/${ideaId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ voteType })
  });
  if (!response.ok) throw new Error('Failed to vote');
  return response.json();
};

export const initializeSurvey = async (surveyId: number) => {
  const response = await fetch(`${API_BASE_URL}/survey/${surveyId}/initialize`, {
    method: 'POST',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to initialize survey');
  return response.json();
};

export const deleteSurvey = async (surveyId: number) => {
  const response = await fetch(`${API_BASE_URL}/delete/survey/${surveyId}`, {
    method: 'POST',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to delete survey');
  return response.json();
};