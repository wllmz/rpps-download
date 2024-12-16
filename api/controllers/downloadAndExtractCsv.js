const fs = require("fs");
const path = require("path");
const axios = require("axios");
const https = require("https");
const unzipper = require("unzipper");

exports.downloadAndExtractCsv = async () => {
  const url =
    "https://service.annuaire.sante.fr/annuaire-sante-webservices/V300/services/extraction/Extraction_Correspondance_MSSante";
  const dataDir = path.join(__dirname, "../data");
  const zipPath = path.join(dataDir, "Extraction_Correspondance_MSSante.zip");
  const csvPath = path.join(dataDir, "Extraction_Correspondance_MSSante.csv");

  try {
    // Vérifier et créer le répertoire si nécessaire
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    console.log("Téléchargement du fichier ZIP...");
    const agent = new https.Agent({ rejectUnauthorized: false });
    const response = await axios.get(url, {
      responseType: "stream",
      httpsAgent: agent,
      timeout: 300000,
    });

    const writer = fs.createWriteStream(zipPath);
    await new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    console.log("Fichier ZIP téléchargé avec succès.");

    console.log("Extraction du fichier CSV...");
    const directory = await unzipper.Open.file(zipPath);

    // Vérification des fichiers dans le ZIP
    if (directory.files.length === 0) {
      throw new Error("Aucun fichier trouvé dans le ZIP.");
    }

    console.log("Fichiers trouvés dans le ZIP :");
    directory.files.forEach((file) => console.log(file.path));

    // Extraire le fichier .txt et le traiter comme un CSV
    let fileExtracted = false;
    for (const file of directory.files) {
      if (file.path.endsWith(".txt")) {
        // Accepter les fichiers .txt
        const content = await file.buffer();
        fs.writeFileSync(csvPath, content);
        console.log(`Fichier extrait et sauvegardé à : ${csvPath}`);
        fileExtracted = true;
        break;
      }
    }

    if (!fileExtracted) {
      throw new Error("Aucun fichier valide trouvé dans le ZIP.");
    }

    console.log("Extraction terminée avec succès.");

    // Vérifier l'existence du fichier CSV
    if (!fs.existsSync(csvPath)) {
      throw new Error(
        `Le fichier CSV n'a pas été correctement sauvegardé à : ${csvPath}`
      );
    }

    console.log("Démarrage du filtrage du fichier...");
    await splitCsvFile(csvPath); // Votre fonction de traitement
  } catch (error) {
    console.error("Erreur dans downloadAndExtractCsv :", error);
    throw error;
  } finally {
    // Nettoyer le fichier ZIP temporaire
    try {
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
        console.log("Fichier ZIP temporaire supprimé.");
      }
    } catch (cleanupError) {
      console.error("Erreur lors du nettoyage :", cleanupError);
    }
  }
};

// Exemple de fonction splitCsvFile (à adapter selon vos besoins)
async function splitCsvFile(csvPath) {
  try {
    console.log(`Traitement du fichier : ${csvPath}`);
    // Ajoutez ici votre logique pour traiter ou diviser le fichier
    console.log("Fichier traité avec succès.");
  } catch (error) {
    console.error("Erreur dans splitCsvFile :", error);
    throw error;
  }
}
