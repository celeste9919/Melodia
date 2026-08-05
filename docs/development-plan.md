# Melodia 开发步骤规划

## 总阶段

项目分 **4 个阶段** 执行，每个阶段内部再分步骤，每步都有验收标准和 run-check。

---

## 阶段 1：项目初始化与基础设施

**目标**：搭好项目框架，确保可以正常开发

| 步骤 | 内容 | 关键文件 |
|------|------|---------|
| 1.1 | Vite + React + TypeScript 初始化 | vite.config.ts, package.json, tsconfig.json |
| 1.2 | 安装核心依赖（Tailwind, react-i18next, Tone.js 等） | package.json |
| 1.3 | 配置 Tailwind（深色模式、CSS 变量） | tailwind.config.ts, index.css |
| 1.4 | 配置路径别名 `@/` | vite.config.ts, tsconfig.json |
| 1.5 | i18n 配置 + 中英文翻译文件框架 | src/i18n/, public/locales/ |
| 1.6 | 基础布局组件（AppShell + Header + 页面路由） | src/App.tsx, src/components/layout/ |
| 1.7 | 深色/浅色/跟随系统主题切换 | src/services/theme/ |
| 1.8 | 初始化构建验证 | 运行 `npm run dev` 确认正常 |

**验收标准**：`npm run dev` 启动成功，能看到基础布局，中英文切换正常工作，主题切换正常工作

---

## 阶段 2：核心服务层

**目标**：完成所有服务模块，可独立测试

| 步骤 | 内容 | 关键文件 |
|------|------|---------|
| 2.1 | StorageService（LocalStorage + IndexedDB 封装） | src/services/storage/ |
| 2.2 | ConfigService（API Key、模型、主题等配置管理） | src/services/config/ |
| 2.3 | AIClient（DeepSeek API 调用 + 错误处理） | src/services/ai/ |
| 2.4 | PromptBuilder（构建 AI prompt + 输出格式指令） | src/services/prompt/ |
| 2.5 | AudioEngine（Tone.js 音乐合成 + 播放控制） | src/services/audio/ |
| 2.6 | MusicOrchestrator（编排整个生成流程） | src/services/orchestrator/ |
| 2.7 | ExportService（WAV/MIDI 导出） | src/services/export/ |
| 2.8 | HistoryService（生成记录管理） | src/services/history/ |

**验收标准**：服务层可在 Storybook 或通过 console 调用验证

---

## 阶段 3：UI 业务模块

**目标**：完成所有用户界面，V1 功能可用

| 步骤 | 内容 | 关键文件 |
|------|------|---------|
| 3.1 | 基础 UI 组件库（Button, Input, Select, Modal） | src/components/ui/ |
| 3.2 | InputPanel 页面（文字/歌词输入 + 风格选择 + 参数调节） | src/modules/input/ |
| 3.3 | ResultPanel 页面（播放控制 + 音乐参数展示） | src/modules/result/ |
| 3.4 | 音乐可视化（简单波形/音符动画） | src/modules/result/ |
| 3.5 | 设置页面（API Key 配置 + 模型切换 + 语言/主题选择） | src/modules/settings/ |
| 3.6 | 历史记录页面 | src/modules/history/ |
| 3.7 | 主题自定义（图片导入 + 配色提取） | src/modules/theme/ |
| 3.8 | 路由整合 + 页面联动 | src/App.tsx |

**验收标准**：完整 UI 可操作，输入→生成→播放→导出的全链路跑通

---

## 阶段 4：打磨与收尾

| 步骤 | 内容 |
|------|------|
| 4.1 | 错误处理完善（所有异常状态 UI） |
| 4.2 | 加载状态和空状态补充 |
| 4.3 | 响应式适配（移动端可用） |
| 4.4 | 导出质量优化（WAV/MIDI 兼容性） |
| 4.5 | 性能优化（Web Worker 合成） |
| 4.6 | 最终自测与 Bug 修复 |

**验收标准**：应用完整可用，无明显 bug，风格统一

---

## 开发流程规范

### 每一步的执行规范
1. 读取当前步骤对应的 docs 文档
2. 了解需要创建/修改的文件
3. 执行编码
4. 运行 `npm run dev` 启动开发服务器验证
5. 运行 `npm run build` 确保无编译错误
6. 填写今日开发日志

### 当步骤失败时
- 编译错误 → 修正后重试
- 功能不符合预期 → 回顾需求文档修正
- 遇到阻塞性问题 → 在日志中记录并询问用户

### 日志记录规范
每天开发结束前：
1. 记录今日完成事项
2. 记录今日遇到问题及解决方案
3. 更新明日待办事项
4. 确保 `npm run dev` 和 `npm run build` 通过
