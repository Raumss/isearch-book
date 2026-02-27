# iSearch Book — Safari 豆瓣读书电子书搜索插件

在豆瓣读书的书籍页面右侧自动显示「搜索电子版」面板，一键跳转到 **Z-Library** 或 **Anna's Archive** 搜索本书的电子版本。面板样式与豆瓣原生的「当前版本有售」保持一致，浑然一体。

![screenshot placeholder](extension/images/icon-128.png)

---

## 功能特性

- 自动检测 `book.douban.com/subject/*` 页面
- 提取书名，生成搜索链接
- 右侧边栏注入面板，样式与「当前版本有售」一致
- 支持搜索引擎：Z-Library、Anna's Archive

---

## 项目结构

```
isearch-book/
├── README.md
├── extension/                     # Web Extension 源码（Manifest V3）
│   ├── manifest.json
│   ├── content.js                 # 内容脚本：注入搜索面板
│   ├── content.css                # 面板样式（匹配豆瓣风格）
│   ├── background.js              # Service Worker（预留）
│   ├── popup.html / .css / .js    # 工具栏弹出页
│   ├── images/                    # 扩展图标
│   └── scripts/
│       └── generate-icons.py      # 图标生成脚本
└── iSearch Book/                  # ← Xcode 项目（下方步骤生成）
```

---

## 快速开始

### 前提条件

- macOS 14+ (Sonoma) 或更高版本
- Xcode 15+
- Safari 17+
- Python 3（用于生成图标，可选）

### 1. 生成 Xcode 项目

Apple 提供了 `safari-web-extension-converter` 工具，可将标准 Web Extension 包装为 Safari 扩展 App：

```bash
cd /path/to/isearch-book

xcrun safari-web-extension-converter extension/ \
  --project-location . \
  --app-name "iSearch Book" \
  --bundle-identifier com.example.isearch-book \
  --macos-only \
  --no-open
```

> 如果需要同时支持 iOS，去掉 `--macos-only` 参数。

### 2. 编译 & 运行

```bash
open "iSearch Book/iSearch Book.xcodeproj"
```

在 Xcode 中选择 **iSearch Book** scheme，点击 ▶️ 运行。首次运行后，前往：

1. **Safari → 设置 → 扩展**
2. 勾选启用 **iSearch Book**

### 3. 使用

打开任意豆瓣读书书籍页面，例如：

```
https://book.douban.com/subject/1084336/
```

右侧边栏将自动出现「搜索电子版」面板，包含 Z-Library 和 Anna's Archive 的搜索按钮。

---

## 开发调试

Safari 开发者工具支持直接调试 Web Extension：

1. Safari → 开发 → Web 扩展背景页 → iSearch Book
2. Content Script 日志在页面的「控制台」标签页中查看
3. 修改 `extension/` 下的文件后，在 Safari 扩展设置中点击「重新载入」即可生效

---

## 自定义搜索引擎

编辑 `extension/content.js` 顶部的 `SEARCH_ENGINES` 数组即可添加/修改搜索引擎：

```javascript
const SEARCH_ENGINES = [
  {
    name: 'Z-Library',
    icon: '📚',
    buildUrl: (q) => `https://z-lib.gs/s/${encodeURIComponent(q)}`
  },
  {
    name: "Anna's Archive",
    icon: '🔍',
    buildUrl: (q) => `https://annas-archive.org/search?q=${encodeURIComponent(q)}`
  }
];
```

> ⚠️ Z-Library 域名经常变化，如遇无法访问请更新 URL。

---

## 许可证

MIT
Safari 插件，豆瓣读书页面增加按钮可以一键搜索电子书
