import { Card } from "@/components/ui/card";
import { MistakeAudioButton } from "@/components/mistakes/mistake-audio-button";
import { requireSession } from "@/lib/auth-session";
import { getMistakeWords } from "@/lib/data";
import { formatDateTime } from "@/lib/utils";

export default async function MistakesPage() {
  const session = await requireSession();
  const mistakes = await getMistakeWords(session.user.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-700">错词本</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">只看答错过的单词</h1>
      </div>

      <Card>
        <div className="space-y-4">
          {mistakes.length ? (
            mistakes.map((item) => (
              <div key={`${item.wordId}-${item.wordListName}`} className="rounded-2xl border border-slate-200 px-4 py-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">
                      {item.word} · {item.meaning}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">来源词库：{item.wordListName}</p>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <div className="text-sm text-slate-500">最近答错：{formatDateTime(item.lastWrongAt)}</div>
                    <MistakeAudioButton audioUrl={item.pronunciationAudioUrl} />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-12 text-center text-sm text-slate-500">
              目前没有错词记录。
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
