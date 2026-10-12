import { registerCondition } from "./quartz/plugins/loader/conditions"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import type { QuartzTransformerPluginInstance } from "./quartz/plugins/types"

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

const pageSurfaces: QuartzTransformerPluginInstance = {
  name: "PageSurfaces",
  externalResources() {
    return {
      css: [{ inline: true, content: PAGE_SURFACE_CSS }],
    }
  },
}

const config = await loadQuartzConfig()

// Appended last so this stylesheet is emitted after the theme's own resources.
config.plugins.transformers.push(pageSurfaces)

export default config
export const layout = await loadQuartzLayout()
