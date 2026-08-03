/**
 * Verifies that the compatibility alias tokens survive into the production
 * CSS bundle. Guards against the aliases being tree-shaken, dropped by the
 * minifier, or lost to an import-order change.
 *
 * Usage: node scripts/verify-built-tokens.mjs
 */

import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

const ASSETS = new URL("../dist/assets", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")

const cssFile = readdirSync(ASSETS).find((f) => f.endsWith(".css"))
if (!cssFile) {
    console.error("No CSS bundle found in dist/assets -- run `npm run build` first.")
    process.exit(1)
}

const css = readFileSync(join(ASSETS, cssFile), "utf8")

const expected = [
    "--spacing-1", "--spacing-2", "--spacing-3", "--spacing-4", "--spacing-5",
    "--spacing-6", "--spacing-8", "--spacing-10", "--spacing-12", "--spacing-16", "--spacing-20",
    "--text-xs", "--text-sm", "--text-base", "--text-lg", "--text-xl",
    "--text-2xl", "--text-3xl", "--text-4xl", "--text-5xl",
    "--color-surface-base", "--color-surface-card",
    "--color-border-subtle", "--color-border-interactive",
    "--color-error-300", "--color-error-400", "--color-error-500", "--color-error-600",
    "--color-warning-300", "--color-warning-400", "--color-warning-500", "--color-warning-600",
    "--color-info-400", "--color-info-500",
    "--duration-normal", "--font-family-sans", "--font-weight-extrabold",
    "--shadow-accent", "--animation-delay"
]

const missing = []

for (const name of expected) {
    // Look for a declaration (name followed by a colon), not a var() usage.
    const declaration = new RegExp(`${name}\\s*:\\s*[^;}]+`)
    const match = css.match(declaration)

    if (match) {
        console.log(`  OK    ${match[ 0 ].trim()}`)
    } else {
        missing.push(name)
        console.log(`  MISS  ${name}`)
    }
}

console.log("")
if (missing.length) {
    console.error(`FAIL - ${missing.length} of ${expected.length} alias tokens are not in the built CSS: ${missing.join(", ")}`)
    process.exit(1)
}

console.log(`OK - all ${expected.length} alias tokens present in ${cssFile}`)
