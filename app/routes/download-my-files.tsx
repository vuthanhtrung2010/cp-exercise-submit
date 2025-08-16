import type { Route } from "./+types/download-my-files";
import { requireUser } from "~/lib/session";
import { ENV } from "~/lib/config";
import fs from "fs";
import path from "path";
import archiver from "archiver";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  
  // Check if user has download permission
  if (!user.canDownload) {
    throw new Response("Access denied: You don't have permission to download files", { status: 403 });
  }

  try {
    const userDir = path.join(ENV.OUTPUT_DIR, user.username);

    // Check if user directory exists
    if (!fs.existsSync(userDir)) {
      throw new Response("No files found", { status: 404 });
    }

    // Get list of files
    const files = fs.readdirSync(userDir);
    if (files.length === 0) {
      throw new Response("No files found", { status: 404 });
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
        archive.directory(userDir, false);
        archive.finalize();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${user.username}-files.zip"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("Error creating user files zip:", error);
    throw new Response("Error creating download", { status: 500 });
  }
}
