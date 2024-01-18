const activeSessions = new Map();

function storeToken(token, userData) {
  activeSessions.set(token, userData);
}

function getUserData(token) {
  return activeSessions.get(token);
}

module.exports = {
  storeToken,
  getUserData,
};
