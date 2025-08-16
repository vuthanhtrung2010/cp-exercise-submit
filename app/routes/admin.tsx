import type { Route } from "./+types/admin";
import { PageLayout } from "~/lib/utils";
import { useState } from "react";
import { Link } from "react-router";

export default function Admin() {
  const [secret, setSecret] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState("");

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString();
  };

  const loadPermissions = async () => {
    if (!secret.trim()) {
      setError("Please enter the session secret");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccessMessage("");

      const formData = new FormData();
      formData.append("secret", secret);
      formData.append("action", "load");

      const response = await fetch("/api/admin", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
        setUsers([]);
      } else {
        setUsers(result.users);
        setSelectedUsers(
          result.users
            .filter((u: any) => u.canDownload)
            .map((u: any) => u.username)
        );
        setLastRefreshed(`Last refreshed: ${formatTime()}`);
      }
    } catch (err) {
      setError("Error loading data: " + (err as Error).message);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const savePermissions = async () => {
    try {
      setIsLoading(true);
      setError("");
      setSuccessMessage("");

      const formData = new FormData();
      formData.append("secret", secret);
      formData.append("action", "save");
      formData.append("users", JSON.stringify(selectedUsers));

      const response = await fetch("/api/admin", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage(
          result.successMessage || "Permissions saved successfully!"
        );
        setUsers(result.users);
        setLastRefreshed(`Last refreshed: ${formatTime()}`);
      }
    } catch (err) {
      setError("Error saving permissions: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map((u) => u.username));
    } else {
      setSelectedUsers([]);
    }
  };

  const toggleUser = (username: string) => {
    setSelectedUsers((prev) =>
      prev.includes(username)
        ? prev.filter((u) => u !== username)
        : [...prev, username]
    );
  };

  return (
    <PageLayout title="Admin Dashboard">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-4">Manage user download permissions</p>

      <div className="mb-4 flex gap-2 items-center">
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Enter session secret"
          className="px-3 py-2 border border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button
          onClick={loadPermissions}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Load Permissions"}
        </button>
        {lastRefreshed && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {lastRefreshed}
          </span>
        )}
      </div>

      {error && (
        <div className="text-red-600 mb-4 p-3 bg-red-100 dark:bg-red-900 dark:text-red-300 rounded">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="text-green-600 mb-4 p-3 bg-green-100 dark:bg-green-900 dark:text-green-300 rounded">
          {successMessage}
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
        {users.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            Enter secret and click Load Permissions to manage user access
          </p>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              User Download Permissions
            </h2>

            <div className="mb-4 flex gap-2">
              <button
                onClick={() => toggleAll(true)}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Toggle All
              </button>
              <button
                onClick={() => toggleAll(false)}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Untoggle All
              </button>
              <button
                onClick={savePermissions}
                disabled={isLoading}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Permissions"}
              </button>
            </div>

            <div className="grid gap-2">
              {users.map((user) => (
                <label
                  key={user.username}
                  className="flex items-center gap-2 text-gray-900 dark:text-white"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.username)}
                    onChange={() => toggleUser(user.username)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="font-mono">{user.username}</span> -{" "}
                  {user.name}
                </label>
              ))}
            </div>
          </div>
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
