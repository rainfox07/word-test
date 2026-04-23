import "dotenv/config";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { eq } from "drizzle-orm";

import { db } from "../db";
import { users, wordLists, words } from "../db/schema";
import {
  createWordListForUser,
  importWordsForUser,
} from "../lib/word-list-service";
import { parseWordsFromText } from "../lib/word-import";

async function ensureVerificationUser() {
  const email = "verify-word-lists@example.com";
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    return existingUser;
  }

  const timestamp = new Date().toISOString();
  const [createdUser] = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      name: "Verifier",
      email,
      emailVerified: true,
      image: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning();

  return createdUser;
}

async function main() {
  const user = await ensureVerificationUser();
  const createdList = await createWordListForUser({
    userId: user.id,
    name: `Verify List ${Date.now()}`,
    description: "用于验证创建词库流程",
  });

  const txtPath = join(process.cwd(), "word-list-input-test.txt");
  const rawText = readFileSync(txtPath, "utf8");
  const parsedWords = parseWordsFromText(rawText);

  const importResult = await importWordsForUser({
    userId: user.id,
    parsedWords,
    newListName: `Imported Verify ${Date.now()}`,
  });

  const createdWords = await db.query.words.findMany({
    where: eq(words.wordListId, importResult.targetWordListId),
  });

  const availableLists = await db.query.wordLists.findMany({
    where: eq(wordLists.ownerId, user.id),
  });

  console.log("Created word list:", createdList.name);
  console.log("Imported word list:", importResult.targetWordListName);
  console.log("Imported count:", importResult.importedCount);
  console.log("Skipped count:", importResult.skippedCount);
  console.log("Actual rows in imported list:", createdWords.length);
  console.log("Owned list count for verification user:", availableLists.length);

  if (createdWords.length !== parsedWords.length) {
    throw new Error("导入结果与预期数量不一致");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
