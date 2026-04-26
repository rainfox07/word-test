import { ContactPlaceholderButton } from "@/components/contact/contact-placeholder-button";
import { Card } from "@/components/ui/card";

const feedbackCards = [
  {
    title: "问题反馈",
    description: "反馈使用中的错误、异常或体验问题。",
  },
  {
    title: "功能建议",
    description: "提出与单词练习、词库管理、错词复习相关的功能想法。",
  },
  {
    title: "学习场景建议",
    description: "说明你在课堂、自习或小组学习中的实际使用需求，供后续版本参考。",
  },
  {
    title: "内容建议",
    description: "反馈默认词库、页面文案或学习流程中的可改进之处。",
  },
];

const feedbackNotes = [
  "这是一个个人非经营性学习工具项目。",
  "当前主要用于单词练习、词库管理和学习辅助。",
  "如果你在使用过程中遇到问题，或者希望增加新的学习功能，可以通过联系方式向我反馈。",
  "相关建议仅用于个人项目优化参考。",
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-card sm:px-8 sm:py-10">
        <p className="text-sm font-medium text-brand-700">反馈与建议</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">个人学习工具仍在持续完善中</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600">
          这是一个个人非经营性学习工具项目，目前主要用于单词练习、词库管理和学习辅助。如果你在使用过程中遇到问题，
          或者希望增加新的学习功能，可以通过联系方式向我反馈。相关建议仅用于个人项目优化参考。
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <p className="text-sm font-medium text-brand-700">反馈方向</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">欢迎从这些角度提出建议</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {feedbackCards.map((item, index) => (
              <div key={item.title} className="rounded-2xl border border-slate-200 px-4 py-4">
                <p className="text-sm font-semibold text-brand-700">0{index + 1}</p>
                <p className="mt-2 text-base font-semibold text-slate-950">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="feature-dark-panel p-6">
          <p className="feature-dark-kicker">使用说明</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">反馈会如何被使用</h2>
          <div className="mt-6 space-y-4">
            {feedbackNotes.map((item, index) => (
              <div key={item} className="feature-dark-surface px-4 py-4">
                <p className="text-sm font-semibold text-sky-200">说明 {index + 1}</p>
                <p className="mt-2 text-sm leading-7 text-slate-100">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <section className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-card sm:px-8">
        <p className="text-sm font-medium text-brand-700">提交反馈</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">如果你已经有建议，可以从这里开始发送</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          当前不接入站内表单，先保留一个简单的反馈入口。你可以通过现有联系方式发送问题反馈、功能建议或学习场景建议。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ContactPlaceholderButton />
        </div>
      </section>
    </div>
  );
}
