import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface Props {
  videoId: string;
  onClose: () => void;
  onComplete: () => void;
}

const REQUIRED_PERCENT = 80;
const SHARE_COUNT = 4;

const YouTubeTaskModal: React.FC<Props> = ({
  videoId,
  onClose,
  onComplete
}) => {
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);

  const [sharesDone, setSharesDone] = useState<number[]>([]);

  const videoUrl = videoId;

  // ================= INIT YOUTUBE =================
  useEffect(() => {
    let initialized = false;

    const initPlayer = () => {
      if (initialized || playerRef.current) return;
      initialized = true;

      playerRef.current = new window.YT.Player("yt-player", {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1
        },
        events: {
          onReady: (e: any) => {
            setDuration(e.target.getDuration());
            setReady(true);
          },
          onStateChange: handleStateChange
        }
      });
    };

    const loadYT = () => {
      if (window.YT && window.YT.Player) {
        initPlayer();
        return;
      }

      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);

      window.onYouTubeIframeAPIReady = initPlayer;
    };

    loadYT();

    return () => {
      stopTracking();
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
  }, [videoId]);

  // ================= TRACKING =================
  const handleStateChange = (event: any) => {
    if (event.data === 1) startTracking();
    if (event.data === 2 || event.data === 0) stopTracking();
  };

  const startTracking = () => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;

      setWatchedSeconds(player.getCurrentTime());
    }, 1000);
  };

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // ================= PROGRESS =================
  const percentWatched = duration
    ? (watchedSeconds / duration) * 100
    : 0;

  const canVerifyWatch = percentWatched >= REQUIRED_PERCENT;

  // ================= SHARE (NATIVE SHEET) =================
  const handleShare = async (index: number) => {
    try {
      const shareData = {
        title: "Watch this video",
        text: "\nCheck this out!",
        url: `https://www.youtube.com/watch?v=${videoId}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${videoId}\nCheck this out!`);
        alert("Link copied!");
      }

      if (!sharesDone.includes(index)) {
        setSharesDone((prev) => [...prev, index]);
      }
    } catch (err) {
      console.log("Share cancelled or failed");
    }
  };

  const allShared = sharesDone.length >= SHARE_COUNT;
  const canVerify = canVerifyWatch && allShared;

  const verify = () => {
    if (!canVerify) return;
    onComplete();
    onClose();
  };

  // ================= UI =================
  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm">

      <div />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[92%] max-w-2xl bg-[#0F172A] rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
      >

        {/* HEADER */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
          <h2 className="text-white text-sm font-semibold">
            🎥 Watch + Share Task
          </h2>
          <button onClick={onClose} className="text-red-400 text-sm">
            Close
          </button>
        </div>

        {/* VIDEO */}
        <div className="relative w-full bg-black aspect-video">
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
              <div className="w-10 h-10 border-4 border-white/20 border-t-cyan-400 rounded-full animate-spin" />
            </div>
          )}
          <div id="yt-player" className="absolute inset-0 w-full h-full" />
        </div>

        {/* PROGRESS */}
        <div className="px-4 pt-3">
          <div className="w-full h-2 bg-white/10 rounded-full">
            <div
              className="h-full bg-cyan-400"
              style={{ width: `${Math.min(100, percentWatched)}%` }}
            />
          </div>

          <div className="text-xs text-white/80 flex justify-between mt-1">
            <span>{Math.floor(percentWatched)}%</span>
            <span>{sharesDone.length}/{SHARE_COUNT} shares</span>
          </div>
        </div>

    {/* ================= SHARE SECTION ================= */}
<div className="px-4 mt-5 space-y-3">

  {/* HEADER */}
  <div className="flex items-center justify-between">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
      Share Video with 10 Friends
    </p>

    <span className="text-[9px] font-bold text-slate-500">
      {sharesDone.length}/{SHARE_COUNT} Completed
    </span>
  </div>

  {/* PROGRESS BAR */}
  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
    <div
      className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 transition-all"
      style={{ width: `${(sharesDone.length / SHARE_COUNT) * 100}%` }}
    />
  </div>

  {/* GRID BUTTONS */}
  <div className="grid grid-cols-2 gap-2 pt-2">

    {Array.from({ length: SHARE_COUNT }).map((_, i) => {
      const done = sharesDone.includes(i);

      return (
        <button
          key={i}
          onClick={() => handleShare(i)}
          className={`
            relative overflow-hidden rounded-xl px-3 py-3 text-[10px] font-bold uppercase tracking-wider
            transition-all duration-300 border
            ${done
              ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
              : "bg-[#0F172A] border-white/10 text-white hover:border-cyan-400/40 hover:bg-white/5"
            }
          `}
        >
          {/* glow effect for done */}
          {done && (
            <div className="absolute inset-0 bg-emerald-500/10 blur-xl" />
          )}

          <span className="relative z-10">
            {done ? "Shared ✓" : `Share ${i + 1}`}
          </span>
        </button>
      );
    })}

  </div>
</div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-4 py-4 mt-2">

          <button onClick={onClose} className="text-white/70">
            Cancel
          </button>

          <button
            onClick={verify}
            disabled={!canVerify}
            className={`px-4 py-2 rounded-lg font-bold ${
              canVerify
                ? "bg-cyan-500 text-black"
                : "bg-gray-600 text-gray-300"
            }`}
          >
            {canVerify ? "Verify Task" : "Complete Watch + Share"}
          </button>

        </div>

      </div>
    </div>,
    document.body
  );
};

export default YouTubeTaskModal;