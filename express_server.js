const express = require("express");
const app = express();
const PORT = 8080;
function generateRandomString() {
  let result = '';
  const charaters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    let index = Math.floor(Math.random() * charaters.length);
    result += charaters[index];
  }
  return result;
}

app.set("view engine", 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(express.urlencoded({ extended: true }));

//delete button
app.post("/urls/:id/delete",(req,res)=>{
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
  console.log(req.body); // Log the POST request body to the console
  //save  urlDatabase to id-longURL key-value pair 
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect("http://localhost:8080/urls/"+shortUrl); // Respond with 'Ok' (we will replace this)
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
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL };
  res.render("urls_show", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
})
