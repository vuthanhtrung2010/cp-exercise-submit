import type { Route } from "./+types/home";
import { PageLayout } from "../lib/utils";
import { getUser } from "../lib/session";
import { data, Link } from "react-router";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "File Upload System" },
    { name: "description", content: "Programming Contest File Upload System" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  return data({ user });
}

export default function Home({ loaderData }: Readonly<Route.ComponentProps>) {
  const { user } = loaderData;

  if (user) {
    return (
      <PageLayout title="Home Page" user={user}>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome
          </h1>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Logged in as: {user.username} - {user.name}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/upload"
                className="block p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Upload Files
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Submit your programming solutions
                </p>
              </a>

              <Link
                to="/list"
                className="block p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  View Your Files
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Manage your uploaded files
                </p>
              </Link>

              <a
                href="/download"
                className="block p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
              >
                <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                  Download Problems
                </h3>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Get problem statements
                </p>
              </a>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Home Page" user={null}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Not logged in. Please login to access the system.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/download"
              className="block p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Download Problems
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Get problem statements
              </p>
            </a>

            <Link
              to="/users"
              className="block p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <h3 className="font-semibold text-green-900 dark:text-green-100">
                View Users
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                See available users
              </p>
            </Link>

            <Link
              to="/live"
              className="block p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <h3 className="font-semibold text-purple-900 dark:text-purple-100">
                Live Monitor
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Monitor uploads live
              </p>
            </Link>

            <Link
              to="/admin"
              className="block p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <h3 className="font-semibold text-orange-900 dark:text-orange-100">
                Admin Dashboard
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Manage permissions
              </p>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
