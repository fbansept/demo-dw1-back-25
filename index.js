const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const app = express();

// Configuration de la base de données
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "tier-list",
});

// Connexion à la base de données
connection.connect((err) => {
    if (err) {
        console.error("Erreur de connexion à la base de données :", err);
        return;
    }
    console.log("Connecté à la base de données MySQL");
});

app.use(cors());
app.use(express.json())

app.get("/", (req, res) => {
    res.send("hello");
});

app.delete("/image/:id", (req, res) => {
    const idImage = req.params["id"];

    connection.query(
        "DELETE FROM images WHERE id = ?",
        [idImage],
        (erreur, resultat) => {
            res.json('{"message" : "Image supprimée"}');
        }
    );
});

app.post("/image",(req, res) => {

    connection.query(
        "INSERT INTO images (url, categorie_id) VALUES (? , ?)",
        [req.body.url, req.body.categorie_id],
        (erreur, resultat) => {
            res.json('{"message" : "Image ajouté"}');
        }
    )
})

app.get("/categories", (req, res) => {

    const categories = []

    connection.query(
        `SELECT c.id, c.titre, i.url, i.id as id_image 
            FROM categories c 
            LEFT JOIN images i ON c.id = i.categorie_id 
            ORDER BY c.id`,
        (err, resultat) => {

            for (let ligne of resultat) {
                const categorieExitante = categories.find(c => c.id == ligne.id);
                //si on a déjà ajouté cette catégorie a la liste des resultats
                if(categorieExitante) {
                    categorieExitante.images.push(
                        {
                            id : ligne.id_image,
                            url : ligne.url
                        })
                } else {

                    //categories.push({id: ligne.id, titre:  ligne.titre, images : (ligne.url ? [{id : ligne.id_image, url : ligne.url}] : [])})

                    //si la categorie ne possède pas d'image,
                    // on ajoute un tableau vide , plutot qu'un tableau avec une url NULL
                    if(ligne.url) {
                        categories.push(
                            {
                                id: ligne.id,
                                titre:  ligne.titre,
                                images : [
                                    {
                                        id : ligne.id_image,
                                        url : ligne.url
                                    }
                                ]
                            }
                        )
                    } else {
                        categories.push(
                            {
                                id: ligne.id,
                                titre:  ligne.titre,
                                images : []
                            })
                    }

                }
            }

            res.json(categories);
    });
});

app.listen(5000, () => {
    console.log("Server is running on port 5000 !!!!!!!!");
});