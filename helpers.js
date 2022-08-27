const getUserByEmail = (email, users) => {
  for (const key in users) {
    if (Object.hasOwnProperty.call(users, key)) {
      const user = users[key];
      if (user.email === email) {
        return user;
      }
    }
  }
  return false;
}

module.exports = getUserByEmail