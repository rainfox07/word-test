import Link from "next/link";

import { adminLogoutAction } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type AdminDashboardData } from "@/lib/admin-data";
import { formatDateTime } from "@/lib/utils";

type AdminSection = "overview" | "users" | "errors" | "word-lists" | "activities" | "system";

const sectionItems: Array<{ id: AdminSection; label: string; description: string }> = [
  { id: "overview", label: "总览", description: "核心全站数据" },
  { id: "users", label: "用户分析", description: "学习表现与活跃度" },
  { id: "errors", label: "错误词分析", description: "错词排行与薄弱点" },
  { id: "word-lists", label: "词库表现", description: "词库使用与难度" },
  { id: "activities", label: "最近活动", description: "近期用户动态" },
  { id: "system", label: "系统状态", description: "健康检查与说明" },
];

function statusClasses(tone: "emerald" | "rose" | "slate") {
  if (tone === "emerald") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (tone === "rose") {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-slate-100 text-slate-700";
}

function safeTime(value: string | null | undefined) {
  return formatDateTime(value, {
    emptyText: "暂无时间",
    invalidText: "时间异常",
  });
}

function SidebarSectionNav({
  activeSection,
  sortBy,
}: {
  activeSection: AdminSection;
  sortBy: AdminDashboardData["sortBy"];
}) {
  return (
    <Card className="p-4">
      <div className="space-y-2">
        {sectionItems.map((item) => (
          <Link
            key={item.id}
            href={`/admin?section=${item.id}${item.id === "users" ? `&sort=${sortBy}` : ""}`}
            className={`block rounded-2xl px-4 py-3 transition ${
              activeSection === item.id
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            <p className="font-semibold">{item.label}</p>
            <p className={`mt-1 text-xs ${activeSection === item.id ? "text-slate-300" : "text-slate-500"}`}>
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </Card>
  );
}

function MobileSectionNav({
  activeSection,
  sortBy,
}: {
  activeSection: AdminSection;
  sortBy: AdminDashboardData["sortBy"];
}) {
  return (
    <div className="lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sectionItems.map((item) => (
          <Link
            key={item.id}
            href={`/admin?section=${item.id}${item.id === "users" ? `&sort=${sortBy}` : ""}`}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeSection === item.id
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function OverviewSection({ data }: { data: AdminDashboardData }) {
  const mostUsedWordList = [...data.wordListPerformance].sort((a, b) => b.totalTests - a.totalTests)[0];

  const overviewCards = [
    { label: "用户总数", value: data.overview.totalUsers},
    { label: "今日活跃用户", value: data.overview.todayActiveUsers },
    { label: "总练习次数", value: data.overview.totalPracticeCount},
    { label: "今日练习次数", value: data.overview.todayPracticeCount },
    { label: "全站平均正确率", value: `${data.overview.averageAccuracy}%` },
    { label: "错词总数", value: data.overview.totalWrongCount },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {overviewCards.map((card) => (
          <Card key={card.label}>
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-4xl font-black text-slate-950">{card.value}</p>
            {/* <p className="mt-2 text-sm leading-6 text-slate-500">{card.detail}</p> */}
          </Card>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <p className="text-sm font-medium text-brand-700">全站重点总览</p>
          {/* <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">现在最值得优先关注的三件事</h2> */}
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-slate-200 px-4 py-4">
              <p className="text-sm text-slate-500">错误率最高的单词</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {data.errorAnalysis.topWrongWords[0]
                  ? `${data.errorAnalysis.topWrongWords[0].word} · ${data.errorAnalysis.topWrongWords[0].meaning}`
                  : "暂无错误词数据"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 px-4 py-4">
              <p className="text-sm text-slate-500">最活跃的用户</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {data.userPerformance[0]
                  ? `${data.userPerformance[0].name} · ${data.userPerformance[0].totalPractice} 次练习`
                  : "暂无用户数据"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 px-4 py-4">
              <p className="text-sm text-slate-500">最常被使用的词库</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {mostUsedWordList ? mostUsedWordList.name : "暂无词库数据"}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium text-brand-700">用户数据分析</p>
          {/* <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">用户是否真的走进学习流程</h2> */}
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">注册用户数</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{data.funnel.registeredUsers}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">创建过词库的用户</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{data.funnel.createdWordListUsers}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">开始过测试的用户</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{data.funnel.startedTestUsers}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-sm text-slate-500">完成较完整练习的用户（近似）</p>
              <p className="mt-2 text-2xl font-black text-slate-950">{data.funnel.completedPracticeUsersApprox}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function UsersSection({ data, activeSection }: { data: AdminDashboardData; activeSection: AdminSection }) {
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-brand-700">用户学习表现</p>
          {/* <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">谁在高频使用，谁几乎没开始</h2> */}
        </div>
        <div className="flex gap-2 text-sm">
          <Link
            href={`/admin?section=${activeSection}&sort=practice`}
            className={`rounded-xl px-3 py-2 font-semibold ${
              data.sortBy === "practice" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            按练习量
          </Link>
          <Link
            href={`/admin?section=${activeSection}&sort=accuracy`}
            className={`rounded-xl px-3 py-2 font-semibold ${
              data.sortBy === "accuracy" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            按正确率
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="px-3 py-3 font-semibold">用户</th>
              <th className="px-3 py-3 font-semibold">注册时间</th>
              <th className="px-3 py-3 font-semibold">总练习量</th>
              <th className="px-3 py-3 font-semibold">正确率</th>
              <th className="px-3 py-3 font-semibold">错词数</th>
              <th className="px-3 py-3 font-semibold">最近活跃</th>
              <th className="px-3 py-3 font-semibold">词库数</th>
            </tr>
          </thead>
          <tbody>
            {data.userPerformance.map((user) => (
              <tr key={user.id} className="border-b border-slate-100 align-top">
                <td className="px-3 py-4">
                  <p className="font-semibold text-slate-950">{user.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                </td>
                <td className="px-3 py-4 text-slate-600">{safeTime(user.registeredAt)}</td>
                <td className="px-3 py-4 font-semibold text-slate-950">{user.totalPractice}</td>
                <td className="px-3 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      user.accuracy >= 80
                        ? "bg-emerald-50 text-emerald-700"
                        : user.accuracy >= 50
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {user.accuracy}%
                  </span>
                </td>
                <td className="px-3 py-4 text-slate-700">{user.wrongCount}</td>
                <td className="px-3 py-4 text-slate-600">{safeTime(user.lastActiveAt)}</td>
                <td className="px-3 py-4 text-slate-700">{user.createdWordLists}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ErrorsSection({ data }: { data: AdminDashboardData }) {
  return (
    <div className="space-y-8">
      <div className="grid gap-8 xl:grid-cols-2">
        <Card>
          <p className="text-sm font-medium text-brand-700">全站错误词 Top 10</p>
          {/* <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">易错词一览无余</h2> */}
          <div className="mt-5 space-y-3">
            {data.errorAnalysis.topWrongWords.map((item, index) => (
              <div key={item.wordId} className="rounded-2xl border border-slate-200 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">
                      #{index + 1} {item.word} · {item.meaning}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">词库：{item.wordListName}</p>
                  </div>
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                    错误率 {item.errorRate}%
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  错误 {item.wrongCount} 次 · 正确 {item.correctCount} 次
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium text-brand-700">最近 7 天错误词 Top 10</p>
          {/* <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">近期是否出现新的薄弱点</h2> */}
          <div className="mt-5 space-y-3">
            {data.errorAnalysis.topWrongWords7d.map((item, index) => (
              <div key={item.wordId} className="rounded-2xl border border-slate-200 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">
                      #{index + 1} {item.word} · {item.meaning}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">词库：{item.wordListName}</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    错误率 {item.errorRate}%
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">
                  错误 {item.wrongCount} 次 · 正确 {item.correctCount} 次
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <p className="text-sm font-medium text-brand-700">各词库中最容易错的单词</p>
        {/* <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">按词库快速定位薄弱点</h2> */}
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {data.errorAnalysis.errorTopByWordList.map((group) => (
            <div key={group.wordListName} className="rounded-2xl border border-slate-200 px-4 py-4">
              <p className="font-semibold text-slate-950">{group.wordListName}</p>
              <div className="mt-3 space-y-2">
                {group.topWords.map((item) => (
                  <div key={item.wordId} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-700">
                      {item.word} · {item.meaning}
                    </span>
                    <span className="font-semibold text-rose-700">{item.wrongCount} 次错误</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function WordListsSection({ data }: { data: AdminDashboardData }) {
  return (
    <Card>
      <p className="text-sm font-medium text-brand-700">词库表现</p>
      {/* <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">哪些词库更热门，哪些更容易卡人</h2> */}
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="px-3 py-3 font-semibold">词库</th>
              <th className="px-3 py-3 font-semibold">类型</th>
              <th className="px-3 py-3 font-semibold">使用人数</th>
              <th className="px-3 py-3 font-semibold">总测试次数</th>
              <th className="px-3 py-3 font-semibold">平均正确率</th>
              <th className="px-3 py-3 font-semibold">平均完成度</th>
              <th className="px-3 py-3 font-semibold">错误最多单词</th>
              <th className="px-3 py-3 font-semibold">最近使用</th>
            </tr>
          </thead>
          <tbody>
            {data.wordListPerformance.map((list) => (
              <tr key={list.id} className="border-b border-slate-100 align-top">
                <td className="px-3 py-4">
                  <p className="font-semibold text-slate-950">{list.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{list.wordCount} 个单词</p>
                </td>
                <td className="px-3 py-4 text-slate-600">{list.type}</td>
                <td className="px-3 py-4 text-slate-700">{list.uniqueUsers}</td>
                <td className="px-3 py-4 text-slate-700">{list.totalTests}</td>
                <td className="px-3 py-4">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {list.averageAccuracy}%
                  </span>
                </td>
                <td className="px-3 py-4">
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {list.averageCompletion}%
                  </span>
                </td>
                <td className="px-3 py-4 text-slate-600">{list.hardestWord}</td>
                <td className="px-3 py-4 text-slate-600">{safeTime(list.lastUsedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ActivitiesSection({ data }: { data: AdminDashboardData }) {
  return (
    <Card>
      <p className="text-sm font-medium text-brand-700">最近活动流</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">用户操作监控</h2>
      <div className="mt-5 space-y-3">
        {data.activities.map((activity) => (
          <div key={activity.id} className="rounded-2xl border border-slate-200 px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950">
                  {activity.user} · {activity.action}
                </p>
                <p className="mt-1 text-sm text-slate-500">{activity.detail}</p>
              </div>
              <span className="text-xs text-slate-500">{safeTime(activity.time)}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SystemSection({ data }: { data: AdminDashboardData }) {
  return (
    <div className="space-y-8">
      <Card>
        <p className="text-sm font-medium text-brand-700">系统健康状态</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">现在站点是否健康</h2>
        <div className="mt-5 grid gap-3">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4">
            <span className="text-sm text-slate-600">数据库状态</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(data.systemHealth.database.tone)}`}>
              {data.systemHealth.database.label}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4">
            <span className="text-sm text-slate-600">音频接口状态</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(data.systemHealth.audioApi.tone)}`}>
              {data.systemHealth.audioApi.label}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4">
            <span className="text-sm text-slate-600">最近 24 小时错误请求数（MVP 近似）</span>
            <span className="text-sm font-semibold text-slate-950">{data.systemHealth.recent24hErrorCount}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4">
            <span className="text-sm text-slate-600">证书 / 域名状态</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(data.systemHealth.certificateStatus.tone)}`}>
              {data.systemHealth.certificateStatus.label}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4">
            <span className="text-sm text-slate-600">当前版本</span>
            <span className="text-sm font-semibold text-slate-950">v{data.systemHealth.version}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4">
            <span className="text-sm text-slate-600">最近部署时间</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(data.systemHealth.deploymentTime.tone)}`}>
              {data.systemHealth.deploymentTime.label}
            </span>
          </div>
        </div>
      </Card>

      {/* <Card>
        <p className="text-sm font-medium text-brand-700">实现说明</p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">哪些数据是精确的，哪些是 MVP</h2>
        <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
          <p>用户总数、今日活跃用户、总练习次数、今日练习次数、全站平均正确率、错误词 Top、用户正确率、词库使用人数等统计都直接来自真实数据库。</p>
          <p>“最近 24 小时错误请求数”当前用最近 24 小时错误答题记录数做近似，不代表真实 HTTP 错误日志。</p>
          <p>用户行为漏斗中的“完成至少一次完整测试”目前用累计答题数 ≥ 10 做近似估算。</p>
          <p>错题本使用人数、单词领读使用人数、证书状态、最近部署时间当前未接入事件埋点或外部监控，因此只做占位展示。</p>
        </div>
      </Card> */}
    </div>
  );
}

function sectionMeta(section: AdminSection) {
  switch (section) {
    case "users":
      return {
        title: "用户分析",
        description: "聚焦单个用户层面的活跃度、练习量、正确率与留存迹象。",
      };
    case "errors":
      return {
        title: "错误词分析",
        description: "定位全站最容易错的单词，以及不同词库里的薄弱点。",
      };
    case "word-lists":
      return {
        title: "词库表现",
        description: "观察词库热度、难度和完成情况，判断哪些内容需要优化。",
      };
    case "activities":
      return {
        title: "最近活动",
        description: "快速浏览近期注册、建词库和答题动态，感知站点热度。",
      };
    case "system":
      return {
        title: "系统状态",
        description: "查看数据库、音频接口和站点运行状态的轻量健康面板。",
      };
    default:
      return {
        title: "总览",
        description: "只保留最核心的全站概览，让管理员先快速判断站点整体情况。",
      };
  }
}

export function AdminPanel({
  data,
  activeSection,
}: {
  data: AdminDashboardData;
  activeSection: AdminSection;
}) {
  const meta = sectionMeta(activeSection);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-700">Admin 面板</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{meta.title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{meta.description}</p>
        </div>
        <form action={adminLogoutAction}>
          <Button variant="secondary" type="submit">
            退出 Admin
          </Button>
        </form>
      </div>

      <MobileSectionNav activeSection={activeSection} sortBy={data.sortBy} />

      <div className="grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start">
        <div className="hidden lg:block">
          <SidebarSectionNav activeSection={activeSection} sortBy={data.sortBy} />
        </div>

        <div className="min-w-0">
          {activeSection === "overview" ? <OverviewSection data={data} /> : null}
          {activeSection === "users" ? <UsersSection data={data} activeSection={activeSection} /> : null}
          {activeSection === "errors" ? <ErrorsSection data={data} /> : null}
          {activeSection === "word-lists" ? <WordListsSection data={data} /> : null}
          {activeSection === "activities" ? <ActivitiesSection data={data} /> : null}
          {activeSection === "system" ? <SystemSection data={data} /> : null}
        </div>
      </div>
    </div>
  );
}
