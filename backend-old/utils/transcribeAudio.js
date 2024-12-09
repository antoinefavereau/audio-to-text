const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

/**
 * Transcrit un fichier audio en texte en utilisant l'API OpenAI.
 * @param {string} filePath - Chemin du fichier audio à transcrire.
 * @param {string} apiKey - Clé API OpenAI.
 * @returns {Promise<string>} - Transcription textuelle.
 */
async function transcribeAudio(filePath, apiKey) {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));
    formData.append("model", "whisper-1");
    formData.append("language", "fr"); // Spécifiez la langue si nécessaire

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/audio/transcriptions",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    ...formData.getHeaders(),
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            }
        );
        return response.data.text;
    } catch (error) {
        console.error(
            "Erreur lors de la transcription du segment:",
            error.response ? error.response.data : error.message
        );
        throw error;
    }
}

module.exports = transcribeAudio;
