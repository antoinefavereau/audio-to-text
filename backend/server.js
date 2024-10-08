require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("node:http");
const rateLimit = require("express-rate-limit");

const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
    },
});
app.set("socketio", io);

// Configurer CORS pour autoriser les requêtes du frontend
app.use(
    cors({
        origin: process.env.FRONTEND_URL,
    })
);

app.use(express.json());

// Appliquer une limite de requêtes (exemple : 60 requêtes par minute)
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // Limite chaque IP à 60 requêtes par fenêtre
    message:
        "Trop de requêtes créées depuis cette IP, veuillez réessayer après une minute",
});
app.use(limiter);

// Inclure les routes
const transcribeRoute = require("./routes/transcribe");
app.use("/transcribe", transcribeRoute);

// Socket.io Connection
io.on("connection", (socket) => {
    console.log("Nouvelle connexion Socket.io :", socket.id);

    socket.on("disconnect", () => {
        console.log("Déconnexion Socket.io :", socket.id);
    });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Serveur backend démarré sur le port ${PORT}`);
});
