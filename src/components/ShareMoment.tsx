import { useEffect, useMemo, useState } from "react";
import { SCENES } from "../data/scenes";
import type { Voice } from "../data/types";
import { canShare, copyLink, sceneShareContent, shareMoment, type ShareCardContent } from "../lib/share";
import { renderShareCard } from "../lib/shareCard";
import { markShareShown, shouldShowSceneShare, useStore } from "../lib/store";
import { pendingRewards } from "../lib/rewards";

export const shareBtn =
  "inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl text-sm font-medium bg-ink text-white transition-[transform,opacity] duration-150 active:scale-[0.98] disabled:opacity-40 justify-self-start";

/** The picture and the black Share (or Copy link) button for any share card. */
export function ShareCardPanel({ content }: { content: ShareCardContent }) {
  const [src, setSrc] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const shareOk = canShare();

  useEffect(() => {
    let gone = false;
    let url: string | null = null;
    renderShareCard(content)
      .then((blob) => {
        if (gone) return;
        url = URL.createObjectURL(blob);
        setSrc(url);
        setFile(new File([blob], content.fileName, { type: "image/png" }));
      })
      .catch(() => {
        if (!gone) setStatus("Couldn't make the picture. You can still copy the link.");
      });
    return () => {
      gone = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [content]);

  const onShare = async () => {
    if (shareOk) {
      const result = await shareMoment({ file: file ?? undefined, title: content.title, text: content.text });
      if (result === "shared") setStatus("Shared.");
      else if (result === "unavailable") {
        const ok = await copyLink();
        setStatus(ok ? "Link copied." : "Couldn't copy the link.");
      }
      return;
    }
    const ok = await copyLink();
    setStatus(ok ? "Link copied." : "Couldn't copy the link.");
  };

  return (
    <div className="grid gap-3">
      {src ? (
        <img src={src} alt={content.alt} className="w-full rounded-2xl border border-line" width={1200} height={630} />
      ) : (
        <div className="aspect-[1200/630] rounded-2xl border border-line bg-paper" aria-hidden="true" />
      )}
      <button type="button" className={shareBtn} onClick={onShare}>
        {shareOk ? "Share" : "Copy link"}
      </button>
      {status ? (
        <p className="text-sm" role="status">
          {status}
        </p>
      ) : null}
    </div>
  );
}

/**
 * One-shot share card for a finished scene. When the scene also earned a badge, the badge celebration
 * carries its own share card, so this one stays out of the way (one celebration, not two).
 */
export function ShareMoment({ sceneId }: { sceneId: string }) {
  const s = useStore();
  const voice: Voice = s.voice ?? "female";
  const scene = SCENES.find((sc) => sc.id === sceneId);
  const [open] = useState(() => !!scene && !scene.adult && shouldShowSceneShare(s, sceneId) && pendingRewards(s).length === 0);
  const content = useMemo(() => (scene && !scene.adult ? sceneShareContent(scene, voice) : null), [scene, voice]);

  useEffect(() => {
    if (open && content) markShareShown("scene", sceneId);
  }, [open, content, sceneId]);

  if (!open || !content) return null;
  return (
    <article className="grid gap-3 rounded-4xl border border-line bg-card p-5" data-share-moment="scene">
      <p className="text-sm text-muted">Share this scene</p>
      <ShareCardPanel content={content} />
    </article>
  );
}
