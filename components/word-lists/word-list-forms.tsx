"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";

import {
  ActionResult,
  addWordAction,
  createWordListAction,
  importWordsAction,
} from "@/app/actions/word-list-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

type OwnedWordList = {
  id: string;
  name: string;
};

const initialState: ActionResult = {
  success: false,
  message: "",
};

function FormFeedback({ state }: { state: ActionResult }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
        state.success
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-rose-200 bg-rose-50 text-rose-900"
      }`}
    >
      {state.message}
    </p>
  );
}

export function WordListForms({ ownedWordLists }: { ownedWordLists: OwnedWordList[] }) {
  const router = useRouter();
  const [createState, createAction] = useActionState(createWordListAction, initialState);
  const [addWordState, addWordFormAction] = useActionState(addWordAction, initialState);
  const [importState, importFormAction] = useActionState(importWordsAction, initialState);

  const createFormRef = useRef<HTMLFormElement>(null);
  const addWordFormRef = useRef<HTMLFormElement>(null);
  const importFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (createState.success) {
      createFormRef.current?.reset();
      router.refresh();
    }
  }, [createState, router]);

  useEffect(() => {
    if (addWordState.success) {
      addWordFormRef.current?.reset();
      router.refresh();
    }
  }, [addWordState, router]);

  useEffect(() => {
    if (importState.success) {
      importFormRef.current?.reset();
      router.refresh();
    }
  }, [importState, router]);

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <Card>
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-950">新建我的词库</h2>
          <p className="mt-1 text-sm text-slate-500">为导入和手动添加单词准备一个独立词库。</p>
        </div>
        <form ref={createFormRef} action={createAction} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">词库名</span>
            <Input name="name" placeholder="例如：四级高频词" required />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">描述</span>
            <Textarea name="description" placeholder="可选，用于说明词库来源或用途" className="min-h-24" />
          </label>
          <FormFeedback state={createState} />
          <SubmitButton className="w-full">创建词库</SubmitButton>
        </form>
      </Card>

      <Card>
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-950">手动新增单词</h2>
          <p className="mt-1 text-sm text-slate-500">输入单词和中文含义，系统会尝试自动拉取音频。</p>
        </div>
        <form ref={addWordFormRef} action={addWordFormAction} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">选择词库</span>
            <Select
              name="wordListId"
              required
            >
              <option value="">请选择我的词库</option>
              {ownedWordLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">英文单词</span>
            <Input name="word" placeholder="example" required />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">中文释义</span>
            <Input name="meaning" placeholder="示例、例子" required />
          </label>
          <FormFeedback state={addWordState} />
          <SubmitButton className="w-full">添加单词</SubmitButton>
        </form>
      </Card>

      <Card>
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-950">批量导入</h2>
          <p className="mt-1 text-sm text-slate-500">
            支持粘贴或上传 `.txt`。格式：`word:中文;word:中文`
          </p>
        </div>
        <form
          ref={importFormRef}
          action={importFormAction}
          encType="multipart/form-data"
          className="space-y-4"
        >
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">导入到现有词库</span>
            <Select
              name="targetWordListId"
            >
              <option value="">不选择则创建新词库</option>
              {ownedWordLists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">新词库名</span>
            <Input name="newListName" placeholder="未选择现有词库时必填" />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">手动输入</span>
            <Textarea
              name="rawInput"
              placeholder="apple:苹果;banana:香蕉;practice:练习"
              className="min-h-28"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">上传 .txt</span>
            <Input name="txtFile" type="file" accept=".txt,text/plain" />
          </label>
          <FormFeedback state={importState} />
          <SubmitButton className="w-full">导入单词</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
