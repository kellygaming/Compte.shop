"use client";

import { useEffect, useState } from "react";

const PROMPTED_KEY = "compte_shop_notif_prompted";
const OPTIN_KEY = "compte_shop_notif_optin";

/**
 * Demande l'autorisation d'afficher des notifications du navigateur une
 * seule fois par appareil. Ne fonctionne que tant qu'un onglet du site
 * est ouvert (pas de push quand le site est fermé — ça demanderait un
 * service worker + des clés VAPID, pas encore en place).
 */
export function NotificationOptIn() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (localStorage.getItem(PROMPTED_KEY)) return;
    if (Notification.permission !== "default") return;
    // Visibilité dépend du localStorage/de l'API Notification, tous deux
    // indisponibles côté serveur — ne peut pas se calculer autrement
    // qu'après le montage, sans provoquer un mismatch d'hydratation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(true);
  }, []);

  function handleAccept() {
    // On ferme la bannière tout de suite : certains navigateurs (surtout
    // mobile) ne résolvent jamais la promesse de requestPermission ou
    // n'affichent pas de popup, ce qui laissait la bannière bloquée sans
    // retour visible. Le résultat réel arrive en arrière-plan.
    localStorage.setItem(PROMPTED_KEY, "true");
    setVisible(false);
    try {
      Notification.requestPermission()
        .then((permission) => {
          localStorage.setItem(OPTIN_KEY, permission === "granted" ? "true" : "false");
        })
        .catch(() => localStorage.setItem(OPTIN_KEY, "false"));
    } catch {
      localStorage.setItem(OPTIN_KEY, "false");
    }
  }

  function handleDecline() {
    localStorage.setItem(PROMPTED_KEY, "true");
    localStorage.setItem(OPTIN_KEY, "false");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-[clamp(16px,4vw,48px)] py-3">
      <p className="text-[13px] text-text-secondary">
        Recevoir une alerte sur ce site quand vous avez un nouveau message ?
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAccept}
          className="rounded-[9px] bg-accent px-4 py-1.5 text-[12.5px] font-semibold text-bg hover:bg-accent-hover"
        >
          Activer
        </button>
        <button
          type="button"
          onClick={handleDecline}
          className="rounded-[9px] border border-border-strong px-4 py-1.5 text-[12.5px] hover:border-border-hover"
        >
          Non merci
        </button>
      </div>
    </div>
  );
}
