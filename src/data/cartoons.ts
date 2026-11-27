import cafeVideo from "../assets/cartoons/cafe.mp4";
import cafePoster from "../assets/cartoons/cafe-poster.webp";
import taxiVideo from "../assets/cartoons/taxi.mp4";
import taxiPoster from "../assets/cartoons/taxi-poster.webp";

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
  /** Set these when the video says a different form than the lesson's default (male) one, e.g. the rider's ค่ะ lines. */
  who?: string;
  thai?: string;
  roman?: string;
  en?: string;
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
  {
    id: "taxi",
    title: "Taking a taxi to Siam",
    titleTh: "นั่งแท็กซี่ไปสยาม",
    blurb: "Name where you're going, ask for the meter, pay 180 baht and keep the change. A 40-second cartoon, every line spoken in Thai.",
    video: taxiVideo,
    poster: taxiPoster,
    scenes: ["taxi"],
    cues: [
      { scene: "taxi", line: "tx1", at: 5.9, who: "you", thai: "ไปสยามค่ะ", roman: "bpai sà-yǎam khâ", en: "To Siam, please." },
      { scene: "taxi", line: "tx2", at: 9.0 },
      { scene: "taxi", line: "tx3", at: 12.2, who: "you", thai: "เปิดมิเตอร์ได้ไหมคะ", roman: "bpòet mí-dtôe dâai mǎi khá", en: "Can you turn on the meter?" },
      { scene: "taxi", line: "tx4", at: 15.3 },
      { scene: "taxi", line: "tx8", at: 22.8 },
      { scene: "taxi", line: "tx9", at: 26.0, who: "you", thai: "นี่สองร้อย ไม่ต้องทอนค่ะ", roman: "nîi sǎwng-ráwy, mâi dtâwng thawn khâ", en: "Here's two hundred. Keep the change." },
      { scene: "taxi", line: "tx10", at: 29.2 },
    ],
  },
];

export function cartoonsForScene(sceneId: string): Cartoon[] {
  return CARTOONS.filter((c) => c.scenes.includes(sceneId));
}
