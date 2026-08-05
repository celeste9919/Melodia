# Melodia - CLAUDE.md

## 项目概述

Melodia 是一个 AI 音乐生成 Web 工具，用户通过文字描述或歌词输入，由 DeepSeek API 生成音乐参数，Tone.js 在浏览器端合成音频。

## 文档索引

| 文档 | 路径 | 内容 |
|------|------|------|
| 需求规格书 | [docs/requirements.md](docs/requirements.md) | 功能需求、用户画像、V1/P0-P1 定义 |
| 架构设计 | [docs/architecture.md](docs/architecture.md) | 模块契约、数据结构、数据流、扩展影响 |
| 技术规范 | [docs/tech-stack.md](docs/tech-stack.md) | 技术栈版本、编码规范、AI/音频规范 |
| 开发步骤规划 | [docs/development-plan.md](docs/development-plan.md) | 4 阶段 21 步详细开发计划 |
| 开发日志 | [dev-logs/](dev-logs/) | 每日开发日志目录 |

## 核心约束

- **纯前端项目**：V1 无后端服务，数据存浏览器本地
- **真实 AI 路径**：不 mock、不硬编码假数据、不随机生成
- **用户自备 API Key**：默认 DeepSeek，可在设置中切换
- **浏览器合成**：音频由 Tone.js 合成，非真实乐器采样

## 开发工作流

1. 阅读 [docs/development-plan.md](docs/development-plan.md) 了解当前阶段
2. 按步骤顺序执行，每一步完成后运行 `npm run dev` 和 `npm run build`
3. 每天开发结束前记录日志到 `dev-logs/{日期}.md`
4. 编译失败时修正后继续，功能不符合预期时回顾需求文档
5. 遇到阻塞性问题在日志中记录并询问用户

## 运行命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 生产构建
npm run preview  # 预览构建结果
```

## 技术栈

Vite + React 18 + TypeScript + Tailwind CSS + Tone.js + react-i18next

## 编码说明

- 代码注释用英文，关键业务逻辑用中文注释 WHY
- 组件/变量命名：PascalCase（组件）、camelCase（函数/变量）
- 目录结构遵循 [docs/architecture.md](docs/architecture.md)
