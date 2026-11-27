import video from "../assets/cartoons/streak-30.mp4";
import poster from "../assets/cartoons/streak-30-poster.webp";
import type { WatchCartoon } from "../components/WatchScene";

/** Voiced congratulations when a 30-day streak is first reached. Not listed in cartoons.ts. */
export const STREAK_30_CARTOON: WatchCartoon = {
  id: "streak-30",
  title: "30-day streak",
  titleTh: "สามสิบวัน",
  blurb: "A short congratulations in Thai, the first time you hit 30 days.",
  video,
  poster,
  cues: [
    { at: 1.7, who: "pim", thai: "ยินดีด้วยค่ะ", roman: "yin-dii dûay khâ", en: "Congratulations!" },
    { at: 4.4, who: "pim", thai: "สามสิบวันติดกันเลยค่ะ เก่งมากค่ะ", roman: "sǎam-sìp wan dtìt gan loei khâ gèng mâak khâ", en: "Thirty days in a row. Well done." },
    { at: 8.5, who: "you", thai: "ขอบคุณครับ", roman: "khàwp-khun khráp", en: "Thank you." },
  ],
};
