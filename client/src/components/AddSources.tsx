// components/AddSourcesModal.tsx
"use client";
import { useState, useRef, useEffect } from "react";
import { X, Upload, Youtube, Link as LinkIcon, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import api, { studyKitApi } from "@/app/api/api"; // adjust path if needed

interface AddSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  kitId?: string | null;          // optional: if not given, create a kit
  defaultKitName?: string;        // used when creating a kit
  onCreated?: (studyKitId: string) => void; // callback to refresh parent
}

export default function AddSourcesModal({
  isOpen,
  onClose,
  kitId: initialKitId,
  defaultKitName = "New Study Kit",
  onCreated,
}: AddSourcesModalProps) {
  // files
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  // links & texts collected
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>([]);
  const [websiteUrls, setWebsiteUrls] = useState<string[]>([]);
  const [pastedTexts, setPastedTexts] = useState<{ id: string; text: string }[]>([]);

  // inputs
  const [curYouTube, setCurYouTube] = useState("");
  const [curWebsite, setCurWebsite] = useState("");
  const [curText, setCurText] = useState("");

  // studykit creation / progress / errors
  const [studyKitId, setStudyKitId] = useState<string | null>(initialKitId ?? null);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setStudyKitId(initialKitId ?? null);
  }, [initialKitId]);

  if (!isOpen) return null;

  /** FILES HANDLERS */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    const arr = Array.from(list);
    setFiles((prev) => prev.concat(arr));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const list = e.dataTransfer.files;
    if (!list) return;
    setFiles((prev) => prev.concat(Array.from(list)));
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /** LINK HANDLERS */
  const addYouTubeUrl = () => {
    if (!curYouTube.trim()) return;
    setYoutubeUrls((p) => [...p, curYouTube.trim()]);
    setCurYouTube("");
  };
  const addWebsiteUrl = () => {
    if (!curWebsite.trim()) return;
    setWebsiteUrls((p) => [...p, curWebsite.trim()]);
    setCurWebsite("");
  };
  const removeYouTube = (i: number) => setYoutubeUrls((p) => p.filter((_, idx) => idx !== i));
  const removeWebsite = (i: number) => setWebsiteUrls((p) => p.filter((_, idx) => idx !== i));

  /** TEXT HANDLERS */
  const addPastedText = () => {
    if (!curText.trim()) return;
    setPastedTexts((p) => [...p, { id: Date.now().toString(36), text: curText.trim() }]);
    setCurText("");
  };
  const removePastedText = (id: string) => setPastedTexts((p) => p.filter((t) => t.id !== id));

  /** CORE SUBMIT flow
   * 1) create studykit if necessary
   * 2) upload files (multipart)
   * 3) post links (one-by-one)
   * 4) post pasted texts (one-by-one)
   */
  const handleSubmit = async () => {
    setMessage(null);
    setCreating(false);
    setUploading(false);

    try {
      setCreating(true);

      // 1) Ensure we have a studyKitId
      let kitId = studyKitId;
      if (!kitId) {
        const created = await studyKitApi.createStudyKit({ name: defaultKitName });
        kitId = created?.id;
        setStudyKitId(kitId ?? null);
      }

      setCreating(false);
      setUploading(true);

      // steps count for UX (files upload counts as one step)
      const totalSteps =
        (files.length > 0 ? 1 : 0) + youtubeUrls.length + websiteUrls.length + pastedTexts.length;
      let completedSteps = 0;

      const bumpProgress = () => {
        completedSteps += 1;
        setMessage(`Processing ${completedSteps} / ${totalSteps}`);
      };

      // 2) upload files (if any) — studyKitApi.uploadSources accepts File[]
      if (files.length > 0) {
        // backend expects form field name "files"
        await studyKitApi.uploadSources(kitId!, files);
        bumpProgress();
      }

      // 3) upload youtube URLs (kind = 'youtube')
      for (const url of youtubeUrls) {
        await studyKitApi.addLinkSource(kitId!, url, "youtube");
        bumpProgress();
      }

      // 4) upload website URLs (kind = 'web')
      for (const url of websiteUrls) {
        await studyKitApi.addLinkSource(kitId!, url, "web");
        bumpProgress();
      }

      // 5) upload pasted texts
      for (const t of pastedTexts) {
        await studyKitApi.addTextSource(kitId!, t.text);
        bumpProgress();
      }

      setMessage("Done — sources added.");
      setFiles([]);
      setYoutubeUrls([]);
      setWebsiteUrls([]);
      setPastedTexts([]);

      // notify parent that a kit was created/updated
      onCreated?.(kitId!);

      // small delay so user can read the message, then close
      setTimeout(() => {
        setUploading(false);
        onClose();
      }, 900);
    } catch (err: any) {
      console.error("AddSources error:", err);
      setMessage(
        err?.response?.data?.error || err?.message || "Upload failed. Try again or check console."
      );
      setUploading(false);
      setCreating(false);
    }
  };

  const totalSelected =
    files.length + youtubeUrls.length + websiteUrls.length + pastedTexts.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl mx-4 bg-background rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Add Sources</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Upload files, add links, or paste text to build your study kit
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
          >
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">Drag & drop files or click to select</p>
            <p className="text-sm text-muted-foreground">Supports PDF files up to 10MB</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            {files.length > 0 && (
              <div className="mt-4 text-left">
                <p className="text-sm font-medium">Selected files:</p>
                <ul className="mt-2 space-y-1">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span>{f.name} • {(f.size / 1024).toFixed(0)} KB</span>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(i)}>Remove</Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Links */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Website / YouTube Links</h3>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Paste YouTube URL"
                    value={curYouTube}
                    onChange={(e) => setCurYouTube(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addYouTubeUrl()}
                  />
                  <Button onClick={addYouTubeUrl}><Youtube className="mr-2" />Add</Button>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Paste Website URL"
                    value={curWebsite}
                    onChange={(e) => setCurWebsite(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addWebsiteUrl()}
                  />
                  <Button onClick={addWebsiteUrl}><LinkIcon className="mr-2" />Add</Button>
                </div>

                {youtubeUrls.length + websiteUrls.length > 0 && (
                  <div className="mt-2 text-sm">
                    {youtubeUrls.map((u, i) => (
                      <div key={`y-${i}`} className="flex justify-between items-center py-1">
                        <span className="truncate">{u}</span>
                        <Button size="sm" variant="ghost" onClick={() => removeYouTube(i)}>Remove</Button>
                      </div>
                    ))}
                    {websiteUrls.map((u, i) => (
                      <div key={`w-${i}`} className="flex justify-between items-center py-1">
                        <span className="truncate">{u}</span>
                        <Button size="sm" variant="ghost" onClick={() => removeWebsite(i)}>Remove</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Pasted Text */}
            <div className="space-y-4">
              <h3 className="font-medium text-foreground">Paste Text</h3>
              <Textarea
                placeholder="Paste text here"
                value={curText}
                onChange={(e) => setCurText(e.target.value)}
                className="min-h-[160px] resize-none"
              />
              <div className="flex gap-2">
                <Button onClick={addPastedText}>Add Text</Button>
                <Button variant="outline" onClick={() => { setCurText(""); }}>Clear</Button>
              </div>

              {pastedTexts.length > 0 && (
                <div className="mt-2 text-sm space-y-1">
                  {pastedTexts.map((t) => (
                    <div key={t.id} className="flex items-center justify-between">
                      <div className="truncate max-w-[70%]">{t.text.slice(0, 120)}{t.text.length > 120 ? "..." : ""}</div>
                      <Button size="sm" variant="ghost" onClick={() => removePastedText(t.id)}>Remove</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
          <div>
            <p className="text-sm text-muted-foreground">Total sources: <strong>{totalSelected}</strong></p>
            {message && <p className="text-sm text-foreground mt-1">{message}</p>}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={creating || uploading}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={totalSelected === 0 || creating || uploading}
            >
              {creating || uploading ? "Processing..." : (initialKitId ? "Add to Kit" : "Create Study Kit")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
