"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function HomeActionModules() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-slate-200 bg-white">
        <p className="text-sm font-medium text-brand-700">上手引导</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">不知道怎么使用？查看视频教程</h2>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          如果你想快速了解词库、测试和领读的基本流程，这里后续会放一段完整演示视频。
        </p>
        <Button
          className="mt-6"
          onClick={() => {
            window.alert("视频未录制");
          }}
        >
          查看视频教程
        </Button>
      </Card>

      <Card className="border-slate-200 bg-slate-950 text-white">
        <p className="text-sm font-medium text-sky-200">合作联系</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight">您是老师或教育工作者？</h2>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          如果你希望定制专属词库、学习功能或品牌化页面，这里有一份更完整的合作说明页。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild className="bg-amber-400 text-slate-950 hover:bg-amber-300">
            <Link href="/contact">联系我</Link>
          </Button>
          <Button asChild variant="ghost" className="text-white hover:bg-white/10 hover:text-white">
            <Link href="/contact">查看合作方案</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
