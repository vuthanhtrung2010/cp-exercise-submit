import type { Route } from "./+types/login";
import { PageLayout } from "../lib/utils";
import { login, createUserSession, getUser } from "../lib/session";
import { data, Link, redirect } from "react-router";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Login - File Upload System" },
    { name: "description", content: "Login to the file upload system" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  
  // If already logged in, redirect to home
  if (user) {
    return redirect("/");
  }
  
  return data({});
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const user = await login(username, password);

  if (user) {
    return createUserSession(user.username, user.name, "/");
  } else {
    return data(
      { error: "Invalid username or password" },
      { status: 400 }
    );
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  return (
    <PageLayout title="Login" user={null}>
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Login
          </h1>
          
          {actionData?.error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300">
              {actionData.error}
            </div>
          )}
          
          <form method="POST" className="space-y-4">
            <div>
              <label 
                htmlFor="username" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Username:
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password:
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Login
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link
              to="/" 
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
