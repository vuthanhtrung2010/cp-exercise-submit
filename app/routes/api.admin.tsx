import type { Route } from "./+types/api.admin";
import { ENV, getUsers, saveUsers } from "~/lib/config";

export async function action({ request }: Route.ActionArgs) {
  try {
    const formData = await request.formData();
    const providedSecret = formData.get("secret") as string;
    const actionType = formData.get("action") as string;
    
    if (providedSecret !== ENV.SESSION_SECRET) {
      return Response.json({ error: "Unauthorized: Invalid secret" }, { status: 401 });
    }

    if (actionType === "load") {
      const users = getUsers();
      return Response.json({ error: null, users, successMessage: null });
    } else if (actionType === "save") {
      const allowedUsersStr = formData.get("users") as string;
      const allowedUsers = allowedUsersStr ? JSON.parse(allowedUsersStr) : [];
      
      // Update users array
      const users = getUsers();
      const updatedUsers = users.map(user => ({
        ...user,
        canDownload: allowedUsers.includes(user.username)
      }));

      // Save to file
      saveUsers(updatedUsers);

      return Response.json({ 
        error: null, 
        users: updatedUsers, 
        successMessage: "User permissions updated successfully!" 
      });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ 
      error: `Error processing admin request: ${errorMessage}` 
    }, { status: 500 });
  }
}
