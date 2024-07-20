import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";

const app = express();
const port = process.env.PORT || 8080;
let db = null;

// cors elimination middleware
app.use(cors());

// post request handling
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function dbSetup(doInsert) {
    if (db === null) {
        return;
    }

    db.run(`
    CREATE TABLE IF NOT EXISTS ShoppingList (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item TEXT NOT NULL,
      quantity INTEGER NOT NULL
    );
  `);

    if (doInsert) {
        db.run(`
      INSERT INTO ShoppingList (item, quantity)
      VALUES ("Eggs", 12), ("Milk", 2);
    `);
    }
}

function appStartedCallback() {
    console.log("App is listening.");
    db = new sqlite3.Database("shopping_list.db");
    dbSetup(false);
}

app.listen(port, appStartedCallback);

app.get("/", (req, res) => {
    res.status(200).json({ status: true });
});

app.get("/api/list", (req, res) => {
    db.all("SELECT * FROM ShoppingList", (error, rows) => {
        if (error) {
            res.status(500).json({ error });
        } else {
            res.status(200).json(rows);
        }
    });
});

app.post("/api/list/new", (req, res) => {
    db.run(
        `
    INSERT INTO ShoppingList (item, quantity)
    VALUES (?, ?);  
  `,
        [req.body.item, req.body.quantity],
        (error, response) => {
            if (error) {
                res.status(500).json({ error });
            } else {
                res.status(201).json({ response });
            }
        }
    );
});
