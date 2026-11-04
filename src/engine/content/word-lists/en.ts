export const englishWords = {
  highFrequency: ["about", "after", "again", "along", "always", "among", "answer", "around", "because", "before", "begin", "below", "between", "build", "change", "clear", "close", "create", "every", "focus", "follow", "found", "friend", "great", "ground", "hello", "house", "large", "learn", "light", "little", "might", "nature", "never", "number", "often", "people", "place", "point", "quick", "quiet", "right", "river", "small", "sound", "still", "story", "their", "there", "these", "thing", "think", "those", "three", "today", "under", "until", "water", "where", "which", "while", "world", "write", "young"],
  mediumFrequency: ["across", "bright", "careful", "decide", "effort", "energy", "family", "gentle", "honest", "inside", "journey", "kindness", "listen", "minute", "notice", "outside", "pattern", "question", "reason", "simple", "together", "useful", "voice", "wonder", "yellow"],
  extended: ["balance", "curious", "discover", "exercise", "flexible", "grateful", "important", "keyboard", "movement", "positive", "remember", "practice", "rhythm", "strength", "welcome"],
} as const;

export const punctuationMarks = [".", ",", "?", "!"] as const;
export const symbolTokens = ["@", "#", "$", "%", "&", "+", "="] as const;
export const numberTokens = ["12", "24", "48", "100", "365", "2026"] as const;
