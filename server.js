const express = require("express");
const app = express();
const db = require("./config/db");
const bcrypt = require("bcrypt");
const session = require("express-session");

app.use(
    session({
        secret:"mySecretKey",
        resave:false,
        saveUninitialized:false
    })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));


app.set("view engine", "ejs");


app.get("/", (req, res) => {
    res.render("index");
});

app.get("/dictionary", (req, res) => {
    if(!req.session.userId){
        return res.redirect("/account");
    }
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
    let sql =
    "SELECT * FROM Users";

    db.query(sql,(err,results)=>{

        if(err) throw err;

        res.render(
            "account",
            { users: results }
        );

    });
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

app.post("/addUser",async (req,res)=>{

    try{
        const username = req.body.username;
        const password = req.body.password;
        const email    = req.body.email;
        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        let sql =
        "INSERT INTO Users(username, password, email) VALUES (?,?,?)";

        db.query(
            sql,
            [username,hashedPassword,email],
            (err,result)=>{
            if(err) throw err;
            console.log("User Added");
            res.redirect("/account");
        });
    }
    catch(err){

        console.log(err);

        res.send("Error");

    }

    

});


app.post("/login",(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    let sql = "SELECT * FROM Users WHERE username=?";

    db.query(
        sql,
        [username],
        async (err,results)=>{
            if(err) throw err;
            if(results.length === 0){

                return res.send(
                    "User not found"
                );
            }
            const user =
                results[0];

            const match =
                await bcrypt.compare(
                    password,
                    user.password
                );
            if(match){
                req.session.userId =
                    user.id;
                req.session.username =
                    user.username;
                res.redirect("/");
            }
            else{
                res.send(
                    "Wrong password"
                );
            }
        }
    );
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});