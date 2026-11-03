"use client";

import Image from "next/image";
import { Check, Minus, Plus, X } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent } from "react";

// A quick photo editor that opens when the admin picks a photo (or a saved photo's name): drag to move,
// zoom with the slider or the mouse wheel, and choose a crop shape. The frame is what will be saved.
// Editing is optional: "use original" keeps the photo as it is.

export type EditorLabels = {
  editorTitle: string;
  editorHint: string;
  zoom: string;
  shape: string;
  original: string;
  useOriginal: string;
  apply: string;
  cancel: string;
};

export type Aspect = "original" | "1:1" | "4:3" | "16:9";
const aspects: Aspect[] = ["original", "1:1", "4:3", "16:9"];
const maxZoom = 4;
const maxSide = 2000;

function ratio(aspect: Aspect, width: number, height: number) {
  if (aspect === "original") return width / height;
  const [w, h] = aspect.split(":").map(Number);
  return w / h;
}

// The frame's size on screen for a crop shape: as wide as fits inside the panel (its margins and padding take
// about 96px), but never taller than 55% of the window.
function frameSize(aspect: number) {
  const width = Math.min(720, window.innerWidth - 96);
  const height = Math.min(width / aspect, window.innerHeight * .55);
  return { width: height * aspect, height };
}

export default function ImageEditor({ src, type, initialAspect = "original", labels, onCancel, onOriginal, onApply }: {
  src: string;
  type: string;
  initialAspect?: Aspect;
  labels: EditorLabels;
  onCancel: () => void;
  onOriginal: () => void;
  onApply: (blob: Blob) => void;
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [aspect, setAspect] = useState<Aspect>(initialAspect);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const drag = useRef<{ x: number; y: number; start: { x: number; y: number } } | null>(null);

  // A new shape (or the photo loading) starts over: the photo covers the frame, centred, at zoom 1.
  function start(img: HTMLImageElement, shape: Aspect) {
    const size = frameSize(ratio(shape, img.naturalWidth, img.naturalHeight));
    const scale = Math.max(size.width / img.naturalWidth, size.height / img.naturalHeight);
    setAspect(shape);
    setFrame(size);
    setZoom(1);
    setOffset({ x: (size.width - img.naturalWidth * scale) / 2, y: (size.height - img.naturalHeight * scale) / 2 });
  }

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setImage(img);
      start(img, initialAspect);
    };
    img.src = src;
    // Only a new photo loads again; the shape it starts with is read once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const baseScale = image ? Math.max(frame.width / image.naturalWidth, frame.height / image.naturalHeight) : 1;
  const scale = baseScale * zoom;
  const shown = image ? { width: image.naturalWidth * scale, height: image.naturalHeight * scale } : { width: 0, height: 0 };
  // The photo always covers the frame: no empty edges.
  const clamp = (x: number, y: number, width = shown.width, height = shown.height) => ({
    x: Math.min(0, Math.max(frame.width - width, x)),
    y: Math.min(0, Math.max(frame.height - height, y)),
  });

  function zoomTo(next: number) {
    if (!image) return;
    const value = Math.min(maxZoom, Math.max(1, next));
    const factor = value / zoom;
    // Zoom around the frame's centre, so what is in the middle stays in the middle.
    const cx = frame.width / 2;
    const cy = frame.height / 2;
    setZoom(value);
    setOffset(clamp(cx - (cx - offset.x) * factor, cy - (cy - offset.y) * factor, image.naturalWidth * baseScale * value, image.naturalHeight * baseScale * value));
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY, start: offset };
  }
  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    setOffset(clamp(drag.current.start.x + event.clientX - drag.current.x, drag.current.start.y + event.clientY - drag.current.y));
  }
  const onWheel = (event: WheelEvent) => zoomTo(zoom * (event.deltaY < 0 ? 1.08 : 1 / 1.08));

  // The frame's part of the photo, in the photo's own pixels, at most 2000px on the long side.
  function apply() {
    if (!image) return;
    const sw = frame.width / scale;
    const sh = frame.height / scale;
    const out = Math.min(1, maxSide / Math.max(sw, sh));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sw * out);
    canvas.height = Math.round(sh * out);
    canvas.getContext("2d")?.drawImage(image, -offset.x / scale, -offset.y / scale, sw, sh, 0, 0, canvas.width, canvas.height);
    const keep = type === "image/png" || type === "image/webp" ? type : "image/jpeg";
    canvas.toBlob((blob) => { if (blob) onApply(blob); }, keep, .9);
  }

  return (
    <div className="image-editor" role="dialog" aria-modal="true" aria-label={labels.editorTitle} onClick={onCancel}>
      <div className="image-editor-panel" onClick={(event) => event.stopPropagation()}>
        <div className="image-editor-head">
          <strong>{labels.editorTitle}</strong>
          <button type="button" className="image-editor-close" onClick={onCancel} aria-label={labels.cancel}><X size={18} /></button>
        </div>
        <div className="image-editor-stage">
          <div className="image-editor-frame" style={{ width: frame.width, height: frame.height }}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onWheel={onWheel}>
            {image && <Image src={src} alt="" width={image.naturalWidth} height={image.naturalHeight} unoptimized draggable={false} style={{ width: shown.width, height: shown.height, transform: `translate(${offset.x}px, ${offset.y}px)` }} />}
            <span className="image-editor-grid" aria-hidden="true" />
          </div>
        </div>
        <p className="image-editor-hint">{labels.editorHint}</p>
        <div className="image-editor-tools">
          <div className="image-editor-shapes" role="group" aria-label={labels.shape}>
            {aspects.map((item) => (
              <button type="button" key={item} className={item === aspect ? "is-active" : undefined} aria-pressed={item === aspect} onClick={() => image && start(image, item)}>
                {item === "original" ? labels.original : item}
              </button>
            ))}
          </div>
          <label className="image-editor-zoom">
            <button type="button" onClick={() => zoomTo(zoom - .25)} aria-label="−"><Minus size={15} /></button>
            <input type="range" min={1} max={maxZoom} step={.01} value={zoom} onChange={(event) => zoomTo(Number(event.target.value))} aria-label={labels.zoom} />
            <button type="button" onClick={() => zoomTo(zoom + .25)} aria-label="+"><Plus size={15} /></button>
          </label>
        </div>
        <div className="image-editor-actions">
          <button type="button" className="image-editor-secondary" onClick={onCancel}>{labels.cancel}</button>
          <button type="button" className="image-editor-secondary" onClick={onOriginal}>{labels.useOriginal}</button>
          <button type="button" className="admin-save" onClick={apply} disabled={!image}><Check size={15} />{labels.apply}</button>
        </div>
      </div>
    </div>
  );
}
