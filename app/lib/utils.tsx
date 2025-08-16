import React from "react";

// Modern React Router utility functions for layout and components

export interface LayoutProps {
  title: string;
  children: React.ReactNode;
  user?: {
    username: string;
    name: string;
  } | null;
}

export function PageLayout({ title, children, user }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {user.username} - {user.name}
                  </span>
                  <a
                    href="/logout"
                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Logout
                  </a>
                </>
              ) : (
                <a
                  href="/login"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Login
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
