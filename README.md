# Rent Checklist

一个基于 Vue 3 + Vite + Element Plus 的租房检查与房屋对比工具。

它适合在看房现场快速记录房屋信息、逐项打分，并把多套房源放在同一个管理页里按分数进行横向比较。

## 功能简介

- 房屋管理页
  - 支持新增、编辑、删除多套房屋
  - 支持记录房屋名称、地址、月租、房东、联系方式和备注
  - 支持展示每套房屋的检查分数、建议和已处理项数量，便于对比
- 租房检查页
  - 内置分分类的检查项清单
  - 支持正常、存在问题、无法检查、物品缺失等状态选择
  - 支持一票否决项，命中后直接建议不要租
  - 支持实时计算扣分、总分和最终建议
- 交互体验
  - 支持移动端适配
  - 支持搜索检查项
  - 支持分类展开/收起
  - 支持本地持久化房屋数据与当前选中房屋

## 技术栈

- Vue 3
- Vite
- TypeScript
- Vue Router 4
- Element Plus
- Vitest

## 页面结构

- `/houses`
  - 房屋管理页
  - 用于维护房屋信息和比较房屋分数
- `/checklist`
  - 租房检查页
  - 只有先选择房屋后才可进入

## 本地运行

先安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

构建生产版本：

```bash
npm run build
```

运行测试：

```bash
npm run test
```

## 静态部署兼容性

- 本项目已调整为适合静态单页托管：
- 构建资源路径使用相对路径，适合 GitHub Pages、Cloudflare Pages 和本地直接打开 `dist/index.html`
- 路由使用 Hash 模式，不依赖服务端回退规则，避免静态托管刷新 404
- 数据保存在浏览器 `localStorage`，不依赖后端接口

## 部署到 Cloudflare Pages

- 推荐使用 Cloudflare Pages，而不是 Workers + Wrangler 的自动框架适配
- 构建配置如下：
  - Framework preset: `None` 或 `Vite`
  - Build command: `npm run build`
  - Build output directory: `dist`
  - Node version: `20`
- 部署完成后直接访问分配的域名即可

## 部署到 GitHub Pages

- 仓库中已包含 GitHub Actions 工作流：
  - [.github/workflows/deploy-pages.yml](file:///c:/Users/tianbin/Desktop/checklist/.github/workflows/deploy-pages.yml)
- 使用方式：
1. 将仓库推送到 GitHub
2. 进入 GitHub 仓库设置 `Settings -> Pages`
3. 在 `Build and deployment` 中将 `Source` 设为 `GitHub Actions`
4. 推送到 `main` 分支后会自动构建并部署

## 直接离线打开

- 构建后可直接打开 [dist/index.html](file:///c:/Users/tianbin/Desktop/checklist/dist/index.html)
- 页面路由会以 `#/houses`、`#/checklist` 的形式工作
- 房屋数据仍会保存在当前浏览器的本地存储中

## 使用流程

1. 进入房屋管理页，新建一套或多套房屋
2. 选择目标房屋进入检查页
3. 按照房间、家具、家电、厨房、卫生间、安全、房东等分类逐项检查
4. 查看实时得分、扣分明细和最终建议
5. 返回房屋管理页，对比不同房屋的分数和建议

## 项目特点

- 面向实际看房场景设计，强调现场快速判断
- 房屋信息与检查结果联动，便于多套房源比较
- 分数、建议和已处理项会自动回写到房屋管理页
- 界面兼顾桌面端和手机端使用体验

## 目录说明

```text
src/
  components/   通用组件
  data/         检查项与一票否决数据
  pages/        页面组件
  stores/       本地房屋状态管理
  router.ts     路由配置
  types.ts      类型定义
```
