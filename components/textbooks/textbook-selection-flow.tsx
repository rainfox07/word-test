import Link from "next/link";

import { Card } from "@/components/ui/card";
import { getTestModeMeta, testModes } from "@/lib/test-modes";
import { cn } from "@/lib/utils";

type TextbookSelectionFlowProps = {
  textbookId: string;
  textbookName: string;
  description: string | null;
  rootScope: {
    id: string;
    title: string;
    wordListId: string | null;
    wordCount: number;
  } | null;
  units: Array<{
    id: string;
    title: string;
    wordListId: string | null;
    wordCount: number;
    sections: Array<{
      id: string;
      title: string;
      wordListId: string | null;
      wordCount: number;
    }>;
  }>;
  selectedUnitId?: string;
  selectedSectionId?: string;
};

function buildScopeHref(textbookId: string, unitId?: string, sectionId?: string) {
  const params = new URLSearchParams();

  if (unitId) {
    params.set("unit", unitId);
  }

  if (sectionId) {
    params.set("section", sectionId);
  }

  const query = params.toString();
  return query ? `/textbooks/${textbookId}?${query}` : `/textbooks/${textbookId}`;
}

export function TextbookSelectionFlow({
  textbookId,
  textbookName,
  description,
  rootScope,
  units,
  selectedUnitId,
  selectedSectionId,
}: TextbookSelectionFlowProps) {
  const selectedWholeBook = selectedUnitId === rootScope?.id;
  const selectedUnit = units.find((unit) => unit.id === selectedUnitId) ?? null;
  const currentUnitScope = selectedWholeBook ? rootScope : selectedUnit;
  const currentSections = selectedUnit?.sections ?? [];
  const selectedCurrentRangeWithoutSection = selectedSectionId === currentUnitScope?.id;
  const selectedSection = currentSections.find((section) => section.id === selectedSectionId) ?? null;
  const finalScope = selectedSection ?? (selectedCurrentRangeWithoutSection ? currentUnitScope : null);
  const currentStep = !selectedUnitId ? 1 : !selectedSectionId ? 2 : 3;
  const steps = [
    { index: 1, label: "选择单元", done: currentStep > 1 },
    { index: 2, label: "选择小节", done: currentStep > 2 },
    { index: 3, label: "选择操作", done: Boolean(finalScope?.wordListId) },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <p className="text-sm font-medium text-brand-700">课本入口</p>
        <h1 className="text-3xl font-black tracking-tight text-slate-950">{textbookName}</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-500">
          {description || "先选择单元，再决定是否细分到小节，最后进入默写、抽验或领读。"}
        </p>
      </div>

      <Card className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {steps.map((step) => (
              <div
                key={step.index}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition",
                  currentStep === step.index
                    ? "border-brand-200 bg-brand-50 text-brand-700"
                    : step.done
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-500",
                )}
              >
                第 {step.index} 步 · {step.label}
              </div>
            ))}
          </div>

          {(selectedUnit || selectedWholeBook || selectedSection || selectedCurrentRangeWithoutSection) && (
            <div className="flex flex-wrap gap-2 text-sm">
              {currentUnitScope ? (
                <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-700">
                  单元：{selectedWholeBook ? "全册" : currentUnitScope.title}
                </span>
              ) : null}
              {selectedSection ? (
                <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-700">
                  小节：{selectedSection.title}
                </span>
              ) : selectedCurrentRangeWithoutSection ? (
                <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-700">
                  小节：不区分小节
                </span>
              ) : null}
            </div>
          )}
        </div>

        {currentStep === 1 ? (
          <div className="space-y-5">
            <div>
              <p className="text-lg font-bold text-slate-950">第 1 步：选择单元</p>
              <p className="mt-1 text-sm text-slate-500">先确定学习范围，可以直接使用整本课本，也可以进入某一个 Unit。</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {rootScope ? (
                <Link
                  href={buildScopeHref(textbookId, rootScope.id)}
                  className="block rounded-2xl border border-slate-200 bg-white px-4 py-5 transition hover:-translate-y-0.5 hover:border-brand-100 hover:bg-brand-50 hover:shadow-sm"
                >
                  <p className="font-semibold text-slate-950">不区分单元，直接使用整本课本</p>
                  <p className="mt-1 text-sm text-slate-500">{rootScope.wordCount} 个单词</p>
                </Link>
              ) : null}

              {units.map((unit) => (
                <Link
                  key={unit.id}
                  href={buildScopeHref(textbookId, unit.id)}
                  className="block rounded-2xl border border-slate-200 bg-white px-4 py-5 transition hover:-translate-y-0.5 hover:border-brand-100 hover:bg-brand-50 hover:shadow-sm"
                >
                  <p className="font-semibold text-slate-950">{unit.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {unit.sections.length ? `${unit.sections.length} 个小节` : "无额外小节"} · {unit.wordCount} 个单词
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-slate-950">第 2 步：选择小节</p>
                <p className="mt-1 text-sm text-slate-500">可以继续细分到小节，也可以直接使用当前范围。</p>
              </div>
              <Link
                href={buildScopeHref(textbookId)}
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                重新选择单元
              </Link>
            </div>

            {currentUnitScope ? (
              <div className="space-y-3">
                <Link
                  href={buildScopeHref(textbookId, selectedUnit?.id ?? rootScope?.id, currentUnitScope.id)}
                  className="block rounded-2xl border border-slate-200 bg-white px-4 py-5 transition hover:-translate-y-0.5 hover:border-brand-100 hover:bg-brand-50 hover:shadow-sm"
                >
                  <p className="font-semibold text-slate-950">
                    {selectedUnit ? "不区分小节，直接使用当前单元" : "不区分小节，直接使用整本课本"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{currentUnitScope.wordCount} 个单词</p>
                </Link>

                {currentSections.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {currentSections.map((section) => (
                      <Link
                        key={section.id}
                        href={buildScopeHref(textbookId, selectedUnit?.id ?? rootScope?.id, section.id)}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-5 transition hover:-translate-y-0.5 hover:border-brand-100 hover:bg-brand-50 hover:shadow-sm"
                      >
                        <p className="font-semibold text-slate-950">{section.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{section.wordCount} 个单词</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    当前范围没有额外小节，点击上方“不区分小节”即可进入下一步。
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-slate-950">第 3 步：选择操作</p>
                <p className="mt-1 text-sm text-slate-500">当前范围已经确定，接下来直接进入测试、抽验或领读。</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={buildScopeHref(textbookId, selectedWholeBook ? rootScope?.id : selectedUnit?.id)}
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  重新选择小节
                </Link>
                <Link
                  href={buildScopeHref(textbookId)}
                  className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  重新选择单元
                </Link>
              </div>
            </div>

            {finalScope?.wordListId ? (
              <>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  当前范围：<span className="font-semibold text-slate-900">{selectedSection?.title ?? currentUnitScope?.title}</span>
                  <span className="ml-2 text-slate-500">· {finalScope.wordCount} 个单词</span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {testModes.map((mode) => {
                    const meta = getTestModeMeta(mode);

                    return (
                      <Link
                        key={mode}
                        href={`/test/${finalScope.wordListId}/${mode}`}
                        className="group rounded-2xl border border-slate-200 bg-white px-4 py-5 transition hover:-translate-y-0.5 hover:border-brand-100 hover:bg-brand-50 hover:shadow-sm"
                      >
                        <p className="text-lg font-bold text-slate-950">{meta.label}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{meta.description}</p>
                        <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
                          进入该模式
                          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Link
            href="/word-lists"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            返回词库页
          </Link>
        </div>
      </Card>
    </div>
  );
}
