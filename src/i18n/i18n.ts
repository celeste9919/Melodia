import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// 翻译文件在 public/locales 目录，通过 fetch 加载
i18n.use(initReactI18next).init({
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
  resources: {
    zh: {
      translation: {
        // App shell
        'app.title': 'AI 音乐工坊',
        'app.tagline': '用 AI 创作独一无二的音乐',

        // Navigation
        'nav.create': '创作',
        'nav.history': '历史',
        'nav.settings': '设置',
        'nav.theme': '主题',

        // Input panel
        'input.mode.text': '文字描述',
        'input.mode.lyrics': '歌词谱曲',
        'input.prompt.placeholder': '描述你想要的音乐... 例如：一首轻快的钢琴曲，夏日清晨的感觉',
        'input.lyrics.placeholder': '在此输入歌词...',
        'input.style.label': '音乐风格',
        'input.style.pop': '流行',
        'input.style.classical': '古典',
        'input.style.electronic': '电子',
        'input.style.jazz': '爵士',
        'input.style.rock': '摇滚',
        'input.style.lofi': 'Lo-Fi',
        'input.style.ambient': '氛围',
        'input.tempo.label': '速度 (BPM)',
        'input.key.label': '调性',
        'input.duration.label': '时长（秒）',
        'input.submit': '生成音乐',
        'input.submitting': '正在生成...',

        // Result panel
        'result.empty.title': '等待创作',
        'result.empty.desc': '在左侧输入你的音乐灵感，点击生成',
        'result.loading': 'AI 正在为你创作音乐...',
        'result.play': '播放',
        'result.pause': '暂停',
        'result.stop': '停止',
        'result.restart': '重新播放',
        'result.download.wav': '下载 WAV',
        'result.download.midi': '下载 MIDI',
        'result.params.bpm': '速度',
        'result.params.key': '调性',
        'result.params.style': '风格',
        'result.params.major': '大调',
        'result.params.minor': '小调',
        'result.chord.label': '和弦走向',

        // History
        'history.title': '生成历史',
        'history.empty': '还没有生成记录',
        'history.delete': '删除',
        'history.clear': '清空全部',
        'history.search': '搜索历史记录',

        // Settings
        'settings.title': '设置',
        'settings.api.title': 'API 配置',
        'settings.api.key': 'API Key',
        'settings.api.key.placeholder': '输入你的 API Key',
        'settings.api.provider': '模型提供商',
        'settings.api.model': '模型名称',
        'settings.api.endpoint': 'API 端点（可选，自定义配置）',
        'settings.language.title': '界面语言',
        'settings.theme.title': '主题模式',
        'settings.theme.dark': '深色',
        'settings.theme.light': '浅色',
        'settings.theme.system': '跟随系统',
        'settings.theme.custom': '自定义主题',
        'settings.provider.deepseek': 'DeepSeek',
        'settings.provider.openai': 'OpenAI',
        'settings.provider.custom': '自定义',
        'settings.saved': '已保存',

        // Theme
        'theme.custom.title': '自定义主题',
        'theme.custom.upload': '上传图片提取配色',
        'theme.custom.reset': '恢复默认',
        'theme.custom.preview': '预览',
        'theme.color.bg': '背景色',
        'theme.color.surface': '表面色',
        'theme.color.primary': '主色调',
        'theme.color.accent': '强调色',
        'theme.color.border': '边框色',
        'theme.color.text': '文字色',
        'theme.color.textSecondary': '次要文字色',
        'theme.color.primaryHover': '主色调悬停',
        'theme.preview.btn.primary': '主要按钮',
        'theme.preview.btn.secondary': '次要按钮',
        'theme.preview.label': '预览',

        // Common
        'common.error': '出错了',
        'common.retry': '重试',
        'common.cancel': '取消',
        'common.confirm': '确认',
        'common.save': '保存',
        'common.loading': '加载中...',
        'common.noApiKey': '请先在设置中配置 API Key',
      },
    },
    en: {
      translation: {
        // App shell
        'app.title': 'AI Music Studio',
        'app.tagline': 'Create unique music with AI',

        // Navigation
        'nav.create': 'Create',
        'nav.history': 'History',
        'nav.settings': 'Settings',
        'nav.theme': 'Theme',

        // Input panel
        'input.mode.text': 'Text Description',
        'input.mode.lyrics': 'Lyrics to Song',
        'input.prompt.placeholder': 'Describe the music you want... e.g. A light piano piece, summer morning vibe',
        'input.lyrics.placeholder': 'Paste your lyrics here...',
        'input.style.label': 'Music Style',
        'input.style.pop': 'Pop',
        'input.style.classical': 'Classical',
        'input.style.electronic': 'Electronic',
        'input.style.jazz': 'Jazz',
        'input.style.rock': 'Rock',
        'input.style.lofi': 'Lo-Fi',
        'input.style.ambient': 'Ambient',
        'input.tempo.label': 'Tempo (BPM)',
        'input.key.label': 'Key',
        'input.duration.label': 'Duration (seconds)',
        'input.submit': 'Generate Music',
        'input.submitting': 'Generating...',

        // Result panel
        'result.empty.title': 'Waiting to Create',
        'result.empty.desc': 'Enter your musical inspiration on the left and click generate',
        'result.loading': 'AI is composing your music...',
        'result.play': 'Play',
        'result.pause': 'Pause',
        'result.stop': 'Stop',
        'result.restart': 'Restart',
        'result.download.wav': 'Download WAV',
        'result.download.midi': 'Download MIDI',
        'result.params.bpm': 'Tempo',
        'result.params.key': 'Key',
        'result.params.style': 'Style',
        'result.params.major': 'Major',
        'result.params.minor': 'Minor',
        'result.chord.label': 'Chord Progression',

        // History
        'history.title': 'Generation History',
        'history.empty': 'No generation history yet',
        'history.delete': 'Delete',
        'history.clear': 'Clear All',
        'history.search': 'Search history',

        // Settings
        'settings.title': 'Settings',
        'settings.api.title': 'API Configuration',
        'settings.api.key': 'API Key',
        'settings.api.key.placeholder': 'Enter your API Key',
        'settings.api.provider': 'Model Provider',
        'settings.api.model': 'Model Name',
        'settings.api.endpoint': 'API Endpoint (optional, for custom config)',
        'settings.language.title': 'Interface Language',
        'settings.theme.title': 'Theme Mode',
        'settings.theme.dark': 'Dark',
        'settings.theme.light': 'Light',
        'settings.theme.system': 'Follow System',
        'settings.theme.custom': 'Custom Theme',
        'settings.provider.deepseek': 'DeepSeek',
        'settings.provider.openai': 'OpenAI',
        'settings.provider.custom': 'Custom',
        'settings.saved': 'Saved',

        // Theme
        'theme.custom.title': 'Custom Theme',
        'theme.custom.upload': 'Upload Image to Extract Colors',
        'theme.custom.reset': 'Reset to Default',
        'theme.custom.preview': 'Preview',
        'theme.color.bg': 'Background',
        'theme.color.surface': 'Surface',
        'theme.color.primary': 'Primary',
        'theme.color.accent': 'Accent',
        'theme.color.border': 'Border',
        'theme.color.text': 'Text',
        'theme.color.textSecondary': 'Secondary Text',
        'theme.color.primaryHover': 'Primary Hover',
        'theme.preview.btn.primary': 'Primary Button',
        'theme.preview.btn.secondary': 'Secondary',
        'theme.preview.label': 'Preview',

        // Common
        'common.error': 'Something went wrong',
        'common.retry': 'Retry',
        'common.cancel': 'Cancel',
        'common.confirm': 'Confirm',
        'common.save': 'Save',
        'common.loading': 'Loading...',
        'common.noApiKey': 'Please configure API Key in Settings first',
      },
    },
  },
})

export default i18n
