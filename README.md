# 致股东信

中国上市公司致股东信合集。静态站点，基于 [Astro](https://astro.build) 构建，部署在 GitHub Pages。

## 功能

- **首页** — 搜索公司、随机卡片展示（带 3D 扇形动画）
- **全部公司** — 网格浏览所有已收录公司
- **阅读器** — 固定侧边栏年份导航，正文区域独立滚动
- **对比模式** — 同时查看同一公司两个年份的股东信，并排阅读
- **亮色/暗色主题** — 基于 Flexoki 配色，跟随系统或手动切换

## 内容结构

所有致股东信以 Markdown 文件存放在 `src/content/letters/` 目录下，按公司分文件夹、按年份命名：

```
src/content/letters/
├── vanke/          # 万科 A
│   ├── 2001.md
│   ├── 2002.md
│   └── ...
├── moutai/         # 贵州茅台
│   ├── 2020.md
│   └── ...
└── {company-slug}/
    └── {year}.md
```

每个 Markdown 文件需包含以下 frontmatter：

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

## 添加新内容

1. 在 `src/content/letters/` 下创建公司文件夹（使用拼音或英文 slug）
2. 添加年份 Markdown 文件，填写 frontmatter
3. 提交并推送到 `main` 分支
4. GitHub Actions 自动构建部署

**添加新公司示例：**

```bash
mkdir src/content/letters/alibaba
```

创建 `src/content/letters/alibaba/2023.md`：

```yaml
---
company: "阿里巴巴"
year: 2023
title: "阿里巴巴 2023 年致股东信"
---

信件正文...
```

推送后站点自动更新，无需修改任何代码。

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建静态站点
npm run build

# 预览构建结果
npm run preview
```

## 部署

站点通过 GitHub Actions 自动部署到 GitHub Pages：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动运行 `npm run build`
3. 构建产物部署到 GitHub Pages

**首次部署设置：**

1. 在 GitHub 仓库 Settings → Pages 中，将 Source 设为 **GitHub Actions**
2. 推送代码到 `main` 分支即可触发部署

## 技术栈

- **Astro 4** — 静态站点生成，内容集合，Markdown 支持
- **Flexoki** — 配色系统（支持亮色/暗色模式）
- **GitHub Pages** — 静态托管
- **GitHub Actions** — CI/CD 自动构建部署
