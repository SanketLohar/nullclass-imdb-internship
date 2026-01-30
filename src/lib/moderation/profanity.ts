const BAD_WORDS = [
  "stupid",
  "idiot",
  "shit",
  "fuck",
  "bastard",
];

export function containsProfanity(text: string) {
  const lower = text.toLowerCase();
  return BAD_WORDS.some((word) =>
    lower.includes(word)
  );
}
