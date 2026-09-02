import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const AUTH_REFRESH_TIMEOUT_MS = 4000;

/**
 * Rafraîchit la session Supabase à chaque navigation (pattern standard
 * @supabase/ssr). Sans ça, un token expiré côté serveur ne serait jamais
 * renouvelé et déconnecterait silencieusement l'utilisateur.
 *
 * Ce point-là bloque TOUTE navigation sur le site (le matcher couvre
 * quasiment toutes les routes) tant que l'appel réseau vers Supabase n'a
 * pas répondu — sur un réseau mobile lent ou instable (public cible :
 * Mobile Money en Afrique de l'Ouest), ça pouvait rendre un clic sur un
 * lien de l'en-tête silencieusement figé plusieurs secondes, voire
 * indéfiniment. On borne l'appel : au-delà du délai, on laisse la
 * navigation continuer sans avoir rafraîchi la session — chaque page/route
 * fait de toute façon sa propre vérification d'auth, donc le pire cas est
 * une session pas renouvelée sur cette navigation-là, pas un blocage.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  await Promise.race([
    supabase.auth.getUser(),
    new Promise((resolve) => setTimeout(resolve, AUTH_REFRESH_TIMEOUT_MS)),
  ]);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|games/|.*\\.(?:svg|png|jpg|jpeg|webp|gif)$).*)",
  ],
};
