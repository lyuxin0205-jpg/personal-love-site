# Netlify 部署说明

这个项目是 Next.js App Router 项目，但当前页面都可以静态生成，后台管理也先使用浏览器本地 `localStorage`。为了避免 Netlify 的 Next.js 函数路由没有正确接管时出现首页 404，项目已改为 Next.js 静态导出，Netlify 直接发布 `out/` 目录。

## 仓库内已固定的配置

`netlify.toml` 已经写入：

```toml
[build]
  command = "next build"
  publish = "out"

[build.environment]
  NODE_VERSION = "20"
  NEXT_TELEMETRY_DISABLED = "1"
```

`next.config.ts` 已经写入：

```ts
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};
```

`package.json` 已指定：

```json
"engines": {
  "node": "20.x"
}
```

## Netlify 后台需要确认

- Base directory：留空，或者使用仓库根目录。
- Build command：`next build`
- Publish directory：`out`
- Node version：`20`
- Package manager：Netlify 会根据 `pnpm-lock.yaml` 自动使用 pnpm。
- Environment variables：建议添加 `NEXT_PUBLIC_SITE_URL=https://你的站点名.netlify.app`

如果 Netlify 后台之前手动填过 `.next`、`dist`、`build` 或其他发布目录，请改成 `out`，或者清空后让仓库里的 `netlify.toml` 生效。

## 重新部署

1. 推送本次提交到 GitHub。
2. 回到 Netlify 项目，点击 Deploys。
3. 选择 Trigger deploy。
4. 如果旧配置仍然影响访问，选择 Clear cache and deploy site。

## 当前限制

`/admin` 目前是本地浏览器内容管理页，数据保存在访问者自己的 `localStorage` 中。它适合先管理占位内容和本机预览，后续接入 Supabase、Strapi、Notion 或自建数据库后，才会变成真正的云端后台。
