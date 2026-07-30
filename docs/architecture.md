# AI Music Studio 架构设计文档

## 1. 架构原则

- **责任完整，不是技术复杂**：覆盖所有必要职责层，但不引入企业级复杂度
- **模块化单体**：单仓库、单应用、清晰模块边界、显式接口契约
- **前端为主**：V1 纯前端，数据存浏览器本地，无后端服务
- **真实 AI 路径**：不 mock，不给假数据

## 2. 架构总览

```
┌─────────────────────────────────────────────────┐
│                   AppShell                       │
│  (布局框架、深色/浅色主题、语言切换、主题自定义)    │
├─────────────────────────────────────────────────┤
│                                                   │
│  ┌──────────────┐    ┌──────────────────────────┐ │
│  │  InputPanel   │    │     ResultPanel          │ │
│  │  - 文字输入    │───→│  - 播放控制              │ │
│  │  - 歌词输入    │    │  - 音乐可视化            │ │
│  │  - 风格选择    │    │  - 生成参数展示          │ │
│  │  - 参数调节    │    └──────────┬───────────────┘ │
│  └──────┬───────┘               │                   │
│         │                       ▼                   │
│         │              ┌────────────────┐           │
│         │              │  ExportService  │           │
│         │              │  - WAV 导出     │           │
│         │              │  - MIDI 导出    │           │
│         │              └────────────────┘           │
│         │                       ▲                   │
│         ▼                       │                   │
│  ┌─────────────────────────────────────────┐        │
│  │          MusicOrchestrator              │        │
│  │  (编排: 参数生成 → 音频合成 → 结果返回) │        │
│  └────────┬──────────────┬────────────────┘         │
│           │              │                          │
│           ▼              ▼                          │
│  ┌──────────────┐  ┌──────────────────┐             │
│  │  PromptBuilder│  │  AudioEngine     │            │
│  │  构建 AI 请求 │  │  Tone.js 合成    │            │
│  └──────┬───────┘  └──────────────────┘             │
│         │                                            │
│         ▼                                            │
│  ┌──────────────────┐                               │
│  │   AIClient       │                               │
│  │  DeepSeek API 调用│                               │
│  └──────────────────┘                               │
│                                                       │
│  ┌─────────────────────────────────────────┐          │
│  │  ConfigService                          │         │
│  │  - API Key 管理 / 模型切换 / 主题设置    │         │
│  └─────────────────────────────────────────┘          │
│                                                       │
│  ┌─────────────────────────────────────────┐          │
│  │  StorageService / HistoryService        │         │
│  │  - 本地存储 / 生成历史记录              │         │
│  └─────────────────────────────────────────┘          │
│                                                       │
└───────────────────────────────────────────────────────┘
```

## 3. 核心模块契约

### Module: AppShell

- **Responsibility**: 应用布局框架，管理全局状态（主题、语言），加载配置
- **Non-responsibility**: 不处理 AI 调用，不管理音乐播放
- **Input**: 无（启动时自动加载 ConfigService）
- **Output**: 子组件渲染上下文（主题 class、语言 locale）
- **Public interface**: `<AppShell />` 根组件
- **Hidden internals**: 主题切换实现、CSS 变量管理
- **Dependencies**: ConfigService, I18nService
- **Extension points**: 新增页面/路由时只需添加新路由配置
- **Run focus**: 主题切换、语言切换、图片导入主题功能可正常工作

### Module: InputPanel

- **Responsibility**: 收集用户输入：文字 prompt、歌词文本、风格选择、参数调节
- **Non-responsibility**: 不验证输入（交给验证层），不调用 AI，不生成音乐
- **Input**: 风格预设列表、用户交互事件
- **Output**: `MusicGenerateRequest` 对象
- **Public interface**: `onSubmit(request: MusicGenerateRequest) => void`
- **Hidden internals**: 输入表单状态、组件内部布局
- **Dependencies**: 无（纯 UI 组件）
- **Extension points**: 新增输入方式（如录音、文件上传）只需添加新的输入组件
- **Run focus**: 输入数据正确性、表单状态转换

### Module: MusicOrchestrator

- **Responsibility**: 编排音乐生成流程：验证输入 → 构建 prompt → 调用 AI → 解析结果 → 合成音频
- **Non-responsibility**: 不直接调用 API，不直接操作音频
- **Input**: `MusicGenerateRequest`
- **Output**: `MusicGenerateResult`（音符号/和弦/参数 + 已合成的 AudioBuffer）
- **Public interface**: `generate(request: MusicGenerateRequest) => Promise<MusicGenerateResult>`
- **Hidden internals**: 编排流程、重试逻辑、超时处理
- **Dependencies**: InputValidator, PromptBuilder, AIClient, AudioEngine
- **Extension points**: 新增生成模式（如"纯音乐"、"歌曲"）通过扩展 PromptBuilder 实现
- **Run focus**: 整体流程跑通、错误传递正确、超时处理

### Module: PromptBuilder

- **Responsibility**: 根据用户输入和风格预设构建发送给 AI 的 prompt
- **Non-responsibility**: 不调用 AI，不解析 AI 输出
- **Input**: `MusicGenerateRequest`
- **Output**: 格式化后的 AI prompt 字符串（包含输出格式指令）
- **Public interface**: `buildPrompt(request: MusicGenerateRequest) => string`
- **Hidden internals**: prompt 模板管理、风格→prompt 映射规则
- **Dependencies**: ConfigService（获取当前语言）
- **Extension points**: 新增风格只需添加模板映射；新增输出格式指令通过修改模板实现
- **Run focus**: 预设风格能生成正确的 prompt 参数（BPM、调性、和弦等）

### Module: AIClient

- **Responsibility**: 调用 DeepSeek API（或其他配置的 LLM），处理 API 错误
- **Non-responsibility**: 不构建 prompt，不解析结果
- **Input**: prompt 字符串 + 可选的模型配置
- **Output**: AI 原始响应字符串
- **Public interface**: `call(prompt: string, config?: ModelConfig) => Promise<string>`
- **Hidden internals**: HTTP 请求实现、重试策略、错误映射
- **Dependencies**: ConfigService（获取 API Key、模型名）
- **Extension points**: 新增模型提供商只需添加新的 provider 适配器
- **Run focus**: API 调用成功、API Key 缺失提示、网络错误处理

### Module: AudioEngine

- **Responsibility**: 根据音乐参数使用 Tone.js 合成音频，提供播放控制
- **Non-responsibility**: 不生成音乐参数，不处理 AI 相关逻辑
- **Input**: `MusicParams`（BPM、调性、和弦、旋律音符序列等）
- **Output**: `AudioPlayback` 对象（播放/暂停/停止）+ WAV 导出数据
- **Public interface**: 
  - `synthesize(params: MusicParams) => Promise<AudioPlayback>`
  - `exportWav(playback: AudioPlayback) => Promise<Blob>`
- **Hidden internals**: Tone.js 合成器链、音色配置、播放状态管理
- **Dependencies**: 无内部依赖（工具模块）
- **Extension points**: 换音色库（如真实乐器采样）只需替换合成器配置
- **Run focus**: 不同参数能生成不同声音、播放控制正常、导出 WAV 可播放

### Module: ResultPanel

- **Responsibility**: 展示生成结果：播放控制、音乐参数信息（BPM/调性/和弦）、加载/错误/空状态
- **Non-responsibility**: 不合成音频，不导出文件
- **Input**: `MusicGenerateResult`
- **Output**: 用户交互事件（播放、暂停、导出等）
- **Public interface**: `onExport(type: 'wav' | 'midi') => void`
- **Hidden internals**: 播放器 UI 状态、进度条
- **Dependencies**: AudioEngine（通过父组件传递）
- **Extension points**: 新增乐谱显示、波形显示等通过扩展展示区域实现
- **Run focus**: 三种状态（空/加载/结果）显示正确、播放控制流畅

### Module: ExportService

- **Responsibility**: 导出 WAV 和 MIDI 文件，触发浏览器下载
- **Non-responsibility**: 不合成音频（WAV 由 AudioEngine 提供），不展示 UI
- **Input**: 导出类型 + 相关数据（AudioBuffer / MIDI 事件）
- **Output**: 触发浏览器文件下载
- **Public interface**: 
  - `exportWav(audioBuffer: AudioBuffer, filename: string) => void`
  - `exportMidi(midiEvents: MidiEvent[], filename: string) => void`
- **Hidden internals**: 文件格式编码细节、Blob URL 管理
- **Dependencies**: 无（纯工具模块）
- **Extension points**: 新增导出格式（如 MP3、OGG）只需添加新方法
- **Run focus**: 导出文件可播放、文件名正确、大文件导出不卡 UI

### Module: ConfigService

- **Responsibility**: 管理用户配置（API Key、模型选择、语言、主题偏好）
- **Non-responsibility**: 不管理生成历史，不管理应用运行时状态
- **Input**: 读写请求
- **Output**: 配置值
- **Public interface**: 
  - `get(key: ConfigKey) => ConfigValue`
  - `set(key: ConfigKey, value: ConfigValue) => void`
  - `subscribe(key: ConfigKey, callback) => void`
- **Hidden internals**: 存储实现（LocalStorage）、默认值管理
- **Dependencies**: StorageService
- **Extension points**: 新增配置项只需添加新的 key 和默认值
- **Run focus**: 配置读写正确、持久化生效、缺少 API Key 时提示

### Module: StorageService

- **Responsibility**: 浏览器本地存储（LocalStorage + IndexedDB）的封装
- **Non-responsibility**: 不关心存储内容含义
- **Input**: key + value
- **Output**: value
- **Public interface**: `getItem`, `setItem`, `removeItem`, `clear`
- **Hidden internals**: IndexedDB 连接管理、LocalStorage 封装
- **Dependencies**: 无
- **Extension points**: 增加远程存储（如 Supabase）通过实现同一接口
- **Run focus**: 读写持久化、JSON 序列化/反序列化

### Module: HistoryService

- **Responsibility**: 管理生成历史记录的增删改查
- **Non-responsibility**: 不管理配置，不关心音乐生成
- **Input**: 历史记录 CRUD 操作
- **Output**: 历史记录列表
- **Public interface**: 
  - `getAll() => HistoryItem[]`
  - `add(item: HistoryItem) => void`
  - `delete(id: string) => void`
  - `clear() => void`
- **Hidden internals**: 存储结构、排序逻辑
- **Dependencies**: StorageService
- **Extension points**: 新增搜索/过滤功能不影响其他模块
- **Run focus**: CRUD 正确、数据持久化

### Module: I18nService

- **Responsibility**: 提供中英文切换能力
- **Non-responsibility**: 不管理其他配置
- **Input**: 语言标识（'zh' | 'en'）
- **Output**: 翻译函数 `t(key: string) => string`
- **Public interface**: 
  - `setLanguage(lang: Lang) => void`
  - `t(key: string, params?) => string`
  - `useTranslation() => { t, lang, setLanguage }`
- **Hidden internals**: 翻译文件加载、语言检测
- **Dependencies**: React i18next
- **Extension points**: 新增语言只需添加翻译文件
- **Run focus**: 切换语言后 UI 更新、翻译键值完整

### Module: ThemeService

- **Responsibility**: 管理深色/浅色主题切换，支持图片导入生成自定义配色
- **Non-responsibility**: 不管理其他 UI 设置
- **Input**: 主题模式（'dark' | 'light' | 'system'）、图片文件（可选）
- **Output**: CSS 变量集
- **Public interface**:
  - `setMode(mode: ThemeMode) => void`
  - `applyCustomTheme(imageFile: File) => Promise<ThemeColors>`
  - `resetTheme() => void`
- **Hidden internals**: 颜色提取算法、CSS 变量注入
- **Dependencies**: ConfigService
- **Extension points**: 新增主题来源（如预设主题包）只需扩展
- **Run focus**: 深浅切换、图片导入后颜色提取、重置恢复

## 4. 数据结构定义

```typescript
// 用户输入
interface MusicGenerateRequest {
  mode: 'text' | 'lyrics';
  prompt?: string;        // 文字描述
  lyrics?: string;         // 歌词
  style: string;           // 风格预设 ID
  tempo?: number;          // BPM（可选，自动推荐）
  key?: string;            // 调性（可选，自动推荐）
  duration: number;        // 时长（秒），默认 30
}

// 音乐参数（AI 输出）
interface MusicParams {
  bpm: number;
  key: string;
  scale: 'major' | 'minor';
  chords: Chord[];
  melody: Note[];
  bass?: Note[];
  style: string;
  duration: number;
}

interface Chord {
  time: number;      // 起始拍
  root: string;      // C, D, E...
  quality: string;   // maj, min, dim, aug, 7...
  duration: number;  // 持续拍数
}

interface Note {
  time: number;      // 起始拍
  pitch: number;     // MIDI 音高 (60 = C4)
  velocity: number;  // 力度 0-127
  duration: number;  // 持续拍数
}

// 生成结果
interface MusicGenerateResult {
  id: string;
  params: MusicParams;
  audioBuffer?: AudioBuffer;
  midiEvents: MidiEvent[];
  createdAt: string;
  request: MusicGenerateRequest;
}

// 历史记录
interface HistoryItem {
  id: string;
  request: MusicGenerateRequest;
  params: MusicParams;
  audioData?: ArrayBuffer;  // 缓存的音频数据
  createdAt: string;
}

// 配置
interface AppConfig {
  apiKey: string;
  modelProvider: 'deepseek' | 'openai' | 'custom';
  modelName: string;
  apiEndpoint?: string;
  language: 'zh' | 'en';
  themeMode: 'dark' | 'light' | 'system';
  customTheme?: ThemeColors;
}

// 导出事件
interface MidiEvent {
  type: 'noteOn' | 'noteOff' | 'tempo' | 'timeSignature';
  time: number;
  data: Record<string, number>;
}
```

## 5. 目录结构

```
music_app/
├── public/
│   └── locales/           # 国际化翻译文件
│       ├── zh/
│       │   └── translation.json
│       └── en/
│           └── translation.json
├── src/
│   ├── components/         # 通用 UI 组件
│   │   ├── ui/            # 基础 UI（Button, Input, Select...）
│   │   └── layout/        # 布局组件（Header, Sidebar, Main）
│   ├── modules/           # 业务模块
│   │   ├── input/         # InputPanel 及相关
│   │   ├── result/        # ResultPanel 及相关
│   │   ├── history/       # 历史记录
│   │   ├── settings/      # 设置页面
│   │   └── theme/         # 主题自定义
│   ├── services/          # 服务层
│   │   ├── orchestrator/  # MusicOrchestrator
│   │   ├── ai/            # AIClient
│   │   ├── audio/         # AudioEngine
│   │   ├── export/        # ExportService
│   │   ├── prompt/        # PromptBuilder
│   │   ├── storage/       # StorageService
│   │   ├── history/       # HistoryService
│   │   ├── config/        # ConfigService
│   │   └── theme/         # ThemeService
│   ├── types/             # TypeScript 类型定义
│   │   └── index.ts
│   ├── i18n/              # i18n 配置
│   ├── hooks/             # 自定义 hooks
│   ├── App.tsx
│   ├── App.css
│   ├── index.css          # Tailwind + CSS 变量
│   └── main.tsx
├── docs/                  # 项目文档
├── dev-logs/              # 开发日志
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── package.json
└── CLAUDE.md
```

## 6. 数据流

```
User Input (InputPanel)
    │
    ▼
MusicGenerateRequest
    │
    ▼
MusicOrchestrator.generate()
    │
    ├─ 1. InputValidator.validate(request)
    │
    ├─ 2. PromptBuilder.buildPrompt(request)
    │      → 包含输出格式指令的 AI prompt
    │
    ├─ 3. AIClient.call(prompt)
    │      → DeepSeek API
    │      → 返回 JSON 格式音乐参数
    │
    ├─ 4. 解析 AI 响应 → MusicParams
    │
    ├─ 5. AudioEngine.synthesize(params)
    │      → Tone.js 合成 → AudioBuffer
    │
    ├─ 6. 保存历史记录 (HistoryService)
    │
    └─ 7. 返回 MusicGenerateResult → ResultPanel
                                      │
                                      ├─ 用户播放 → AudioEngine.play()
                                      ├─ 导出 WAV → ExportService.exportWav()
                                      └─ 导出 MIDI → ExportService.exportMidi()
```

## 7. 扩展影响说明

| 后期功能 | 影响模块 | 不受影响模块 |
|---------|---------|------------|
| 用户登录 | 新增 AuthService, StorageService 扩展 | 所有 UI、音频、导出模块 |
| 五线谱可视化 | ResultPanel 扩展、新增 ScoreRenderer | 输入、服务层不变 |
| AI 人声演唱 | AudioEngine 扩展、PromptBuilder 扩展 | 输入、导出、历史不变 |
| 社区分享 | 新增 ShareService | 核心生成流程不变 |
| 批量生成 | InputPanel 扩展、Orchestrator 适配 | 音频、导出不变 |
| 音轨编辑 | AudioEngine 扩展、新增 TrackEditor | 输入、AI 调用不变 |
| 参考音频上传 | InputPanel 扩展、PromptBuilder 扩展 | 音频合成、导出不变 |

## 8. 责任完整性检查

| 职责层 | 覆盖模块 | 状态 |
|--------|---------|------|
| 页面/UI 层 | AppShell, InputPanel, ResultPanel, Settings | ✅ |
| 用户输入层 | InputPanel | ✅ |
| 验证层 | MusicOrchestrator（内部校验） | ✅ |
| 业务编排层 | MusicOrchestrator | ✅ |
| Prompt 管理层 | PromptBuilder | ✅ |
| AI 调用层 | AIClient | ✅ |
| 结果解析层 | MusicOrchestrator（内部解析） | ✅ |
| 数据结构层 | types/index.ts | ✅ |
| 结果展示层 | ResultPanel | ✅ |
| 导出层 | ExportService | ✅ |
| 错误处理层 | 各模块内部 + 全局 ErrorBoundary | ✅ |
| 配置层 | ConfigService | ✅ |
| UI 语言和样式层 | I18nService, ThemeService | ✅ |
| 扩展点层 | 模块契约中的扩展说明 | ✅ |
| 持久化层 | StorageService, HistoryService | ✅ |
