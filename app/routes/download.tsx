import type { Route } from "./+types/download";
import { ENV } from "~/lib/config";
import fs from "fs";
import path from "path";
import archiver from "archiver";

export async function loader({ request }: Route.LoaderArgs) {
  try {
    const folderName = ENV.CONFIG_STATEMENTS;
    const folderPath = path.join(process.cwd(), folderName);

    // Check if folder exists
    if (!fs.existsSync(folderPath)) {
      throw new Response("The statements folder could not be found.", { status: 404 });
    }

    // Create a readable stream for the ZIP file
    const stream = new ReadableStream({
      start(controller) {
        const archive = archiver('zip', { zlib: { level: 9 } });
        
        // Handle archive data
        archive.on('data', (chunk) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        
        // Handle archive completion
        archive.on('end', () => {
          controller.close();
        });
        
        // Handle errors
        archive.on('error', (err) => {
          controller.error(err);
        });

        // Add directory to archive
        archive.directory(folderPath, false);
        archive.finalize();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": "attachment; filename=\"problem-statements.zip\"",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Error occurred while processing folder download:", error);
    throw new Response("Error processing download request", { status: 500 });
  }
}