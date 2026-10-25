# Quartz 布局参考图

> 快照：`d39ff79`（2026-10-25，配置更新）。这只是快速定位用的图；每次改动前仍要重读 `quartz.config.yaml` 和 `quartz.ts`。

## 页面骨架

`default` 框架（大多数页面）：

```
.page[data-frame="default"] > #quartz-body
├── .left.sidebar
├── .center
│   ├── .page-header
│   │   ├── header            ← header 栏位（当前为空）
│   │   └── .popover-hint     ← beforeBody 栏位
│   ├── article.popover-hint  ← pageBody（由页面类型决定）
│   ├── hr
│   └── .page-footer          ← afterBody 栏位
├── .right.sidebar
└── footer                    ← footer 栏位
```

`full-width` 框架没有左右侧栏，`.center.full-width` 独占整行。`minimal` 框架只有内容和 footer，404 在用。

## 当前布局（按 priority 升序）

| 栏位       | priority | 组件（source 名）   | 条件 / 分组 / 显示         |
| ---------- | -------: | ------------------- | -------------------------- |
| header     |        — | 无                  | —                          |
| beforeBody |        5 | `breadcrumbs`       | `not-index`                |
| beforeBody |       10 | `article-title`     | —                          |
| beforeBody |       15 | `note-properties`   | `display: all`             |
| beforeBody |       20 | `content-meta`      | —                          |
| left       |       10 | `page-title`        | —                          |
| left       |       20 | `search`            | 组 `toolbar`，`grow: true` |
| left       |       25 | `spacer`            | `mobile-only`              |
| left       |       30 | `darkmode`          | 组 `toolbar`               |
| left       |       35 | `reader-mode`       | 组 `toolbar`               |
| left       |       50 | `table-of-contents` | `has-many-headings`        |
| left       |       50 | `explorer`          | `home-only`                |
| right      |       10 | `graph`             | —                          |
| right      |       50 | `backlinks`         | `hideWhenEmpty: false`     |
| footer     |       50 | `footer`            | GitHub 链接                |

`toolbar` 组：`priority: 35`、`direction: row`、`gap: 0.5rem`。组的实际位置取组配置的 35；成员自己的 priority 只决定组内顺序。

`table-of-contents` 与 `explorer` 都是 left / 50，但条件互斥：Explorer 只在首页，TOC 只在“文章且 TOC 条目 > 3”时出现。文件夹列表、标签页两者都不出现，左栏只剩 page-title + toolbar（桌面端 spacer 隐藏）。

## 页面类型矩阵

| 键        | 匹配的 slug                                                  | 框架                  | 当前 YAML 覆盖                                  | 效果               |
| --------- | ------------------------------------------------------------ | --------------------- | ----------------------------------------------- | ------------------ |
| `content` | 首页 `index` + 文章（不以 `/index` 结尾、不以 `tags/` 开头） | `default`             | `{}`                                            | 全量默认布局       |
| `folder`  | `<folder>/index`                                             | `default`             | `exclude: [reader-mode]`；`positions.right: []` | 左栏保留，右栏清空 |
| `tag`     | `tags`、`tags/**`                                            | `default`             | 同 folder                                       | 左栏保留，右栏清空 |
| `404`     | 构建失败页（只生成，不参与常规匹配）                         | `minimal`（插件声明） | `beforeBody/left/right: []`                     | 只有内容 + footer  |
| `canvas`  | Canvas 页                                                    | `canvas`（插件声明）  | `{}`                                            | Canvas 自己的框架  |
| `bases`   | Bases 页                                                     | `default`             | `{}`                                            | 默认布局           |

页面类型匹配按插件 `priority` 从高到低进行：Canvas/Bases 20、Folder/Tag 10、Content 0；404 是 `match: none()` 的生成页，不参与常规匹配。因此 `tags` 虽然也符合 Content 的 matcher，仍会先命中 Tag。

## 加载语义（`quartz/plugins/loader/config-loader.ts`）

- `layout.position` 只认 `header`、`beforeBody`、`afterBody`、`left`、`right`、`footer`。写错或写 `body` 时该组件被静默跳过，不会报错。
- `layout.priority` 升序。**必须显式写数字**：省略时是 `undefined`，排序不可靠。
- `layout.group` 把组件交给 `Flex`；组位置 = `layout.groups.<name>.priority`，没配则取组内最早成员的 priority。
- `layout.display`：`all`（默认）、`mobile-only`、`desktop-only`。
- `layout.condition`：内置 `not-index`、`has-tags`、`has-backlinks`、`has-toc`；其余必须在 `quartz.ts` 里 `registerCondition()`，且注册要在 `loadQuartzConfig()` 之前。
- `layout.byPageType.<type>.exclude`：按 source 最后一段匹配，例如 `reader-mode`、`graph`。
- `layout.byPageType.<type>.positions.<slot>: []`：只支持清空；**非空数组会被忽略**，不能靠它给某类页面“加”组件或改顺序。
- `layout.byPageType.<type>.template`：覆盖页面框架；该页面类型未单独设置时继承默认布局的 `head` / `header` / `footer`。
- 页面类型布局是从“全部 enabled 条目”重新构建的；`exclude` 后会重建所有栏位，所以它同时影响左右栏和 beforeBody。

### YAML schema 与实际运行时的偏差

`quartz/plugins/quartz-plugins.schema.json` 落后于运行时，编辑器可能对下面这些写法报 schema 警告：

- `position: header` / `position: footer`：schema 的 enum 没有，但运行时支持；当前站点就在用 `position: footer`。
- `layout.byPageType.<type>.template`：schema 没声明，但运行时支持。
- `layout.groups.<name>.wrap`：schema 写成 boolean，运行时需要 `"nowrap" | "wrap" | "wrap-reverse"` 字符串。不确定时不要写 `wrap`。
- `position: body`：schema 允许，运行时没有 `body` 栏位，会被忽略。不要用。

不要把“schema 警告”误当成构建失败；以 `npx quartz build` 的结果为准。

## 样式选择器

布局 CSS 通过 `quartz.ts` 的 transformer `externalResources().css` 注入（现有 `PageSurfaces` 就是模板）。这些 CSS 不在 `@layer quartz-base` 里，会覆盖主题和基础样式。

| 目标            | 选择器                                                                    |
| --------------- | ------------------------------------------------------------------------- |
| 页面根 / 框架   | `.page`、`.page[data-frame="default"]`、`#quartz-body`                    |
| 左 / 右栏       | `.page > #quartz-body > .sidebar.left`、`... > .sidebar.right`            |
| 中栏            | `.page > #quartz-body > .center`、`.center.full-width`、`.center.minimal` |
| 页头 / 页脚区域 | `.page-header`、`.page-footer`                                            |
| 目录树          | `.explorer`、`.explorer-content`、`.explorer-ul`                          |
| 文章目录        | `.toc`、`.toc-header`、`.toc-content`                                     |
| 关系图谱        | `.graph`、`.graph-outer`、`.graph-container`                              |
| 反链            | `.backlinks`                                                              |
| 搜索            | `.search`、`.search-container`                                            |
| 页面标题        | `.page-title`                                                             |
| 阅读模式        | `.readermode`                                                             |
| 面包屑          | `.breadcrumb-container`                                                   |
| 内容元信息      | `.content-meta`、`.note-properties`                                       |
| 工具栏组        | `.flex-component`                                                         |
| 响应式包装      | `.mobile-only`、`.desktop-only`                                           |

常用主题变量：`--light`、`--lightgray`、`--gray`、`--darkgray`、`--dark`、`--secondary`、`--tertiary`、`--highlight`、`--textHighlight`；主题额外提供 `--background-primary`、`--background-secondary`、`--tab-container-background`、`--status-bar-background`。本项目在 `quartz.ts` 里用 `--layout-bg` 统一了页面底色。

暗色选择器：`:root[saved-theme="dark"]`。

## 断点与网格

- 移动端：`max-width: 800px`
- 平板：`min-width: 800px` 且 `max-width: 1200px`
- 桌面：`min-width: 1200px`
- 边界值（800px、1200px）会同时命中相邻规则，后写的基础样式会覆盖前一条；自定义规则时把区间写成不重叠的 `801px` / `1201px` 也可以。

桌面网格默认 `320px auto 320px`；平板 `320px auto`；移动端单列。栏间距 5px。`.page` 最大宽度 `calc(1200px + 300px)`。侧栏 `position: sticky`、`height: 100vh`、顶部内边距 `6rem`。

覆盖网格时记得同时处理断点，否则移动端会被桌面规则污染。空右栏折叠的完整配方见 `recipes.md`。

## 只读参考位置

这些文件用来理解行为，**不要修改**：

- `quartz/plugins/loader/config-loader.ts`：`loadQuartzLayout`、`buildLayoutForEntries`、`resolveGroups`
- `quartz/plugins/pageTypes/dispatcher.ts`：页面类型匹配与框架解析
- `quartz/components/frames/DefaultFrame.tsx`、`FullWidthFrame.tsx`、`MinimalFrame.tsx`
- `quartz/styles/base.scss`、`quartz/styles/variables.scss`
- `docs/layout.md`、`docs/layout-components.md`（注意其中的 TS override 示例在本项目不生效，见 SKILL.md）
