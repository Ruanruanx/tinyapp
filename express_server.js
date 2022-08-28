const express = require("express");
const bcrypt = require("bcryptjs");
//update with cookieSession
const cookieSession = require("cookie-session")
const app = express();
app.use(cookieSession({
  name: 'session',
  keys: ["user_id"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
const PORT = 8080;

const { getUserByEmail, generateRandomString, urlsForUser, verifyPassword } = require('./helpers')

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "563",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "596",
  },
  i3BsGr: {
    longURL: "https://www.google.caaa",
    userID: "596",
  },
};

const users = {
  563: {
    id: "563",
    email: "user1@example.com",
    password: "purple",
  },
  596: {
    id: "596",
    email: "user2@example.com",
    password: "funk",
  },
};

app.set("view engine", 'ejs');

app.use(express.urlencoded({ extended: true }));

app.get("/register", (req, res) => {
  const templateVars = { user: null };
  res.render("register", templateVars)
})

app.post('/register', (req, res) => {
  let id = generateRandomString(3);
  //read the name, email and password
  const { email, password } = req.body;
  //check if the email is empty
  if (!email) return res.status(400).send('Email is empty')


  //check if the email is taken
  const userExists = getUserByEmail(email, users);
  if (userExists) return res.status(400).send('Email is already taken')
  //add new user

  const hashedPassword = bcrypt.hashSync(password, 10);

  const newUser = {
    id,
    email,
    hashedPassword,
  }
  users[id] = newUser;
  //respond back to the client with a cookie
  req.session.user_id = id;
  res.redirect("/urls")
})

app.get("/login", (req, res) => {
  const templateVars = { user: null };
  res.render("login", templateVars)
})

app.post("/login", (req, res) => {
  //retrieve input email and password
  const { email, password } = req.body;

  //check if email exists in users database
  const user = getUserByEmail(email, users);
  if (!user) return res.status(403).send('The email provided does not exist')

  //validate password match


  if (verifyPassword(user, password)) {
    req.session.user_id = user.id
    res.redirect("/urls")
  } else {
    return res.status(403).send('The password is incorrect')
  }
})

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls")
})

//delete button
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userID = req.session.user_id;
  const myURL = urlsForUser(userID, urlDatabase);
  //if not logged in
  if (!userID) {
    res.status(403).send("Login befor delete please!")
  } else if (!urlDatabase[id]) {
    //if page doesn't exist
    res.status(404).send("Don't have this")
  } else if (myURL[id] && userID === myURL[id].userID) {
    //if you own the url
    delete urlDatabase[id];
    res.redirect("/urls")
  } else {
    res.status(403).send("You can't delete this")
  }

})

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  const userID = req.session.user_id;

  if (id && userID === urlDatabase[id].userID) {
    urlDatabase[id].longURL = longURL;
    res.redirect(`/urls/${id}`);
  } else {
    res.status(401).send("You can't modify this")
  }

});

app.post("/urls", (req, res) => {
  // Log the POST request body to the console
  //save  urlDatabase to id-longURL key-value pair 
  if (req.session.user_id) {
    let shortUrl = generateRandomString(6);
    urlDatabase[shortUrl] = { longURL: req.body.longURL, userID: req.session.user_id };
    res.redirect("http://localhost:8080/urls/" + shortUrl);
  } else {
    res.status(403).send("Please login first!")
  }
});

app.get("/u/:id", (req, res) => {
  let id = req.params.id;
  if (urlDatabase[id].longURL) {
    res.redirect(urlDatabase[id].longURL);
  } else {
    res.status(403).send("Short url doesn't exist")
  }
});

app.get("/", (req, res) => {
  //check if cookie exists
  const userId = req.session.user_id
  //redirect to /urls if logged in
  if (userId) {
    res.redirect('/urls')
  } else {
    //if not logged in, redirect to /login
    res.redirect('/login')
  }
});
//Add routes
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { user };
  if (user) {
    res.render("urls_new", templateVars);
  } else {
    //redirect to GET /login if not logged in
    res.redirect("/login")
  }
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.session.user_id
  const user = users[userId];
  const myURL = urlsForUser(userId, urlDatabase)
  const templateVars = { id, myURL, user };

  if (!userId) {
    return res.status(403).send("Please log in first")
  }
  //if shortURL doesn't exist
  if (!urlDatabase[id]) {
    res.status(404).send("Don't have this")
  } else if (myURL[id] && (userId === myURL[id].userID)) {
    res.render("urls_show", templateVars);
  } else {
    return res.status(401).send("You don't have the access for this page")
  }

});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id
  const user = users[userId]
  const templateVars = {
    urls: urlsForUser(userId, urlDatabase),
    user
  };
  if (!userId) {
    res.statusCode = 403;
  }
  res.render("urls_index", templateVars);

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
})
