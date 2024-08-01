const fs = require('fs');
const path = require('path');

// Fonction pour vérifier si un identifiant RPPS ou ADELI est valide en lisant directement les fichiers JSON divisés
exports.verifyIdentifier = (req, res) => {
  const { identifier, email } = req.body;
  const dataDir = path.join(__dirname, '../data');

  if (!identifier || !email) {
    return res.status(400).json({ error: 'Identifiant et email requis' });
  }

  const rppsRegex = /^\d{11}$/; // Regex pour les numéros RPPS à 11 chiffres
  const adeliRegex = /^\d{9}$/; // Regex pour les numéros ADELI à 9 chiffres
  let found = false;

  // Lire et analyser les fichiers JSON divisés
  fs.readdir(dataDir, (err, files) => {
    if (err) {
      console.error('Erreur lors de la lecture du répertoire :', err);
      return res.status(500).json({ error: 'Échec de la lecture du répertoire' });
    }

    // Utiliser les fichiers JSON générés
    const jsonFiles = files.filter(file => file.startsWith('Extraction_Correspondance_MSSante_filtered') && file.endsWith('.json'));

    for (const file of jsonFiles) {
      if (found) break; // Arrêter la recherche si l'identifiant est trouvé

      const filePath = path.join(dataDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const entry = data.find(entry => entry.Number === identifier && entry.Email === email);

      if (entry) {
        found = true;
        return res.json({ message: `Identifiant ${entry.Type} valide avec email correspondant`, email: entry.Email });
      }
    }

    if (!found) {
      res.json({ message: 'Identifiant ou email non valide' });
    }
  });
};
