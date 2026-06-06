const fs =
require("fs");
require("dotenv").config();

const csv =
require("csv-parser");

const mysql =
require("mysql2");

const db =
mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

fs.createReadStream(
    "csv/hskall.csv"
)
.pipe(
    csv()
)
.on(
    "data",
    (row)=>{

        let sql =
        `
        INSERT INTO
        CharacterDictionary
        (
            chinese_character,
            pronunciation,
            english
        )
        VALUES (?,?,?)`;
        db.query(
            sql,
            [
                row.chinese_character,
                row.pronunciation,
                row.english
            ],
            (err)=>{
                if(err)
                    console.log(err);
            }
        );
    }
)
.on( "end",()=>{
        console.log("Import complete");
    }
);