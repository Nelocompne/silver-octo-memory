import { registerCondition } from "./quartz/plugins/loader/conditions"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"

// Conditions used by `layout.condition` in quartz.config.yaml must be registered
// *before* the config (and therefore the layout) is loaded, because the layout is
// built while `loadQuartzConfig()` runs.
//
// A slug is an "article" when it is not the home page (`index`), a folder listing
// (`<folder>/index`) or a tag page (`tags`, `tags/<tag>`).
const isArticle = (slug: string): boolean =>
  slug !== "index" && !slug.endsWith("/index") && slug !== "tags" && !slug.startsWith("tags/")

// "not-article": render on the home page, on folder listings and on tag pages,
// but not on individual articles. This keeps the Explorer as left-sidebar
// navigation on landing/listing pages, while article pages leave the left
// sidebar to the page title + toolbar (search / dark mode / reader mode).
registerCondition("not-article", (props) => !isArticle(props.fileData.slug ?? ""))

// "has-many-headings": show the article table of contents in the left sidebar
// (the slot the Explorer occupies on listing pages) once an article has more
// than 3 entries in its table of contents (headings up to the configured
// `maxDepth`). Shorter articles keep the left sidebar unchanged.
registerCondition("has-many-headings", (props) => {
  if (!isArticle(props.fileData.slug ?? "")) return false
  const toc = (props.fileData as Record<string, unknown>).toc
  return Array.isArray(toc) && toc.length > 3
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
