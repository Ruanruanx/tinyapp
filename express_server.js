const express = require("express");
var cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const PORT = 8080;
function generateRandomString(n) {
  let result = '';
  const charaters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < n; i++) {
    let index = Math.floor(Math.random() * charaters.length);
    result += charaters[index];
  }
  return result;
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

const getUserByEmail=(email)=>{
  for(const key in users){
    if(Object.hasOwnProperty.call(users,key)){
      const user = users[key];
      if(user.email === email){
        return user;
      }
    }
  }
  return false;
}

app.set("view engine", 'ejs');


app.use(express.urlencoded({ extended: true }));

app.get("/register",(req,res)=>{
  // const templateVars = { username: req.cookies["username"] };
  const templateVars = {user:null};
  res.render("register",templateVars)
})

app.post('/register',(req,res)=>{
  let id = generateRandomString(3);
  //read the name, email and password
  const {email, password} = req.body;
  //check if the email is empty
  if(!email) return res.status(400).send('Email is empty')

  //check if the email is taken
  const userExists = getUserByEmail(email);
  if(userExists) return res.status(400).send('Email is already taken')
  //add new user
  const newUser = {
    id,
    email,
    password,
  }
  users[id]=newUser;
  //respond back to the client with a cookie
  res.cookie("user_id", id)
  res.redirect("/urls")
})

app.get("/login",(req,res)=>{
  const templateVars = {user:null};
  res.render("login",templateVars)
})

app.post("/login", (req, res) => {
  //retrieve input email and password
  const{email,password} =req.body;

  //check if email exists in users database
  const user = getUserByEmail(email);
  if(!user) return res.status(403).send('The email provided does not exist')

  //validate password match
  if(user.password === password){
    //return cookie if password is right
    res.cookie('user_id', user.id);
    res.redirect("/urls")
  } else {
    return res.status(403).send('The password is incorrect')
  }
//  const userId = req.cookies.user_id;
})

app.post("/logout", (req, res) => {
  const userId = req.cookies.user_id
  res.clearCookie("user_id",userId)
  res.redirect("/urls")
})

//delete button
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls")
})

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;

  res.redirect(`/urls/${id}`);
});

app.post("/urls", (req, res) => {
  console.log(req.body); 
  // Log the POST request body to the console
  //save  urlDatabase to id-longURL key-value pair 
  let shortUrl = generateRandomString(6);
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect("http://localhost:8080/urls/" + shortUrl); // Respond with 'Ok' (we will replace this)
});



app.get("/u/:id", (req, res) => {
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});
//Add routes
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})
//send HTML
// app.get("/hello", (req, res) => {
//   const templateVars ={greeting: "Hello World!"}
//   res.render("hello_world",templateVars);
// });

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/urls/new", (req, res) => {
  // const templateVars = { username: req.cookies["username"] };
  const userId = req.cookies.user_id
  const user = users[userId]
  const templateVars = {user};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const userId = req.cookies.user_id
  const user = users[userId];
  // const templateVars = { id, longURL, username: req.cookies["username"] };
  const templateVars = { id, longURL, user};
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id
  const user = users[userId]

  const templateVars = {
    urls: urlDatabase,
    //username: req.cookies["username"]
    user
  };
  res.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
})
