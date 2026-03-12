export const ERROR_MESSAGES = [
  "Damn elves hexed the mail scroll. Let me wipe it off and try again.",
  "Looks like a fey ran off with your message. So it goes. Try again more quietly.",
  "Hmm that didn't work. Let me hit it with the fixing stick and try again.",
  "Looks like a wild surge flipped a bit. These things happen. Try again with less magic.",
  "Oh no the carrier pidgeon got distracted. Mating season, what can you do. Try with magic instead.",
  "Nat 1... *go on and roll again, I won't tell anyone*",
  "Sprites got into the works again. Let me get the fixing stick...",
  "Postmaster's on break. again... Maybe ask again politely with nice, free words?",
]

export function randomErrorMessage(): string {
  return ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)]
}
