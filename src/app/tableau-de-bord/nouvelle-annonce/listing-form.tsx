"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "rounded-[10px] border border-border-strong bg-surface px-3.5 py-2.5 text-[15px] text-text outline-none placeholder:text-text-tertiary focus:border-border-hover";

const fileClass =
  "rounded-[10px] border border-dashed border-border-strong bg-surface px-3.5 py-3 text-[13.5px] text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-[12.5px] file:font-semibold file:text-bg";

export function ListingForm({ games }: { games: { slug: string; name: string }[] }) {
  const router = useRouter();
  const [gameSlug, setGameSlug] = useState(games[0]?.slug ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceXOF, setPriceXOF] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [deliveryType, setDeliveryType] = useState<"instant" | "manual">("instant");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [credentials, setCredentials] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const price = Number(priceXOF);
    if (!Number.isFinite(price) || price <= 0) {
      setError("Prix invalide.");
      return;
    }
    if (!images || images.length === 0) {
      setError("Au moins une photo est requise.");
      return;
    }
    if (deliveryType === "instant" && !credentials.trim()) {
      setError("Indiquez l'email et le mot de passe à donner à l'acheteur.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expirée, reconnectez-vous.");

      const imageUrls: string[] = [];
      for (const file of Array.from(images)) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${Date.now()}-${imageUrls.length}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(path, file);
        if (uploadError) throw new Error(`Échec de l'envoi de la photo : ${uploadError.message}`);
        const { data: publicUrl } = supabase.storage.from("listing-images").getPublicUrl(path);
        imageUrls.push(publicUrl.publicUrl);
      }

      const response = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          game_slug: gameSlug,
          title,
          description,
          price_xof: price,
          images: imageUrls,
          delivery_type: deliveryType,
          delivery_instructions: deliveryInstructions,
          credentials,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Une erreur est survenue.");
      }

      router.push("/tableau-de-bord");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Jeu">
        <select
          value={gameSlug}
          onChange={(e) => setGameSlug(e.target.value)}
          className={inputClass}
        >
          {games.map((game) => (
            <option key={game.slug} value={game.slug}>
              {game.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Titre de l'annonce">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Ex. Compte niveau 120, 40 skins"
        />
      </Field>
      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className={inputClass}
          placeholder="Détails du contenu du compte…"
        />
      </Field>
      <Field label="Prix (F CFA)">
        <input
          required
          inputMode="numeric"
          value={priceXOF}
          onChange={(e) => setPriceXOF(e.target.value.replace(/[^\d]/g, ""))}
          className={inputClass}
          placeholder="45000"
        />
      </Field>
      <Field label="Photos">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(e.target.files)}
          className={fileClass}
        />
      </Field>
      <div className="flex flex-col gap-1.5 text-[13px] text-text-secondary">
        <div className="font-semibold text-text">
          Comment vas-tu donner le compte à l&apos;acheteur ?
        </div>
        <p className="mb-1 text-[12.5px] leading-relaxed text-text-tertiary">
          C&apos;est écrit sur l&apos;annonce, la personne le voit avant
          d&apos;acheter. Aura-t-elle un email + mot de passe pour se
          connecter seule, même sans toi ? Ou dois-tu être présent pour lui
          donner le compte toi-même ?
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setDeliveryType("instant")}
            className={`flex-1 rounded-[10px] border px-3.5 py-2.5 text-left text-[13.5px] ${
              deliveryType === "instant"
                ? "border-accent text-text"
                : "border-border-strong text-text-secondary"
            }`}
          >
            <div className="font-semibold">Email + mot de passe</div>
            <div className="text-[12px] text-text-tertiary">
              Elle reçoit les accès juste après le paiement et se connecte
              seule, sans toi.
            </div>
          </button>
          <button
            type="button"
            onClick={() => setDeliveryType("manual")}
            className={`flex-1 rounded-[10px] border px-3.5 py-2.5 text-left text-[13.5px] ${
              deliveryType === "manual"
                ? "border-accent text-text"
                : "border-border-strong text-text-secondary"
            }`}
          >
            <div className="font-semibold">Je dois être présent</div>
            <div className="text-[12px] text-text-tertiary">
              Tu dois être disponible après l&apos;achat pour lui donner le
              compte toi-même. Si tu n&apos;es pas là à temps, l&apos;acheteur
              est remboursé.
            </div>
          </button>
        </div>
      </div>

      {deliveryType === "instant" ? (
        <Field label="Email + mot de passe à donner à l'acheteur">
          <p className="mb-1.5 text-[12.5px] leading-relaxed text-text-tertiary">
            Ceci sera envoyé automatiquement à l&apos;acheteur dès qu&apos;il
            paie — personne ne pourra te contacter pour le débloquer.
            Avant de publier, prépare le compte pour qu&apos;il puisse se
            connecter seul, sans toi :
          </p>
          <ul className="mb-2 list-disc pl-4 text-[12.5px] leading-relaxed text-text-tertiary">
            <li>Retire ton numéro de téléphone et ton 2ᵉ e-mail du compte</li>
            <li>
              Désactive la double authentification (2FA) et les codes envoyés
              par SMS
            </li>
            <li>Change tout mot de passe temporaire par le mot de passe final</li>
          </ul>
          <textarea
            required
            value={credentials}
            onChange={(e) => setCredentials(e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="email@exemple.com / motdepasse123"
          />
          <span className="mt-1 block text-[12px] text-text-tertiary">
            L&apos;acheteur verra ce message juste après avoir payé. Personne
            d&apos;autre ne peut le voir.
          </span>
        </Field>
      ) : null}
      <Field label="Un message pour l'acheteur (affiché avant l'achat, optionnel)">
        <textarea
          value={deliveryInstructions}
          onChange={(e) => setDeliveryInstructions(e.target.value)}
          rows={3}
          className={inputClass}
          placeholder={
            deliveryType === "instant"
              ? "Ex. Après ton achat tu reçois l'email et le mot de passe, connecte-toi et profite."
              : "Ex. Après ton achat je dois être présent pour te donner accès complet — laisse un message, je serai disponible."
          }
        />
      </Field>

      {error ? <p className="text-[13px] text-text-secondary">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-1.5 rounded-[10px] bg-accent px-6 py-3 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-60"
      >
        {loading ? "Publication…" : "Publier l'annonce"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-[13px] text-text-secondary">
      {label}
      {children}
    </label>
  );
}
