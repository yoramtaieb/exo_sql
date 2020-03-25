const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const ejs = require('ejs');

// Création du serveur Express
const app = express();

// Configuration du serveur
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({
  extended: false
}));

// Connexion à la base de donnée SQlite
const db_name = path.join(__dirname, "data", "database.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connexion réussie à la base de données 'database.db'");
});

// Création de la table contacts (id, title, email, message)
const sql_create = `CREATE TABLE IF NOT EXIST contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  title TEXT, 
  email TEXT, 
  message TEXT)`;
  db.run(sql_create, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Création réussie de la table 'contacts'");
  const sql_insert = `INSERT INTO contacts (id, title, email, message) VALUES
  (1, 'Hello Agence', 'lfichot.ext@gmail.com', 'The message'),
  (2, 'Hello Agence', 'smicalizzi.ext@gmail.com', 'The message')`;
  db.run(sql_insert, err => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Insertion dans la table 'contacts'");
  });
});

// Démarrage du serveur
app.listen(3000, () => {
  console.log(`Serveur démarré (http://localhost:3000/) !`);
});

// GET /
app.get("/", (req, res) => {
  res.render("index", {
    contact: {}
  });
});

// GET /about
app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/admin/contacts", (req, res) => {
  // select all contacts order by email
  const sql = `SELECT * FROM contacts ORDER BY email`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("admin/contacts", {
      contacts: rows
    });
  });
});

app.get("/create", (req, res) => {
  res.render("index", {
    contact: {}
  });
});

// POST /create
app.post("/create", (req, res) => {
  // insert contact in table contacts
  const sql = `INSERT INTO contacts ( title, email, message ) VALUES ( ?, ?, ?)`;
  const contact = [req.body.title, req.body.email, req.body.message];
  db.run(sql, contact, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/admin/contacts");
  });
});

// GET /edit/5
app.get("/admin/edit/:id", (req, res) => {
  const id = req.params.id;
  // select contact by id
  const sql = "SELECT * FROM contacts WHERE id = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("admin/edit", {
      contact: row
    });
  });
});

// POST /edit/5
app.post("/admin/edit/:id", (req, res) => {
  const id = req.params.id;
  const contact = [req.body.title, req.body.email, req.body.message, id];
  // update contact by id
  const sql = "UPDATE contacts SET title = ?, email = ?, message = ? WHERE id = ?";
  db.run(sql, contact, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/admin/contacts");
  });
});

// GET /delete/5
app.get("/admin/delete/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM contacts WHERE id = ?";
  db.get(sql, id, (err, row) => {
    if (err) {
      return console.error(err.message);
    }
    res.render("admin/delete", {
      contact: row
    });
  });
});

// POST /delete/5
app.post("/admin/delete/:id", (req, res) => {
  const id = req.params.id;
  // delete contact by id
  const sql = "DELETE FROM contacts WHERE id = ?";
  db.run(sql, id, err => {
    if (err) {
      return console.error(err.message);
    }
    res.redirect("/admin/contacts");
  });
});


// Bonus, create table posts and show all on page blog
app.get("/blog", (req, res) => {
  const posts = {
    title: "Posts",
    items: ["un", "deux", "trois"]
  };
  res.render("blog", {
    posts: posts
  });
});

app.get('/*', function(req,res){
  res.send('error 404')
})