#!/usr/bin/env node

/**
 * Import shareholder letters from letters/ into src/content/letters/.
 *
 * Original files live in:
 *   letters/{公司名}-致股东信/{公司名}-{year}-致股东信.md
 *
 * Content collection files live in:
 *   src/content/letters/{slug}/{year}.md   (with YAML frontmatter)
 *
 * The script always uses the body from the original file. If a content
 * collection file already exists, its frontmatter is preserved so that
 * hand-curated fields like `source` and `date` are not lost.
 *
 * Usage:
 *   node scripts/import-letters.mjs            # dry-run (default)
 *   node scripts/import-letters.mjs --write    # actually write files
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const LETTERS_DIR = path.join(ROOT, "letters");
const CONTENT_DIR = path.join(ROOT, "src", "content", "letters");

const dryRun = !process.argv.includes("--write");

// ── slug mapping ────────────────────────────────────────────────
// Maps Chinese company names (the part before -致股东信) to URL slugs.
// Add new entries here when new companies are added to letters/.
const SLUG_MAP = {
  "万科 A": "vanke",
  "腾讯控股": "tencent",
  "贵州茅台": "moutai",
  "招商银行": "cmb",
  "比亚迪": "byd",
  "格力电器": "gree",
  "美的集团": "midea",
  "中国平安": "pingan",
  "龙湖集团": "longfor",
};

// ── helpers ─────────────────────────────────────────────────────

/** Parse YAML frontmatter from a string. Returns { attrs, body }. */
function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { attrs: null, body: text };

  const attrs = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (m) {
      let val = m[2].trim();
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      // Detect numbers
      attrs[m[1]] = /^\d+$/.test(val) ? Number(val) : val;
    }
  }
  return { attrs, body: match[2] };
}

/** Build YAML frontmatter string from an attrs object. */
function buildFrontmatter(attrs) {
  const lines = ["---"];
  // Preserve key order: company, year, title, source, date
  for (const key of ["company", "year", "title", "source", "date"]) {
    if (attrs[key] == null) continue;
    const val = typeof attrs[key] === "number" ? attrs[key] : `"${attrs[key]}"`;
    lines.push(`${key}: ${val}`);
  }
  lines.push("---");
  return lines.join("\n");
}

// ── main ────────────────────────────────────────────────────────

if (!fs.existsSync(LETTERS_DIR)) {
  console.error(`letters/ directory not found at ${LETTERS_DIR}`);
  process.exit(1);
}

const companyDirs = fs
  .readdirSync(LETTERS_DIR)
  .filter((name) => name.endsWith("-致股东信") && !name.startsWith("._"));

if (companyDirs.length === 0) {
  console.log("No company folders found in letters/.");
  process.exit(0);
}

let created = 0;
let updated = 0;
let unchanged = 0;
let skipped = 0;

for (const dir of companyDirs.sort()) {
  const companyName = dir.replace(/-致股东信$/, "");
  const slug = SLUG_MAP[companyName];

  if (!slug) {
    console.warn(`⚠  No slug mapping for "${companyName}" — skipping. Add it to SLUG_MAP in this script.`);
    skipped++;
    continue;
  }

  const srcDir = path.join(LETTERS_DIR, dir);
  const destDir = path.join(CONTENT_DIR, slug);

  // Collect letter files, ignore macOS ._* metadata
  const files = fs
    .readdirSync(srcDir)
    .filter((f) => f.endsWith(".md") && !f.startsWith("._"));

  for (const file of files.sort()) {
    // Extract year from filename: {公司名}-{year}-致股东信.md
    const yearMatch = file.match(/-(\d{4})-致股东信\.md$/);
    if (!yearMatch) {
      console.warn(`⚠  Cannot parse year from "${file}" — skipping.`);
      skipped++;
      continue;
    }
    const year = Number(yearMatch[1]);

    // Read original file; strip any frontmatter that may already exist in the source
    const originalRaw = fs.readFileSync(path.join(srcDir, file), "utf-8");
    const originalBody = parseFrontmatter(originalRaw).body;

    // Check for existing content collection file
    const destFile = path.join(destDir, `${year}.md`);
    let attrs;

    if (fs.existsSync(destFile)) {
      const existing = fs.readFileSync(destFile, "utf-8");
      const parsed = parseFrontmatter(existing);

      if (parsed.attrs) {
        attrs = parsed.attrs;
      }

      // Check if body already matches
      const existingBody = parsed.body;
      if (existingBody.trim() === originalBody.trim()) {
        unchanged++;
        continue;
      }
    }

    // Build frontmatter — use existing attrs or create defaults
    if (!attrs) {
      attrs = {
        company: companyName,
        year,
        title: `${companyName} ${year} 年致股东信`,
      };
    }
    // Ensure required fields are present
    attrs.company = attrs.company || companyName;
    attrs.year = attrs.year || year;
    attrs.title = attrs.title || `${companyName} ${year} 年致股东信`;

    const output = buildFrontmatter(attrs) + "\n\n" + originalBody.trimStart();

    if (dryRun) {
      const action = fs.existsSync(destFile) ? "UPDATE" : "CREATE";
      console.log(`${action}  ${slug}/${year}.md`);
    } else {
      fs.mkdirSync(destDir, { recursive: true });
      fs.writeFileSync(destFile, output, "utf-8");
      if (fs.existsSync(destFile)) {
        updated++;
        console.log(`✓ updated  ${slug}/${year}.md`);
      } else {
        created++;
        console.log(`✓ created  ${slug}/${year}.md`);
      }
    }

    if (dryRun) {
      // Count for dry-run summary
      if (fs.existsSync(destFile)) updated++;
      else created++;
    }
  }
}

console.log("");
if (dryRun) {
  console.log(`Dry run complete. ${created} to create, ${updated} to update, ${unchanged} unchanged, ${skipped} skipped.`);
  console.log("Run with --write to apply changes.");
} else {
  console.log(`Done. ${created} created, ${updated} updated, ${unchanged} unchanged, ${skipped} skipped.`);
}
