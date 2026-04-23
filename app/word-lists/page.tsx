import Link from "next/link";

import { Card } from "@/components/ui/card";
import { WordListForms } from "@/components/word-lists/word-list-forms";
import { requireSession } from "@/lib/auth-session";
import { getAccessibleWordLists } from "@/lib/data";

export default async function WordListsPage() {
  const session = await requireSession();
  const wordLists = await getAccessibleWordLists(session.user.id);

  const systemLists = wordLists.filter((list) => list.isSystem);
  const ownedLists = wordLists.filter((list) => !list.isSystem);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <p className="text-sm font-medium text-brand-700">词库管理</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">默认词库与我的词库</h1>
      </div>

      <WordListForms ownedWordLists={ownedLists.map((list) => ({ id: list.id, name: list.name }))} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-950">默认词库</h2>
            <p className="mt-1 text-sm text-slate-500">系统内置内容，只读，可直接进入测试。</p>
          </div>
          <div className="space-y-4">
            {systemLists.map((list) => (
              <div key={list.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950">{list.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{list.description || "系统默认词库"}</p>
                    <p className="mt-2 text-xs text-slate-400">{list.words.length} 个单词</p>
                  </div>
                  <Link href={`/test/${list.id}`} className="text-sm font-semibold text-brand-700">
                    开始测试
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-950">我的词库</h2>
            <p className="mt-1 text-sm text-slate-500">可手动添加和批量导入。</p>
          </div>
          <div className="space-y-4">
            {ownedLists.length ? (
              ownedLists.map((list) => (
                <div key={list.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">{list.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{list.description || "自定义词库"}</p>
                      <p className="mt-2 text-xs text-slate-400">{list.words.length} 个单词</p>
                    </div>
                    <Link href={`/test/${list.id}`} className="text-sm font-semibold text-brand-700">
                      开始测试
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
                你还没有自己的词库，可以先在上方创建或导入。
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
