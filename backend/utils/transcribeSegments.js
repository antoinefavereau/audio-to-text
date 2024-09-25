const transcribeAudio = require("./transcribeAudio");
const pLimit = require("p-limit");

/**
 * Transcrit une liste de segments audio avec une limitation de concurrence.
 * @param {string[]} segments - Liste des chemins des fichiers segments audio.
 * @param {string} apiKey - Clé API OpenAI.
 * @param {number} concurrency - Nombre maximum de transcriptions parallèles.
 * @returns {Promise<string>} - Transcription combinée.
 */
async function transcribeSegments(segments, apiKey, concurrency = 3) {
    const limit = pLimit(concurrency);
    const transcriptions = await Promise.all(
        segments.map((segment) => limit(() => transcribeAudio(segment, apiKey)))
    );
    return transcriptions.join(" ");
}

module.exports = transcribeSegments;
