"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeft, ExternalLink, Monitor, PanelRightClose, PanelRightOpen, RotateCw, Smartphone } from "lucide-react";

// Live public site beside the admin editor. It opens the page for the current admin section,
// reloads in place after every save (refreshKey changes), and renders the site at a real desktop
// or phone width, scaled down to fit the pane. Open/width/device are kept in cookies.

type Device = "desktop" | "phone";
type PreviewLabels = { title: string; hide: string; reload: string; back: string; desktop: string; phone: string; open: string; drag: string };
type AdminPreviewProps = {
  src: string;
  refreshKey?: string;
  initial: { open: boolean; width: number; device: Device };
  labels: PreviewLabels;
};

const frameWidths: Record<Device, number> = { desktop: 1440, phone: 390 };
const TOGGLE_EVENT = "admin-preview-toggle";
// Below this the pane becomes a full-screen overlay instead of a column.
const OVERLAY_QUERY = "(max-width: 1099px)";

function remember(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/admin; max-age=31536000; samesite=lax`;
}

export function AdminPreviewToggle({ label }: { label: string }) {
  return (
    <button className="admin-preview-toggle" type="button" onClick={() => window.dispatchEvent(new Event(TOGGLE_EVENT))}>
      <PanelRightOpen size={16} aria-hidden="true" /><span>{label}</span>
    </button>
  );
}

export default function AdminPreview({ src, refreshKey, initial, labels }: AdminPreviewProps) {
  const [open, setOpen] = useState(initial.open);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [width, setWidth] = useState(initial.width);
  const [device, setDevice] = useState<Device>(initial.device);
  const [dragging, setDragging] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [shownPath, setShownPath] = useState(src);
  const viewportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const lastKey = useRef(refreshKey);

  useEffect(() => {
    const onToggle = () => {
      if (window.matchMedia(OVERLAY_QUERY).matches) {
        setOverlayOpen((value) => !value);
        return;
      }
      remember("admin-preview", open ? "closed" : "open");
      setOpen(!open);
    };
    window.addEventListener(TOGGLE_EVENT, onToggle);
    return () => window.removeEventListener(TOGGLE_EVENT, onToggle);
  }, [open]);

  // A save redirects back here with a new refreshKey: reload whatever page the preview is on.
  // Leaving the saved URL clears the key; that must not reload, or it would cancel the
  // navigation to the next section's page.
  useEffect(() => {
    const changed = refreshKey !== lastKey.current;
    lastKey.current = refreshKey;
    if (changed && refreshKey) frameRef.current?.contentWindow?.location.reload();
  }, [refreshKey]);

  useEffect(() => {
    const node = viewportRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    observer.observe(node);
    return () => observer.disconnect();
  }, [open, overlayOpen]);

  function close() {
    if (window.matchMedia(OVERLAY_QUERY).matches) {
      setOverlayOpen(false);
      return;
    }
    remember("admin-preview", "closed");
    setOpen(false);
  }

  function chooseDevice(next: Device) {
    remember("admin-preview-device", next);
    setDevice(next);
  }

  function startResize(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    let latest = width;
    const clamp = (value: number) => Math.round(Math.min(Math.max(value, 340), window.innerWidth - 640));
    const move = (moveEvent: PointerEvent) => {
      latest = clamp(window.innerWidth - moveEvent.clientX);
      setWidth(latest);
    };
    const stop = () => {
      setDragging(false);
      remember("admin-preview-width", String(latest));
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    setDragging(true);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  }

  function frameLoaded() {
    try {
      const location = frameRef.current?.contentWindow?.location;
      if (location) setShownPath(location.pathname);
    } catch {}
  }

  const frameWidth = frameWidths[device];
  const gutter = device === "phone" ? 24 : 0;
  const scale = box.w ? Math.min(1, (box.w - gutter * 2) / frameWidth) : 1;
  const frameHeight = box.h ? (box.h - gutter * 2) / scale : 800;
  const classes = ["admin-preview", open && "is-open", overlayOpen && "is-overlay", dragging && "is-dragging"].filter(Boolean).join(" ");

  return (
    <aside className={classes} style={width ? { "--preview-width": `${width}px` } as CSSProperties : undefined} aria-label={labels.title}>
      <button className="admin-preview-rail" type="button" onClick={() => window.dispatchEvent(new Event(TOGGLE_EVENT))} aria-label={labels.title}>
        <PanelRightOpen size={16} aria-hidden="true" /><span>{labels.title}</span>
      </button>
      <div className="admin-preview-resize" onPointerDown={startResize} title={labels.drag} aria-hidden="true" />
      <div className="admin-preview-bar">
        <button type="button" onClick={() => frameRef.current?.contentWindow?.history.back()} title={labels.back} aria-label={labels.back}><ArrowLeft size={16} /></button>
        <button type="button" onClick={() => frameRef.current?.contentWindow?.location.reload()} title={labels.reload} aria-label={labels.reload}><RotateCw size={15} /></button>
        <span className="admin-preview-url" title={shownPath}>{shownPath}</span>
        <div className="admin-preview-devices" role="group">
          <button type="button" className={device === "desktop" ? "is-active" : undefined} onClick={() => chooseDevice("desktop")} title={labels.desktop} aria-label={labels.desktop} aria-pressed={device === "desktop"}><Monitor size={15} /></button>
          <button type="button" className={device === "phone" ? "is-active" : undefined} onClick={() => chooseDevice("phone")} title={labels.phone} aria-label={labels.phone} aria-pressed={device === "phone"}><Smartphone size={15} /></button>
        </div>
        <a href={shownPath} target="_blank" rel="noreferrer" title={labels.open} aria-label={labels.open}><ExternalLink size={15} /></a>
        <button type="button" onClick={close} title={labels.hide} aria-label={labels.hide}><PanelRightClose size={16} /></button>
      </div>
      <div className={`admin-preview-viewport is-${device}`} ref={viewportRef}>
        {(open || overlayOpen) && <div className="admin-preview-stage" style={{ width: frameWidth * scale, height: frameHeight * scale }}>
          <iframe
            ref={frameRef}
            src={src}
            title={labels.title}
            onLoad={frameLoaded}
            style={{ width: frameWidth, height: frameHeight, transform: `scale(${scale})` }}
          />
        </div>}
      </div>
    </aside>
  );
}
