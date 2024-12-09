const fs = require("fs");
const path = require("path");
const splitAudio = require("../utils/splitAudio");
const transcribeSegments = require("../utils/transcribeSegments");

/**
 * Contrôleur pour la transcription audio avec division en segments.
 */
exports.transcribe = async (req, res) => {
    const io = req.app.get("socketio");

    const apiKey = process.env.OPENAI_API_KEY;

    const file = req.file;

    if (!file) {
        return res
            .status(400)
            .json({ message: "Aucun fichier audio téléchargé." });
    }

    try {
        const filePath = req.file.path;
        const segmentsDir = path.join(
            "uploads",
            "segments",
            path.parse(req.file.filename).name
        );

        // Diviser l'audio en segments de 5 minutes (300 secondes)
        const segments = await splitAudio(filePath, segmentsDir, 300, io);

        if (segments.length === 0) {
            throw new Error("Aucun segment audio créé.");
        }

        // Transcrire tous les segments avec une concurrence limitée (ex. 3)
        const fullTranscript = await transcribeSegments(
            segments,
            apiKey,
            3,
            io
        );

        // Supprimer les fichiers temporaires
        fs.unlink(filePath, (err) => {
            if (err)
                console.error(
                    "Erreur lors de la suppression du fichier original:",
                    err
                );
        });
        fs.rm(segmentsDir, { recursive: true, force: true }, (err) => {
            if (err)
                console.error(
                    "Erreur lors de la suppression des segments:",
                    err
                );
        });

        res.json({ text: fullTranscript });
    } catch (error) {
        console.error(
            "Erreur lors de la transcription:",
            error.response ? error.response.data : error.message
        );
        io.emit("processError", { message: error.message });

        // Supprimer les fichiers temporaires en cas d'erreur
        if (req.file) {
            fs.unlink(req.file.path, () => {});
            const segmentsDir = path.join(
                "uploads",
                "segments",
                path.parse(req.file.filename).name
            );
            fs.rm(segmentsDir, { recursive: true, force: true }, () => {});
        }

        if (error.response && error.response.status === 413) {
            return res.status(413).json({
                error: "Le fichier audio dépasse la taille maximale autorisée de 25 MB par segment.",
            });
        }

        res.status(500).json({ error: "Erreur lors de la transcription" });
    }
};
