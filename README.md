# Word Test

一个支持“听音拼写”的背单词网站 MVP，基于 Next.js 15、Drizzle ORM、SQLite 和 Better Auth。

## 技术栈

- Next.js 15 + TypeScript + App Router
- Tailwind CSS
- SQLite 本地存储
- Drizzle ORM
- Better Auth
- Zod

## 本地运行

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

访问 `http://localhost:3000`。

## 功能范围

- 注册 / 登录 / 退出登录
- 系统默认词库与用户自定义词库
- 手动添加单词
- 手动文本导入与 `.txt` 导入
- 听音拼写测试
- 最近学习记录
- 错词本
