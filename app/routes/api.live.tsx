import type { Route } from "./+types/api.live";
import { ENV, getUsers, getProblems } from "~/lib/config";
import fs from "fs";
import path from "path";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const providedSecret = formData.get("secret") as string;
    
    if (providedSecret !== ENV.SESSION_SECRET) {
      return Response.json({ error: "Unauthorized: Invalid secret" }, { status: 401 });
    }

    const problems = getProblems();
    const users = getUsers();

    interface UserData {
      username: string;
      name: string;
      latestTimestamp: Date;
      files: string[];
    }

    const usersData: UserData[] = users.map((user) => {
      const username = user.username;
      const name = user.name;
      const userDir = path.join(ENV.OUTPUT_DIR, username);
      let files: string[] = [];
      let latestMtime = new Date(0);
    
      if (fs.existsSync(userDir)) {
        files = fs.readdirSync(userDir);
    
        for (const file of files) {
          const filePath = path.join(userDir, file);
          const stats = fs.statSync(filePath);
          if (stats.mtime > latestMtime) {
            latestMtime = stats.mtime;
          }
        }
      }
    
      return {
        username,
        name,
        latestTimestamp: latestMtime,
        files
      };
    });

    usersData.sort((a, b) => a.username.localeCompare(b.username));

    return Response.json({ 
      error: null, 
      data: { users: usersData, problems } 
    });
  } catch (error) {
    return Response.json({ 
      error: "Error generating uploaded files table" 
    }, { status: 500 });
  }
}
