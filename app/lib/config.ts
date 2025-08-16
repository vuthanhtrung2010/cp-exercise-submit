import { z } from "zod";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export interface User {
  username: string;
  password: string;
  name: string;
  canDownload?: boolean;
}

// Environment configuration with Zod schema for validation
const Env = z.object({
  CONFIG_USERS: z.string().min(1, "CONFIG_USERS must not be empty"),
  CONFIG_PROBLEMS: z.string().min(1, "CONFIG_PROBLEMS must not be empty"),
  CONFIG_STATEMENTS: z.string().min(1, "CONFIG_STATEMENTS must not be empty"),
  OUTPUT_DIR: z.string().min(1, "OUTPUT_DIR must not be empty"),
  PORT: z.string().regex(/^\d+$/, "PORT must be a number").transform(Number),
  SESSION_SECRET: z
    .string()
    .min(8, "SESSION_SECRET must be at least 8 characters"),
});

type EnvVars = z.infer<typeof Env>;

function getEnv(): EnvVars {
  try {
    return Env.parse({
      CONFIG_USERS: process.env.CONFIG_USERS,
      CONFIG_PROBLEMS: process.env.CONFIG_PROBLEMS,
      CONFIG_STATEMENTS: process.env.CONFIG_STATEMENTS,
      OUTPUT_DIR: process.env.OUTPUT_DIR,
      PORT: process.env.PORT,
      SESSION_SECRET: process.env.SESSION_SECRET,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((e) => `- ${e.path.join(".")}: ${e.message}`)
        .join("\n");

      throw new Error(
        `Environment validation failed:\n${errorMessages}\n\nCreate a .env file based on .env.example or set environment variables.`
      );
    }
    throw error;
  }
}

export const ENV = getEnv();

export function getUsers(): User[] {
  try {
    const fileContent = fs.readFileSync(ENV.CONFIG_USERS, "utf-8");
    const lines = fileContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== "");

    return lines.map((line) => {
      const parts = line.split(":");
      const [username, password, name] = parts;
      const canDownload = parts[3] === "true";
      return { username, password, name, canDownload };
    });
  } catch (error) {
    console.error("Error reading users file:", error);
    throw new Error(`Failed to read users from ${ENV.CONFIG_USERS}`);
  }
}

export function saveUsers(users: User[]): void {
  try {
    const lines = users.map(user => 
      `${user.username}:${user.password}:${user.name}:${user.canDownload || false}`
    );
    fs.writeFileSync(ENV.CONFIG_USERS, lines.join('\n'), 'utf-8');
  } catch (error) {
    console.error("Error saving users file:", error);
    throw new Error(`Failed to save users to ${ENV.CONFIG_USERS}`);
  }
}

export function getProblems(): string[] {
  try {
    const fileContent = fs.readFileSync(ENV.CONFIG_PROBLEMS, "utf-8");
    const lines = fileContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== "");

    const problems = lines.flatMap((line) => 
      line.split(":").map(p => p.trim().toUpperCase())
    );

    return problems;
  } catch (error) {
    console.error("Error reading problems file:", error);
    throw new Error(`Failed to read problems from ${ENV.CONFIG_PROBLEMS}`);
  }
}

export function createUserFolders() {
  const users = getUsers();
  const outputDir = ENV.OUTPUT_DIR;

  users.forEach((user) => {
    const userDir = path.join(outputDir, user.username);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
      console.log(`Folder created for user: ${user.username}`);
    }
  });
}

// File upload configuration
export const MAX_FILE_SIZE = 65536; // 64KB
export const ALLOWED_EXTENSIONS = [".c", ".cpp", ".py"];

// Utility functions
export const sanitizeFilename = (name: string): string => {
  const baseName = path.basename(name);
  return baseName.replace(/[^\x00-\x7F]|[\/\\]/g, (match) =>
    encodeURIComponent(match)
  );
};
