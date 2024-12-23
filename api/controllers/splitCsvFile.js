const fs = require('fs');
const path = require('path');
const readline = require('readline');

exports.splitCsvFile = async () => {
  const csvPath = path.join(__dirname, '../data/Extraction_Correspondance_MSSante.csv');
  const outputCsvPath = path.join(__dirname, '../data/Extraction_Correspondance_MSSante_filtered.csv'); // Chemin du CSV filtré

  try {
    // Créer un flux de lecture pour le fichier CSV
    const readStream = fs.createReadStream(csvPath);
    const rl = readline.createInterface({ input: readStream });
    let writeStream = fs.createWriteStream(outputCsvPath);
    let headers = null;

    for await (const line of rl) {
      const values = line.split('|'); // Diviser la ligne en valeurs en utilisant '|' comme séparateur

      if (!headers) {
        // Définir les en-têtes
        headers = values;
        // Écrire les en-têtes dans le fichier CSV filtré
        writeStream.write('Identification nationale PP|Identification Structure|Adresse BAL\n');
      } else {
        // Filtrer les valeurs pour ne conserver que RPPS, ADELI, et email
        const rppsIndex = headers.indexOf('Identification nationale PP');
        const adeliIndex = headers.indexOf('Identification Structure');
        const emailIndex = headers.indexOf('Adresse BAL');

        if (rppsIndex === -1 || adeliIndex === -1 || emailIndex === -1) {
          console.error('Les colonnes RPPS, ADELI, ou Adresse BAL ne sont pas présentes dans le CSV');
          return;
        }

        const rpps = values[rppsIndex];
        const adeli = values[adeliIndex];
        const email = values[emailIndex];

        // Écrire les valeurs filtrées dans le fichier CSV
        writeStream.write(`${rpps}|${adeli}|${email}\n`);
      }
    }

    writeStream.end(); // Terminer le fichier filtré

    console.log('Le fichier CSV a été filtré et sauvegardé.');
  } catch (error) {
    console.error('Erreur dans splitCsvFile :', error);
    throw error;
  }
};
