"use client";

import Image from "next/image";
import { Play, X } from "lucide-react";
import { useEffect, useState } from "react";
import { youtubeId } from "@/components/media-page";

// The homepage's full-width photo band between tournaments and players: a pause in the rhythm of card rows.
// The photo runs edge to edge under a dark veil, with the title and a short line on it; when the admin adds
// a YouTube link, a button plays it in the same player as the media page.

export default function HomeBand({ image, title, text, videoUrl, labels }: {
  image: string;
  title: string;
  text: string;
  videoUrl: string;
  labels: { playVideo: string; close: string };
}) {
  const [playing, setPlaying] = useState(false);
  const id = youtubeId(videoUrl);

  useEffect(() => {
    if (!playing) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setPlaying(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [playing]);

  return (<>
    <section className="home-band">
      <Image className="home-band-image" src={image} alt="" fill sizes="100vw" unoptimized />
      <div className="home-band-content section-wrap">
        <h2>{title}</h2>
        {text && <p className="home-band-text">{text}</p>}
        {id && <button type="button" className="hero-round-link home-band-play" onClick={() => setPlaying(true)}>
          <span><Play size={16} /></span>{labels.playVideo}
        </button>}
      </div>
    </section>

    {/* The player sits outside the band: the band is its own stacking layer, which would keep it under the page */}
    {playing && id && <div className="sandyk" role="dialog" aria-modal="true" aria-label={title} onClick={() => setPlaying(false)}>
      <figure className="sandyk-lid" onClick={(event) => event.stopPropagation()}>
        <div className="sandyk-video">
          <iframe src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1`} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
        </div>
      </figure>
      <button type="button" className="sandyk-close" onClick={() => setPlaying(false)} aria-label={labels.close} autoFocus><X size={24} /></button>
    </div>}
  </>);
}
