import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function ProofUpload({
  bucket,
  pathPrefix,
  onUploaded,
}: {
  bucket: string;
  pathPrefix: string;
  onUploaded: (url: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    setError(null);
    const path = `${pathPrefix}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    setUploading(false);
    if (error) {
      setError(error.message);
      return;
    }
    onUploaded(path);
  }

  return (
    <div className="space-y-2">
      <label className="block rounded-xl border-2 border-dashed border-border-light dark:border-border-dark p-6 text-center cursor-pointer hover:border-teal transition-colors">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {preview ? (
          <img src={preview} alt="Proof preview" className="max-h-48 mx-auto rounded-lg" />
        ) : (
          <span className="text-text-light-secondary dark:text-text-dark-secondary text-sm">
            Tap to upload screenshot proof
          </span>
        )}
      </label>
      {uploading && <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary">Uploading…</p>}
      {error && <p className="text-danger text-xs">{error}</p>}
    </div>
  );
}
