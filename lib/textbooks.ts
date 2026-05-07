import { asc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { textbookScopes, textbooks, wordLists } from "@/db/schema";

type TextbookScopeView = {
  id: string;
  parentId: string | null;
  title: string;
  pathKey: string;
  scopeType: "book" | "unit" | "section";
  sortOrder: number;
  wordListId: string | null;
  wordCount: number;
};

type TextbookScopeRow = {
  id: string;
  parentId: string | null;
  title: string;
  pathKey: string;
  scopeType: "book" | "unit" | "section";
  sortOrder: number;
  wordListId: string | null;
  wordList?: {
    words: Array<{ id: string }>;
  } | null;
};

type FallbackScopeView = {
  rootScope: TextbookScopeView | null;
  units: Array<TextbookScopeView & { sections: TextbookScopeView[] }>;
};

function buildFallbackStructure(
  textbookName: string,
  lists: Array<{
    id: string;
    name: string;
    words: Array<{ id: string }>;
  }>,
): FallbackScopeView {
  const prefix = `${textbookName} / `;
  const rootList = lists.find((list) => list.name === `${textbookName} / 全册`) ?? null;
  const unitMap = new Map<string, TextbookScopeView & { sections: TextbookScopeView[] }>();

  for (const list of lists) {
    if (!list.name.startsWith(prefix) || list.name === `${textbookName} / 全册`) {
      continue;
    }

    const segments = list.name.slice(prefix.length).split(" / ").map((item) => item.trim()).filter(Boolean);

    if (segments.length === 1) {
      unitMap.set(list.id, {
        id: list.id,
        parentId: rootList?.id ?? null,
        title: segments[0],
        pathKey: `fallback-unit-${segments[0].toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        scopeType: "unit",
        sortOrder: unitMap.size + 1,
        wordListId: list.id,
        wordCount: list.words.length,
        sections: [],
      });
      continue;
    }

    if (segments.length >= 2) {
      const unitTitle = segments[0];
      const sectionTitle = segments.slice(1).join(" / ");
      let unitEntry =
        [...unitMap.values()].find((unit) => unit.title === unitTitle) ??
        null;

      if (!unitEntry) {
        unitEntry = {
          id: `fallback-${unitTitle}`,
          parentId: rootList?.id ?? null,
          title: unitTitle,
          pathKey: `fallback-unit-${unitTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          scopeType: "unit",
          sortOrder: unitMap.size + 1,
          wordListId: null,
          wordCount: 0,
          sections: [],
        };
        unitMap.set(unitEntry.id, unitEntry);
      }

      unitEntry.sections.push({
        id: list.id,
        parentId: unitEntry.id,
        title: sectionTitle,
        pathKey: `${unitEntry.pathKey}/fallback-section-${sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        scopeType: "section",
        sortOrder: unitEntry.sections.length + 1,
        wordListId: list.id,
        wordCount: list.words.length,
      });
    }
  }

  return {
    rootScope: rootList
      ? {
          id: rootList.id,
          parentId: null,
          title: "全册",
          pathKey: "fallback-book",
          scopeType: "book",
          sortOrder: 0,
          wordListId: rootList.id,
          wordCount: rootList.words.length,
        }
      : null,
    units: [...unitMap.values()].sort((left, right) => left.title.localeCompare(right.title, "en")),
  };
}

export async function getAccessibleTextbooks() {
  const [rows, textbookWordLists] = await Promise.all([
    db.query.textbooks.findMany({
      orderBy: [asc(textbooks.createdAt)],
      with: {
        scopes: {
          orderBy: [asc(textbookScopes.sortOrder), asc(textbookScopes.createdAt)],
          with: {
            wordList: {
              with: {
                words: true,
              },
            },
          },
        },
      },
    }),
    db.query.wordLists.findMany({
      where: eq(wordLists.sourceType, "textbook"),
      with: {
        words: true,
      },
      orderBy: [asc(wordLists.createdAt)],
    }),
  ]);

  return rows.map((textbook) => {
    const directRootScope = textbook.scopes.find((scope) => scope.scopeType === "book");
    const directUnitCount = textbook.scopes.filter((scope) => scope.scopeType === "unit").length;
    const directSectionCount = textbook.scopes.filter((scope) => scope.scopeType === "section").length;
    const fallback = buildFallbackStructure(
      textbook.name,
      textbookWordLists.filter((list) => list.name.startsWith(`${textbook.name} / `)),
    );
    const rootScope = directRootScope ?? fallback.rootScope;
    const unitCount = directUnitCount || fallback.units.length;
    const sectionCount = directSectionCount || fallback.units.reduce((sum, unit) => sum + unit.sections.length, 0);
    const totalWords = directRootScope?.wordList?.words.length ?? fallback.rootScope?.wordCount ?? 0;

    return {
      id: textbook.id,
      name: textbook.name,
      description: textbook.description,
      sourceFileName: textbook.sourceFileName,
      unitCount,
      sectionCount,
      totalWords,
    };
  });
}

function toScopeView(scope: TextbookScopeRow): TextbookScopeView {
  return {
    id: scope.id,
    parentId: scope.parentId,
    title: scope.title,
    pathKey: scope.pathKey,
    scopeType: scope.scopeType,
    sortOrder: scope.sortOrder,
    wordListId: scope.wordListId,
    wordCount: scope.wordList?.words.length ?? 0,
  };
}

export async function getTextbookById(textbookId: string) {
  const textbook = await db.query.textbooks.findFirst({
    where: eq(textbooks.id, textbookId),
    with: {
      scopes: {
        orderBy: [asc(textbookScopes.sortOrder), asc(textbookScopes.createdAt)],
        with: {
          wordList: {
            with: {
              words: true,
            },
          },
        },
      },
    },
  });

  if (!textbook) {
    return null;
  }

  const scopes = textbook.scopes.map(toScopeView);
  const directRootScope = scopes.find((scope) => scope.scopeType === "book") ?? null;
  const unitScopes = scopes.filter((scope) => scope.scopeType === "unit");

  if (!unitScopes.length) {
    const fallbackLists = await db.query.wordLists.findMany({
      where: sql`${wordLists.sourceType} = 'textbook' and ${wordLists.name} like ${`${textbook.name} / %`}`,
      with: {
        words: true,
      },
      orderBy: [asc(wordLists.createdAt)],
    });
    const fallback = buildFallbackStructure(textbook.name, fallbackLists);

    return {
      id: textbook.id,
      name: textbook.name,
      description: textbook.description,
      sourceFileName: textbook.sourceFileName,
      rootScope: fallback.rootScope,
      units: fallback.units,
    };
  }

  const unitMap = new Map(
    unitScopes.map((unit) => [
      unit.id,
      {
        ...unit,
        sections: scopes.filter((scope) => scope.parentId === unit.id && scope.scopeType === "section"),
      },
    ]),
  );

  return {
    id: textbook.id,
    name: textbook.name,
    description: textbook.description,
    sourceFileName: textbook.sourceFileName,
    rootScope: directRootScope,
    units: [...unitMap.values()],
  };
}
