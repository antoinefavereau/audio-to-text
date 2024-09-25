document.getElementById("audioInput").addEventListener("change", () => {
    const fileInput = document.getElementById("audioInput");
    const file = fileInput.files[0];
    const resultDiv = document.getElementById("result");
    const downloadBtn = document.getElementById("downloadBtn");

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

    resultDiv.innerText = "Transcription en cours...";

    fetch("http://localhost:3000/transcribe", {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.text) {
                resultDiv.innerText = data.text;
                downloadBtn.href =
                    "data:text/plain;charset=utf-8," +
                    encodeURIComponent(data.text);
                downloadBtn.download = file.name + ".txt";
                downloadBtn.style.display = "block";
            } else if (data.error) {
                resultDiv.innerText = "Erreur : " + data.error;
            } else {
                resultDiv.innerText = "Erreur lors de la transcription.";
            }
        })
        .catch((error) => {
            console.error("Erreur:", error);
            resultDiv.innerText =
                "Erreur : " + (error.error || "Erreur lors de la requête.");
        });
});
