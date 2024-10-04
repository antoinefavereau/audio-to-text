const express = require("express");
const router = express.Router();
const transcribeController = require("../controllers/transcribeController");
const multer = require("multer");
const path = require("path");

// Définir les formats audio acceptés avec leurs types MIME correspondants
const MIME_TYPES = {
    "audio/mpeg": [".mp3"],
    "audio/mp4": [".mp4", ".m4a"],
    "audio/wav": [".wav"],
    "audio/ogg": [".ogg"],
    "audio/flac": [".flac"],
    "audio/aac": [".aac"],
    "audio/vnd.dlna.adts": [".aac"],
};

// Configurer Multer pour stocker les fichiers dans le dossier 'uploads'
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        // Générer un nom de fichier unique
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname +
                "-" +
                uniqueSuffix +
                path.extname(file.originalname)
        );
    },
});

// Configurer Multer avec les limites de taille et le filtre de fichier
const upload = multer({
    storage: storage,
    limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB
    fileFilter: (req, file, cb) => {
        const mimeType = file.mimetype;
        const ext = path.extname(file.originalname).toLowerCase();
        console.log(`Type MIME: ${mimeType}, Extension: ${ext}`); // Log des informations du fichier

        // Vérifier si le type MIME est dans la liste des types acceptés
        if (MIME_TYPES[mimeType] && MIME_TYPES[mimeType].includes(ext)) {
            return cb(null, true);
        }

        // Si le type MIME n'est pas accepté, rejeter le fichier
        cb(new Error("Format de fichier audio non pris en charge."));
    },
});

router.post("/", upload.single("file"), transcribeController.transcribe);

module.exports = router;
