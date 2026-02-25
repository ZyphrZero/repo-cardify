# Repo Cardify

<p align="center">
  <strong>几分钟内生成高质量 GitHub 社交卡片。</strong><br />
  获取仓库信息，在可视化画布中编辑每个区块，并导出 SVG / PNG / JPG。
</p>

<p align="center">
  <a href="./README.md">English</a>
</p>

<p align="center">
  <img alt="Next.js 16" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="React 19" src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" />
  <img alt="pnpm" src="https://img.shields.io/badge/Package_Manager-pnpm-f69220?logo=pnpm&logoColor=white" />
</p>

## 项目简介

Repo Cardify 是一个基于 Next.js App Router 的仓库卡片生成工具。
它通过服务端 API 代理拉取 GitHub 仓库数据，支持在画布中直接编辑布局，并以社交卡片尺寸（`1200 x 630`）导出最终图片。

## 核心能力

| 能力 | 说明 |
| --- | --- |
| 实时仓库拉取 | 支持 `owner/repo` 或 `https://github.com/owner/repo`，错误信息由 `app/api/github/route.ts` 统一映射。 |
| 可视化卡片编辑 | 头像、标题、描述、统计、徽章区块可拖拽和缩放，带吸附参考线。 |
| 丰富样式配置 | 4 种主题、6 种字体、10 种图案叠加、颜色配置，以及区块级弹层配置。 |
| 统计与语言徽章 | 可配置 Stars/Forks/Issues，语言徽章使用 GitHub API 返回的前 3 个语言。 |
| 高质量导出 | 支持 SVG、PNG、JPG；SVG 导出会嵌入字体并内联头像数据，提升可移植性。 |
| 预设工作流 | 支持 JSON 预设导入导出，运行时在 `services/presetService.ts` 做数据校验与清洗。 |
| 内置国际化 | UI 支持英文和简体中文（`i18n.ts`）。 |
| 界面主题模式 | 支持 `system`、`light`、`dark`，并持久化本地设置。 |

## 快速开始

### 环境要求

- Node.js `20+`（建议与 Next.js 16 配套）
- `pnpm`

### 安装与运行

```bash
pnpm install
pnpm dev
```

启动后访问 `http://localhost:3000`。

## 环境变量

在项目根目录创建 `.env.local`：

```bash
GITHUB_TOKEN=your_github_token
```

| 变量名 | 必填 | 用途 |
| --- | --- | --- |
| `GITHUB_TOKEN` | 否 | 提升 GitHub API 请求配额，并支持通过服务端路由访问鉴权仓库。 |

## 使用说明

1. 输入仓库地址（`owner/repo` 或 GitHub URL），点击 `Fetch`。
2. 在右侧主面板调整全局样式（`Theme`、`Typography`、`Pattern`）。
3. 点击画布中的可编辑区块，打开区块级配置（`Avatar`、`Title`、`Description`、`Stats`、`Badges`）。
4. 可按需导出当前配置为 JSON 预设，或导入已有预设。
5. 将成品导出为 `SVG`、`PNG` 或 `JPG`。

## 脚本命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务 |
| `pnpm exec eslint .` | 运行代码检查 |

## 目录结构

```text
app/
  api/github/route.ts       # GitHub 代理与错误映射
  globals.css               # 全局样式与深浅色 UI 主题
  layout.tsx                # 根布局、字体链接、Tailwind CDN
  page.tsx                  # Next.js 页面入口
components/
  CardPreview.tsx           # SVG 渲染主流程
  EditorCanvas.tsx          # 可交互拖拽/缩放编辑层
  ControlPanel.tsx          # 主样式面板与预设导入导出
  BlockPopover.tsx          # 区块级高级配置弹层
services/
  githubService.ts          # 客户端请求与头像 base64 规范化
  presetService.ts          # 预设清洗、导入、导出
  exportFontService.ts      # SVG 导出字体嵌入
App.tsx                     # 应用主流程
i18n.ts                     # 国际化文案与工具函数
types.ts                    # 共享类型与默认配置
```

## API 约定

### `GET /api/github?repo=<value>`

`repo` 支持：
- `owner/repo`
- `https://github.com/owner/repo`

返回结构：

```json
{
  "owner": "string",
  "name": "string",
  "description": "string | null",
  "stars": 0,
  "forks": 0,
  "issues": 0,
  "language": "string | null",
  "languages": ["string"],
  "avatarUrl": "string"
}
```

## 验证清单

- `pnpm build` 通过
- `pnpm exec eslint .` 无新增问题
- 手工冒烟测试：
  - 能成功获取仓库
  - 能编辑卡片样式和布局
  - 能成功导出 PNG

## 常见问题

| 问题 | 可能原因 | 处理方式 |
| --- | --- | --- |
| `GitHub API rate limit exceeded` | 未配置 Token 或未鉴权请求配额较低 | 在 `.env.local` 配置 `GITHUB_TOKEN` |
| 导出中头像未内联 | 远程头像拉取失败或 CORS 回退异常 | 检查网络后重试，或手动上传自定义 Logo |
| 导出字体与预期不一致 | 字体嵌入请求失败 | 检查到 `unpkg.com` 的网络连通性并重试 |

## 安全建议

- `GITHUB_TOKEN` 仅在服务端使用（`app/api/github/route.ts`）。
- 不要提交 `.env.local` 或任何密钥文件。
- 仅授予满足需求的最小 GitHub Token 权限。
