const express = require("express");
const app = express();
const db = require("./config/db");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/dictionary", (req, res) => {
    res.render("dictionary");
});

app.get("/account", (req, res) => {
    res.render("account");
});


app.listen(3000, () => {
    console.log("Server running on port 3000");
});