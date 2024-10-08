const transcribeAudio = require("./transcribeAudio");
const pLimit = require("p-limit");

/**
 * Transcrit une liste de segments audio avec une limitation de concurrence.
 * @param {string[]} segments - Liste des chemins des fichiers segments audio.
 * @param {string} apiKey - Clé API OpenAI.
 * @param {number} concurrency - Nombre maximum de transcriptions parallèles.
 * @param {object} io - Instance de Socket.io pour émettre des événements.
 * @returns {Promise<string>} - Transcription combinée.
 */
async function transcribeSegments(segments, apiKey, concurrency = 3, io) {
    const limit = pLimit(concurrency);
    let transcript = "";
    let completed = 0;
    const total = segments.length;

    // Fonction pour transcrire un segment et gérer la progression
    const transcribeAndUpdate = async (segment, index) => {
        try {
            const text = await transcribeAudio(segment, apiKey);
            transcript += text + " ";
            completed += 1;
            // Émettre un événement de progression
            io.emit("transcriptionProgress", {
                percent: ((completed / total) * 100).toFixed(2),
            });
            return text;
        } catch (error) {
            // Émettre un événement d'erreur pour ce segment
            io.emit("transcriptionError", {
                segment: segment,
                error: error.message,
            });
            // Vous pouvez choisir de rejeter ou de continuer. Ici, nous continuons.
            completed += 1;
            io.emit("transcriptionProgress", {
                percent: ((completed / total) * 100).toFixed(2),
            });
            return "";
        }
    };

    // Lancer les transcriptions avec concurrence limitée
    await Promise.all(
        segments.map((segment, index) =>
            limit(() => transcribeAndUpdate(segment, index))
        )
    );

    return transcript.trim();
}

module.exports = transcribeSegments;
