import { SCENES } from "./scenes";
import { STREAK_MILESTONES, STREAK_PHRASES, type StreakMilestone } from "../lib/share";

/**
 * Milestones and the badge each one earns. Thai here is checked against the tone rules (consonant class,
 * live/dead syllable, tone mark), and the romanization follows the rest of Baan. Nothing here comes from
 * the 18+ section, and nothing in the 18+ section counts toward a badge.
 */
export type MilestoneKind = "streak" | "scenes" | "words" | "rolePlay" | "story" | "tones";
export type BadgeColor = "clay" | "teal" | "gold" | "leaf" | "blue";
export type BadgeIcon = "mic" | "headphones" | "ear" | "trophy";
export type CartoonId = "streak-7" | "streak-30" | "streak-100";

export interface Fact {
  title: string;
  body: string;
  /** One Thai word or phrase the fact is about, with romanization and meaning. */
  thai?: string;
  roman?: string;
  en?: string;
}

export interface Milestone {
  id: string;
  kind: MilestoneKind;
  /** How many (days, scenes, words, tone rounds). For "every scene" it is the number of learnable scenes. */
  need: number;
  /** Tone trainer badges also need this share of rounds right. */
  accuracy?: number;
  title: string;
  /** What to do, shown on a locked badge. */
  ask: string;
  color: BadgeColor;
  /** Text on the badge: the number, or an icon for the ones without a count. */
  mark?: string;
  icon?: BadgeIcon;
  unit?: string;
  /** The Thai line you say for it. No particle, so it is the same for every voice. */
  say: { thai: string; roman: string; en: string };
  fact: Fact;
  cartoon?: CartoonId;
}

/** Shown above every badge: "Congratulations!" */
export const CONGRATS = { thai: "ยินดีด้วย", roman: "yin-dii dûay", en: "Congratulations!" } as const;

const streakFacts: Record<StreakMilestone, Fact> = {
  3: {
    title: "The wai",
    body: "Thais greet, thank and say sorry with a wai: palms together near the chest and a small bow. The higher the hands, the more respect.",
    thai: "ไหว้",
    roman: "wâi",
    en: "to wai",
  },
  7: {
    title: "A colour for every day",
    body: "Each day of the week has a traditional colour: Sunday red, Monday yellow, Tuesday pink, Wednesday green, Thursday orange, Friday blue, Saturday purple. Some people wear the colour of the day.",
  },
  14: {
    title: "No worries",
    body: "You will hear this all day long. It means never mind, it's okay, don't worry, and it says a lot about staying calm.",
    thai: "ไม่เป็นไร",
    roman: "mâi bpen rai",
    en: "never mind, no worries",
  },
  30: {
    title: "Nicknames",
    body: "Almost everyone has a short nickname that friends, coworkers and even newsreaders use. The long official name is mostly for paperwork.",
    thai: "ชื่อเล่น",
    roman: "chûue lên",
    en: "nickname",
  },
  60: {
    title: "Sanuk",
    body: "Many Thais try to make everything a little bit fun, even work and chores. The word for that kind of fun is a favourite.",
    thai: "สนุก",
    roman: "sà-nùk",
    en: "fun",
  },
  100: {
    title: "The Buddhist Era",
    body: "Thai calendars count years in the Buddhist Era, 543 years ahead of the Western year. 2026 is 2569 in Thailand.",
  },
};

const streakCartoon: Partial<Record<StreakMilestone, CartoonId>> = { 7: "streak-7", 30: "streak-30", 100: "streak-100" };

export const STREAK_BADGES: Milestone[] = STREAK_MILESTONES.map((d) => ({
  id: `streak-${d}`,
  kind: "streak",
  need: d,
  title: `${d}-day streak`,
  ask: `Meet your daily goal ${d} days in a row`,
  color: "clay",
  mark: String(d),
  unit: "days",
  say: { ...STREAK_PHRASES[d], en: `${d} days in a row` },
  fact: streakFacts[d],
  cartoon: streakCartoon[d],
}));

/** Scenes anyone can learn from. The 18+ scene never counts. */
export const LEARNABLE_SCENES = SCENES.filter((s) => !s.adult).length;

const OTHER_BADGES: Milestone[] = [
  {
    id: "scenes-1",
    need: 1,
    kind: "scenes",
    title: "First scene",
    ask: "Finish a scene's drills",
    color: "teal",
    mark: "1",
    unit: "scene",
    say: { thai: "ทำได้แล้ว", roman: "tham dâai láew", en: "I did it!" },
    fact: {
      title: "The Land of Smiles",
      body: "Thailand's best-known nickname is the Land of Smiles. A smile covers a lot: hello, thanks, sorry, and \"no problem\".",
      thai: "เมืองยิ้ม",
      roman: "mueang yím",
      en: "land of smiles",
    },
  },
  {
    id: "scenes-5",
    need: 5,
    kind: "scenes",
    title: "5 scenes",
    ask: "Finish 5 scenes",
    color: "teal",
    mark: "5",
    unit: "scenes",
    say: { thai: "เก่งมาก", roman: "gèng mâak", en: "Very good!" },
    fact: {
      title: "No tenses",
      body: "Thai verbs don't change for tense or for who is doing it. \"I go\", \"she went\" and \"we will go\" all use the same verb, and a little time word or the context does the rest.",
      thai: "ไป",
      roman: "bpai",
      en: "to go",
    },
  },
  {
    id: "scenes-10",
    need: 10,
    kind: "scenes",
    title: "10 scenes",
    ask: "Finish 10 scenes",
    color: "teal",
    mark: "10",
    unit: "scenes",
    say: { thai: "สุดยอด", roman: "sùt yâwt", en: "Awesome!" },
    fact: {
      title: "Pad thai",
      body: "Stir-fried noodles with a sweet-sour-salty sauce became a national favourite in the 1940s, helped along by a government campaign to eat more noodles.",
      thai: "ผัดไทย",
      roman: "phàt thai",
      en: "pad thai",
    },
  },
  {
    id: "scenes-all",
    need: LEARNABLE_SCENES,
    kind: "scenes",
    title: "Every scene",
    ask: "Finish every scene",
    color: "teal",
    icon: "trophy",
    unit: "scenes",
    say: { thai: "ยอดเยี่ยม", roman: "yâwt yîam", en: "Excellent!" },
    fact: {
      title: "Bangkok's long name",
      body: "Locals just say Krung Thep. The full ceremonial name is 168 letters in English spelling and is often called the longest capital-city name in the world.",
      thai: "กรุงเทพ",
      roman: "grung thêep",
      en: "Bangkok",
    },
  },
  {
    id: "words-25",
    need: 25,
    kind: "words",
    title: "25 words",
    ask: "Reach 25 learned in Review",
    color: "gold",
    mark: "25",
    unit: "words",
    say: { thai: "จำได้แล้ว", roman: "jam dâai láew", en: "I remember it now!" },
    fact: {
      title: "No spaces",
      body: "Thai is written without spaces between words. A space marks the end of a phrase or sentence, a bit like a comma or full stop.",
    },
  },
  {
    id: "words-100",
    need: 100,
    kind: "words",
    title: "100 words",
    ask: "Reach 100 learned in Review",
    color: "gold",
    mark: "100",
    unit: "words",
    say: { thai: "จำได้เยอะเลย", roman: "jam dâai yé loei", en: "I remember so much!" },
    fact: {
      title: "44 letters",
      body: "Thai has 44 consonant letters but only about 21 consonant sounds, because several letters sound the same. The letters sit in mid, high and low classes, and the class helps decide the tone.",
    },
  },
  {
    id: "words-250",
    need: 250,
    kind: "words",
    title: "250 words",
    ask: "Reach 250 learned in Review",
    color: "gold",
    mark: "250",
    unit: "words",
    say: { thai: "ภูมิใจมาก", roman: "phuum-jai mâak", en: "So proud!" },
    fact: {
      title: "555",
      body: "Five is ห้า, so 555 in a Thai text is the same as typing hahaha. Five fives, five laughs.",
      thai: "ห้า",
      roman: "hâa",
      en: "five",
    },
  },
  {
    id: "first-roleplay",
    need: 1,
    kind: "rolePlay",
    title: "First role-play",
    ask: "Finish a role-play",
    color: "leaf",
    icon: "mic",
    unit: "role-play",
    say: { thai: "พูดได้แล้ว", roman: "phûut dâai láew", en: "I can say it now!" },
    fact: {
      title: "Where have you been?",
      body: "A friendly hello in Thai is often a question: where are you going, where have you been? It isn't nosy. It just means hi.",
      thai: "ไปไหนมา",
      roman: "bpai nǎi maa",
      en: "where have you been?",
    },
  },
  {
    id: "first-story",
    need: 1,
    kind: "story",
    title: "First story",
    ask: "Finish a listening story",
    color: "leaf",
    icon: "headphones",
    unit: "story",
    say: { thai: "ฟังออกแล้ว", roman: "fang àwk láew", en: "I can follow it now!" },
    fact: {
      title: "Heart words",
      body: "Thai keeps feelings in the heart, ใจ. It turns up in kind, calm and glad: ใจดี (jai-dii), ใจเย็น (jai-yen), ดีใจ (dii-jai).",
      thai: "ใจ",
      roman: "jai",
      en: "heart",
    },
  },
  {
    id: "tones-1",
    need: 40,
    kind: "tones",
    accuracy: 0.7,
    title: "Tone ears",
    ask: "Get 70% right over 40 tone rounds",
    color: "blue",
    icon: "ear",
    unit: "rounds",
    say: { thai: "ได้ยินชัดเลย", roman: "dâai-yin chát loei", en: "I hear it clearly!" },
    fact: {
      title: "Same sound, three words",
      body: "Say maa with a different tone and you get a different word: มา (maa) is come, ม้า (máa) is horse, and หมา (mǎa) is dog.",
    },
  },
  {
    id: "tones-2",
    need: 100,
    kind: "tones",
    accuracy: 0.85,
    title: "Sharp tone ears",
    ask: "Get 85% right over 100 tone rounds",
    color: "blue",
    icon: "ear",
    unit: "rounds",
    say: { thai: "ได้ยินชัดมาก", roman: "dâai-yin chát mâak", en: "I hear it so clearly!" },
    fact: {
      title: "Near and far",
      body: "ใกล้ (glâi) is near and ไกล (glai) is far. One tone is the whole difference, and it's an easy pair to mix up.",
    },
  },
];

export const MILESTONES: Milestone[] = [...STREAK_BADGES, ...OTHER_BADGES];
export const MILESTONE_BY_ID = new Map(MILESTONES.map((m) => [m.id, m]));
