# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
pnpm install       # 安装依赖
pnpm dev           # 启动开发服务器 (http://localhost:3000)
pnpm build         # 构建生产版本
pnpm start         # 运行生产服务器
pnpm exec eslint . # 运行代码检查
```

## Project Overview

Repo Cardify 是一个 Next.js 16 App Router 项目，用于生成 GitHub 仓库的社交卡片（1200x630），支持 SVG/PNG/JPG/WEBP 导出和 README 嵌入。

## Architecture

### Data Flow
1. 用户输入 `owner/repo` 或 GitHub URL
2. 通过 `/api/github` 服务端代理获取仓库元数据
3. `App.tsx` 管理全局状态（repoData, config, locale, uiTheme）
4. `CardSvg.tsx` 渲染 SVG 卡片，客户端预览和服务器端图片路由共用同一组件
5. 导出时将 SVG 转为 Canvas 再输出为光栅格式

### Key Components

| 文件 | 职责 |
|------|------|
| `App.tsx` | 主应用组件，管理所有状态和用户交互 |
| `components/CardSvg.tsx` | 核心 SVG 渲染器，支持客户端和服务端 |
| `components/EditorCanvas.tsx` | 可拖拽/调整大小的编辑画布层 |
| `components/ControlPanel.tsx` | 右侧样式控制面板 |
| `components/BlockPopover.tsx` | 区块特定的弹出控制 |
| `types.ts` | 共享类型定义和默认配置 |

### Services

| 文件 | 职责 |
|------|------|
| `services/githubService.ts` | 客户端仓库数据获取 |
| `services/presetService.ts` | 预设配置导入/导出（带运行时净化） |
| `services/shareImageService.ts` | 分享链接配置编码/解码 |
| `services/exportFontService.ts` | SVG 导出字体嵌入 |
| `services/logoStorageService.ts` | 自定义 Logo 存储 |

### API Routes

| 端点 | 说明 |
|------|------|
| `app/api/github/route.ts` | GitHub API 代理，支持 `?repo=` 参数 |
| `app/[owner]/[name]/image/route.ts` | 可分享的图片端点，支持 `?c=` 压缩配置和 `?l=` 语言 |
| `app/api/logo/route.ts` | 自定义 Logo 上传端点 |
| `app/api/logo/[logoId]/route.ts` | 已存储 Logo 文件服务 |

### Environment Variables

| 变量 | 必填 | 用途 |
|------|------|------|
| `GITHUB_TOKEN` | 否 | 提高 GitHub API 速率限制 |
| `LOGO_STORAGE_DIR` | 否 | 自定义 Logo 存储目录，默认 `.repo-cardify/logos` |

## Card Configuration Structure (`types.ts`)

配置通过 `CardConfig` 接口管理：
- `theme`: 主题 (gradient/solid/simple/dark)
- `font`: 字体 (inter/mono/serif/poppins/playfair/oswald)
- `pattern`: 背景图案 (10 种预设)
- `colors`: background/accent 颜色
- `avatar`: 头像配置 (形状/大小/可见性)
- `stats`: 统计配置 (stars/forks/issues 显示及样式)
- `badge`: 语言标签配置
- `text`: 标题/描述/所有者显示配置
- `layout`: 5 个可拖拽区块的坐标和尺寸
- `customLogo`: 自定义 Logo URL

## Canvas Dimensions

- 导出尺寸: 1200 x 630 (社交媒体标准)
- 5 个布局区块: avatar, title, description, stats, badges

## i18n

UI 支持英语和简体中文，通过 `i18n.ts` 管理。`I18nContext.tsx` 提供 React Context。
