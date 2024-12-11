import { NextResponse } from "next/server";
import { Readable } from "stream";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false, // Désactive le parsing par défaut
  },
};

// Fonction utilitaire pour créer un fichier temporaire
async function saveFile(file: formidable.File): Promise<string> {
  const tempPath = path.join(
    process.cwd(),
    "uploads",
    file.originalFilename || "temp_audio"
  );
  const fileData = await fs.readFile(file.filepath);
  await fs.writeFile(tempPath, fileData);
  return tempPath;
}

export async function POST(request: Request) {
  try {
    const form = formidable({ uploadDir: "./uploads", keepExtensions: true });

    // Convertit la requête web en stream Node.js compatible
    const nodeStream = Readable.fromWeb(request.body! as any);
    const nodeReq = nodeStream as unknown as NodeJS.ReadableStream & {
      headers: Record<string, string>;
    };

    nodeReq.headers = Object.fromEntries(request.headers.entries());

    // Parse le fichier
    const { files } = await new Promise<{
      fields: any;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(nodeReq as any, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file = (files.file as formidable.File[])[0];
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Sauvegarde du fichier temporaire
    const audioFilePath = await saveFile(file);

    console.log("audioFilePath:" + audioFilePath);
    console.log("pathDest" + path.dirname(audioFilePath));

    // Exécute Whisper via Python
    const transcription = await new Promise<string>((resolve, reject) => {
      const whisper = spawn("whisper", [
        audioFilePath,
        "--model",
        "base",
        "--output_format",
        "txt",
        "--output_dir",
        path.dirname(audioFilePath),
      ]);

      whisper.on("close", async (code) => {
        if (code === 0) {
          const outputFile = audioFilePath.replace(/\.\w+$/, ".txt");
          const result = await fs.readFile(outputFile, "utf8");
          await fs.unlink(audioFilePath);
          await fs.unlink(outputFile);
          resolve(result);
        } else {
          reject(new Error("Transcription process failed"));
        }
      });
    });

    return NextResponse.json({ transcription });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
