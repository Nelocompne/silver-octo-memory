# 布局配方

所有配方都遵守 `SKILL.md` 的硬约束：只改根目录的 `quartz.config.yaml` 和 `quartz.ts`。

改完后统一执行：

```bash
npx quartz build
git status --porcelain | grep -E '^.. quartz/' || echo "OK: quartz/ untouched"
```

---

## 1. 移动组件 / 调整顺序

改插件条目的 `layout.position` 和 `layout.priority`。`priority` 升序，越小越靠前。

```yaml
- source: "@quartz-community/table-of-contents"
  enabled: true
  layout:
    position: right # left | right | beforeBody | afterBody | header | footer
    priority: 20
```

注意：

- 同一栏位里两个组件 priority 相同时，按 `plugins` 数组中的声明顺序稳定排序；不要依赖这一点，显式给不同数字。
- `pageBody` 不是可分配栏位；文章正文由页面类型插件决定。
- 不要改 `order`（插件处理顺序），它和布局无关。

验证：

```bash
node .dsh/skills/quartz-layout/scripts/slot-probe.mjs public/strs-github.html toc right
```

---

## 2. 在某类页面隐藏组件

### 2.1 整个页面类型都不要

```yaml
layout:
  byPageType:
    folder:
      exclude:
        - reader-mode
        - backlinks
```

`exclude` 用 source 的最后一段（`@quartz-community/reader-mode` → `reader-mode`）。它会把组件从该页面类型的所有栏位移除。

### 2.2 只清空某个栏位

```yaml
layout:
  byPageType:
    folder:
      positions:
        right: []
```

只支持空数组；**写非空数组不会生效**。清空后桌面端仍保留 320px 空栏，见配方 6。

### 2.3 按条件隐藏

内置条件：

```yaml
layout:
  position: right
  priority: 10
  condition: not-index # not-index | has-tags | has-backlinks | has-toc
```

自定义条件在 `quartz.ts` 注册，必须在 `await loadQuartzConfig()` 之前：

```ts
registerCondition("folder-listing", (props) => {
  const slug = props.fileData.slug ?? ""
  return slug !== "index" && slug.endsWith("/index")
})

registerCondition("tag-pages", (props) => {
  const slug = props.fileData.slug ?? ""
  return slug === "tags" || slug.startsWith("tags/")
})
```

然后在 YAML 里引用：

```yaml
condition: folder-listing
```

注意：

- 条件名任意，但建议 kebab-case；重复注册会覆盖旧谓词。
- 条件在服务端渲染时求值；SPA 导航到另一类页面时，服务端返回的新 HTML 会重新应用条件。
- 不推荐用 `body[data-slug="..."]` 写布局开关：条件/框架在服务端求值，语义更清楚，也不会依赖 SPA 的 DOM morph 行为。

---

## 3. 只在文章页显示组件

现有 `quartz.ts` 已有 `isArticle` 辅助函数，直接复用：

```ts
registerCondition("article-only", (props) => isArticle(props.fileData.slug ?? ""))
```

```yaml
- source: "@quartz-community/table-of-contents"
  enabled: true
  layout:
    position: left
    priority: 50
    condition: article-only
```

如果要求是“文章且 TOC 条目超过 3 条”，现有 `has-many-headings` 已经做了这件事，不要重复注册。

---

## 4. 把几个组件排成一行（工具栏）

```yaml
plugins:
  - source: "@quartz-community/search"
    enabled: true
    layout:
      position: left
      priority: 20
      group: toolbar
      groupOptions:
        grow: true
  - source: "@quartz-community/darkmode"
    enabled: true
    layout:
      position: left
      priority: 30
      group: toolbar
  - source: "@quartz-community/reader-mode"
    enabled: true
    layout:
      position: left
      priority: 35
      group: toolbar

layout:
  groups:
    toolbar:
      priority: 35
      direction: row
      gap: 0.5rem
```

- 组的位置由 `groups.toolbar.priority` 决定；没写时取组内最小 priority 的成员。
- 成员之间的顺序由成员 priority 决定；也可以用 `groupOptions.order` 微调（CSS `order`）。
- `groupOptions` 支持 `grow`、`shrink`、`basis`、`order`、`align`、`justify`。
- 不要写 `wrap: true`（schema 这么写是错的）；需要换行时写 `wrap: "wrap"`，并接受编辑器 schema 警告。

---

## 5. 改变某类页面的框架

```yaml
layout:
  byPageType:
    folder:
      template: full-width # default | full-width | minimal
    tag:
      template: minimal
```

- `full-width`：无左右侧栏，内容占满整行。
- `minimal`：无侧栏、无页头/ beforeBody，只有内容和 footer。
- `template` 按页面类型生效。`content` 同时包含首页和文章；如果只想让“文章”全宽，YAML 做不到，需要先确认是否接受首页也全宽，或用条件 + CSS（属于更大改动）。
- `canvas` 页有插件自带的 `canvas` 框架，覆盖它通常没有意义。

---

## 6. 收起空侧栏（清空栏位后不留空白）

`positions: { right: [] }` 只移除组件，不改变网格。桌面端补一段 CSS：

```ts
const LAYOUT_CSS = `
@media (min-width: 1200px) {
  .page > #quartz-body:has(> .sidebar.right:empty) {
    grid-template-columns: 320px minmax(0, 1fr) 0;
  }
  .page > #quartz-body > .sidebar.right:empty {
    display: none;
  }
}
`
```

同法可处理左栏：把 `.right` 换成 `.left`，网格改成 `0 minmax(0, 1fr) 320px`。注意平板（800–1200px）的网格是两列，不要套用桌面规则。

`:has()` 需要 Chrome 105+ / Safari 15.4+ / Firefox 121+；如果站点要兼容更老的浏览器，改用页面类型条件或框架。

---

## 7. 调整内容宽度 / 侧栏宽度

```ts
const LAYOUT_CSS = `
@media (min-width: 1200px) {
  .page {
    max-width: 1600px;
  }
  .page > #quartz-body {
    grid-template-columns: 280px minmax(0, 1fr) 280px;
  }
}

@media (min-width: 800px) and (max-width: 1200px) {
  .page > #quartz-body {
    grid-template-columns: 280px minmax(0, 1fr);
  }
}
`
```

只改阅读宽度、不动侧栏：

```css
.page article .markdown-preview-view {
  max-width: 72ch;
  margin-inline: auto;
}
```

验证时检查 1440px 和 1024px；`npx quartz build --serve`，不要只看静态 HTML。

---

## 8. 侧栏滚动 / 粘性

默认左右侧栏是 `position: sticky; height: 100vh`。让右栏跟随页面滚动：

```css
.page > #quartz-body > .sidebar.right {
  position: static;
  height: auto;
}
```

让侧栏内容过长时独立滚动：

```css
.page > #quartz-body > .sidebar.left {
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

移动端基础样式会把侧栏改成横向排列，以上规则要放在 `@media (min-width: 1200px)` 里，避免影响平板/手机。

---

## 9. 高级：YAML 表达不了的按页面类型布局

已验证：单纯 `export const layout = await loadQuartzLayout({...})` **不生效**（dispatcher 在 `loadQuartzConfig()` 内部已经构造好）。要让 TS 布局生效，必须替换 dispatcher：

在现有 `quartz.ts` 上做三处改动：

1. 在顶部加导入：
   ```ts
   import { PageTypes } from "./quartz/plugins"
   ```
2. 在 `config.plugins.transformers.push(pageSurfaces)` 之后插入：
   ```ts
   const layout = await loadQuartzLayout({
     byPageType: {
       content: { right: [] },
     },
   })

   const dispatcherIndex = config.plugins.emitters.findIndex((e) => e.name === "PageTypeDispatcher")
   if (dispatcherIndex >= 0) {
     config.plugins.emitters[dispatcherIndex] = PageTypes.PageTypeDispatcher({
       defaults: layout.defaults,
       byPageType: layout.byPageType,
     })
   }
   ```
3. 把文件末尾的 `export const layout = await loadQuartzLayout()` 改成 `export { layout }`，避免重复声明。

`export default config` 保持在原来的位置，不要复制第二份。

适用场景：按页面类型清空栏位，或构造组件数组重排某类页面的栏位。

注意：

- 这是对公开导出的运行时替换，不是修改 `quartz/` 源码；但依赖 `PageTypeDispatcher` 这个名字和 `PageTypes` 导出，升级 Quartz 后要重测。
- 这里只改 `byPageType` 是可靠的；`defaults` 会被各页面类型自己的完整布局覆盖，当前所有页面类型都在 YAML 里有条目，所以不要指望在 TS 里改 `defaults` 生效。
- 示例的 `content` 包含首页；给 `content` 清空右栏会连首页一起清空。需要区分首页/文章时，优先用条件。
- 改完必须构建，并用 slot-probe 检查至少一个 content、folder、tag 页面。

---

## 10. 验证与回滚

### 构建 + 结构检查

```bash
npx quartz build

# 组件在指定栏位
node .dsh/skills/quartz-layout/scripts/slot-probe.mjs public/strs-github.html toc right

# 组件不应出现
node .dsh/skills/quartz-layout/scripts/slot-probe.mjs public/posts/index.html graph absent
```

`slot-probe` 只做结构检查，不检查视觉。涉及宽度、颜色、粘性时，必须 `npx quartz build --serve` 后看浏览器；不能看浏览器就在汇报里说明。

### 确认没碰源码

```bash
git status --porcelain | grep -E '^.. quartz/' || echo "OK: quartz/ untouched"
```

### 回滚

- 只回滚本次布局：按 `git diff -- quartz.config.yaml quartz.ts` 手动删掉新增块；不要用 `git checkout` 把用户的其他改动一起丢掉。
- 构建产物 `public/` 不需要回滚，重新构建即可。
- 如果新增了注释/条件，回滚时一起删除，避免留下“注册了但没人用”的条件。

---

## 11. 常见症状

| 症状                           | 原因                                               | 处理                                                                          |
| ------------------------------ | -------------------------------------------------- | ----------------------------------------------------------------------------- |
| 组件完全没出现                 | `position` 拼错 / 组件未 `enabled` / 组件未注册    | 用有效栏位；构建日志看是否有插件加载失败                                      |
| 条件写了但无效                 | 条件名未注册，或注册晚于 `loadQuartzConfig()`      | 构建日志会打印 `Unknown condition`；把注册移到 `loadQuartzConfig()` 之前      |
| 改了 YAML 没变化               | 构建失败、重建还没结束，或浏览器缓存               | 看 `--serve` 日志是否出现 `Done rebuilding` 和错误；强制刷新                  |
| 某页面类型清空栏位后仍有空白   | 只是清空组件，网格还在                             | 用配方 6 的 CSS                                                               |
| 编辑器报 schema 错误但构建通过 | schema 落后于运行时（header/footer/template/wrap） | 以构建结果为准，见 `layout-map.md`                                            |
| 升级后 dispatcher 替换失效     | `PageTypeDispatcher` 名字/导出变了                 | 回退到 YAML + 条件 + CSS，或重新核对 `quartz/plugins/pageTypes/dispatcher.ts` |
