/**
 * 服务端 sys_menu.icon → Element Plus 图标组件。
 *
 * 图标名有两个来源：产品菜单种子（A1SEED）直接写 Element Plus 原名，若依标准库仍是
 * 旧版小写名（system / peoples / tree-table / form）。这里只维护一张显式别名表，
 * 未登记的图标名返回空，侧边栏按“无图标”渲染，避免后端脏数据把菜单渲染成空白。
 */
import {
  Aim,
  Avatar,
  Bell,
  Box,
  Briefcase,
  Brush,
  Calendar,
  ChatDotRound,
  ChatLineSquare,
  Clock,
  Coin,
  Collection,
  CollectionTag,
  Cpu,
  DataAnalysis,
  DataBoard,
  DataLine,
  Document,
  DocumentCopy,
  Download,
  EditPen,
  Files,
  Folder,
  FolderOpened,
  Grid,
  Guide,
  Histogram,
  Iphone,
  Key,
  Link,
  List,
  Lock,
  MagicStick,
  Management,
  Menu,
  Money,
  Monitor,
  Notebook,
  Odometer,
  Operation,
  Picture,
  PictureFilled,
  PieChart,
  Postcard,
  Present,
  QuestionFilled,
  Right,
  Search,
  Sell,
  Setting,
  ShoppingCart,
  Stamp,
  Star,
  SwitchButton,
  Tickets,
  Timer,
  Tools,
  TrendCharts,
  Trophy,
  Upload,
  User,
  UserFilled,
  VideoCamera,
  VideoPlay,
  Warning,
  WarningFilled
} from '@element-plus/icons-vue'

/** 白名单：组件被 `import` 进来才会进包，未列入的名字无法解析。 */
export const MENU_ICONS = {
  Aim,
  Avatar,
  Bell,
  Box,
  Briefcase,
  Brush,
  Calendar,
  ChatDotRound,
  ChatLineSquare,
  Clock,
  Coin,
  Collection,
  CollectionTag,
  Cpu,
  DataAnalysis,
  DataBoard,
  DataLine,
  Document,
  DocumentCopy,
  Download,
  EditPen,
  Files,
  Folder,
  FolderOpened,
  Grid,
  Guide,
  Histogram,
  Iphone,
  Key,
  Link,
  List,
  Lock,
  MagicStick,
  Management,
  Menu,
  Money,
  Monitor,
  Notebook,
  Odometer,
  Operation,
  Picture,
  PictureFilled,
  PieChart,
  Postcard,
  Present,
  QuestionFilled,
  Right,
  Search,
  Sell,
  Setting,
  ShoppingCart,
  Stamp,
  Star,
  SwitchButton,
  Tickets,
  Timer,
  Tools,
  TrendCharts,
  Trophy,
  Upload,
  User,
  UserFilled,
  VideoCamera,
  VideoPlay,
  Warning,
  WarningFilled
}

/**
 * 别名：若依标准库旧图标名，以及种子中写了但 Element Plus 并不存在的名字。
 * 值必须是 MENU_ICONS 的键，键一律小写比较。
 */
export const MENU_ICON_ALIASES = {
  // 若依标准库
  system: 'Setting',
  monitor: 'Monitor',
  peoples: 'UserFilled',
  people: 'UserFilled',
  'tree-table': 'Grid',
  tree: 'Grid',
  table: 'Grid',
  row: 'Grid',
  component: 'Grid',
  cascader: 'Grid',
  checkbox: 'Grid',
  radio: 'Grid',
  select: 'Grid',
  slider: 'Grid',
  switch: 'SwitchButton',
  tab: 'Grid',
  post: 'Postcard',
  dict: 'Notebook',
  edit: 'EditPen',
  input: 'EditPen',
  textarea: 'EditPen',
  form: 'Document',
  log: 'Document',
  logs: 'Document',
  clipboard: 'Document',
  excel: 'Document',
  pdf: 'Document',
  swagger: 'Document',
  logininfor: 'Key',
  validcode: 'Key',
  build: 'Tools',
  tool: 'Tools',
  job: 'Timer',
  time: 'Clock',
  guide: 'Guide',
  money: 'Money',
  list: 'List',
  nested: 'Files',
  druid: 'Coin',
  server: 'Coin',
  theme: 'Brush',
  color: 'Brush',
  icon: 'Picture',
  number: 'Histogram',
  phone: 'Iphone',
  question: 'QuestionFilled',
  rate: 'Star',
  skill: 'Star',
  star: 'Star',
  shopping: 'ShoppingCart',
  wechat: 'ChatLineSquare',
  zip: 'Folder',
  date: 'Calendar',
  example: 'Grid',
  download: 'Download',
  upload: 'Upload',
  // 产品种子写了、但 Element Plus 无同名的图标
  dashboard: 'Odometer',
  chart: 'TrendCharts',
  magic: 'MagicStick',
  chat: 'ChatLineSquare',
  video: 'VideoPlay'
}

/** 小写索引：Element Plus 原名 + 别名，一次查表。 */
const LOWER_INDEX = (() => {
  const index = new Map()
  for (const name of Object.keys(MENU_ICONS)) index.set(name.toLowerCase(), name)
  for (const [alias, target] of Object.entries(MENU_ICON_ALIASES)) index.set(alias, target)
  return index
})()

/**
 * 图标名 → MENU_ICONS 键；无法解析时返回空字符串。
 */
export function resolveMenuIconName(icon) {
  if (typeof icon !== 'string') return ''
  const key = icon.trim()
  if (!key) return ''
  if (Object.prototype.hasOwnProperty.call(MENU_ICONS, key)) return key
  const hit = LOWER_INDEX.get(key.toLowerCase())
  return hit && Object.prototype.hasOwnProperty.call(MENU_ICONS, hit) ? hit : ''
}

/**
 * 图标名 → 图标组件；无法解析时返回 null。
 */
export function resolveMenuIcon(icon) {
  const name = resolveMenuIconName(icon)
  return name ? MENU_ICONS[name] : null
}

export default resolveMenuIcon
