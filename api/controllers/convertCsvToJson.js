const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const maxRetries = 3; // Nombre maximum de réessais

exports.convertCsvToJson = async (csvFile, retryCount = 0) => {
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

          if (error.code === 'ECONNRESET' && retryCount < maxRetries) {
            console.warn(`Erreur ECONNRESET rencontrée. Nouvelle tentative ${retryCount + 1}/${maxRetries}...`);
            // Réessayer la conversion après une courte pause
            setTimeout(() => exports.convertCsvToJson(csvFile, retryCount + 1).then(resolve).catch(reject), 1000);
          } else {
            reject(error);
          }
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
