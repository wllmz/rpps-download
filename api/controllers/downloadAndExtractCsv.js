const fs = require('fs');
const path = require('path');
const axios = require('axios');
const https = require('https');
const unzipper = require('unzipper');

exports.downloadAndExtractCsv = async () => {
  const url = 'https://service.annuaire.sante.fr/annuaire-sante-webservices/V300/services/extraction/Extraction_Correspondance_MSSante';
  const zipPath = path.join(__dirname, '../data/Extraction_Correspondance_MSSante.zip');
  const csvPath = path.join(__dirname, '../data/Extraction_Correspondance_MSSante.csv');

  try {
    // Configurer l'agent HTTPS pour ignorer les erreurs de certificat
    const agent = new https.Agent({  
      rejectUnauthorized: false
    });

    // Télécharger le fichier ZIP
    const response = await axios.get(url, {
      responseType: 'stream',
      httpsAgent: agent,
      timeout: 300000 // Augmenter le délai d'attente à 5 minutes
    });

    // Créer un flux d'écriture pour enregistrer le fichier ZIP
    const writer = fs.createWriteStream(zipPath);

    // Utiliser une promesse pour gérer l'écriture du fichier ZIP
    await new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // Ouvrir et extraire le fichier CSV du ZIP
    const directory = await unzipper.Open.file(zipPath);
    const file = directory.files[0];
    const content = await file.buffer();

    // Enregistrer le fichier CSV extrait
    fs.writeFileSync(csvPath, content);
    console.log('Fichier CSV extrait et sauvegardé.');
  } catch (error) {
    console.error('Erreur dans downloadAndExtractCsv :', error);
    throw error;
  } finally {
    // Nettoyer le fichier ZIP temporaire
    try {
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
        console.log('Fichier ZIP temporaire supprimé.');
      }
    } catch (cleanupError) {
      console.error('Erreur lors du nettoyage :', cleanupError);
    }
  }
};
