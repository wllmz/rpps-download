const fs = require('fs');
const path = require('path');
const readline = require('readline');

exports.splitCsvFile = async () => {
  const csvPath = path.join(__dirname, '../data/Extraction_Correspondance_MSSante.csv');
  const linesPerFile = 50000; // Nombre de lignes par fichier fractionné

  try {
    // Créer un flux de lecture pour le fichier CSV
    const readStream = fs.createReadStream(csvPath);
    const rl = readline.createInterface({ input: readStream });
    let fileIndex = 0;
    let lineCount = 0;
    let writeStream;
    let headers = null;

    for await (const line of rl) {
      const values = line.split('|'); // Diviser la ligne en valeurs en utilisant '|' comme séparateur

      if (!headers) {
        // Définir les en-têtes
        headers = values;
      } else {
        // Filtrer les valeurs pour ne conserver que RPPS et ADELI
        const rppsIndex = headers.indexOf('Identification nationale PP');
        const adeliIndex = headers.indexOf('Identification Structure');
        
        if (rppsIndex === -1 || adeliIndex === -1) {
          console.error('Les colonnes RPPS et ADELI ne sont pas présentes dans le CSV');
          return;
        }

        const rpps = values[rppsIndex];
        const adeli = values[adeliIndex];

        // Vérifier si nous devons créer un nouveau fichier fractionné
        if (lineCount % linesPerFile === 0) {
          if (writeStream) {
            writeStream.end(); // Terminer le flux de l'ancien fichier
          }
          const newCsvPath = path.join(__dirname, `../data/part_${fileIndex}.csv`);
          writeStream = fs.createWriteStream(newCsvPath);
          // Écrire les en-têtes dans le nouveau fichier
          writeStream.write('Identification nationale PP|Identification Structure\n');
          fileIndex++;
        }

        // Écrire les valeurs filtrées dans le fichier fractionné
        writeStream.write(`${rpps}|${adeli}\n`);
        lineCount++;
      }
    }

    if (writeStream) {
      writeStream.end(); // Terminer le dernier fichier fractionné
    }

    console.log(`Le fichier CSV a été divisé en ${fileIndex} parties.`);
  } catch (error) {
    console.error('Erreur dans splitCsvFile :', error);
    throw error;
  }
};
