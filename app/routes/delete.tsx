import type { Route } from "./+types/delete";
import { requireUser } from "~/lib/session";
import { ENV, sanitizeFilename } from "~/lib/config";
import { redirect } from "react-router";
import fs from "fs";
import path from "path";

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);
  
  try {
    const formData = await request.formData();
    const filename = formData.get("filename");

    // Validate filename
    if (!filename || typeof filename !== "string") {
      throw new Response("Invalid filename", { status: 400 });
    }

    // Sanitize the filename and build the path
    const sanitizedFilename = sanitizeFilename(filename);
    const userDir = path.join(ENV.OUTPUT_DIR, user.username);
    const filePath = path.join(userDir, sanitizedFilename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Response("File not found", { status: 404 });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    // Redirect back to the list page
    return redirect("/list");
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Response("Error deleting file", { status: 500 });
  }
}

export default function Delete() {
  return null;
}
