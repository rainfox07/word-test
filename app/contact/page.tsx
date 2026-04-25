import Link from "next/link";

import { ContactPlaceholderButton } from "@/components/contact/contact-placeholder-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const capabilities = [
  "自定义单词功能，无论是学习、测试、单词游戏等自定义功能",
  "自定义您的单词词库，可以是课本或您自己的词库",
  "不受限制的词库与单词数量设置",
  "将您的团队 / 单位的 logo 标识放在主页或您指定的位置，更加醒目，彰显品牌文化",
  "将网站完全自定义成您想要的样子，或者打包成 app，随您所欲",
];

const workflow = [
  "添加我的联系方式",
  "说出您的需求",
  "由我们协商价格后，您需要先支付 30% 的费用",
  "等待项目完成，通常为几周或几月",
  "交付项目，并提供售后服务",
  "您支付余下 70% 的费用",
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-card sm:px-8 sm:py-10">
        <p className="text-sm font-medium text-brand-700">合作联系</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">教育合作方案</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
          面向老师、学校、教育工作者与团队的定制化词汇学习解决方案。如果您希望定制专属词库、
          品牌化页面或专属学习功能，欢迎联系我。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/">返回主页</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/word-lists">查看现有产品</Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <p className="text-sm font-medium text-brand-700">我能为您做什么？</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">把词汇学习站点改造成真正适配你场景的工具</h2>
          <div className="mt-6 grid gap-4">
            {capabilities.map((item, index) => (
              <div key={item} className="rounded-2xl border border-slate-200 px-4 py-4">
                <p className="text-sm font-semibold text-brand-700">0{index + 1}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-950 text-white">
          <p className="text-sm font-medium text-sky-200">需要您做什么？</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">合作流程</h2>
          <div className="mt-6 space-y-4">
            {workflow.map((item, index) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-sm font-semibold text-sky-200">步骤 {index + 1}</p>
                <p className="mt-2 text-sm leading-7 text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-card sm:px-8">
        <p className="text-sm font-medium text-brand-700">联系引导</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">如果你已经有想法，可以从这里开始联系</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          当前不接入真实表单，先保留占位入口。后续可以补充微信、邮箱或更正式的商务联络方式。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ContactPlaceholderButton />
          <Button asChild variant="secondary">
            <Link href="/">回到首页</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
