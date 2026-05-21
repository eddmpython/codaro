import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, extname, posix, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { marked } from "marked";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..", "..");
const docsRoot = resolve(projectRoot, "docs");
const blogRoot = resolve(docsRoot, "blog");
const generatedRoot = resolve(projectRoot, "landing", "src", "lib", "generated");
const generatedDocsPageRoot = resolve(generatedRoot, "docsPages");
const basePath = process.env.NODE_ENV === "development" ? "" : "/codaro";

const blogCategoryMeta = new Map([
  ["01-product-and-runtime", { slug: "product-and-runtime", label: "Product and Runtime" }],
  ["02-editor-and-notebooks", { slug: "editor-and-notebooks", label: "Editor and Notebooks" }],
  ["03-learning-and-workflows", { slug: "learning-and-workflows", label: "Learning and Workflows" }],
  ["04-automation-and-apps", { slug: "automation-and-apps", label: "Automation and Apps" }],
]);

const docsSectionMeta = new Map([
  ["skills", "Skills"],
  ["identity", "Identity"],
  ["architecture", "Architecture"],
  ["ops", "Operations"],
]);

function toPosix(value) {
  return value.split(sep).join("/");
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+\]\([^)]+\)/g, " ")
    .replace(/^#+\s+/gm, "")
    .replace(/[*_>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sortByDateDesc(items) {
  return [...items].sort((left, right) => String(right.date).localeCompare(String(left.date)));
}

function escapeForModule(value) {
  return JSON.stringify(value, null, 2);
}

function docsContentModuleName(pathValue) {
  const digest = createHash("sha1").update(pathValue || "index").digest("hex").slice(0, 12);
  return `page${digest}`;
}

function collectBlogPosts() {
  const posts = [];
  for (const categoryEntry of readdirSync(blogRoot, { withFileTypes: true })) {
    if (!categoryEntry.isDirectory() || categoryEntry.name.startsWith("_")) {
      continue;
    }
    const categoryMeta = blogCategoryMeta.get(categoryEntry.name);
    if (!categoryMeta) {
      continue;
    }
    const categoryPath = resolve(blogRoot, categoryEntry.name);
    for (const postEntry of readdirSync(categoryPath, { withFileTypes: true })) {
      if (!postEntry.isDirectory()) {
        continue;
      }
      const filePath = resolve(categoryPath, postEntry.name, "index.md");
      const raw = readFileSync(filePath, "utf-8");
      const parsed = matter(raw);
      const slug = postEntry.name.replace(/^\d+-/, "");
      const fileMeta = parsed.data;
      const requiredFields = ["title", "date", "description", "category", "series", "seriesOrder", "thumbnail", "cardPreview"];
      for (const field of requiredFields) {
        if (fileMeta[field] === undefined || fileMeta[field] === null || fileMeta[field] === "") {
          throw new Error(`Missing blog frontmatter "${field}" in ${filePath}`);
        }
      }
      const previewValue = String(fileMeta.cardPreview);
      const cardPreview = previewValue.startsWith("./assets/")
        ? `${basePath}/docs/blog/assets/${previewValue.split("/").pop()}`
        : previewValue;
      posts.push({
        slug,
        title: String(fileMeta.title),
        date: String(fileMeta.date),
        description: String(fileMeta.description),
        category: String(fileMeta.category),
        categoryLabel: categoryMeta.label,
        categoryFolder: categoryEntry.name,
        categoryPath: `${basePath}/docs/blog/category/${String(fileMeta.category)}`,
        series: String(fileMeta.series),
        seriesOrder: Number(fileMeta.seriesOrder),
        thumbnail: `${basePath}${String(fileMeta.thumbnail)}`,
        cardPreview,
        draft: Boolean(fileMeta.draft),
        url: `${basePath}/docs/blog/${slug}`,
        html: marked.parse(parsed.content),
        text: stripMarkdown(parsed.content),
      });
    }
  }
  return sortByDateDesc(posts).filter((post) => !post.draft);
}

function normalizeDocsPath(filePath) {
  const relativePath = toPosix(relative(docsRoot, filePath));
  const withoutExtension = relativePath.replace(/\.md$/, "");
  if (withoutExtension.endsWith("/README")) {
    return withoutExtension.slice(0, -"/README".length);
  }
  if (withoutExtension === "README") {
    return "";
  }
  return withoutExtension;
}

function docsRouteFromMarkdownPath(pathValue) {
  const withoutExtension = pathValue.replace(/\.md$/, "");
  if (withoutExtension.endsWith("/README")) {
    return withoutExtension.slice(0, -"/README".length);
  }
  if (withoutExtension === "README") {
    return "";
  }
  return withoutExtension;
}

function normalizeDocsLink(href, sourceRelativePath) {
  if (
    href.startsWith("#")
    || href.startsWith("/")
    || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)
  ) {
    return href;
  }

  const [pathPart, hashPart] = href.split("#", 2);
  if (!pathPart.endsWith(".md")) {
    return href;
  }

  const sourceDir = posix.dirname(sourceRelativePath);
  const resolvedPath = posix.normalize(posix.join(sourceDir, pathPart));
  if (resolvedPath.startsWith("../")) {
    return href;
  }

  const route = docsRouteFromMarkdownPath(resolvedPath);
  return `${basePath}/docs/${route}${hashPart ? `#${hashPart}` : ""}`;
}

function renderDocsMarkdown(content, sourceRelativePath) {
  const renderer = new marked.Renderer();
  renderer.link = ({ href, title, tokens }) => {
    const label = renderer.parser.parseInline(tokens);
    const normalizedHref = normalizeDocsLink(String(href || ""), sourceRelativePath);
    const titleAttr = title ? ` title="${String(title).replace(/"/g, "&quot;")}"` : "";
    return `<a href="${normalizedHref}"${titleAttr}>${label}</a>`;
  };
  return marked.parse(content, { renderer });
}

function walkDocs(dirPath) {
  const results = [];
  const relativeDir = toPosix(relative(docsRoot, dirPath));
  if (relativeDir === "blog" || relativeDir.startsWith("blog/")) {
    return results;
  }
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    if (entry.name.startsWith("_")) {
      continue;
    }
    const fullPath = resolve(dirPath, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDocs(fullPath));
      continue;
    }
    if (entry.isFile() && extname(entry.name) === ".md") {
      results.push(fullPath);
    }
  }
  return results;
}

function collectDocsPages() {
  const pages = [];
  for (const filePath of walkDocs(docsRoot)) {
    const raw = readFileSync(filePath, "utf-8");
    const parsed = matter(raw);
    const fileMeta = parsed.data;
    const requiredFields = ["title", "description", "section", "order"];
    for (const field of requiredFields) {
      if (fileMeta[field] === undefined || fileMeta[field] === null || fileMeta[field] === "") {
        throw new Error(`Missing docs frontmatter "${field}" in ${filePath}`);
      }
    }
    const path = normalizeDocsPath(filePath);
    const sourceRelativePath = toPosix(relative(docsRoot, filePath));
    const isSkillPage = path === "skills" || path.startsWith("skills/");
    const rawSection = String(fileMeta.section);
    const skillCategory = fileMeta.category ? String(fileMeta.category) : "";
    const section = isSkillPage && skillCategory ? skillCategory : rawSection;
    const slugSegments = path ? path.split("/") : [];
    pages.push({
      path,
      slugSegments,
      title: String(fileMeta.title),
      description: String(fileMeta.description),
      section,
      sectionLabel: docsSectionMeta.get(section) || section,
      order: Number(fileMeta.order),
      draft: Boolean(fileMeta.draft),
      url: path ? `${basePath}/docs/${path}` : `${basePath}/docs`,
      html: renderDocsMarkdown(parsed.content, sourceRelativePath),
      text: stripMarkdown(parsed.content),
    });
  }
  return pages
    .filter((page) => !page.draft)
    .sort((left, right) => {
      if (left.section !== right.section) {
        return left.section.localeCompare(right.section);
      }
      if (left.order !== right.order) {
        return left.order - right.order;
      }
      return left.path.localeCompare(right.path);
    });
}

function buildDocsSections(pages) {
  return [...docsSectionMeta.entries()].map(([slug, label]) => ({
    slug,
    label,
    pages: pages.filter((page) => page.section === slug),
  })).filter((section) => section.pages.length > 0);
}

function toDocsNavPage(page) {
  return {
    path: page.path,
    slugSegments: page.slugSegments,
    title: page.title,
    description: page.description,
    section: page.section,
    sectionLabel: page.sectionLabel,
    order: page.order,
    url: page.url,
    contentModule: docsContentModuleName(page.path),
  };
}

function writeDocsPageModules(pages) {
  mkdirSync(generatedDocsPageRoot, { recursive: true });
  for (const page of pages) {
    const content = {
      html: page.html,
      text: page.text,
    };
    writeFileSync(
      resolve(generatedDocsPageRoot, `${docsContentModuleName(page.path)}.js`),
      `export const pageContent = ${escapeForModule(content)};\n`,
      "utf-8",
    );
  }
}

const posts = collectBlogPosts();
const docsPages = collectDocsPages();
const docsNavPages = docsPages.map(toDocsNavPage);
const docsSections = buildDocsSections(docsNavPages);
const postCategories = [...new Map(posts.map((post) => [post.category, { slug: post.category, label: post.categoryLabel }])).values()];
const postSeries = [...new Map(posts.map((post) => [post.series, { slug: post.series, label: post.series }])).values()];
const searchEntries = [
  ...posts.map((post) => ({
    kind: "writing",
    title: post.title,
    description: post.description,
    url: post.url,
    text: post.text,
    category: post.category,
  })),
  ...docsPages.map((page) => ({
    kind: "docs",
    title: page.title,
    description: page.description,
    url: page.url,
    text: page.text,
    category: page.section,
  })),
];

const modules = [
  ["posts.js", `export const posts = ${escapeForModule(posts)};\nexport const postCategories = ${escapeForModule(postCategories)};\nexport const postSeries = ${escapeForModule(postSeries)};\n`],
  ["docsNav.js", `export const docsPages = ${escapeForModule(docsNavPages)};\nexport const docsSections = ${escapeForModule(docsSections)};\n`],
  ["searchIndex.js", `export const searchEntries = ${escapeForModule(searchEntries)};\n`],
];

writeDocsPageModules(docsPages);

for (const [fileName, content] of modules) {
  writeFileSync(resolve(generatedRoot, fileName), content, "utf-8");
}

console.log(`[content] posts=${posts.length} docs=${docsPages.length} search=${searchEntries.length}`);
