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

    // Create a ReadableStream to send progress updates
    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false; // Flag to track if the controller is closed

        // Convert the web request to Node.js stream
        const nodeStream = Readable.fromWeb(request.body! as any);
        const nodeReq = nodeStream as unknown as NodeJS.ReadableStream & {
          headers: Record<string, string>;
        };

        nodeReq.headers = Object.fromEntries(request.headers.entries());

        // Parse the file
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
          controller.error("No file provided");
          return;
        }

        // Save the temporary file
        const audioFilePath = await saveFile(file);

        // Execute Whisper via Python
        const whisper = spawn("whisper", [
          audioFilePath,
          "--model",
          "base",
          "--output_format",
          "txt",
          "--output_dir",
          path.dirname(audioFilePath),
          "--verbose",
          "False",
        ]);

        whisper.stderr.on("data", (data) => {
          if (!isClosed) {
            // Check if controller is still open
            const log = data.toString();
            const regex = /(\d+(?:\.\d+)?)(?=%)/g;
            const match = log.match(regex);
            if (match) {
              const percentage = match[0];
              try {
                // Remove the incorrect signal check
                controller.enqueue(`Progress: ${percentage}%\n`);
              } catch (error) {
                // Silently handle the case where the controller might be closed
                console.log("Stream controller is no longer available:", error);
                isClosed = true; // Update flag when we detect controller is unusable
              }
            }
          }
        });

        whisper.on("close", async (code) => {
          isClosed = true; // Set flag to indicate controller is closed
          if (code === 0) {
            const outputFile = audioFilePath.replace(/\.\w+$/, ".txt");
            const result = await fs.readFile(outputFile, "utf8");
            await fs.unlink(audioFilePath);
            await fs.unlink(outputFile);

            const sanitizedText = result.replace(/\r?\n/g, " ");
            controller.enqueue("Transcription: " + sanitizedText);
          } else {
            controller.error("Transcription process failed");
          }
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
