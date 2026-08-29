const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

/**
 * URL publique d'un fichier dans un bucket public (ex. listing-images).
 * Ne jamais utiliser pour le bucket privé kyc-documents.
 */
export function getPublicStorageUrl(bucket: string, path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
