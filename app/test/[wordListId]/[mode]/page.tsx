import { notFound } from "next/navigation";

import { WordReader } from "@/components/test/word-reader";
import { TestRunner } from "@/components/test/test-runner";
import { requireSession } from "@/lib/auth-session";
import { getWordListForUser } from "@/lib/data";
import { isTestMode } from "@/lib/test-modes";

type TestModePageProps = {
  params: Promise<{
    wordListId: string;
    mode: string;
  }>;
};

export default async function TestModePage({ params }: TestModePageProps) {
  const session = await requireSession();
  const { wordListId, mode } = await params;

  if (!isTestMode(mode)) {
    notFound();
  }

  const wordList = await getWordListForUser(wordListId, session.user.id);

  if (!wordList) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {mode === "word_reader" ? (
        <WordReader
          wordListName={wordList.name}
          words={wordList.words.map((word) => ({
            id: word.id,
            word: word.word,
            meaning: word.meaning,
            pronunciationAudioUrl: word.pronunciationAudioUrl,
          }))}
        />
      ) : (
        <TestRunner wordListId={wordList.id} wordListName={wordList.name} testMode={mode} />
      )}
    </div>
  );
}
