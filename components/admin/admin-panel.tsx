import Link from "next/link";

import { adminLogoutAction } from "@/app/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type AdminDashboardData } from "@/lib/admin-data";
import { formatDateTime } from "@/lib/utils";

function statusClasses(tone: "emerald" | "rose" | "slate") {
  if (tone === "emerald") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (tone === "rose") {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-slate-100 text-slate-700";
}

export function AdminPanel({ data }: { data: AdminDashboardData }) {
  const overviewCards = [
    { label: "用户总数", value: data.overview.totalUsers, detail: "当前注册用户" },
    { label: "今日活跃用户", value: data.overview.todayActiveUsers, detail: "今天至少答过一次题" },
    { label: "总练习次数", value: data.overview.totalPracticeCount, detail: "累计 test_records 数量" },
    { label: "今日练习次数", value: data.overview.todayPracticeCount, detail: "今日新增练习记录" },
    { label: "全站平均正确率", value: `${data.overview.averageAccuracy}%`, detail: "基于所有答题记录" },
    { label: "错词总数", value: data.overview.totalWrongCount, detail: "全站错误记录数" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-700">Admin 面板</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">用户、词库与系统状态总览</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            用一页快速看清站点活跃度、学习表现、错误分布、词库表现和系统健康情况。
          </p>
        </div>
        <form action={adminLogoutAction}>
          <Button variant="secondary" type="submit">
            退出 Admin
          </Button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {overviewCards.map((card) => (
          <Card key={card.label}>
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-4xl font-black text-slate-950">{card.value}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{card.detail}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-brand-700">用户学习表现</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">谁在高频使用，谁几乎没开始</h2>
            </div>
            <div className="flex gap-2 text-sm">
              <Link
                href="/admin?sort=practice"
                className={`rounded-xl px-3 py-2 font-semibold ${
                  data.sortBy === "practice" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                按练习量
              </Link>
              <Link
                href="/admin?sort=accuracy"
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
                    <td className="px-3 py-4 text-slate-600">
                      {formatDateTime(user.registeredAt, {
                        emptyText: "暂无时间",
                        invalidText: "时间异常",
                      })}
                    </td>
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
                    <td className="px-3 py-4 text-slate-600">
                      {formatDateTime(user.lastActiveAt, {
                        emptyText: "暂无时间",
                        invalidText: "时间异常",
                      })}
                    </td>
                    <td className="px-3 py-4 text-slate-700">{user.createdWordLists}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-8">
          <Card>
            <p className="text-sm font-medium text-brand-700">用户行为漏斗</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">用户在哪一步停住了</h2>
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
                <p className="text-sm text-slate-500">完成较完整练习的用户（近似：累计答题 ≥ 10）</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{data.funnel.completedPracticeUsersApprox}</p>
              </div>
              <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-500">
                错题本使用人数、单词领读使用人数目前未接入事件埋点，暂不提供精确漏斗统计。
              </div>
            </div>
          </Card>

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
                <span className="text-sm text-slate-600">最近 24 小时错误请求数（MVP 近似：错误答题记录）</span>
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
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <Card>
          <p className="text-sm font-medium text-brand-700">错误分析</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">全站最容易错在哪里</h2>
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
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">近期是否出现新的薄弱点</h2>
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

      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <p className="text-sm font-medium text-brand-700">各词库中最容易错的单词</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">按词库快速定位薄弱点</h2>
          <div className="mt-5 space-y-4">
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

        <Card>
          <p className="text-sm font-medium text-brand-700">词库表现</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">哪些词库更热门，哪些更容易卡人</h2>
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
                    <td className="px-3 py-4 text-slate-600">
                      {formatDateTime(list.lastUsedAt, {
                        emptyText: "暂无时间",
                        invalidText: "时间异常",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <p className="text-sm font-medium text-brand-700">最近活动流</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">站点近期发生了什么</h2>
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
                  <span className="text-xs text-slate-500">
                    {formatDateTime(activity.time, {
                      emptyText: "暂无时间",
                      invalidText: "时间异常",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-sm font-medium text-brand-700">实现说明</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">哪些数据是精确的，哪些是 MVP</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-slate-600">
            <p>用户总数、今日活跃用户、总练习次数、今日练习次数、全站平均正确率、错误词 Top、用户正确率、词库使用人数等统计都直接来自真实数据库。</p>
            <p>“最近 24 小时错误请求数”当前用最近 24 小时错误答题记录数做近似，不代表真实 HTTP 错误日志。</p>
            <p>用户行为漏斗中的“完成至少一次完整测试”目前用累计答题数 ≥ 10 做近似估算。</p>
            <p>错题本使用人数、单词领读使用人数、证书状态、最近部署时间当前未接入事件埋点或外部监控，因此只做占位展示。</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
