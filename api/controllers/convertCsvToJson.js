const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

exports.convertCsvToJson = async (csvFile) => {
  const csvPath = path.join(__dirname, `../data/${csvFile}`);
  const jsonFilePath = csvPath.replace('.csv', '.json');
  const timeoutDuration = 600000; // Délai d'attente de 10 minutes

  try {
    const readStream = fs.createReadStream(csvPath);
    let results = [];

    const conversionPromise = new Promise((resolve, reject) => {
      readStream
        .pipe(csv({ separator: '|' }))
        .on('data', (data) => {
          // Ajouter les données filtrées (RPPS ou ADELI) au tableau des résultats
          if (data['Identification nationale PP'] || data['Identification Structure']) {
            results.push({
              Type: data['Identification nationale PP'] ? 'RPPS' : 'ADELI',
              Number: data['Identification nationale PP'] || data['Identification Structure']
            });
          }
        })
        .on('end', () => {
          // Écrire les résultats dans un fichier JSON
          fs.writeFileSync(jsonFilePath, JSON.stringify(results, null, 2));
          resolve();
        })
        .on('error', (error) => {
          console.error('Erreur lors de la conversion CSV en JSON :', error);
          reject(error);
        });
    });

    await Promise.race([
      conversionPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout: conversion took too long')), timeoutDuration))
    ]);

    console.log(`Le fichier CSV ${csvPath} a été converti en fichier JSON ${jsonFilePath}.`);
  } catch (error) {
    console.error('Erreur dans convertCsvToJson :', error);
    throw error;
  }
};
