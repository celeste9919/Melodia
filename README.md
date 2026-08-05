# Melodia

AI 音乐创作工具 — 用文字描述或歌词输入，通过 DeepSeek API 生成音乐参数，Tone.js 在浏览器端实时合成音频。

## 功能特性

- **文字生成音乐** — 描述场景或情绪，AI 自动谱曲
- **歌词谱曲** — 输入歌词，AI 生成旋律与和弦
- **7 种风格预设** — 电子、古典、爵士、流行、摇滚、Lo-Fi、氛围
- **实时播放** — 基于 Tone.js 的浏览器端合成（播放/暂停/停止）
- **WAV/MIDI 导出** — 将创作下载为音频或 MIDI 文件
- **音乐可视化** — 和弦走向展示、音符密度视图、五线谱渲染
- **主题切换** — 深色/浅色/跟随系统，支持图片导入提取配色
- **中英文双语** — 界面语言随时切换
- **桌面客户端** — Electron 打包，支持 Windows（NSIS 安装包）和 macOS（DMG）

## 快速开始

### Web 版

```bash
npm install
npm run dev      # 访问 http://localhost:5173
```

### 桌面版

```bash
npm run electron:dev       # 开发模式
npm run electron:build:win # 构建 Windows 安装包
npm run electron:build:mac # 构建 macOS 安装包
```

## 使用说明

1. 打开「设置」页面
2. 填入你的 **DeepSeek API Key**（也支持 OpenAI 或自定义接口）
3. 选择模型和语言偏好
4. 进入「创作」页面，输入音乐描述或歌词，点击生成
5. 在结果页播放、试听，满意后导出 WAV 或 MIDI

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript |
| 构建 | Vite |
| 样式 | Tailwind CSS |
| 音频合成 | Tone.js |
| 乐谱渲染 | VexFlow |
| 国际化 | react-i18next |
| 桌面端 | Electron |

## 架构说明

纯前端项目，无后端服务。用户配置和主题存 localStorage，生成历史存 IndexedDB。AI API 调用直接从浏览器发送到 DeepSeek/OpenAI 端点。

详细模块契约和数据流见 [docs/architecture.md](docs/architecture.md)。

## 目录结构

```
src/
├── components/ui/    # 通用 UI 组件（Button、Modal 等）
├── modules/          # 业务模块
│   ├── input/        # 音乐生成输入面板
│   ├── result/       # 播放控制 + 可视化
│   ├── history/      # 生成历史记录
│   ├── settings/     # API Key、模型、偏好设置
│   └── theme/        # 自定义主题（图片取色）
├── services/         # 核心服务层
│   ├── ai/           # DeepSeek API 客户端
│   ├── audio/        # Tone.js 合成引擎
│   ├── config/       # 用户配置管理
│   ├── export/       # WAV/MIDI 导出
│   ├── history/      # IndexedDB 存储
│   ├── orchestrator/ # 生成流程编排
│   ├── prompt/       # AI 提示词构建
│   ├── storage/      # LocalStorage + IndexedDB 封装
│   └── theme/        # 主题管理
└── types/            # 共享 TypeScript 类型定义
```

## License

MIT
