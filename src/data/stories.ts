/** Listening stories: short narrated stories built from scene words, with English comprehension questions. */
export interface StorySentence {
  thai: string;
  roman: string;
  en: string;
}
export interface StoryQuestion {
  q: string;
  /** First option is the right answer; the screen shuffles them. */
  options: string[];
}
export interface Story {
  id: string;
  title: string;
  titleTh: string;
  titleRoman: string;
  /** Scene ids whose words this story uses. */
  scenes: string[];
  sentences: StorySentence[];
  questions: StoryQuestion[];
}

export const STORIES: Story[] = [
  {
    id: "coffee",
    title: "Morning coffee",
    titleTh: "กาแฟตอนเช้า",
    titleRoman: "gaa-faae dtawn cháo",
    scenes: ["cafe", "order"],
    sentences: [
      { thai: "ตอนเช้า ทอมไปร้านกาแฟ", roman: "dtawn cháo, thawm bpai ráan gaa-faae", en: "In the morning, Tom goes to a café." },
      { thai: "นิดพูดว่า สวัสดีค่ะ", roman: "nít phûut wâa, sà-wàt-dii khâ", en: "Nid says, “Hello.”" },
      { thai: "ทอมขอกาแฟเย็น", roman: "thawm khǎw gaa-faae yen", en: "Tom asks for an iced coffee." },
      { thai: "เขาเอาหวานน้อย", roman: "khǎo ao wǎan náwy", en: "He wants it a little sweet." },
      { thai: "กาแฟเย็นห้าสิบห้าบาท", roman: "gaa-faae yen hâa-sìp-hâa bàat", en: "The iced coffee is fifty-five baht." },
      { thai: "กาแฟอร่อยมาก", roman: "gaa-faae à-ròi mâak", en: "The coffee is very good." },
      { thai: "ทอมพูดว่า ขอบคุณครับ", roman: "thawm phûut wâa, khàwp-khun khráp", en: "Tom says, “Thank you.”" },
    ],
    questions: [
      { q: "What does Tom ask for?", options: ["An iced coffee", "A hot tea", "Plain water", "Pad thai"] },
      { q: "How sweet does he want it?", options: ["A little sweet", "Very sweet", "Not sweet at all"] },
      { q: "How much is it?", options: ["55 baht", "15 baht", "50 baht", "105 baht"] },
      { q: "What does Tom think of the coffee?", options: ["It’s very good.", "It’s too sweet.", "It’s too expensive."] },
    ],
  },
  {
    id: "market-ride",
    title: "The market, then a ride",
    titleTh: "ตลาดกับรถ",
    titleRoman: "dtà-làat gàp rót",
    scenes: ["market", "street"],
    sentences: [
      { thai: "วันนี้ทอมไปตลาด", roman: "wan-níi thawm bpai dtà-làat", en: "Today Tom goes to the market." },
      { thai: "เขาถามลุงว่า อันนี้เท่าไหร่", roman: "khǎo thǎam lung wâa, an-níi thâo-rài", en: "He asks the uncle, “How much is this one?”" },
      { thai: "ลุงบอกว่า ร้อยยี่สิบบาท", roman: "lung bàwk wâa, ráwy yîi-sìp bàat", en: "The uncle says, “One hundred twenty baht.”" },
      { thai: "แพงไป ทอมขอลดหน่อย", roman: "phaaeng bpai, thawm khǎw lót nàwy", en: "That’s too expensive, so Tom asks for a little off." },
      { thai: "ลุงบอกว่า ร้อยบาทได้", roman: "lung bàwk wâa, ráwy bàat dâai", en: "The uncle says one hundred baht is OK." },
      { thai: "แล้วทอมขึ้นรถไปสยาม", roman: "láew thawm khûen rót bpai sà-yǎam", en: "Then Tom gets in a car to Siam." },
      { thai: "ค่ารถแปดสิบบาท", roman: "khâa rót bpàaet-sìp bàat", en: "The ride costs eighty baht." },
    ],
    questions: [
      { q: "What price does the uncle say first?", options: ["120 baht", "100 baht", "80 baht", "200 baht"] },
      { q: "Why does Tom ask for a little off?", options: ["It’s too expensive.", "It’s broken.", "He wants two."] },
      { q: "What price do they agree on?", options: ["100 baht", "120 baht", "80 baht", "55 baht"] },
      { q: "Where does Tom go next?", options: ["Siam", "Wat Pho", "7-Eleven"] },
      { q: "How much is the ride?", options: ["80 baht", "18 baht", "100 baht", "8 baht"] },
    ],
  },
  {
    id: "hot-day",
    title: "A hot day",
    titleTh: "วันร้อน",
    titleRoman: "wan ráwn",
    scenes: ["seven", "bts"],
    sentences: [
      { thai: "วันนี้ร้อนมาก", roman: "wan-níi ráwn mâak", en: "It’s very hot today." },
      { thai: "ทอมเข้าเซเว่น", roman: "thawm khâo se-wên", en: "Tom goes into 7-Eleven." },
      { thai: "เขาซื้อน้ำเปล่า", roman: "khǎo súue náam bplào", en: "He buys plain water." },
      { thai: "น้ำเปล่าอยู่ในตู้เย็น", roman: "náam bplào yùu nai dtûu yen", en: "The water is in the fridge." },
      { thai: "เขาไม่รับถุง", roman: "khǎo mâi ráp thǔng", en: "He doesn’t take a bag." },
      { thai: "แล้วเขาไปขึ้นรถไฟฟ้า", roman: "láew khǎo bpai khûen rót fai fáa", en: "Then he goes to take the Skytrain." },
      { thai: "เขาซื้อบัตรเที่ยวเดียว", roman: "khǎo súue bàt thîao diaw", en: "He buys a one-way ticket." },
      { thai: "เขาลงที่สถานีสยาม", roman: "khǎo long thîi sà-thǎa-nii sà-yǎam", en: "He gets off at Siam station." },
    ],
    questions: [
      { q: "What is the weather like?", options: ["Very hot", "Rainy", "Cold"] },
      { q: "Where is the water?", options: ["In the fridge", "By the door", "At the counter"] },
      { q: "Does Tom take a bag?", options: ["No", "Yes, one bag", "Yes, two bags"] },
      { q: "What ticket does he buy?", options: ["One-way", "Return", "A day pass"] },
      { q: "Where does he get off?", options: ["Siam station", "Wat Pho", "The market"] },
    ],
  },
  {
    id: "long-afternoon",
    title: "This afternoon",
    titleTh: "บ่ายวันนี้",
    titleRoman: "bàai wan-níi",
    scenes: ["lost", "massage", "meal"],
    sentences: [
      { thai: "ทอมหลงทาง", roman: "thawm lǒng thaang", en: "Tom is lost." },
      { thai: "เขาถามจอยว่า วัดโพธิ์อยู่ที่ไหน", roman: "khǎo thǎam jawy wâa, wát pho yùu thîi nǎi", en: "He asks Joy, “Where is Wat Pho?”" },
      { thai: "จอยบอกว่า ใกล้ เดินไปได้", roman: "jawy bàwk wâa, glâi, dern bpai dâai", en: "Joy says it’s close, he can walk there." },
      { thai: "ตอนเย็น ทอมปวดหัว", roman: "dtawn yen, thawm bpùat hǔa", en: "In the evening, Tom has a headache." },
      { thai: "เขาไปนวด", roman: "khǎo bpai nûat", en: "He goes for a massage." },
      { thai: "เขาบอกว่า เบาๆหน่อย", roman: "khǎo bàwk wâa, bao-bao nàwy", en: "He says, “A little softer, please.”" },
      { thai: "แล้วเขากินผัดไทยไม่เผ็ด", roman: "láew khǎo gin phàt-thai mâi phèt", en: "Then he eats pad thai, not spicy." },
      { thai: "อร่อยมาก", roman: "à-ròi mâak", en: "It’s delicious." },
    ],
    questions: [
      { q: "What is Tom looking for?", options: ["Wat Pho", "Siam station", "A pharmacy"] },
      { q: "Is it far?", options: ["No, he can walk there.", "Yes, he needs a car.", "Yes, he needs the Skytrain."] },
      { q: "What is wrong in the evening?", options: ["He has a headache.", "His back hurts.", "He is hungry."] },
      { q: "How does he want the massage?", options: ["Softer", "Harder", "Faster"] },
      { q: "What does he eat?", options: ["Pad thai, not spicy", "Spicy pad thai", "Fried rice"] },
    ],
  },
];
