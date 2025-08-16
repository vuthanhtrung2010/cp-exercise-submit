import type { Route } from "./+types/logout";
import { logout } from "../lib/session";

export async function loader({ request }: Route.LoaderArgs) {
  return logout(request);
}

export async function action({ request }: Route.ActionArgs) {
  return logout(request);
}

export default function Logout() {
  // This component should never render since we redirect
  return null;
}
