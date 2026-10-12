import { registerCondition } from "./quartz/plugins/loader/conditions"
import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"

// Conditions used by `layout.condition` in quartz.config.yaml must be registered
// *before* the config (and therefore the layout) is loaded, because the layout is
// built while `loadQuartzConfig()` runs.
//
// "not-article": render on the home page, on folder listings (`<folder>/index`)
// and on tag pages (`/tags`, `/tags/<tag>`), but not on individual articles.
// This keeps the Explorer as left-sidebar navigation on landing/listing pages,
// while article pages leave the left sidebar to the page title + toolbar
// (search / dark mode / reader mode) only.
registerCondition("not-article", (props) => {
  const slug = props.fileData.slug ?? ""
  return slug === "index" || slug.endsWith("/index") || slug === "tags" || slug.startsWith("tags/")
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
