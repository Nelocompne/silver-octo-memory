import { h } from "preact"
import { PageTypes } from "./quartz/plugins"
import ConditionalRender from "./quartz/components/ConditionalRender"
import DesktopOnly from "./quartz/components/DesktopOnly"
import type { QuartzComponent, QuartzComponentProps } from "./quartz/components/types"
import { registerCondition } from "./quartz/plugins/loader/conditions"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import type { QuartzPluginData } from "./quartz/plugins/vfile"
import type { QuartzTransformerPluginInstance } from "./quartz/plugins/types"
import { resolveRelative } from "./quartz/util/path"
import type { FullSlug } from "./quartz/util/path"

// Conditions used by `layout.condition` in quartz.config.yaml must be registered
// *before* the config (and therefore the layout) is loaded, because the layout is
// built while `loadQuartzConfig()` runs.
//
// A slug is an "article" when it is not the home page (`index`), a folder listing
// (`<folder>/index`) or a tag page (`tags`, `tags/<tag>`).
const isArticle = (slug: string): boolean =>
  slug !== "index" && !slug.endsWith("/index") && slug !== "tags" && !slug.startsWith("tags/")

// "home-only": render on the home page (`index`) and nowhere else. The Explorer
// uses it so the content tree is no longer shown on folder listings
// (`<folder>/index`) or tag pages (`tags`, `tags/<tag>`) either — those, like
// articles, keep just the page title + toolbar (search / dark mode / reader
// mode) in the left sidebar.
registerCondition("home-only", (props) => props.fileData.slug === "index")

// "has-many-headings": show the article table of contents in the left sidebar
// (the slot the Explorer occupies on the home page) once an article has more
// than 3 entries in its table of contents (headings up to the configured
// `maxDepth`). Shorter articles keep the left sidebar unchanged.
registerCondition("has-many-headings", (props) => {
  if (!isArticle(props.fileData.slug ?? "")) return false
  const toc = (props.fileData as Record<string, unknown>).toc
  return Array.isArray(toc) && toc.length > 3
})

// ---------------------------------------------------------------------------
// Home sidebar index — posts above, thought notes below
// ---------------------------------------------------------------------------
// Mirrors the reference layout: two short lists in the left sidebar, each with
// a section title, title + date rows and a "see more" link to the folder page.
// The Explorer tree remains available on mobile only, so this component is
// rendered on the home page (`index`) and on desktop only.
//
// `limit` controls how many rows each section shows before "查看其余 N 篇 →".
const SIDEBAR_SECTIONS = [
  { title: "文章", folder: "posts", limit: 4 },
  { title: "一些零碎", folder: "thought", limit: 2 },
] as const

const pageDate = (data: QuartzPluginData): Date | undefined => {
  const dates = data.dates
  if (!dates) return undefined
  // Prefer the per-file date type set by CreatedModifiedDate, then fall back
  // through the same order the rest of the site uses.
  return (
    (data.defaultDateType ? dates[data.defaultDateType] : undefined) ??
    dates.modified ??
    dates.created
  )
}

const isListedIn = (data: QuartzPluginData, folder: string): boolean => {
  const slug = data.slug ?? ""
  return (
    slug.startsWith(`${folder}/`) &&
    !slug.endsWith("/index") &&
    (data as { unlisted?: boolean }).unlisted !== true
  )
}

const sortByDateDesc = (a: QuartzPluginData, b: QuartzPluginData): number => {
  const aDate = pageDate(a)
  const bDate = pageDate(b)
  if (aDate && bDate) return bDate.getTime() - aDate.getTime()
  if (aDate) return -1
  if (bDate) return 1
  return (a.frontmatter?.title ?? "").localeCompare(b.frontmatter?.title ?? "")
}

const SidebarSections: QuartzComponent = ({ allFiles, fileData, cfg }: QuartzComponentProps) => {
  const slug: FullSlug = fileData.slug ?? ("index" as FullSlug)
  const locale = cfg.locale ?? "zh-CN"

  const sections = SIDEBAR_SECTIONS.map(({ title, folder, limit }) => {
    const pages = allFiles.filter((f) => isListedIn(f, folder)).sort(sortByDateDesc)
    const remaining = Math.max(0, pages.length - limit)
    const items = pages.slice(0, limit).map((page) => {
      const date = pageDate(page)
      return h("li", { class: "sidebar-section-item" }, [
        h(
          "a",
          {
            class: "sidebar-section-link internal",
            href: resolveRelative(slug, page.slug ?? slug),
          },
          page.frontmatter?.title ?? page.slug?.split("/").pop() ?? "未命名",
        ),
        date
          ? h(
              "time",
              {
                class: "sidebar-section-date",
                datetime: date.toISOString(),
              },
              date.toLocaleDateString(locale, {
                year: "numeric",
                month: "short",
                day: "2-digit",
              }),
            )
          : null,
      ])
    })

    return h("section", { class: "sidebar-section" }, [
      h("h3", { class: "sidebar-section-title" }, title),
      h("ul", { class: "sidebar-section-list" }, items),
      remaining > 0
        ? h(
            "a",
            {
              class: "sidebar-section-more internal",
              href: resolveRelative(slug, folder as FullSlug),
            },
            `查看其余 ${remaining} 篇 →`,
          )
        : null,
    ])
  })

  return h("div", { class: "sidebar-sections" }, sections)
}

// ---------------------------------------------------------------------------
// Unified page surfaces — left sidebar · centre column · right sidebar
// ---------------------------------------------------------------------------
// `@quartz-themes/core` paints the page shell and both sidebars with
// `--tab-container-background` (which resolves to `--background-secondary`)
// while the centre column uses `--background-primary`, so the columns end up in
// two different shades.
//
// The theme ships its CSS inside `@layer obsidian-theme` / `@layer
// quartz-themes-base`, but plugin resources are emitted *unlayered* — and
// unlayered declarations beat every cascade layer. So the stylesheet below wins
// without needing `!important`.
//
// Pointing all the "surface" variables at one shared colour makes the whole
// page (left, centre, right, footer and the panels drawn on top of it) use a
// single background. To repaint everything, change `--layout-bg`:
//
//   var(--background-primary)   → the content/page colour (current default)
//   var(--background-secondary) → the sidebar tone used before this override
//   var(--light)                → the page colour set in quartz.config.yaml
const PAGE_SURFACE_CSS = `
:root {
  --layout-bg: var(--background-primary);

  /* Page shell, sidebars and footer */
  --tab-container-background: var(--layout-bg);
  --status-bar-background: var(--layout-bg);

  /* Surfaces drawn on top of the background: graph view, canvas sidebar,
     explorer, bases table headers, stacked pages */
  --background-secondary: var(--layout-bg);
  --background-secondary-alt: var(--layout-bg);
}

/* The theme draws a 1px divider between the left sidebar and the article
   column. Drop it so the two surfaces read as one continuous background, and
   zero the right sidebar's matching border for symmetry. */
.page > #quartz-body .sidebar.left {
  border-right: none;
}
.page > #quartz-body .sidebar.right {
  border-left: none;
}
`

// ---------------------------------------------------------------------------
// Sidebar layout — serif font stack, compact search button, posts/thoughts
// ---------------------------------------------------------------------------
// `--titleFont` / `--headerFont` / `--bodyFont` are emitted by the theme with a
// generic sans-serif fallback. Append serif fallbacks so Chinese text still
// reads as 思源宋体 when the Google font is unavailable.
//
// The search plugin renders a full-width button (icon + text) by default. The
// rules below keep the same button element and click handler but collapse it to
// just the icon, aligned with the theme/reader-mode icons.
const LAYOUT_CSS = `
:root {
  --titleFont: "Noto Serif SC", "Source Han Serif SC", "Source Han Serif", "Songti SC", "STSong", "SimSun", serif;
  --headerFont: "Noto Serif SC", "Source Han Serif SC", "Source Han Serif", "Songti SC", "STSong", "SimSun", serif;
  --bodyFont: "Noto Serif SC", "Source Han Serif SC", "Source Han Serif", "Songti SC", "STSong", "SimSun", serif;
  /* The theme reads these directly for paragraphs and UI chrome. */
  --font-text: "Noto Serif SC", "Source Han Serif SC", "Source Han Serif", "Songti SC", "STSong", "SimSun", serif;
  --font-interface: "Noto Serif SC", "Source Han Serif SC", "Source Han Serif", "Songti SC", "STSong", "SimSun", serif;
}

/* Site title and icons share one row in the left sidebar. */
.page > #quartz-body .sidebar.left .flex-component {
  align-items: center;
}
.page > #quartz-body .sidebar.left .flex-component .page-title,
.page > #quartz-body .sidebar.left .flex-component .page-title a {
  /* The theme also styles h2.page-title a with its own inline-title size,
     which is wider than the h2 box and wrapped the four-character title. */
  font-size: 1.65rem;
  line-height: 1.2;
  letter-spacing: 0.01em;
  white-space: nowrap;
}
.page > #quartz-body .sidebar.left .flex-component .page-title {
  margin: 0;
}

/* Search: one small icon button, no border and no label. */
.page > #quartz-body .sidebar.left .search {
  max-width: none;
  min-width: 0;
}
.page > #quartz-body .sidebar.left .search > .search-button {
  width: 20px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  justify-content: center;
}
.page > #quartz-body .sidebar.left .search > .search-button > p {
  display: none;
}
.page > #quartz-body .sidebar.left .search > .search-button svg {
  width: 18px;
  min-width: 18px;
  margin: 0;
}
.page > #quartz-body .sidebar.left .search > .search-button:hover svg .search-path {
  stroke: var(--secondary);
}

/* Posts / thought lists. */
.page > #quartz-body .sidebar.left .sidebar-sections {
  display: flex;
  flex-direction: column;
  gap: 2.25rem;
  margin-top: 0.35rem;
}
.page > #quartz-body .sidebar.left .sidebar-section-title {
  margin: 0 0 0.9rem;
  font-family: var(--headerFont);
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--dark);
}
.page > #quartz-body .sidebar.left .sidebar-section-list {
  display: flex;
  flex-direction: column;
  gap: 1.05rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.page > #quartz-body .sidebar.left .sidebar-section-item {
  margin: 0;
}
.page > #quartz-body .sidebar.left .sidebar-section-link {
  display: block;
  font-family: var(--headerFont);
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.35;
  color: var(--secondary);
  text-decoration: none;
  /* The theme gives a.internal a highlight background. */
  background-color: transparent;
}
.page > #quartz-body .sidebar.left .sidebar-section-link:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.page > #quartz-body .sidebar.left .sidebar-section-date {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.8rem;
  font-style: italic;
  color: var(--gray);
}
.page > #quartz-body .sidebar.left .sidebar-section-more {
  display: inline-block;
  margin-top: 1rem;
  font-size: 0.95rem;
  color: var(--secondary);
  text-decoration: underline;
  text-underline-offset: 4px;
  background-color: transparent;
}
.page > #quartz-body .sidebar.left .sidebar-section-more:hover {
  color: var(--tertiary);
}
`

const pageSurfaces: QuartzTransformerPluginInstance = {
  name: "PageSurfaces",
  externalResources() {
    return {
      css: [
        { inline: true, content: PAGE_SURFACE_CSS },
        { inline: true, content: LAYOUT_CSS },
      ],
    }
  },
}

const config = await loadQuartzConfig()

// Appended last so this stylesheet is emitted after the theme's own resources.
config.plugins.transformers.push(pageSurfaces)

// ---------------------------------------------------------------------------
// Inject the home sidebar lists into the content layout
// ---------------------------------------------------------------------------
// `loadQuartzLayout({...})` overrides are not consumed by this project's build
// (the dispatcher is created inside `loadQuartzConfig()`), so replace the
// dispatcher instance with one built from the modified layout. See the
// quartz-layout skill, recipe 9.
const layout = await loadQuartzLayout()

const homeSidebarSections = DesktopOnly(
  ConditionalRender({
    component: SidebarSections,
    condition: (props) => props.fileData.slug === "index",
  }),
)

const contentLayout = layout.byPageType.content ?? {}
layout.byPageType.content = {
  ...contentLayout,
  left: [...(contentLayout.left ?? []), homeSidebarSections],
}

const dispatcherIndex = config.plugins.emitters.findIndex(
  (emitter) => emitter.name === "PageTypeDispatcher",
)
if (dispatcherIndex < 0) {
  throw new Error("PageTypeDispatcher emitter not found; sidebar lists were not injected")
}
config.plugins.emitters[dispatcherIndex] = PageTypes.PageTypeDispatcher({
  defaults: layout.defaults,
  byPageType: layout.byPageType,
})

export default config
export { layout }
