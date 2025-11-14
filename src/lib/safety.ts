// Safety features for MindLink AI

export interface SafetyCheckResult {
  isSafe: boolean;
  riskLevel: "low" | "medium" | "high" | "critical";
  flags: string[];
  message?: string;
}

// Profanity filter keywords (basic implementation)
const profanityWords = [
  // Add your list of profanity words here
  // This is a simplified version - in production, use a comprehensive library
];

// Crisis detection keywords
const crisisKeywords = [
  "suicide",
  "kill myself",
  "end my life",
  "want to die",
  "not worth living",
  "harm myself",
  "self harm",
  "cutting",
  "overdose",
];

// Self-harm indicators
const selfHarmIndicators = [
  "hurt myself",
  "cut myself",
  "bleeding",
  "pain",
  "worthless",
  "hopeless",
  "no point",
];

export const checkMessageSafety = (message: string): SafetyCheckResult => {
  const lowerMessage = message.toLowerCase();
  const flags: string[] = [];
  let riskLevel: "low" | "medium" | "high" | "critical" = "low";

  // Check for profanity
  const hasProfanity = profanityWords.some((word) => lowerMessage.includes(word));
  if (hasProfanity) {
    flags.push("profanity");
    riskLevel = "medium";
  }

  // Check for crisis keywords
  const hasCrisisKeywords = crisisKeywords.some((keyword) => lowerMessage.includes(keyword));
  if (hasCrisisKeywords) {
    flags.push("crisis");
    riskLevel = "critical";
  }

  // Check for self-harm indicators
  const hasSelfHarm = selfHarmIndicators.some((indicator) => lowerMessage.includes(indicator));
  if (hasSelfHarm) {
    flags.push("self_harm");
    if (riskLevel === "low") riskLevel = "high";
    else if (riskLevel === "medium") riskLevel = "critical";
  }

  // Generate appropriate message
  let messageText: string | undefined;
  if (riskLevel === "critical") {
    messageText = "We're concerned about your safety. Please reach out to a crisis hotline: 988 (Suicide & Crisis Lifeline) or text HOME to 741741.";
  } else if (riskLevel === "high") {
    messageText = "We're here to support you. Would you like to talk to someone?";
  } else if (hasProfanity) {
    messageText = "Please keep conversations respectful and supportive.";
  }

  return {
    isSafe: riskLevel === "low",
    riskLevel,
    flags,
    message: messageText,
  };
};

export const filterProfanity = (text: string): string => {
  let filtered = text;
  profanityWords.forEach((word) => {
    const regex = new RegExp(word, "gi");
    filtered = filtered.replace(regex, "*".repeat(word.length));
  });
  return filtered;
};

export const getCrisisResources = () => [
  {
    name: "988 Suicide & Crisis Lifeline",
    number: "988",
    description: "24/7 free and confidential support",
    type: "Crisis",
  },
  {
    name: "Crisis Text Line",
    number: "Text HOME to 741741",
    description: "Text-based crisis support",
    type: "Crisis",
  },
  {
    name: "SAMHSA National Helpline",
    number: "1-800-662-4357",
    description: "Treatment referral and information",
    type: "Support",
  },
];

