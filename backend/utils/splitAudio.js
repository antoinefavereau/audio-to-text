const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static'); // Importer ffmpeg-static

// Définir le chemin vers FFmpeg fourni par ffmpeg-static
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
} else {
  throw new Error('FFmpeg non trouvé. Assurez-vous que ffmpeg-static est installé.');
}

/**
 * Divise un fichier audio en segments de durée spécifiée et ré-encode en MP3.
 * @param {string} inputPath - Chemin du fichier audio d'entrée.
 * @param {string} outputDir - Répertoire où les segments seront stockés.
 * @param {number} segmentDuration - Durée de chaque segment en secondes.
 * @returns {Promise<string[]>} - Liste des chemins des fichiers segments créés.
 */
function splitAudio(inputPath, outputDir, segmentDuration = 600) { // 600 secondes = 10 minutes
  return new Promise((resolve, reject) => {
    console.log(`Diviser le fichier audio : ${inputPath}`);
    if (!fs.existsSync(outputDir)){
      console.log(`Création du répertoire de segments : ${outputDir}`);
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPattern = path.join(outputDir, 'segment%03d.mp3');

    const command = ffmpeg(inputPath)
      .outputOptions([
        '-f', 'segment',
        '-segment_time', segmentDuration,
        '-c:a', 'libmp3lame', // Utiliser le codec audio MP3
        '-b:a', '128k' // Définir le bitrate audio à 128 kbps
      ])
      .output(outputPattern)
      .on('start', (cmdLine) => {
        console.log(`FFmpeg lancé avec la commande : ${cmdLine}`);
      })
      .on('end', () => {
        console.log('Division de l\'audio terminée.');
        // Récupérer la liste des fichiers segments
        fs.readdir(outputDir, (err, files) => {
          if (err) {
            console.error('Erreur lors de la lecture du répertoire des segments :', err);
            return reject(err);
          }
          const segments = files
            .filter(file => file.startsWith('segment') && file.endsWith('.mp3'))
            .sort()
            .map(file => path.join(outputDir, file));
          
          // Vérifier la taille de chaque segment
          let oversizedSegments = [];
          segments.forEach(segment => {
            const stats = fs.statSync(segment);
            const fileSizeInMB = stats.size / (1024 * 1024);
            console.log(`Segment: ${segment}, Taille: ${fileSizeInMB.toFixed(2)} MB`);
            if (fileSizeInMB > 25) {
              oversizedSegments.push(segment);
            }
          });

          if (oversizedSegments.length > 0) {
            console.error('Certains segments dépassent la taille maximale de 25 MB:', oversizedSegments);
            return reject(new Error('Certains segments audio dépassent la taille maximale de 25 MB.'));
          }

          console.log('Tous les segments respectent la limite de taille.');
          resolve(segments);
        });
      })
      .on('error', (err) => {
        console.error('Erreur FFmpeg lors de la division de l\'audio :', err.message);
        reject(err);
      })
      .run();
  });
}

module.exports = splitAudio;
