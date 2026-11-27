import video7 from "../assets/cartoons/streak-7.mp4";
import poster7 from "../assets/cartoons/streak-7-poster.webp";
import video30 from "../assets/cartoons/streak-30.mp4";
import poster30 from "../assets/cartoons/streak-30-poster.webp";
import video100 from "../assets/cartoons/streak-100.mp4";
import poster100 from "../assets/cartoons/streak-100-poster.webp";
import type { WatchCartoon } from "../components/WatchScene";
import type { CartoonId } from "./rewards";

/** Voiced congratulations for the 7-, 30- and 100-day streaks. Not listed in cartoons.ts. */
export const STREAK_7_CARTOON: WatchCartoon = {
  id: "streak-7",
  title: "7-day streak",
  titleTh: "เจ็ดวัน",
  blurb: "A short congratulations in Thai, the first time you hit 7 days.",
  video: video7,
  poster: poster7,
  cues: [
    { at: 1.7, who: "pim", thai: "เจ็ดวันติดกันแล้วค่ะ", roman: "jèt wan dtìt gan láew khâ", en: "Seven days in a row now." },
    { at: 3.9, who: "pim", thai: "เก่งมากเลยค่ะ", roman: "gèng mâak loei khâ", en: "Really well done." },
    { at: 6.1, who: "you", thai: "พรุ่งนี้เจอกันครับ", roman: "phrûng-níi jer gan khráp", en: "See you tomorrow." },
  ],
};

export const STREAK_30_CARTOON: WatchCartoon = {
  id: "streak-30",
  title: "30-day streak",
  titleTh: "สามสิบวัน",
  blurb: "A short congratulations in Thai, the first time you hit 30 days.",
  video: video30,
  poster: poster30,
  cues: [
    { at: 1.7, who: "pim", thai: "ยินดีด้วยค่ะ", roman: "yin-dii dûay khâ", en: "Congratulations!" },
    { at: 4.4, who: "pim", thai: "สามสิบวันติดกันเลยค่ะ เก่งมากค่ะ", roman: "sǎam-sìp wan dtìt gan loei khâ gèng mâak khâ", en: "Thirty days in a row. Well done." },
    { at: 8.5, who: "you", thai: "ขอบคุณครับ", roman: "khàwp-khun khráp", en: "Thank you." },
  ],
};

export const STREAK_100_CARTOON: WatchCartoon = {
  id: "streak-100",
  title: "100-day streak",
  titleTh: "หนึ่งร้อยวัน",
  blurb: "A short congratulations in Thai, the first time you hit 100 days.",
  video: video100,
  poster: poster100,
  cues: [
    { at: 1.7, who: "pim", thai: "หนึ่งร้อยวันแล้วค่ะ", roman: "nùeng-ráwy wan láew khâ", en: "One hundred days already!" },
    { at: 3.9, who: "pim", thai: "สุดยอดมากค่ะ", roman: "sùt yâwt mâak khâ", en: "Truly amazing." },
    { at: 6.1, who: "you", thai: "ขอบคุณมากครับ", roman: "khàwp-khun mâak khráp", en: "Thank you very much." },
  ],
};

export const STREAK_CARTOONS: Record<CartoonId, WatchCartoon> = {
  "streak-7": STREAK_7_CARTOON,
  "streak-30": STREAK_30_CARTOON,
  "streak-100": STREAK_100_CARTOON,
};
