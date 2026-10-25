#!/usr/bin/env node
/**
 * Report which layout slot contains a component class in a built Quartz page.
 *
 * Usage:
 *   node slot-probe.mjs <html-file> <class-token> [expected-slot|absent]
 *
 * Examples:
 *   node slot-probe.mjs public/strs-github.html toc left
 *   node slot-probe.mjs public/index.html graph right
 *   node slot-probe.mjs public/posts/index.html graph absent
 *
 * Slots: left, right, header, beforeBody, pageBody, afterBody, footer.
 * Understands the default, full-width and minimal frames; canvas pages may need
 * manual inspection because their frame has a different DOM shape.
 * Exit codes: 0 = match, 1 = mismatch/not found, 2 = bad input.
 */
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const args = process.argv.slice(2)
if (args.length < 2) {
  console.error("usage: node slot-probe.mjs <html-file> <class-token> [expected-slot|absent]")
  process.exit(2)
}

const [file, token, expectation] = args
let html
try {
  html = readFileSync(resolve(file), "utf8")
} catch (error) {
  console.error(`cannot read ${file}: ${error instanceof Error ? error.message : String(error)}`)
  process.exit(2)
}

const find = (needle, from = 0) => html.indexOf(needle, from)
const bodyStart = find('<div id="quartz-body">')
if (bodyStart < 0) {
  console.error(`${file}: no #quartz-body found (is this a built page?)`)
  process.exit(2)
}

const leftStart = find('<div class="left sidebar">', bodyStart)
const centerStart = find('<div class="center', bodyStart)
const rightStart = find('<div class="right sidebar">', centerStart >= 0 ? centerStart : bodyStart)
const footerStart = find("<footer", centerStart >= 0 ? centerStart : bodyStart)
const centerEndCandidates = [rightStart, footerStart].filter((index) => index >= 0)
const centerEnd =
  centerStart >= 0
    ? centerEndCandidates.length > 0
      ? Math.min(...centerEndCandidates)
      : html.length
    : -1

const ranges = []
if (leftStart >= 0 && centerStart > leftStart) ranges.push(["left", leftStart, centerStart])
if (centerStart >= 0) ranges.push(["center", centerStart, centerEnd])
if (rightStart >= 0) {
  ranges.push(["right", rightStart, footerStart > rightStart ? footerStart : html.length])
}
if (footerStart >= 0) ranges.push(["footer", footerStart, html.length])

if (centerStart >= 0) {
  const headerStart = find("<header", centerStart)
  const headerEnd = headerStart >= 0 ? find("</header>", headerStart) : -1
  if (headerStart >= 0 && headerStart < centerEnd) {
    ranges.push([
      "header",
      headerStart,
      headerEnd >= 0 ? headerEnd + "</header>".length : centerEnd,
    ])
  }

  const pageHeaderStart = find('<div class="page-header">', centerStart)
  const articleStart = find("<article", pageHeaderStart >= 0 ? pageHeaderStart : centerStart)
  if (pageHeaderStart >= 0 && pageHeaderStart < centerEnd) {
    ranges.push([
      "beforeBody",
      pageHeaderStart,
      articleStart > pageHeaderStart ? articleStart : centerEnd,
    ])
  }

  if (articleStart >= 0 && articleStart < centerEnd) {
    const articleEnd = find("</article>", articleStart)
    ranges.push([
      "pageBody",
      articleStart,
      articleEnd > articleStart ? articleEnd + "</article>".length : centerEnd,
    ])
  }

  const afterStart = find('<div class="page-footer">', centerStart)
  if (afterStart >= 0 && afterStart < centerEnd) {
    ranges.push(["afterBody", afterStart, centerEnd])
  }
}

const countIn = (start, end) => {
  let count = 0
  for (const match of html.slice(start, end).matchAll(/class="([^"]*)"/g)) {
    if (match[1].split(/\s+/).includes(token)) count++
  }
  return count
}

let hits = ranges
  .map(([slot, start, end]) => ({ slot, count: countIn(start, end) }))
  .filter((hit) => hit.count > 0)

// header is inside beforeBody; a specific center slot supersedes "center".
if (hits.some((hit) => hit.slot === "header")) {
  hits = hits.filter((hit) => hit.slot !== "beforeBody")
}
if (hits.some((hit) => ["header", "beforeBody", "pageBody", "afterBody"].includes(hit.slot))) {
  hits = hits.filter((hit) => hit.slot !== "center")
}

if (hits.length === 0) {
  if (expectation === "absent") {
    console.log(`${file}: ${token} -> absent (ok)`)
    process.exit(0)
  }
  console.error(`${file}: class "${token}" not found`)
  process.exit(1)
}

for (const hit of hits) {
  console.log(`${file}: ${token} -> ${hit.slot} (${hit.count})`)
}

if (expectation === "absent") {
  console.error(`expected absent, found ${hits.map((hit) => hit.slot).join(", ")}`)
  process.exit(1)
}

if (expectation && !hits.some((hit) => hit.slot === expectation)) {
  console.error(`expected ${expectation}, got ${hits.map((hit) => hit.slot).join(", ")}`)
  process.exit(1)
}
