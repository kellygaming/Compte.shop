"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "rounded-[10px] border border-border-strong bg-surface px-3.5 py-2.5 text-[15px] text-text outline-none placeholder:text-text-tertiary focus:border-border-hover";

const fileClass =
  "rounded-[10px] border border-dashed border-border-strong bg-surface px-3.5 py-3 text-[13.5px] text-text-secondary file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-[12.5px] file:font-semibold file:text-bg";

export function KycForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [birthCertificate, setBirthCertificate] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selfie || (!idDocument && !birthCertificate)) {
      setError("Pièce d'identité (ou extrait de naissance) et photo requises.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Session expirée, reconnectez-vous.");
      setLoading(false);
      return;
    }

    try {
      const uploads: { idDocumentPath?: string; birthCertificatePath?: string; selfiePath: string } =
        { selfiePath: "" };

      if (idDocument) {
        uploads.idDocumentPath = await uploadFile(supabase, user.id, "id-document", idDocument);
      }
      if (birthCertificate) {
        uploads.birthCertificatePath = await uploadFile(
          supabase,
          user.id,
          "birth-certificate",
          birthCertificate,
        );
      }
      uploads.selfiePath = await uploadFile(supabase, user.id, "selfie", selfie);

      const response = await fetch("/api/sellers/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_document_path: uploads.idDocumentPath,
          birth_certificate_path: uploads.birthCertificatePath,
          selfie_path: uploads.selfiePath,
          phone,
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
      <Field label="Téléphone (utilisé pour vos paiements)">
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={inputClass}
          placeholder="07 00 00 00 00"
        />
      </Field>
      <Field label="Pièce d'identité">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setIdDocument(e.target.files?.[0] ?? null)}
          className={fileClass}
        />
      </Field>
      <Field label="Ou extrait de naissance">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setBirthCertificate(e.target.files?.[0] ?? null)}
          className={fileClass}
        />
      </Field>
      <Field label="Photo de vous (selfie)">
        <input
          required
          type="file"
          accept="image/*"
          onChange={(e) => setSelfie(e.target.files?.[0] ?? null)}
          className={fileClass}
        />
      </Field>

      {error ? <p className="text-[13px] text-text-secondary">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="mt-1.5 rounded-[10px] bg-accent px-6 py-3 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-60"
      >
        {loading ? "Envoi…" : "Envoyer mes documents"}
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

async function uploadFile(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  kind: string,
  file: File,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("kyc-documents").upload(path, file, {
    upsert: false,
  });
  if (error) {
    throw new Error(`Échec de l'envoi (${kind}) : ${error.message}`);
  }
  return path;
}
