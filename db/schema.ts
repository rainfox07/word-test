import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const timestamp = () =>
  text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString());

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: text("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

export const accounts = sqliteTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: text("access_token_expires_at"),
    refreshTokenExpiresAt: text("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => [uniqueIndex("accounts_provider_account_idx").on(table.providerId, table.accountId)],
);

export const verifications = sqliteTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});

export const wordLists = sqliteTable(
  "word_lists",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    ownerId: text("owner_id").references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    isSystem: integer("is_system", { mode: "boolean" }).notNull().default(false),
    sourceType: text("source_type", { enum: ["system", "custom"] }).notNull(),
    createdAt: timestamp(),
    updatedAt: text("updated_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [index("word_lists_owner_id_idx").on(table.ownerId)],
);

export const words = sqliteTable(
  "words",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    wordListId: text("word_list_id")
      .notNull()
      .references(() => wordLists.id, { onDelete: "cascade" }),
    word: text("word").notNull(),
    meaning: text("meaning").notNull(),
    meaningsJson: text("meanings_json").notNull().default("[]"),
    acceptedAnswersJson: text("accepted_answers_json").notNull().default("[]"),
    phonetic: text("phonetic"),
    partOfSpeech: text("part_of_speech"),
    pronunciationAudioUrl: text("pronunciation_audio_url"),
    createdByUserId: text("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp(),
    updatedAt: text("updated_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex("words_word_list_word_idx").on(table.wordListId, table.word),
    index("words_word_list_id_idx").on(table.wordListId),
  ],
);

export const testRecords = sqliteTable(
  "test_records",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    wordId: text("word_id")
      .notNull()
      .references(() => words.id, { onDelete: "cascade" }),
    wordListId: text("wordlist_id")
      .notNull()
      .references(() => wordLists.id, { onDelete: "cascade" }),
    testMode: text("test_mode", {
      enum: ["audio_to_word", "meaning_to_word"],
    })
      .notNull()
      .default("audio_to_word"),
    userAnswer: text("user_answer").notNull(),
    isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
    answeredAt: text("answered_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => [
    index("test_records_user_id_idx").on(table.userId),
    index("test_records_word_list_id_idx").on(table.wordListId),
    index("test_records_answered_at_idx").on(table.answeredAt),
  ],
);

export const usersRelations = relations(users, ({ many }) => ({
  wordLists: many(wordLists),
  testRecords: many(testRecords),
}));

export const wordListsRelations = relations(wordLists, ({ one, many }) => ({
  owner: one(users, {
    fields: [wordLists.ownerId],
    references: [users.id],
  }),
  words: many(words),
  testRecords: many(testRecords),
}));

export const wordsRelations = relations(words, ({ one, many }) => ({
  wordList: one(wordLists, {
    fields: [words.wordListId],
    references: [wordLists.id],
  }),
  creator: one(users, {
    fields: [words.createdByUserId],
    references: [users.id],
  }),
  testRecords: many(testRecords),
}));

export const testRecordsRelations = relations(testRecords, ({ one }) => ({
  user: one(users, {
    fields: [testRecords.userId],
    references: [users.id],
  }),
  word: one(words, {
    fields: [testRecords.wordId],
    references: [words.id],
  }),
  wordList: one(wordLists, {
    fields: [testRecords.wordListId],
    references: [wordLists.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type WordList = typeof wordLists.$inferSelect;
export type Word = typeof words.$inferSelect;
export type TestRecord = typeof testRecords.$inferSelect;

export const countAll = sql<number>`count(*)`;
