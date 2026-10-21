import type { Gendered } from "./types";

/**
 * Tip cards (Babbel-style "see it in use, then a one-line tip"). Each tip appears in the conversation right after the
 * line where its pattern first shows up, and again on the scene's finish screen. Speaking-focused: every example has
 * romanization and English, and Thai script is secondary.
 */
export interface TipExample {
  thai: Gendered;
  roman: Gendered;
  en: string;
}
export interface Tip {
  id: string;
  sceneId: string;
  /** Line id in that scene; the card shows under this line. */
  afterLine: string;
  kind: "grammar" | "culture";
  title: string;
  /** Plain English. Any Thai in it gets romanized on screen. */
  body: string;
  examples: TipExample[];
}

const p = (stem: string, stemRoman: string, kind: "statement" | "question" = "statement") => ({
  thai: { male: `${stem}ครับ`, female: `${stem}${kind === "question" ? "คะ" : "ค่ะ"}` },
  roman: { male: `${stemRoman} khráp`, female: `${stemRoman} ${kind === "question" ? "khá" : "khâ"}` },
});

export const TIPS: Tip[] = [
  // The café door
  {
    id: "cafe-particle",
    sceneId: "cafe",
    afterLine: "c2",
    kind: "grammar",
    title: "End with khráp or khâ to sound polite",
    body: "Men end almost every sentence with khráp (high). Women end statements with khâ (falling) and questions with khá (high). With strangers, leaving it off sounds blunt, so add it to everything.",
    examples: [
      { ...p("สวัสดี", "sà-wàt-dii"), en: "Hello." },
      { ...p("สบายดีไหม", "sà-baai dii mǎi", "question"), en: "How are you?" },
    ],
  },
  {
    id: "cafe-mai",
    sceneId: "cafe",
    afterLine: "c3",
    kind: "grammar",
    title: "Add mǎi to make a yes/no question",
    body: "Say the statement, then add mǎi (rising) at the end. There's no word swap and no change of order.",
    examples: [
      { ...p("สบายดี", "sà-baai dii"), en: "I'm well." },
      { ...p("สบายดีไหม", "sà-baai dii mǎi", "question"), en: "Are you well?" },
    ],
  },
  // Ordering
  {
    id: "order-khaw",
    sceneId: "order",
    afterLine: "o2",
    kind: "grammar",
    title: "khǎw + thing means “may I have”",
    body: "khǎw (rising) in front of what you want is the polite way to ask for anything in a shop or café. Finish with your khráp or khâ.",
    examples: [
      { ...p("ขอกาแฟเย็น", "khǎw gaa-faae yen"), en: "An iced coffee, please." },
      { ...p("ขอน้ำเปล่า", "khǎw náam bplào"), en: "Some plain water, please." },
    ],
  },
  {
    id: "order-sweet",
    sceneId: "order",
    afterLine: "o4",
    kind: "culture",
    title: "Thai drinks come very sweet",
    body: "Iced coffee and tea are made sweet by default, so staff often ask how sweet you want it. Say how sweet before they start.",
    examples: [
      { ...p("หวานน้อย", "wǎan náwy"), en: "Just a little sweet." },
      { ...p("ไม่หวาน", "mâi wǎan"), en: "Not sweet." },
    ],
  },
  // The market
  {
    id: "market-too",
    sceneId: "market",
    afterLine: "m4",
    kind: "grammar",
    title: "Describing word + bpai means “too”",
    body: "Put bpai right after a describing word and it means “too”. It's the same word as “go”, but here it means it went too far.",
    examples: [
      { ...p("แพงไป", "phaaeng bpai"), en: "Too expensive." },
      { ...p("เผ็ดไป", "phèt bpai"), en: "Too spicy." },
    ],
  },
  {
    id: "market-bargain",
    sceneId: "market",
    afterLine: "m5",
    kind: "culture",
    title: "Bargain with a smile, and only at markets",
    body: "At street markets a friendly “can you come down a little?” is normal. Keep it light and smile. In 7-Eleven, malls, or anywhere with printed price tags, the price is fixed. dâai mǎi at the end means “can you?”.",
    examples: [
      { ...p("ลดหน่อยได้ไหม", "lót nàwy dâai mǎi", "question"), en: "Can you come down a little?" },
      { ...p("เอาอันนี้", "ao an-níi"), en: "I'll take this one." },
    ],
  },
  // In the car
  {
    id: "street-directions",
    sceneId: "street",
    afterLine: "s3",
    kind: "grammar",
    title: "Four phrases get you anywhere by car",
    body: "Drivers often don't know street names, so you steer them yourself. Turn, left, right, straight, and stop cover almost every ride.",
    examples: [
      { ...p("เลี้ยวซ้าย", "líaw sáai"), en: "Turn left." },
      { ...p("เลี้ยวขวา", "líaw khwǎa"), en: "Turn right." },
      { ...p("ตรงไป", "dtrong bpai"), en: "Go straight." },
      { ...p("จอดที่นี่", "jàwt thîi-nîi"), en: "Stop here." },
    ],
  },
  {
    id: "street-chai",
    sceneId: "street",
    afterLine: "s5",
    kind: "grammar",
    title: "châi mǎi means “right?”",
    body: "Add châi mǎi to the end of a sentence to check something. Answer yes with châi (falling), or no with mâi châi.",
    examples: [
      { ...p("ตรงไปใช่ไหม", "dtrong bpai châi mǎi", "question"), en: "Straight ahead, right?" },
      { ...p("ใช่", "châi"), en: "Yes, that's right." },
      { ...p("ไม่ใช่", "mâi châi"), en: "No, that's not right." },
    ],
  },
  // 7-Eleven
  {
    id: "seven-yes",
    sceneId: "seven",
    afterLine: "x3",
    kind: "grammar",
    title: "To say yes, repeat the verb",
    body: "Thai has no single word for yes. Answer a question by saying its verb back. For no, put mâi (falling) in front of it.",
    examples: [
      { ...p("มี", "mii"), en: "Yes, we have it." },
      { ...p("ไม่มี", "mâi mii"), en: "No, we don't have it." },
      { ...p("อุ่น", "ùn"), en: "Yes, heat it up." },
    ],
  },
  {
    id: "seven-mai",
    sceneId: "seven",
    afterLine: "x7",
    kind: "grammar",
    title: "Put mâi in front to say no",
    body: "mâi (falling) before a verb or describing word turns it negative. You'll use it for bags, spice, and sugar all day.",
    examples: [
      { ...p("ไม่รับ", "mâi ráp"), en: "No thanks (I won't take it)." },
      { ...p("ไม่อุ่น", "mâi ùn"), en: "No need to heat it." },
      { ...p("ไม่เผ็ด", "mâi phèt"), en: "Not spicy." },
    ],
  },
  // BTS / MRT
  {
    id: "bts-pai",
    sceneId: "bts",
    afterLine: "b2",
    kind: "culture",
    title: "bpai nǎi is also a friendly hello",
    body: "bpai nǎi means “where are you going?”, and people you know use it as a casual greeting. They don't need details. bpai thîao (going out) is a fine answer.",
    examples: [
      { ...p("ไปสยาม", "bpai sà-yǎam"), en: "I'm going to Siam." },
      { ...p("ไปเที่ยว", "bpai thîao"), en: "Just going out." },
    ],
  },
  {
    id: "bts-on-off",
    sceneId: "bts",
    afterLine: "b3",
    kind: "grammar",
    title: "khûen gets on, long gets off",
    body: "khûen (falling) means go up or get on. long (mid) means go down or get off. They work for trains, buses, taxis, and stairs.",
    examples: [
      { ...p("ขึ้นรถไฟฟ้า", "khûen rót-fai-fáa"), en: "Get on the Skytrain." },
      { ...p("ลงสถานีสยาม", "long sà-thǎa-nii sà-yǎam"), en: "Get off at Siam station." },
    ],
  },
  // Lost
  {
    id: "lost-where",
    sceneId: "lost",
    afterLine: "l1",
    kind: "grammar",
    title: "Place first, then yùu thîi nǎi",
    body: "Name the place, then say yùu thîi nǎi (is located where?). Swap in any place you need.",
    examples: [
      { ...p("วัดโพธิ์อยู่ที่ไหน", "wát pho yùu thîi nǎi", "question"), en: "Where is Wat Pho?" },
      { ...p("ห้องน้ำอยู่ที่ไหน", "hâwng-náam yùu thîi nǎi", "question"), en: "Where is the toilet?" },
    ],
  },
  {
    id: "lost-double",
    sceneId: "lost",
    afterLine: "l6",
    kind: "grammar",
    title: "Say a word twice to soften it",
    body: "Doubling a describing word makes it gentler, like “nice and slow”. In writing there's a repeat mark, but you just say it twice.",
    examples: [
      { ...p("พูดช้าๆหน่อย", "phûut cháa-cháa nàwy"), en: "Please speak a little slower." },
      { ...p("เบาๆหน่อย", "bao-bao nàwy"), en: "A little softer, please." },
    ],
  },
  // Massage / pharmacy
  {
    id: "massage-ache",
    sceneId: "massage",
    afterLine: "ms2",
    kind: "grammar",
    title: "bpùat is an ache, jèp is a sore or sharp pain",
    body: "bpùat (low) is a deep or dull ache. jèp (low) is soreness or pain you can point to. Put the body part right after.",
    examples: [
      { ...p("ปวดหัว", "bpùat hǔa"), en: "I have a headache." },
      { ...p("ปวดหลัง", "bpùat lǎng"), en: "My back aches." },
      { ...p("เจ็บคอ", "jèp khaw"), en: "I have a sore throat." },
    ],
  },
  {
    id: "massage-speak-up",
    sceneId: "massage",
    afterLine: "ms6",
    kind: "culture",
    title: "Speak up during a Thai massage",
    body: "Thai massage can be strong, and therapists expect you to say so. Asking for softer or harder is normal and not rude.",
    examples: [
      { ...p("เบาๆหน่อย", "bao-bao nàwy"), en: "A little softer, please." },
      { ...p("แรงไป", "raeng bpai"), en: "That's too hard." },
      { ...p("เจ็บ", "jèp"), en: "That hurts." },
    ],
  },
  // A meal
  {
    id: "meal-people",
    sceneId: "meal",
    afterLine: "f2",
    kind: "grammar",
    title: "Number + khon for people",
    body: "Count people with the number first, then khon. Just one is the fixed phrase khon diaw (one person alone).",
    examples: [
      { ...p("คนเดียว", "khon diaw"), en: "Just one person." },
      { ...p("สองคน", "sǎwng khon"), en: "Two people." },
    ],
  },
  {
    id: "meal-spice",
    sceneId: "meal",
    afterLine: "f4",
    kind: "culture",
    title: "Set the spice level when you order",
    body: "Say it right after the dish. Even “not spicy” can come with a little heat, so say it clearly.",
    examples: [
      { ...p("ไม่เผ็ด", "mâi phèt"), en: "Not spicy." },
      { ...p("เผ็ดนิดหน่อย", "phèt nít-nàwy"), en: "A little spicy." },
    ],
  },
  // Small talk
  {
    id: "chat-from",
    sceneId: "chat",
    afterLine: "k2",
    kind: "grammar",
    title: "maa jàak + a place says where you're from",
    body: "maa jàak means come from. Put the place after it. You can drop “I” when it's obvious, so maa jàak plus your country is a full answer.",
    examples: [
      { ...p("มาจากอเมริกา", "maa jàak à-mee-rí-gaa"), en: "(I'm) from America." },
      { ...p("มาจากอังกฤษ", "maa jàak ang-grìt"), en: "(I'm) from England." },
    ],
  },
  {
    id: "chat-modest",
    sceneId: "chat",
    afterLine: "k3",
    kind: "culture",
    title: "Brush off the compliment",
    body: "Thais praise almost any Thai you speak. A modest reply is the natural one: say you only speak a little, or mâi gèng (not really good), with a smile. Thanking them works too.",
    examples: [
      { ...p("พูดได้นิดหน่อย", "phûut dâai nít-nàwy"), en: "I can speak a little." },
      { ...p("ไม่เก่ง", "mâi gèng"), en: "Not really good." },
      { ...p("ขอบคุณ", "khàwp-khun"), en: "Thank you." },
    ],
  },
  // Hotel check-in
  {
    id: "hotel-gii",
    sceneId: "hotel",
    afterLine: "h5",
    kind: "grammar",
    title: "gìi + a counting word asks how many",
    body: "Put gìi (how many) in front of what you're counting: nights, people, or o'clock. Answer with the number in the same spot.",
    examples: [
      { ...p("กี่คืน", "gìi khuen", "question"), en: "How many nights?" },
      { ...p("กี่คน", "gìi khon", "question"), en: "How many people?" },
      { ...p("กี่โมง", "gìi moong", "question"), en: "What time?" },
    ],
  },
  {
    id: "hotel-clock",
    sceneId: "hotel",
    afterLine: "h9",
    kind: "culture",
    title: "Thai clock time: morning and afternoon",
    body: "Day to day, Thais split the day into parts. Morning hours are the number plus moong cháo, and afternoon hours start with bàai (afternoon). Midday is thîang.",
    examples: [
      { ...p("หกโมงเช้า", "hòk moong cháo"), en: "Six in the morning." },
      { ...p("บ่ายสามโมง", "bàai sǎam moong"), en: "Three in the afternoon." },
      { ...p("เที่ยง", "thîang"), en: "Noon." },
    ],
  },
  // Clothes shop
  {
    id: "shop-gwaa",
    sceneId: "shop",
    afterLine: "sh6",
    kind: "grammar",
    title: "Add gwàa to compare: smaller, cheaper, bigger",
    body: "Put gwàa (more) after a describing word to compare. Add níi (than this) to point at the one in your hand.",
    examples: [
      { ...p("เล็กกว่านี้", "lék gwàa níi"), en: "Smaller than this." },
      { ...p("มีตัวใหญ่กว่านี้ไหม", "mii dtua yài gwàa níi mǎi", "question"), en: "Do you have a bigger one?" },
      { ...p("มีถูกกว่านี้ไหม", "mii thùuk gwàa níi mǎi", "question"), en: "Do you have a cheaper one?" },
    ],
  },
  {
    id: "shop-dtua",
    sceneId: "shop",
    afterLine: "sh10",
    kind: "grammar",
    title: "dtua is how Thai counts clothes",
    body: "Thai counts things with a counting word after the number or after níi (this). Shirts, pants and dresses use dtua, so this one is dtua níi and two shirts is sûea sǎwng dtua.",
    examples: [
      { ...p("เอาตัวนี้", "ao dtua níi"), en: "I'll take this one." },
      { ...p("เสื้อสองตัว", "sûea sǎwng dtua"), en: "Two shirts." },
      { ...p("ตัวนี้เท่าไหร่", "dtua níi thâo-rài", "question"), en: "How much is this one?" },
    ],
  },
  // Street food stall
  {
    id: "food-glap-baan",
    sceneId: "food",
    afterLine: "sf4",
    kind: "culture",
    title: "glàp bâan is how you say to go",
    body: "At a stall, takeaway is glàp bâan (go back home), even if you're eating at your desk. Eating there is gin thîi-nîi. Vendors bag almost everything, and sài thǔng asks for a bag.",
    examples: [
      { ...p("กลับบ้าน", "glàp bâan"), en: "To go." },
      { ...p("กินที่นี่", "gin thîi-nîi"), en: "To eat here." },
      { ...p("ใส่ถุงด้วย", "sài thǔng dûay"), en: "A bag too, please." },
    ],
  },
  {
    id: "food-mai-sai",
    sceneId: "food",
    afterLine: "sf7",
    kind: "grammar",
    title: "mâi sài leaves something out, sài adds it",
    body: "mâi sài means don't put in. Name the thing right after it: no cilantro, no ice, no chili. Drop the mâi to ask for something added, and put dûay (too) at the end.",
    examples: [
      { ...p("ไม่ใส่น้ำแข็ง", "mâi sài náam-khǎeng"), en: "No ice." },
      { ...p("ไม่ใส่พริก", "mâi sài phrík"), en: "No chili." },
      { ...p("ใส่ไข่ดาวด้วย", "sài khài daaw dûay"), en: "Add a fried egg too." },
    ],
  },
  // Laundry
  {
    id: "laundry-la",
    sceneId: "laundry",
    afterLine: "la2",
    kind: "grammar",
    title: "lá means per",
    body: "Put lá between a unit and a price to say per: per kilo, per person, per hour. You'll hear it at laundries, massage shops and markets.",
    examples: [
      { ...p("กิโลละสี่สิบบาท", "gì-loo lá sìi-sìp bàat"), en: "Forty baht a kilo." },
      { ...p("คนละร้อยบาท", "khon lá ráwy bàat"), en: "A hundred baht each." },
      { ...p("ชั่วโมงละสามร้อยบาท", "chûa-moong lá sǎam-ráwy bàat"), en: "Three hundred baht an hour." },
    ],
  },
  {
    id: "laundry-mai-dtawng",
    sceneId: "laundry",
    afterLine: "la8",
    kind: "grammar",
    title: "mâi dtâwng means no need to",
    body: "dtâwng is must or have to. mâi dtâwng turns it into no need to, a polite way to turn down an offer. mâi dtâwng thawn is how you say keep the change.",
    examples: [
      { ...p("ไม่ต้องรีด", "mâi dtâwng rîit"), en: "No need to iron." },
      { ...p("ไม่ต้องใส่ถุง", "mâi dtâwng sài thǔng"), en: "No bag needed." },
      { ...p("ไม่ต้องทอน", "mâi dtâwng thawn"), en: "Keep the change." },
    ],
  },
  // Haircut
  {
    id: "haircut-phom",
    sceneId: "haircut",
    afterLine: "hc2",
    kind: "grammar",
    title: "phǒm means hair, and I",
    body: "phǒm (rising) is hair, and it's also the word men use for I. Same sound, same tone, and context tells you which. A man asking for a haircut says phǒm twice without blinking.",
    examples: [
      { ...p("ตัดผม", "dtàt phǒm"), en: "Get a haircut." },
      { ...p("สระผม", "sà phǒm"), en: "Wash hair." },
      { thai: "ผมชื่อทอมครับ", roman: "phǒm chûue Tom khráp", en: "My name is Tom (a man speaking)." },
    ],
  },
  {
    id: "haircut-phaw",
    sceneId: "haircut",
    afterLine: "hc9",
    kind: "culture",
    title: "phaw láew means that's enough",
    body: "phaw is enough. phaw láew is how you stop someone politely: the barber, a host refilling your plate, or a massage that's strong enough. phaw-dii means just right, handy for clothes and pressure too.",
    examples: [
      { ...p("พอแล้ว", "phaw láew"), en: "That's enough." },
      { ...p("อิ่มแล้ว", "ìm láew"), en: "I'm full." },
      { ...p("พอดี", "phaw-dii"), en: "Just right." },
    ],
  },
  // Phone shop
  {
    id: "phone-chai-dai",
    sceneId: "phone",
    afterLine: "ph8",
    kind: "grammar",
    title: "chái dâai means it works",
    body: "chái is to use, so chái dâai (can use) is how Thais say it works or it's fine, and chái mâi dâai means it doesn't work. Handy for a SIM, the Wi-Fi, a card at the till, or the air-con. Careful: chái (high) is use, châi (falling) is yes.",
    examples: [
      { ...p("ใช้ได้แล้ว", "chái dâai láew"), en: "It works now." },
      { ...p("ใช้ไม่ได้", "chái mâi dâai"), en: "It doesn't work." },
      { ...p("ไวไฟใช้ไม่ได้", "wai-fai chái mâi dâai"), en: "The Wi-Fi doesn't work." },
    ],
  },
  {
    id: "phone-thaa",
    sceneId: "phone",
    afterLine: "ph9",
    kind: "grammar",
    title: "thâa for if",
    body: "Put thâa (falling) at the start to say if. The rest of the sentence follows straight on, with no word for then. It works for plans, prices and problems.",
    examples: [
      { thai: "ถ้าเน็ตหมด", roman: "thâa nét mòt", en: "If the data runs out." },
      { ...p("ถ้าแพงไป ไม่เอา", "thâa phaaeng bpai, mâi ao"), en: "If it's too expensive, I won't take it." },
      { ...p("ถ้าใช้ไม่ได้ ช่วยดูหน่อยได้ไหม", "thâa chái mâi dâai, chûay duu nàwy dâai mǎi", "question"), en: "If it doesn't work, could you take a look?" },
    ],
  },
  // Money exchange
  {
    id: "exchange-gii-thao-rai",
    sceneId: "exchange",
    afterLine: "ex4",
    kind: "grammar",
    title: "gìi or thâo-rài",
    body: "Both ask about amounts. thâo-rài is how much, for a price or a total. gìi is how many, and it always needs a counting word right after it: gìi bàat (how many baht), gìi bai (how many notes), gìi wan (how many days).",
    examples: [
      { ...p("อันนี้เท่าไหร่", "an-níi thâo-rài", "question"), en: "How much is this?" },
      { ...p("หนึ่งดอลลาร์ได้กี่บาท", "nùeng dawn-lâa dâai gìi bàat", "question"), en: "How many baht for one dollar?" },
      { ...p("กี่ใบ", "gìi bai", "question"), en: "How many notes?" },
    ],
  },
  {
    id: "exchange-gawn",
    sceneId: "exchange",
    afterLine: "ex9",
    kind: "grammar",
    title: "gàwn at the end means first",
    body: "Put gàwn (low) after a verb to say do this first, before anything else. You hear it at counters all the time, and you can use it to buy a moment: wait a moment first, let me check first.",
    examples: [
      { ...p("นับดูก่อน", "náp duu gàwn"), en: "Count it first." },
      { ...p("รอก่อน", "raw gàwn"), en: "Wait a moment." },
      { ...p("ขอดูก่อน", "khǎw duu gàwn"), en: "Let me have a look first." },
    ],
  },
  // Goodbye
  {
    id: "leave-mai-pen-rai",
    sceneId: "leave",
    afterLine: "l2",
    kind: "culture",
    title: "mâi bpen rai fits almost everything",
    body: "mâi bpen rai means it's okay, no problem, you're welcome, or never mind. Use it when someone says sorry or thank you.",
    examples: [{ ...p("ไม่เป็นไร", "mâi bpen rai"), en: "It's okay. No problem." }],
  },
  {
    id: "leave-bye",
    sceneId: "leave",
    afterLine: "l6",
    kind: "culture",
    title: "Everyday goodbyes",
    body: "laa-kàwn sounds final, like farewell. When you leave a shop or friends, people say bpai gàwn ná (I'm heading off) or just bye-bye.",
    examples: [
      {
        thai: { male: "ไปก่อนนะครับ", female: "ไปก่อนนะคะ" },
        roman: { male: "bpai gàwn ná khráp", female: "bpai gàwn ná khá" },
        en: "I'm heading off.",
      },
      { thai: "บ๊ายบาย", roman: "báai-baai", en: "Bye-bye." },
    ],
  },
];

export const tipsForScene = (sceneId: string) => TIPS.filter((t) => t.sceneId === sceneId);
export const tipAfterLine = (sceneId: string, lineId: string) => TIPS.filter((t) => t.sceneId === sceneId && t.afterLine === lineId);
