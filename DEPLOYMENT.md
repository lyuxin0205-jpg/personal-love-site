# Vercel 部署说明

## 部署前确认

- 项目类型：Next.js App Router。
- 包管理器：仓库包含 `pnpm-lock.yaml`，Vercel 会默认使用 pnpm 安装依赖。
- Build Command：`next build`，也可以保持 Vercel 默认配置。
- Output Directory：不需要填写，Next.js 由 Vercel 自动识别。
- 静态资源：图片放在 `public/images`，音乐放在 `public/audio`，代码中使用 `/images/...` 和 `/audio/...` 绝对路径。

## 环境变量

在 Vercel Project Settings → Environment Variables 中添加：

```text
NEXT_PUBLIC_SITE_URL=https://你的域名
```

本地可参考 `.env.example`。这个变量用于 SEO metadata 和 Open Graph 图片地址，不影响页面视觉。

## GitHub 上传流程

1. 在 GitHub 创建一个新仓库。
2. 本地把项目提交到 git。
3. 添加远程仓库：

```powershell
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M main
git push -u origin main
```

如果当前电脑没有安装 git，需要先安装 Git for Windows，或者直接在 GitHub 网页上传项目文件。

## Vercel 部署流程

1. 打开 Vercel，选择 Add New Project。
2. 导入刚才的 GitHub 仓库。
3. Framework Preset 保持 `Next.js`。
4. Build Command 保持默认或填写 `next build`。
5. 添加环境变量 `NEXT_PUBLIC_SITE_URL`。
6. 点击 Deploy。

## 当前限制

- `/admin` 是本地浏览器版本，内容保存到当前浏览器的 `localStorage`。
- 部署到 Vercel 后，后台修改内容只会保存在访问者自己的浏览器里，不会同步到云端。
- 真正长期使用时，建议后续接 Supabase、Notion、Strapi 或自建数据库，把 `lib/content-store.tsx` 的保存来源替换掉。
