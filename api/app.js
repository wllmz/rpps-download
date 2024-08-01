const express = require('express');
const cors = require('cors');
const app = express();

// Importation des routeurs
const downloadRoutes = require('./routes/download.Routes');

// Fonction pour démarrer le serveur
async function startServer() {
    try {
        // Importe et initialise la connexion à MongoDB
        // await require('./db/MongodbConnect'); 

        // Middleware pour le parsing JSON
        app.use(express.json());

        // Middleware pour gérer les requêtes CORS
        app.use(cors({
            origin: ['http://localhost:3000', 'https://mylizy.fr']
        }));

        // Route pour le message d'accueil
        app.get('/', (req, res) => {
            res.send('Bienvenue sur l\'API de téléchargement de fichiers !');
        });
          
        // Utilisation des routes avec un préfixe 
        app.use('/api', downloadRoutes);

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start the server:', error);
    }
}

startServer();
