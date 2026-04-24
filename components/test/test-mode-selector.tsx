import Link from "next/link";

import { Card } from "@/components/ui/card";
import { getTestModeMeta, testModes } from "@/lib/test-modes";

type TestModeSelectorProps = {
  wordListId: string;
  wordListName: string;
};

export function TestModeSelector({ wordListId, wordListName }: TestModeSelectorProps) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-medium text-brand-700">测试模式选择</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{wordListName}</h1>
        <p className="mt-3 text-sm text-slate-500">先选择测试方式，再进入正式测试流程。</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {testModes.map((mode) => {
          const meta = getTestModeMeta(mode);

          return (
            <Card key={mode} className="flex flex-col justify-between gap-5">
              <div>
                <h2 className="text-xl font-bold text-slate-950">{meta.label}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{meta.description}</p>
              </div>
              <Link
                href={`/test/${wordListId}/${mode}`}
                className="inline-flex w-fit items-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                进入该模式
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
