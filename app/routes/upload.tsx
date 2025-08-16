import {
  type FileUpload,
  parseFormData,
} from "@remix-run/form-data-parser";
import type { Route } from "./+types/upload";
import { requireUser } from "~/lib/session";
import { PageLayout } from "~/lib/utils";
import { ENV, ALLOWED_EXTENSIONS, MAX_FILE_SIZE, sanitizeFilename } from "~/lib/config";
import { data, Link } from "react-router";
import path from "path";
import fs from "fs";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Upload Files - File Upload System" },
    { name: "description", content: "Upload your programming files" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  return data({ user });
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);
  
  const uploadedFiles: string[] = [];
  const errors: string[] = [];

  const uploadHandler = async (fileUpload: FileUpload) => {
    if (fileUpload.fieldName === "files") {
      try {
        const filename = fileUpload.name;
        
        // Check file extension
        const ext = path.extname(filename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
          errors.push(`${filename} has invalid extension. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
          return filename;
        }

        // Check file size
        if (fileUpload.size > MAX_FILE_SIZE) {
          errors.push(`${filename} is too large (max ${MAX_FILE_SIZE / 1024}KB)`);
          return filename;
        }

        // Sanitize filename
        const originalName = filename;
        const namePart = originalName.split('.')[0].toUpperCase();
        const extension = originalName.split('.').slice(1).join('.');
        const sanitizedFilename = sanitizeFilename(`${namePart}.${extension}`);
        
        // Create user directory
        const userDir = path.join(ENV.OUTPUT_DIR, user.username);
        if (!fs.existsSync(userDir)) {
          fs.mkdirSync(userDir, { recursive: true });
        }

        // Save file to filesystem
        const filePath = path.join(userDir, sanitizedFilename);
        const buffer = Buffer.from(await fileUpload.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
        
        uploadedFiles.push(sanitizedFilename);
        return null;
      } catch (fileError) {
        console.error(`Error processing file ${fileUpload.name}:`, fileError);
        errors.push(`Failed to save ${fileUpload.name}`);
        return null;
      }
    }
    return null;
  };

  try {
    await parseFormData(request, uploadHandler);
    
    if (uploadedFiles.length === 0 && errors.length === 0) {
      return data({
        error: "No files uploaded"
      });
    }

    if (uploadedFiles.length > 0) {
      return data({
        success: true,
        uploadedFiles,
        errors,
        message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
        userDir: path.join(ENV.OUTPUT_DIR, user.username)
      });
    } else {
      return data({
        error: "Upload failed",
        errors
      });
    }
    
  } catch (error) {
    console.error("Error in file upload:", error);
    return data({
      error: "Error uploading files"
    });
  }
}

export default function Upload({ loaderData, actionData }: Readonly<Route.ComponentProps>) {
  const { user } = loaderData;
  
  // Type guard to check if actionData has success property
  const isSuccessData = (data: any): data is { success: boolean; uploadedFiles: string[]; errors: string[]; message: string; userDir: string } => {
    return data && typeof data === 'object' && 'success' in data;
  };

  const isErrorData = (data: any): data is { error: string; errors?: string[] } => {
    return data && typeof data === 'object' && 'error' in data;
  };
  
  return (
    <PageLayout title="Upload Files" user={user}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Upload Files
        </h1>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Upload Guidelines</h3>
          </div>
          <ul className="text-blue-800 dark:text-blue-200 space-y-2">
            <li>• Maximum size: {MAX_FILE_SIZE / 1024}KB per file</li>
            <li>• Allowed extensions: {ALLOWED_EXTENSIONS.join(", ")}</li>
            <li>• Multiple files can be selected at once</li>
            <li>• Files are automatically renamed to uppercase</li>
          </ul>
        </div>
        
        {isSuccessData(actionData) && actionData.message && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 dark:text-green-200 font-semibold">{actionData.message}</p>
            </div>
            {actionData.uploadedFiles && actionData.uploadedFiles.length > 0 && (
              <>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                  Files saved to: {actionData.userDir}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {actionData.uploadedFiles.map((filename: string, index: number) => (
                    <div key={`${filename}-${index}`} className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                      </svg>
                      <span className="font-mono text-sm">{filename}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        
        {(isSuccessData(actionData) && actionData.errors && actionData.errors.length > 0) && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 dark:text-red-200 font-semibold">Errors ({actionData.errors.length}):</p>
            </div>
            <ul className="space-y-1">
              {actionData.errors.map((error: string, index: number) => (
                <li key={index} className="text-red-700 dark:text-red-300 text-sm">
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isErrorData(actionData) && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 dark:text-red-200 font-semibold">{actionData.error}</p>
            </div>
          </div>
        )}
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Select Files to Upload
          </h2>
          
          <form method="POST" encType="multipart/form-data" className="space-y-6">
            <div>
              <label 
                htmlFor="files" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3"
              >
                Choose files:
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="files"
                  name="files"
                  multiple
                  required
                  accept={ALLOWED_EXTENSIONS.join(",")}
                  className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200 dark:hover:file:bg-blue-800"
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Drag and drop files here or click to browse
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span>Upload Files</span>
              </div>
            </button>
          </form>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {isSuccessData(actionData) && actionData.uploadedFiles && actionData.uploadedFiles.length > 0 && (
            <a 
              href="/list" 
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>View Your Files</span>
              </div>
            </a>
          )}
          <Link
            to="/" 
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
