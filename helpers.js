const bcrypt = require("bcryptjs");
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

const generateRandomString = (n) => {
  let result = '';
  const charaters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < n; i++) {
    let index = Math.floor(Math.random() * charaters.length);
    result += charaters[index];
  }
  return result;
}

const urlsForUser = (id, urlDatabase) => {
  let userURL = {};
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID === id) {
      userURL[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return userURL;
}

const verifyPassword = (user, password) => {
  if (user.password === password) {
    return true
  } else if (bcrypt.compareSync(password, user.password)) {
    return true;
  } else {
    return false;
  }
}

module.exports = { getUserByEmail, generateRandomString, urlsForUser, verifyPassword }