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
    let sql =
    "SELECT * FROM CharacterDictionary";

    db.query(sql,(err,results)=>{

        if(err) throw err;

        res.render(
            "dictionary",
            { characters: results }
        );

    });
});

app.get("/account", (req, res) => {
    res.render("account");
});

app.post("/addCharacter",(req,res)=>{

    let character = req.body.character;
    let english = req.body.english;
    let pronunciation= req.body.pronunciation;

    let sql =
    "INSERT INTO CharacterDictionary(chinese_character,english,pronunciation) VALUES (?,?,?)";

    db.query(
        sql,
        [character,english,pronunciation],
        (err,result)=>{
        if(err) throw err;
        console.log("Character Added");
        res.redirect("/dictionary");
    });

});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});