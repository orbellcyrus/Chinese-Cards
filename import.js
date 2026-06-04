const fs =
require("fs");

const csv =
require("csv-parser");

const mysql =
require("mysql2");

const db =
mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"Howdididoit6789",
    database:"chinese"
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