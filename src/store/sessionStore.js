const sessions = new Map();

export function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      messages: [],
      qualification: {
        active: false,
        currentIndex: 0,
        answers: {},
        completed: false,
      },
    });
  }

  return sessions.get(sessionId);
}