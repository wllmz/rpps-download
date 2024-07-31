const fs = require('fs');
const path = require('path');
const { downloadAndExtractCsv } = require('./downloadAndExtractCsv');
const { splitCsvFile } = require('./splitCsvFile');
const { convertCsvToJson } = require('./convertCsvToJson');

exports.handleLargeCsvFile = async (req, res) => {
  const csvPath = path.join(__dirname, '../data/Extraction_Correspondance_MSSante.csv');
  const filteredCsvPath = path.join(__dirname, '../data/Extraction_Correspondance_MSSante_filtered.csv');

  try {
    console.log('Démarrage du processus de téléchargement et d\'extraction...');
    await downloadAndExtractCsv();
    console.log('Téléchargement et extraction terminés. Démarrage du filtrage du CSV...');
    await splitCsvFile();

    console.log('Filtrage du CSV terminé. Démarrage de la conversion en JSON...');
    // Convertir le fichier CSV filtré en JSON
    await convertCsvToJson('Extraction_Correspondance_MSSante_filtered.csv');
    console.log('Conversion du fichier CSV en JSON terminée.');

    res.json({ message: 'Fichier téléchargé, filtré, converti en JSON et sauvegardé' });
  } catch (error) {
    console.error('Erreur dans handleLargeCsvFile :', error);
    res.status(500).json({ error: 'Échec du traitement du fichier' });
  } finally {
    // Nettoyage des fichiers temporaires
    try {
      if (fs.existsSync(csvPath)) {
        fs.unlinkSync(csvPath);
        console.log('Fichier CSV original supprimé.');
      }
      if (fs.existsSync(filteredCsvPath)) {
        fs.unlinkSync(filteredCsvPath);
        console.log('Fichier CSV filtré supprimé.');
      }
    } catch (cleanupError) {
      console.error('Erreur lors du nettoyage final :', cleanupError);
    }
  }
};
