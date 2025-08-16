import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/login", "routes/login.tsx"),
  route("/logout", "routes/logout.tsx"),
  route("/users", "routes/users.tsx"),
  route("/upload", "routes/upload.tsx"),
  route("/list", "routes/list.tsx"),
  route("/delete", "routes/delete.tsx"),
  route("/download", "routes/download.tsx"),
  route("/download-my-files", "routes/download-my-files.tsx"),
  route("/live", "routes/live.tsx"),
  route("/admin", "routes/admin.tsx"),
  route("/api/admin", "routes/api.admin.tsx"),
  route("/api/live", "routes/api.live.tsx")
] satisfies RouteConfig;
