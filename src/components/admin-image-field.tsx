"use client";

import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { Crop, ImageIcon, ImagePlus, Loader2, Trash2, Upload, X } from "lucide-react";
import ImageEditor, { type Aspect, type EditorLabels } from "@/components/image-editor";

// Photo uploads for the admin, made for someone who never types a file path: pick or drop a photo, adjust it
// in the editor if you like (move, zoom, crop), confirm, and the form shows the photo's file name. Clicking
// the name opens the photo in the editor again. Large photos are shrunk in the browser first (at most 2000px
// on the long side), so uploads stay quick and small; the server keeps them and returns their address.

export type ImageLabels = EditorLabels & {
  choose: string;
  replace: string;
  remove: string;
  drop: string;
  uploading: string;
  error: string;
  empty: string;
  edit: string;
  uploaded: string;
};

const maxSide = 2000;

async function shrink(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1_500_000 && (file.type === "image/jpeg" || file.type === "image/webp")) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const type = file.type === "image/png" && file.size < 2_000_000 ? "image/png" : "image/jpeg";
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("shrink")), type, 0.85));
}

export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", await shrink(file), file.name);
  const response = await fetch("/api/admin/upload", { method: "POST", body });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.url) throw new Error("upload");
  return payload.url as string;
}

const imagesIn = (files: FileList | null) => [...(files ?? [])].filter((file) => file.type.startsWith("image/"));

// The name shown for a saved photo: the file name kept in its address, else the last part of the path.
export function photoName(url: string, uploaded: string) {
  if (!url) return "";
  try {
    const parsed = new URL(url, "http://local");
    const name = parsed.searchParams.get("name");
    if (name) return name;
    if (parsed.pathname.startsWith("/api/images/")) return uploaded;
    return decodeURIComponent(parsed.pathname.split("/").pop() || url);
  } catch {
    return url;
  }
}

// An edited photo keeps its name, with the extension of what the editor saved.
function renamed(name: string, type: string) {
  const extension = type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";
  return `${name.replace(/\.[a-z0-9]+$/i, "") || "photo"}.${extension}`;
}

type Editing = { src: string; type: string; name: string; file?: File };

// Opens a saved photo in the editor (it is fetched, so the edited copy can be drawn and saved).
async function editingFrom(url: string, name: string): Promise<Editing | null> {
  const response = await fetch(url).catch(() => null);
  if (!response?.ok) return null;
  const blob = await response.blob();
  return { src: URL.createObjectURL(blob), type: blob.type, name };
}

// The editor plus what happens after it: "use original" uploads the picked file as it is (for a saved photo
// nothing changes), "apply" uploads the edited copy under the same name.
function useEditor(onUploaded: (url: string) => void, onBusy: (busy: boolean) => void, onFailed: () => void) {
  const [editing, setEditing] = useState<Editing | null>(null);
  useEffect(() => () => { if (editing) URL.revokeObjectURL(editing.src); }, [editing]);

  async function upload(file: File) {
    setEditing(null);
    onBusy(true);
    try {
      onUploaded(await uploadImage(file));
    } catch {
      onFailed();
    }
    onBusy(false);
  }

  return {
    editing,
    open: setEditing,
    close: () => setEditing(null),
    original: () => editing?.file ? upload(editing.file) : setEditing(null),
    apply: (blob: Blob) => editing && upload(new File([blob], renamed(editing.name, blob.type), { type: blob.type })),
  };
}

// One photo: the form gets its address in a field named `name`. `aspect` is the crop shape the editor starts with.
export function ImageField({ name, label, value = "", required = true, aspect = "original", labels }: { name: string; label: string; value?: string; required?: boolean; aspect?: Aspect; labels: ImageLabels }) {
  const [url, setUrl] = useState(value);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [over, setOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const editor = useEditor(setUrl, setBusy, () => setFailed(true));
  const fileName = photoName(url, labels.uploaded);

  function take(files: FileList | null) {
    const [file] = imagesIn(files);
    if (!file) return;
    setFailed(false);
    editor.open({ src: URL.createObjectURL(file), type: file.type, name: file.name, file });
  }

  async function reopen() {
    const editing = await editingFrom(url, fileName);
    if (editing) editor.open(editing);
    else window.open(url, "_blank", "noopener");
  }

  function drop(event: DragEvent) {
    event.preventDefault();
    setOver(false);
    take(event.dataTransfer.files);
  }

  return (
    <div className="admin-field admin-image-field">
      <span>{label}</span>
      <div className={`admin-image-box${over ? " is-over" : ""}${url ? " has-photo" : ""}`} onDragOver={(event) => { event.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={drop}>
        {url
          ? <button type="button" className="admin-image-name" onClick={reopen} disabled={busy} title={labels.edit}>
              {busy ? <Loader2 className="admin-spin" size={16} /> : <ImageIcon size={16} />}<span>{busy ? labels.uploading : fileName}</span>
            </button>
          : <span className="admin-image-name is-empty">{busy ? <Loader2 className="admin-spin" size={16} /> : <ImagePlus size={16} />}<span>{busy ? labels.uploading : labels.empty}</span></span>}
        <span className="admin-image-actions">
          {url && !busy && <button type="button" className="admin-image-icon" onClick={reopen} title={labels.edit} aria-label={labels.edit}><Crop size={15} /></button>}
          <button type="button" className="admin-image-choose" onClick={() => inputRef.current?.click()} disabled={busy}>
            <Upload size={14} />{url ? labels.replace : labels.choose}
          </button>
          {url && !busy && <button type="button" className="admin-image-icon is-danger" onClick={() => setUrl("")} title={labels.remove} aria-label={labels.remove}><Trash2 size={15} /></button>}
        </span>
        {failed && <small className="admin-image-error">{labels.error}</small>}
        {/* The address the form saves; kept as a real (invisible) field so a required photo is checked on save */}
        <input className="admin-image-value" name={name} value={url} onChange={() => {}} required={required} tabIndex={-1} aria-label={label} />
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={(event) => { take(event.target.files); event.target.value = ""; }} />
      </div>
      {editor.editing && <ImageEditor src={editor.editing.src} type={editor.editing.type} initialAspect={aspect} labels={labels}
        onCancel={editor.close} onOriginal={editor.original} onApply={editor.apply} />}
    </div>
  );
}

export type BatchLabels = ImageLabels & { title: string; hint: string; captionKy: string; captionRu: string; saveAll: string };
type BatchItem = { key: string; url: string; captionKy: string; captionRu: string };

// Several photos at once: pick them, add captions if you like, then save them all with one button. Each
// photo is listed by name; its name (or the crop button) opens it in the editor. The chosen photos go to the
// form as JSON in a field named `items`; the form's own fields (category, published) apply to all of them.
export function ImageBatch({ labels, children }: { labels: BatchLabels; children?: ReactNode }) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [busy, setBusy] = useState(0);
  const [failed, setFailed] = useState(false);
  const [over, setOver] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const update = (key: string, change: Partial<BatchItem>) => setItems((list) => list.map((item) => item.key === key ? { ...item, ...change } : item));
  const editor = useEditor((url) => editingKey && update(editingKey, { url }), (on) => setBusy((count) => count + (on ? 1 : -1)), () => setFailed(true));

  async function take(files: FileList | null) {
    const chosen = imagesIn(files);
    if (!chosen.length) return;
    setFailed(false);
    setBusy((count) => count + chosen.length);
    await Promise.all(chosen.map(async (file) => {
      try {
        const url = await uploadImage(file);
        setItems((list) => [...list, { key: url, url, captionKy: "", captionRu: "" }]);
      } catch {
        setFailed(true);
      }
      setBusy((count) => count - 1);
    }));
  }

  async function edit(item: BatchItem) {
    const editing = await editingFrom(item.url, photoName(item.url, labels.uploaded));
    if (!editing) return;
    setEditingKey(item.key);
    editor.open(editing);
  }

  return (
    <div className="admin-batch">
      <div className={`admin-batch-drop${over ? " is-over" : ""}`} onDragOver={(event) => { event.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(event) => { event.preventDefault(); setOver(false); take(event.dataTransfer.files); }}>
        <ImagePlus size={26} aria-hidden="true" />
        <strong>{labels.title}</strong>
        <small>{labels.hint}</small>
        <button type="button" className="admin-image-choose" onClick={() => inputRef.current?.click()}><Upload size={14} />{labels.choose}</button>
        {busy > 0 && <small className="admin-batch-busy"><Loader2 className="admin-spin" size={14} />{labels.uploading} ({busy})</small>}
        {failed && <small><b>{labels.error}</b></small>}
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(event) => { take(event.target.files); event.target.value = ""; }} />
      </div>
      {items.length > 0 && <>
        <ul className="admin-batch-list">
          {items.map((item) => (
            <li key={item.key}>
              <button type="button" className="admin-image-name" onClick={() => edit(item)} title={labels.edit}><ImageIcon size={16} /><span>{photoName(item.url, labels.uploaded)}</span></button>
              <input value={item.captionKy} onChange={(event) => update(item.key, { captionKy: event.target.value })} placeholder={labels.captionKy} maxLength={200} />
              <input value={item.captionRu} onChange={(event) => update(item.key, { captionRu: event.target.value })} placeholder={labels.captionRu} maxLength={200} />
              <span className="admin-batch-item-actions">
                <button type="button" onClick={() => edit(item)} aria-label={labels.edit} title={labels.edit}><Crop size={15} /></button>
                <button type="button" className="is-danger" onClick={() => setItems((list) => list.filter((other) => other.key !== item.key))} aria-label={labels.remove} title={labels.remove}><X size={15} /></button>
              </span>
            </li>
          ))}
        </ul>
        {children}
        <input type="hidden" name="items" value={JSON.stringify(items.map(({ url, captionKy, captionRu }) => ({ url, captionKy, captionRu })))} />
        <div className="admin-form-actions"><button className="admin-save" type="submit" disabled={busy > 0}><Upload size={15} />{labels.saveAll} ({items.length})</button></div>
      </>}
      {editor.editing && <ImageEditor src={editor.editing.src} type={editor.editing.type} labels={labels}
        onCancel={() => { editor.close(); setEditingKey(null); }} onOriginal={() => { editor.close(); setEditingKey(null); }} onApply={editor.apply} />}
    </div>
  );
}
