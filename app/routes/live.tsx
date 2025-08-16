import type { Route } from "./+types/live";
import { PageLayout } from "~/lib/utils";
import { useState, useEffect } from "react";
import { Link } from "react-router";

export default function Live() {
  const [secret, setSecret] = useState("");
  const [uploadsData, setUploadsData] = useState<{
    users: any[];
    problems: string[];
  } | null>(null);
  const [error, setError] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString();
  };

  const fetchUploadedData = async () => {
    if (!secret.trim()) {
      setError("Please enter the secret");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const formData = new FormData();
      formData.append("secret", secret);

      const response = await fetch("/api/live", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
        setUploadsData(null);
        setAutoRefreshEnabled(false);
      } else {
        setUploadsData(result.data);
        setError("");
        setLastRefreshed(`Last refreshed: ${formatTime()}`);
        setAutoRefreshEnabled(true);
      }
    } catch (err) {
      setError("Error loading data: " + (err as Error).message);
      setUploadsData(null);
      setAutoRefreshEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh every 5 seconds when enabled and data is loaded
  useEffect(() => {
    if (!autoRefreshEnabled || !secret || !uploadsData) return;

    const interval = setInterval(() => {
      fetchUploadedData();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, secret, uploadsData]);

  return (
    <PageLayout title="Live Uploads Monitor">
      <h1 className="text-2xl font-bold mb-4">Live Uploads Monitor</h1>
      {autoRefreshEnabled && (
        <p className="mb-4 text-green-600">
          Auto-refreshing every 5 seconds...
        </p>
      )}

      <div className="mb-4 flex gap-2 items-center">
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Enter session secret"
          className="px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button
          onClick={fetchUploadedData}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Refresh Now"}
        </button>
        {lastRefreshed && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {lastRefreshed}
          </span>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96">
        {error && (
          <div className="text-red-600 mb-4 p-3 bg-red-100 dark:bg-red-900 dark:text-red-300 rounded">
            {error}
          </div>
        )}

        {!uploadsData && !error && (
          <div className="text-gray-500 dark:text-gray-400">
            Enter secret and click Refresh Now to view uploads
          </div>
        )}

        {uploadsData && (
          <table className="border border-collapse border-gray-300 dark:border-gray-600 w-full bg-white dark:bg-gray-900">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">
                  Username
                </th>
                <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">
                  Name
                </th>
                {uploadsData.problems.map((problem) => (
                  <th
                    key={problem}
                    className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-white"
                  >
                    {problem}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {uploadsData.users.map((userData) => (
                <tr
                  key={userData.username}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 font-mono text-gray-900 dark:text-white">
                    {userData.username}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-900 dark:text-white">
                    {userData.name}
                  </td>
                  {uploadsData.problems.map((problem) => {
                    const hasSubmission = userData.files.some((f: string) =>
                      f.startsWith(problem)
                    );
                    return (
                      <td
                        key={problem}
                        className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-center text-gray-900 dark:text-white"
                      >
                        {hasSubmission ? "✅" : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-4">
        <Link
          to="/"
          className="text-blue-500 hover:underline dark:text-blue-400"
        >
          Back to Home
        </Link>
      </p>
    </PageLayout>
  );
}
