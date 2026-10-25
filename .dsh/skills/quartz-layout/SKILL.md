---
name: quartz-layout
description: 按需求修改本项目的 Quartz 页面布局（组件栏位/顺序/分组、按页面类型显隐、页面框架、布局 CSS），只改 quartz.config.yaml 与 quartz.ts，不修改 quartz/ 源码。
whenToUse: 用户要求移动、隐藏、显示、分组、加宽、收窄或重排页面元素，或调整首页、文章、文件夹列表、标签页、404 等某类页面的整体布局时。
---

# Quartz 布局修改

本项目是 Quartz v5 站点。布局的事实源是根目录的 `quartz.config.yaml`，TS 扩展点是根目录的 `quartz.ts`。

## 硬约束

- 默认只修改 `quartz.config.yaml`、`quartz.ts` 和本 skill 目录下的文件。**任何情况下都不修改 `quartz/` 下的源码**，包括 `quartz/components/**`、`quartz/styles/custom.scss`、`quartz/plugins/**`、`quartz/cfg.ts`。
- 不要手改 `public/`（构建产物）、`node_modules/`、`.quartz/`、`quartz/.quartz-cache/`。
- 例外：需求确实需要新组件时，可以用官方命令安装插件（会改 `package.json`、lockfile 和 `.quartz/plugins/`）；先征得用户同意，仍然不碰 `quartz/` 源码。
- 布局变更不要碰插件的 `order`（内容处理顺序）；只改 `layout.*`。
- 动手前先 `git status --short`；保留用户已有的未提交改动。不要用 `git checkout`、`git reset` 回滚，除非用户明确要求。
- 不要为了布局改 `content/**`；只有需求确实依赖 frontmatter（例如条件需要 `tags`）时才改内容，并在汇报中说明。
- 不要顺手改主题颜色/字体；那属于 `configuration.theme`，需要用户明确要求。

## 先写验收标准

动手前把需求落成 4 项；缺哪项就问用户，不要猜：

| 项       | 示例                                                                      |
| -------- | ------------------------------------------------------------------------- |
| 目标组件 | 目录树 Explorer、文章目录 TOC、关系图谱 Graph、反链 Backlinks、工具栏     |
| 目标页面 | 全站 / 首页 / 文章 / 文件夹列表 `<folder>/index` / 标签页 `tags/**` / 404 |
| 期望行为 | 换到右栏、排在 X 前面、文章页隐藏、横向工具栏、全宽、收窄                 |
| 验收方式 | 构建通过；`public/<slug>.html` 中组件出现在（或不出现在）指定栏位         |

如果用户说“把目录放右边”但没说页面范围，先确认“目录”指 Explorer 还是 TOC，以及是否只影响文章页；不要直接改全站。

## 布局模型速查

页面栏位：`head`（不可见）、`header`、`beforeBody`、`pageBody`、`afterBody`、`left`、`right`、`footer`。

- YAML 可分配：`header`、`beforeBody`、`afterBody`、`left`、`right`、`footer`。
- `pageBody` 由页面类型插件决定；`head` 由 `Head` 组件固定生成。
- 页面类型键：`content`（首页 + 文章）、`folder`（`<folder>/index`）、`tag`（`tags/**`）、`404`、`canvas`、`bases`。
- 页面框架：`default`（三栏）、`full-width`（无侧栏）、`minimal`（无侧栏、无页头；404 在用）、`canvas`（Canvas 插件）。

当前站点布局快照、页面类型矩阵、可用 CSS 选择器见 `references/layout-map.md`。快照只用于快速定位；改动前必须重读 `quartz.config.yaml`。

## 工作流

1. **复述 + 定验收**：用上面的 4 项表格确认。
2. **读现状**：`quartz.config.yaml`、`quartz.ts`、`references/layout-map.md`；执行 `git status --short`。
3. **选最小改动面**：见决策表。能用 YAML 就不写 TS；能用 `condition` 就不写 CSS。
4. **改文件**：保持现有代码的注释风格；新增条件/样式要写清“为什么”和影响哪些页面。
5. **验证（必须）**：
   - `npx quartz build`
   - 用 `scripts/slot-probe.mjs` 检查受影响的代表性页面（首页、文章、文件夹列表、标签页、404）。
   - 涉及响应式或外观时，`npx quartz build --serve` 后检查 390px / 900px / 1440px 和明暗主题；无法做视觉检查时，在汇报里明确说“未做视觉检查”。
6. **汇报**：改了哪些文件、每处对应哪项需求、影响页面、验证结果、回滚方式、未验证项。

## 改动面决策表

| 需求                                   | 改哪里                                                                                               | 关键点                                                                                   |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 组件换栏位 / 调顺序                    | 该插件条目的 `layout.position` / `layout.priority`                                                   | `priority` 升序，越小越靠前；必须显式写数字                                              |
| 组件在某页面类型整体消失               | `layout.byPageType.<type>.exclude: [组件名]`                                                         | 组件名是 source 最后一段，如 `reader-mode`                                               |
| 清空某页面类型的整个栏位               | `layout.byPageType.<type>.positions.<slot>: []`                                                      | 只支持清空；**非空数组会被忽略**                                                         |
| 只在某些页面显示                       | `layout.condition`                                                                                   | 内置：`not-index`、`has-tags`、`has-backlinks`、`has-toc`；自定义条件在 `quartz.ts` 注册 |
| 横排工具条 / 成组                      | `layout.groups` + 插件 `layout.group` / `groupOptions`                                               | 组的位置由 `groups.<name>.priority` 或组内最早成员决定                                   |
| 仅移动端 / 仅桌面                      | `layout.display: mobile-only` / `desktop-only`                                                       | 默认 `all`                                                                               |
| 页面无侧栏 / 全宽 / 极简               | `layout.byPageType.<type>.template`                                                                  | `full-width` 只去侧栏；`minimal` 再去页头/beforeBody；`default` 恢复三栏                 |
| 宽度、间距、边框、背景、粘性、空栏折叠 | `quartz.ts` 注入 CSS                                                                                 | 不要用 `!important`；按断点和 `data-frame` 限定                                          |
| 需要全新组件                           | 先征得同意；npm 包用 `npm install <包名>` 后在 YAML 增加条目，Git 插件用 `npx quartz plugin add ...` | 不要往 `quartz/components/` 里加文件                                                     |
| YAML 表达不了的按页面类型重排          | 高级：在 `quartz.ts` 替换 `PageTypeDispatcher`                                                       | 见 `references/recipes.md`；必须构建验证                                                 |

## 两个必须记住的坑

1. **`loadQuartzLayout()` 的 TS override 不生效。** 上游文档示例是在 `quartz.ts` 里 `export const layout = await loadQuartzLayout({...})`，但本项目构建时 `loadQuartzConfig()` 已经用无 override 的布局构造了 `PageTypeDispatcher`，这个导出没有被消费。已用构建验证。需要 TS 级布局时用 `references/recipes.md` 的 dispatcher 替换法，或优先用条件 + CSS。
2. **清空栏位不等于收起栏位。** `positions: { right: [] }` 只移除组件，桌面端仍保留 320px 右栏。需要真正收起时加 CSS（见 `references/recipes.md` 的空栏折叠配方）。

## 最小示例

### 移动组件到右栏

```yaml
- source: "@quartz-community/table-of-contents"
  enabled: true
  layout:
    position: right
    priority: 20
```

### 只在文章页显示组件

```ts
// quartz.ts，必须在 loadQuartzConfig() 之前注册
registerCondition("article-only", (props) => {
  const slug = props.fileData.slug ?? ""
  return (
    slug !== "index" && !slug.endsWith("/index") && slug !== "tags" && !slug.startsWith("tags/")
  )
})
```

```yaml
- source: "@quartz-community/table-of-contents"
  enabled: true
  layout:
    position: left
    priority: 50
    condition: article-only
```

### 注入布局 CSS

沿用现有 `pageSurfaces` 的写法，在它之后追加：

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

const layoutOverrides: QuartzTransformerPluginInstance = {
  name: "LayoutOverrides",
  externalResources() {
    return { css: [{ inline: true, content: LAYOUT_CSS }] }
  },
}

config.plugins.transformers.push(layoutOverrides)
```

transformer `externalResources()` 注入的 CSS 不进入 `@layer quartz-base`，并且在核心样式之后加载，会覆盖主题和基础样式。先限定选择器，再考虑提高特异性，最后才考虑 `!important`。

## 验证

```bash
npx quartz build
node .dsh/skills/quartz-layout/scripts/slot-probe.mjs public/strs-github.html toc left
node .dsh/skills/quartz-layout/scripts/slot-probe.mjs public/index.html graph right
node .dsh/skills/quartz-layout/scripts/slot-probe.mjs public/posts/index.html graph absent
```

- 构建输出应包含 `Emitted N files` 且退出码为 0；出现 `Unknown condition` 说明条件名拼错或没注册。
- 示例里的 `public/strs-github.html` 等路径按当前内容生成；实际验证时换成受影响的 slug。
- `public/` 是生成物，不要手改。
- `--serve` 会监听 `quartz.config.yaml`、`**/*.ts`、`**/*.tsx`、`**/*.scss` 和 `package.json`，修改布局后会自动重建；等日志出现 `Done rebuilding` 再刷新页面。内容文件由另一路 watcher 监听。
- 改了 `quartz.ts` 不需要清缓存，`npx quartz build` 每次都会重新转译。

## 禁止事项

- 不要修改 `quartz/`、`node_modules/`、`public/`；不要手改 `.quartz/`（插件安装命令生成的内容除外）。
- 不要用 `display: none` 代替页面类型级隐藏，除非确实需要保留 DOM（例如脚本依赖）；优先 `condition` / `exclude`。
- 不要为了布局改 `content/**` 的 slug；slug 变化会影响链接、RSS 和 Explorer。
- 不要删除现有的 `home-only` / `has-many-headings` 条件，除非需求就是改它们。
- 不要为了“看起来对”而绕过构建验证；构建通过后才算完成。
