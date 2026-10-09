// One-off: turns the data extracted from the Grok build into typed TS files.
const fs=require('fs');
const d=JSON.parse(fs.readFileSync('/tmp/baan-data.json','utf8'));
const J=v=>JSON.stringify(v,null,2);
const hdr='// Ported verbatim from the Grok-hosted Baan build (routes-BILTYoNg.js).\n';
fs.writeFileSync('src/data/vocab.ts',hdr+`import type { Vocab } from "./types";\n\nexport const VOCAB: Vocab[] = ${J(d.te)};\n\nexport const VOCAB_BY_ID = new Map(VOCAB.map((v) => [v.id, v]));\n`);
fs.writeFileSync('src/data/scenes.ts',hdr+`import type { Scene } from "./types";\n\nexport const SCENES: Scene[] = ${J(d.S)};\n`);
fs.writeFileSync('src/data/tones.ts',hdr+`import type { RuleKey, ToneWord } from "./types";\n\n/** The five tone anchors. */\nexport const TONE_ANCHORS: (ToneWord & { hint: string })[] = ${J(d.I)};\n\n/** Pool for the single-word Ear quiz. */\nexport const EAR_POOL: ToneWord[] = ${J(d.Ne)};\n\n/** ไม่ ใหม่ ไหม ไหม้ */\nexport const MAI_SET: ToneWord[] = ${J(d.Pe)};\n\n/** Example word per class|syllable|mark combination. */\nexport const RULE_EXAMPLES: Partial<Record<RuleKey, { thai: string; roman: string; en: string }>> = ${J(d.L)};\n`);
fs.writeFileSync('src/data/letters.ts',hdr+`import type { Consonant, VowelCard } from "./types";\n\nexport const CONSONANTS: Consonant[] = ${J(d.R)};\n\nexport const VOWELS: VowelCard[] = ${J(d.Ie)};\n`);
