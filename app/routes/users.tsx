import type { Route } from "./+types/users";
import { PageLayout } from "~/lib/utils";
import { getUsers } from "~/lib/config";
import { data, Link } from "react-router";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Available Users - File Upload System" },
    { name: "description", content: "View available users in the system" },
  ];
}

export async function loader(_: Route.LoaderArgs) {
  try {
    const users = getUsers();
    const usernames = users.map((user) => user.username);
    return data({ usernames });
  } catch (error) {
    console.error("Error processing users:", error);
    throw new Response("Failed to load users", { status: 500 });
  }
}

export default function Users({ loaderData }: Readonly<Route.ComponentProps>) {
  const { usernames } = loaderData;

  return (
    <PageLayout title="Available Users">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Available Users
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            These are the registered users in the system:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {usernames.map((username) => (
              <div
                key={username}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-blue-900 dark:text-blue-100 font-medium">
                    {username}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Total: {usernames.length} user{usernames.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <a
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Login
          </a>
          <Link
            to="/"
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
