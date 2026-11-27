import { useEffect, useMemo, useState } from "react";
import { SCENES } from "../data/scenes";
import type { Voice } from "../data/types";
import {
  canShare,
  copyLink,
  sceneShareContent,
  shareMoment,
  streakShareContent,
  type StreakMilestone,
} from "../lib/share";
import { renderShareCard } from "../lib/shareCard";
import { getState, markShareShown, pendingStreakMilestone, shouldShowSceneShare, useStore } from "../lib/store";

type Props = { kind: "scene"; sceneId: string } | { kind: "streak"; days: StreakMilestone };

const shareBtn =
  "inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-xl text-sm font-medium bg-ink text-white transition-[transform,opacity] duration-150 active:scale-[0.98] disabled:opacity-40 justify-self-start";

/** One-shot share card for a finished scene or a 3/7/30-day streak. */
export function ShareMoment(props: Props) {
  const s = useStore();
  const voice: Voice = s.voice ?? "female";
  const scene = props.kind === "scene" ? SCENES.find((sc) => sc.id === props.sceneId) : undefined;
  const allowed =
    props.kind === "streak" ? true : !!scene && !scene.adult && shouldShowSceneShare(s, props.sceneId);
  const [open] = useState(allowed);
  const key = props.kind === "scene" ? props.sceneId : props.days;
  const content = useMemo(() => {
    if (props.kind === "streak") return streakShareContent(props.days, voice, getState());
    if (!scene || scene.adult) return null;
    return sceneShareContent(scene, voice);
  }, [props.kind, key, voice, scene]);

  const [src, setSrc] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const shareOk = canShare();

  useEffect(() => {
    if (!open || !content) return;
    if (props.kind === "scene") markShareShown("scene", props.sceneId);
    else markShareShown("streak", props.days);
  }, [open, content, props.kind, key]);

  useEffect(() => {
    if (!open || !content) return;
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
  }, [open, content]);

  if (!open || !content) return null;

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
    <article className="grid gap-3 rounded-4xl border border-line bg-card p-5" data-share-moment={props.kind}>
      <p className="text-sm text-muted">{props.kind === "scene" ? "Share this scene" : "Share your streak"}</p>
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
    </article>
  );
}

/** Show a pending 3/7/30-day streak card once, and keep it on screen for this visit. */
export function StreakShare() {
  const s = useStore();
  const [days] = useState(() => pendingStreakMilestone(s));
  if (!days) return null;
  return <ShareMoment kind="streak" days={days} />;
}
