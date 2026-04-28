import { createHmac, randomUUID } from "node:crypto";

import { env } from "@/lib/env";

type VerificationOption = {
  id: string;
  emoji: string;
  label: string;
};

type VerificationChallenge = {
  id: string;
  prompt: string;
  options: VerificationOption[];
  answerId: string;
};

const optionMap: Record<string, VerificationOption> = {
  apple: { id: "apple", emoji: "🍎", label: "苹果" },
  grape: { id: "grape", emoji: "🍇", label: "葡萄" },
  banana: { id: "banana", emoji: "🍌", label: "香蕉" },
  watermelon: { id: "watermelon", emoji: "🍉", label: "西瓜" },
};

const challengeBank: VerificationChallenge[] = [
  {
    id: "choose-apple",
    prompt: "请选择苹果",
    options: [optionMap.apple, optionMap.grape, optionMap.banana, optionMap.watermelon],
    answerId: optionMap.apple.id,
  },
  {
    id: "choose-grape",
    prompt: "请选择葡萄",
    options: [optionMap.apple, optionMap.grape, optionMap.banana, optionMap.watermelon],
    answerId: optionMap.grape.id,
  },
  {
    id: "choose-yellow-fruit",
    prompt: "请选择黄色水果",
    options: [optionMap.apple, optionMap.grape, optionMap.banana, optionMap.watermelon],
    answerId: optionMap.banana.id,
  },
  {
    id: "choose-red-fruit",
    prompt: "请选择红色水果",
    options: [optionMap.apple, optionMap.grape, optionMap.banana, optionMap.watermelon],
    answerId: optionMap.apple.id,
  },
  {
    id: "choose-watermelon",
    prompt: "请选择西瓜",
    options: [optionMap.apple, optionMap.grape, optionMap.banana, optionMap.watermelon],
    answerId: optionMap.watermelon.id,
  },
];

function signPayload(payload: string) {
  return createHmac("sha256", env.betterAuthSecret).update(payload).digest("hex");
}

export function createHumanVerificationChallenge() {
  const challenge = challengeBank[Math.floor(Math.random() * challengeBank.length)];
  const nonce = randomUUID();
  const issuedAt = Date.now();
  const payload = `${challenge.id}.${challenge.answerId}.${nonce}.${issuedAt}`;
  const signature = signPayload(payload);

  return {
    prompt: challenge.prompt,
    options: challenge.options,
    token: `${payload}.${signature}`,
  };
}

export function verifyHumanVerificationToken(token: string, selectedOptionId: string) {
  const parts = token.split(".");

  if (parts.length !== 5) {
    return false;
  }

  const [challengeId, answerId, nonce, issuedAt, signature] = parts;
  const payload = `${challengeId}.${answerId}.${nonce}.${issuedAt}`;
  const expectedSignature = signPayload(payload);

  if (signature !== expectedSignature) {
    return false;
  }

  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age > 1000 * 60 * 30) {
    return false;
  }

  return selectedOptionId === answerId;
}
