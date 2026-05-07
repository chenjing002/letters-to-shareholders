# 致股东信

中国上市公司致股东信合集。项目使用 [Astro](https://astro.build) 构建静态站点，并通过 GitHub Pages 部署。

网站当前提供三类主要浏览方式：按公司、按年份、单篇阅读。内容来源以 Markdown 为主，新增公司可通过导入脚本接入。

## 目录结构

```text
letters/                       # 原始整理稿，按“公司名-致股东信”分目录
scripts/import-letters.mjs     # 导入脚本：letters/ -> src/content/letters/
src/content/letters/           # 站点实际使用的内容
src/content/intros/            # 公司导读（可选）
src/pages/                     # Astro 页面
```

站点内容文件格式：

```yaml
---
company: "公司名称"
year: 2024
title: "公司名称 2024 年致股东信"
source: "来源（可选）"
date: "日期（可选）"
---

正文内容...
```

## 更新内容

如果是直接新增站点内容，可以手动在 `src/content/letters/{slug}/{year}.md` 下添加文件。

如果是从原始整理稿导入，使用当前仓库的标准流程：

1. 把原文放到 `letters/{公司名}-致股东信/{公司名}-{year}-致股东信.md`
2. 新公司需要先在 [`scripts/import-letters.mjs`](scripts/import-letters.mjs) 的 `SLUG_MAP` 中补 slug
3. 运行 `node scripts/import-letters.mjs --write`
4. 检查生成的 `src/content/letters/{slug}/{year}.md`
5. 运行 `npm run build` 验证
6. 推送到 `main`，GitHub Actions 会自动部署

## 本地开发

```bash
npm install
npm run dev
npm run build
npm run preview
```

预览地址默认是 `http://localhost:4321/letters-to-shareholders/`。

## 部署

- 推送到 `main` 后自动触发 GitHub Actions 构建和 GitHub Pages 部署
- 仓库 Pages Source 需设为 **GitHub Actions**

## 技术栈

- Astro 4
- GitHub Pages
- GitHub Actions
