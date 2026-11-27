import cafeVideo from "../assets/cartoons/cafe.mp4";
import cafePoster from "../assets/cartoons/cafe-poster.webp";

/**
 * Short voiced cartoons ("Watch the scene"). Each one acts out real lines from the lessons.
 * Every bubble is voiced in Thai: the staff in a female voice, the customer in a male voice
 * (so the customer's lines use the ครับ forms).
 *
 * To add one (taxi, market, ...): render it with the reel kit, drop `<id>.mp4` (720×1280,
 * about 1 MB) and `<id>-poster.webp` into src/assets/cartoons/, then add an entry here with the
 * scenes it belongs to and the time (seconds) each line starts in the video.
 */
export interface CartoonCue {
  scene: string;
  line: string;
  at: number;
}

export interface Cartoon {
  id: string;
  title: string;
  titleTh: string;
  blurb: string;
  video: string;
  poster: string;
  /** Lesson screens that show this cartoon. */
  scenes: string[];
  cues: CartoonCue[];
}

export const CARTOONS: Cartoon[] = [
  {
    id: "cafe",
    title: "Ordering an iced coffee",
    titleTh: "สั่งกาแฟเย็น",
    blurb: "Say hello to Nid, order, pay 55 baht. A 33-second cartoon, every line spoken in Thai.",
    video: cafeVideo,
    poster: cafePoster,
    scenes: ["cafe", "order"],
    cues: [
      { scene: "cafe", line: "c1", at: 7.0 },
      { scene: "cafe", line: "c2", at: 9.4 },
      { scene: "order", line: "o1", at: 11.9 },
      { scene: "order", line: "o2", at: 14.5 },
      { scene: "order", line: "o6", at: 18.4 },
      { scene: "order", line: "o7", at: 21.0 },
    ],
  },
];

export function cartoonsForScene(sceneId: string): Cartoon[] {
  return CARTOONS.filter((c) => c.scenes.includes(sceneId));
}
