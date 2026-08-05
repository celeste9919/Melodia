# Melodia 技术规范文档

## 1. 技术栈

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 构建工具 | Vite | latest | 快速开发服务器和构建 |
| 框架 | React | 18.x | UI 框架 |
| 语言 | TypeScript | 5.x | 类型安全 |
| 样式 | Tailwind CSS | 3.x | 实用优先的 CSS 框架 |
| 国际化 | react-i18next | latest | 中英文切换 |
| 音频合成 | Tone.js | latest | Web Audio 合成框架 |
| MIDI | midi-writer-js | latest | MIDI 文件生成 |
| 路由 | react-router-dom | latest | 页面路由 |

## 2. 编码规范

### 命名规范

- **组件名**: PascalCase（`InputPanel.tsx`, `MusicOrchestrator.ts`）
- **普通函数/变量**: camelCase
- **类型/接口**: PascalCase（`MusicGenerateRequest`）
- **常量**: UPPER_SNAKE_CASE
- **文件命名**: 组件文件与组件名一致
- **CSS 类名**: Tailwind 实用类优先，自定义类用 kebab-case

### 目录规范

- `src/modules/` — 业务页面模块，每个模块一个子目录
- `src/services/` — 服务层，每个服务一个子目录
- `src/components/` — 通用 UI 组件
- `src/components/ui/` — 基础 UI 原子组件
- `src/hooks/` — 自定义 React Hooks
- `src/types/` — TypeScript 类型定义
- `src/i18n/` — 国际化配置

### 组件结构

```
CompName/
├── CompName.tsx       # 主组件
├── CompName.test.tsx  # 测试（后期添加）
└── SubComponent.tsx   # 子组件（可选）
```

对于简单模块，直接用单文件。

### 代码注释

- 代码中用英文
- 关键业务逻辑处用中文注释说明 WHY
- React 组件用英文命名和 props 类型
- 对外接口（公共方法/组件 props）需要有中文说明此接口用途

## 3. 项目配置规范

### Vite 配置

- 开发服务器端口：5173（默认）
- 代理 API 请求到 DeepSeek 端点

### TypeScript 配置

- strict 模式
- 路径别名 `@/` 映射到 `src/`

### Tailwind 配置

- 深色模式基于 class
- 自定义颜色使用 CSS 变量（支持动态主题切换）
- 自定义主题通过注入 CSS 变量实现

## 4. AI 集成规范

### DeepSeek API
- 端点：`https://api.deepseek.com/v1/chat/completions`
- 模型：`deepseek-chat`
- 调用方式：前端直连（用户自行配置 API Key，存储在浏览器本地）
- 错误处理：API Key 无效、网络错误、超时、限流

### Prompt 设计规范
- 输出格式为 JSON，确保可解析
- 包含明确的输出 schema 指令
- 音乐参数必须包含：bpm, key, chords[], melody[], style, duration
- 参数使用 MIDI 标准（音高 0-127，力度 0-127）

### 严禁行为
- ❌ 硬编码假数据作为"示例结果"
- ❌ mock API 返回
- ❌ 随机生成结果冒充 AI 输出
- ❌ 默认启用 mock 模式
- ✅ 允许空状态、加载状态、错误状态
- ✅ 缺失 API Key 时显示配置提示

## 5. 音频规范

### Tone.js 合成
- 主旋律用 Synth（或 PolySynth）
- 和弦用 PolySynth
- 贝斯用 MonoSynth
- 鼓点用 MembraneSynth / MetalSynth（后期）
- 音色参数通过 AI 输出的风格信息动态调整

### 导出规范
- WAV: 44100Hz, 16bit, 立体声
- MIDI: 标准 MIDI 格式 1，包含 tempo、音轨、音符事件

## 6. 浏览器兼容

- 目标：现代浏览器（Chrome, Firefox, Edge, Safari 最新版）
- Web Audio API 在 iOS Safari 需要用户手势触发
- IndexedDB 在所有现代浏览器中均可用
- LocalStorage 存储上限约 5-10MB，大音频数据用 IndexedDB

## 7. 性能考虑

- 音频合成在 Web Worker 中执行（避免阻塞 UI）
- 历史记录中的音频数据使用 IndexedDB 存储 Blob
- 大文件导出使用 Blob URL，避免内存占用
- 生成过程中显示进度反馈

## 8. 安全考虑

- 用户 API Key 仅存储在浏览器 LocalStorage
- 不将 API Key 发送到除 AI 服务外的第三方
- 不记录用户输入的 prompt 到外部服务
- MIDI/WAV 导出仅在前端完成，不上传服务器
