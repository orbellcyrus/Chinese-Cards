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

app.get("/login", (req, res) => {
    res.render("login");
});


app.get("/dictionary",(req,res)=>{
    if(!req.session.userId){
        return res.redirect("/account");
    }

    let sql = `
    SELECT
        CharacterDictionary.*,

        CASE
            WHEN UsersLearned.user_id IS NULL
            THEN 0
            ELSE 1
        END AS known

    FROM CharacterDictionary

    LEFT JOIN UsersLearned

    ON CharacterDictionary.id =
       UsersLearned.character_id

    AND UsersLearned.user_id = ?
    `;

    db.query(
        sql,
        [req.session.userId],
        (err,results)=>{

            if(err) throw err;

            res.render(
                "dictionary",
                {characters:results}
            );

        }
    );

});

app.get("/account", (req, res) => {
    if(!req.session.userId){
        return res.redirect("/login");
    }
    let sql =
    "SELECT * FROM Users WHERE id = ?" ;
    db.query(sql,
        [req.session.userId]
        ,(err,results)=>{

        if(err) throw err;

        res.render(
            "account",
            { user: results[0] }
        );

    });
});

app.get("/flashcards", (req,res)=>{
    res.render(
        "flashcards"
    );
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

app.post("/addUser", async (req,res)=>{
    try{
        const username = req.body.username;
        const password = req.body.password;
        const email = req.body.email;

        let checkSQL = `SELECT * FROM Users WHERE username = ? OR email = ?`;
        db.query(
            checkSQL,
            [username,email],
            async (err,results)=>{
                if(err) throw err;
                if(results.length > 0){
                    return res.send(
                        "Username or email already exists."
                    );
                }
                const hashedPassword = await bcrypt.hash(password,10);
                let insertSQL = `INSERT INTO Users (username,password,email) VALUES (?,?,?)`;
                db.query(
                    insertSQL,
                    [username,hashedPassword,email],
                    (err)=>{
                        if(err) throw err;
                        console.log("User Added");
                        res.redirect("/account");
                    }
                );
            }
        );
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


app.post("/learnCharacter", (req,res)=>{
    const userID = req.session.userId;
    const charID = req.body.characterId;
    let sql = "INSERT INTO UsersLearned(user_id , character_id) VALUES (?, ?)";
    db.query(
        sql,
        [userID,charID],
        (err,result)=>{

            if(err) throw err;

            console.log("Connection added");
            res.redirect("dictionary");
    }
    )
});


app.post("/unlearnCharacter",(req,res)=>{

    const userId =
        req.session.userId;

    const characterId =
        req.body.characterId;

    db.query(
        `
        DELETE FROM UsersLearned

        WHERE user_id = ?
        AND character_id = ?
        `,
        [userId,characterId],

        (err)=>{

            if(err) throw err;

            res.redirect("/dictionary");

        }

    );

});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});