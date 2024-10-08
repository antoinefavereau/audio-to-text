// Initialiser Socket.io
const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("Connecté à Socket.io");
});

document.getElementById("audioInput").addEventListener("change", () => {
    const fileInput = document.getElementById("audioInput");
    const file = fileInput.files[0];
    const resultDiv = document.getElementById("result");
    const downloadBtn = document.getElementById("downloadBtn");
    const progressContainer = document.getElementById("progressContainer");
    const progressBar = document.getElementById("progressBar");
    const errorDiv = document.getElementById("error");

    // Réinitialiser les éléments
    resultDiv.innerText = "";
    downloadBtn.style.display = "none";
    errorDiv.innerText = "";

    if (!file) {
        alert("Veuillez sélectionner un fichier audio.");
        return;
    }

    // Vérifier la taille du fichier (200 MB)
    const maxSize = 200 * 1024 * 1024; // 200 MB
    if (file.size > maxSize) {
        alert(
            "Le fichier audio sélectionné dépasse la taille maximale autorisée de 200 MB."
        );
        return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("socketId", socket.id);

    resultDiv.innerText = "Transcription en cours...";
    progressBar.style.width = "0%";
    progressBar.innerText = "0%";
    progressContainer.style.display = "block";

    // Écouter les événements Socket.io
    socket.on("processStarted", (data) => {
        resultDiv.innerText = data.message;
    });

    socket.on("transcriptionProgress", (data) => {
        const { percent } = data;
        progressBar.style.width = `${percent}%`;
        progressBar.innerText = `${percent}%`;
        resultDiv.innerText = `Transcription en cours...`;
    });

    socket.on("transcriptionCompleted", (data) => {
        resultDiv.innerText = "Transcription terminée.";
        progressBar.style.width = `100%`;
        progressBar.innerText = `100%`;
        progressContainer.style.display = "none";

        // Afficher le bouton de téléchargement
        downloadBtn.href =
            "data:text/plain;charset=utf-8," +
            encodeURIComponent(data.transcript);
        downloadBtn.download = `${file.name}_transcription.txt`;
        downloadBtn.style.display = "inline-block";
    });

    socket.on("transcriptionError", (data) => {
        resultDiv.innerText = "Erreur : " + data.message;
        progressBar.style.width = `0%`;
        progressBar.innerText = `0%`;
        progressContainer.style.display = "none";
        errorDiv.innerText = `Erreur sur le segment ${
            data.segment || "inconnu"
        }: ${data.error}`;
    });

    // Envoyer la requête d'upload
    fetch("http://localhost:3000/transcribe", {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.text) {
                // Si la transcription est déjà complétée (cas où le traitement est rapide)
                resultDiv.innerText = data.text;
                downloadBtn.href =
                    "data:text/plain;charset=utf-8," +
                    encodeURIComponent(data.text);
                downloadBtn.download = `${file.name}.txt`;
                downloadBtn.style.display = "inline-block";
                progressContainer.style.display = "none";
            } else if (data.error) {
                resultDiv.innerText = "Erreur : " + data.error;
                progressContainer.style.display = "none";
                errorDiv.innerText = data.error;
            } else {
                resultDiv.innerText = "Erreur lors de la transcription.";
                progressContainer.style.display = "none";
                errorDiv.innerText =
                    "Erreur inconnue lors de la transcription.";
            }
        })
        .catch((error) => {
            console.error("Erreur:", error);
            resultDiv.innerText =
                "Erreur : " + (error.error || "Erreur lors de la requête.");
            progressContainer.style.display = "none";
            errorDiv.innerText = error.message || "Erreur lors de la requête.";
        });
});
