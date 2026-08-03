/**
 * Finds CSS custom properties that are *used* via var(--x) but never *defined*
 * anywhere in the stylesheet graph.
 *
 * An undefined custom property makes the whole declaration invalid at compute
 * time, so `padding: var(--nope)` silently produces no padding at all. That
 * failure mode is invisible in the source and easy to introduce by renaming a
 * token, so this audit exists to catch it mechanically.
 *
 * Usage: node scripts/audit-css-vars.mjs
 */

import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const SRC = new URL("../src", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")

function walk(dir) {
    return readdirSync(dir).flatMap((entry) => {
        const full = join(dir, entry)
        return statSync(full).isDirectory() ? walk(full) : [ full ]
    })
}

const styleFiles = walk(SRC).filter((f) => f.endsWith(".scss") || f.endsWith(".css"))

const defined = new Set()
const used = new Map()

for (const file of styleFiles) {
    const content = readFileSync(file, "utf8")

    for (const match of content.matchAll(/^\s*(--[\w-]+)\s*:/gm)) {
        defined.add(match[ 1 ])
    }

    for (const match of content.matchAll(/var\(\s*(--[\w-]+)/g)) {
        const name = match[ 1 ]
        if (!used.has(name)) used.set(name, new Set())
        used.get(name).add(relative(SRC, file))
    }
}

const undefinedVars = [ ...used.keys() ]
    .filter((name) => !defined.has(name))
    .sort()

if (!undefinedVars.length) {
    console.log(`OK - ${used.size} custom properties used, all defined.`)
    process.exit(0)
}

console.log(`FAIL - ${undefinedVars.length} custom properties are used but never defined:\n`)

for (const name of undefinedVars) {
    const files = [ ...used.get(name) ]
    console.log(`  ${name}`)
    console.log(`      used in: ${files.join(", ")}`)
}

console.log(`\n${defined.size} defined, ${used.size} used, ${undefinedVars.length} missing.`)
process.exit(1)
