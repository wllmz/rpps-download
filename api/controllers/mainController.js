const fs = require('fs');
const path = require('path');
const { downloadAndExtractCsv } = require('./downloadAndExtractCsv');
const { splitCsvFile } = require('./splitCsvFile');
const { convertCsvToJson } = require('./convertCsvToJson');

exports.handleLargeCsvFile = async (req, res) => {
  const csvPath = path.join(__dirname, '../data/Extraction_Correspondance_MSSante.csv');

  try {
    console.log('Démarrage du processus de téléchargement et d\'extraction...');
    await downloadAndExtractCsv();
    console.log('Téléchargement et extraction terminés. Démarrage du fractionnement du CSV...');
    await splitCsvFile();

    console.log('Fractionnement du CSV terminé. Démarrage de la conversion en JSON...');
    // Convertir chaque fichier CSV fractionné en JSON
    const files = fs.readdirSync(path.join(__dirname, '../data')).filter(file => file.startsWith('part_') && file.endsWith('.csv'));
    for (const file of files) {
      console.log(`Conversion de ${file} en JSON...`);
      await convertCsvToJson(file);
      console.log(`${file} converti en JSON.`);
      // Supprimer éventuellement le fichier CSV fractionné après la conversion en JSON
      fs.unlinkSync(path.join(__dirname, `../data/${file}`));
      console.log(`${file} supprimé.`);
    }

    console.log('Tous les fichiers CSV fractionnés ont été convertis en JSON.');
    res.json({ message: 'Fichier téléchargé, converti en JSON et sauvegardé' });
  } catch (error) {
    console.error('Erreur dans handleLargeCsvFile :', error);
    res.status(500).json({ error: 'Échec du traitement du fichier' });
  } finally {
    // Nettoyage du fichier CSV original et de tout fichier fractionné restant
    try {
      if (fs.existsSync(csvPath)) {
        fs.unlinkSync(csvPath);
        console.log('Fichier CSV temporaire supprimé.');
      }

      const remainingFiles = fs.readdirSync(path.join(__dirname, '../data')).filter(file => file.startsWith('part_') && file.endsWith('.csv'));
      for (const file of remainingFiles) {
        fs.unlinkSync(path.join(__dirname, `../data/${file}`));
        console.log(`Fichier CSV fractionné temporaire ${file} supprimé.`);
      }
    } catch (cleanupError) {
      console.error('Erreur lors du nettoyage final :', cleanupError);
    }
  }
};
