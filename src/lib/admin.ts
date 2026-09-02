import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export async function getAdminUser(): Promise<{ id: string } | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") return null;
  return { id: user.id };
}

/**
 * Garde de page admin qui distingue "pas connecté" de "connecté mais pas
 * admin" — un simple `if (!getAdminUser()) redirect("/")` renvoyait les
 * deux cas silencieusement vers l'accueil, ce qui ressemble à "la page
 * n'existe pas" pour quelqu'un qui n'était juste pas connecté sur cet
 * appareil/navigateur.
 */
export async function requireAdmin(pathname: string): Promise<{ id: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/connexion?next=${encodeURIComponent(pathname)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return { id: user.id };
}
