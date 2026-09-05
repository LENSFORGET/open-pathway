# Open Pathway

[![Public project checks](https://github.com/LENSFORGET/open-pathway/actions/workflows/ci.yml/badge.svg)](https://github.com/LENSFORGET/open-pathway/actions/workflows/ci.yml)

**把下一步，留给可能。** 一个帮助你探索方向、制定行动计划、回顾进展的双语成长规划应用。

Open Pathway helps you explore a direction, turn it into a small action plan, and reflect on your progress. Built with React and Vite, it brings guided questions, readiness checklists, and a personal workspace together in a browser-based experience.

![Original pathway illustration](public/images/pathway.svg)

从学习一项技能、整理作品集，到完成一个创作项目，Open Pathway 用五个问题帮你梳理目标、阶段、重点、节奏和回顾方式。你可以把结果保存到工作台，检查行动前的准备情况，并随时调整计划。

## 功能一览

| 页面       | 路径          | 用途                                                |
| ---------- | ------------- | --------------------------------------------------- |
| 首页       | `/`           | 了解规划方法，选择探索入口                          |
| 探索评估   | `/assessment` | 通过五步问卷梳理方向，生成起步计划                  |
| 准备度自查 | `/readiness`  | 从方向、时间、工具、回馈与心态五个面向整理准备事项  |
| 知识手册   | `/qa`         | 阅读起步方法、计分说明、工作台用法与数据保存方式    |
| 规划工作台 | `/workspace`  | 汇总计划与准备度结果，更新状态、筛选记录和导出 JSON |

问卷会根据「学习与成长」「职涯与技能」「创作与个人项目」三种方向调整后续选项。结果页展示起步建议及对应的选择依据，方便回看和修改。

## 快速开始

使用 Node.js 22 或更高版本及 npm：

```sh
git clone https://github.com/LENSFORGET/open-pathway.git
cd open-pathway
npm ci
npm run dev
```

打开终端显示的本地地址即可体验。应用在浏览器中完成规划与数据保存，字体、图标和插画随站点一起提供。

## 体验一段完整的规划流程

1. 进入探索评估，选择一个方向，例如「职涯与技能」。
2. 完成五步问卷，查看起步建议及答案摘要。
3. 将计划加入工作台，按「待探索」「回顾中」「已完成」更新进展。
4. 完成准备度自查，查看五个维度的分数与待准备清单。
5. 导出计划留作记录，或回到问卷调整方向与节奏。

顶部按钮可切换繁体中文和英文；`?lang=tc` 与 `?lang=en` 可指定页面语言。草稿在当前分页中保存，刷新后会从待完成的问题继续。

## 实现方式

- **React 19 + Vite**：页面组件负责交互，纯函数处理问卷分支、答案校验与报告生成。
- **透明的规划规则**：方向决定起步建议，其他选择组成回顾清单；结果附有规则版本。
- **五维准备度**：八道题各计 0–2 分，总分换算为百分比；各维度按所属题目独立计算，帮助安排下一步准备工作。
- **本机数据管理**：答案保存前与恢复时都经过选项白名单校验。
- **双语与可访问性**：支持跨页面语言偏好、键盘操作、原生字段组、移动菜单和减少动态效果设置。
- **原创视觉**：暖纸色、深绿与黄铜色组成界面，几何拱门插画呼应探索路径的主题。
- **持续检查**：GitHub Actions 自动执行构建、测试与公开文件审查。

```text
src/
  App.jsx                页面、导航、规划工作台与导出交互
  model.js               问题、分支、计分规则与数据校验
  siteLanguage.js        语言检测与跨页面偏好
  styles.css             响应式视觉系统
public/images/           原创 SVG 插画
tests/                   模型、语言及静态托管测试
scripts/                 构建、文件审查及源码打包
worker/                  静态资源适配器
```

## 数据保存

应用保存你选择的选项代码、计划状态与准备度答案。工作台附有一个「每周阅读小计划」示例，帮助熟悉状态切换与筛选。

| 数据                               | 保存位置                        | 管理方式                 |
| ---------------------------------- | ------------------------------- | ------------------------ |
| 草稿、保存的计划、准备度与计划状态 | 当前分页会话的 `sessionStorage` | 页尾「清除规划资料」按钮 |
| 语言偏好                           | 本机 `localStorage`             | 同一个清除按钮           |
| 内建示例的临时状态                 | 页面内存                        | 刷新页面后重设           |
| 导出的 JSON                        | 使用者选择的下载位置            | 自行保存或删除文件       |

浏览器还原分页可能恢复会话资料，清除按钮可以明确删除本应用保存的资料。储存被禁用时，应用使用当前页面内存继续运行，刷新后进度可能丢失。部署者可通过托管平台管理访问日志及保留期限。

## 开发与验证

```sh
npm run build          # 构建前端与静态托管适配器
npm run preview        # 预览构建产物
npm test               # 构建后运行模型、语言与托管测试
npm run audit:public   # 检查发布文件清单与常见敏感信息模式
npm run check          # 构建、测试与公开文件审查
npm run format         # 格式化源代码与文档
npm run package:public # 检查后生成 open-pathway-source.tgz
```

测试使用 Node.js 内置测试运行器，覆盖分支切换、草稿恢复、数据校验、准备度计算与语言选择。发布审查依据允许的文件清单检查源码；新增素材时，请同步记录来源和许可。

## 部署与复用

静态托管的构建命令为 `npm run build`，输出目录为 `dist/client`。仓库提供 `vercel.json` 页面路由与安全响应头，以及可选的 Sites 静态资源适配器。

其他静态托管服务需要将应用页面回退到 `index.html`。当前资源与导航使用站点根路径；部署到 GitHub Pages 等仓库子路径时，需要一起调整资源 base 和页面路由。

欢迎通过 Fork 复用，通过 Pull Request 贡献改进。源码包可用于建立自己的项目；发布前运行 `npm run check`，并审阅待提交文件。

## 开源许可

原创代码、文字与几何 SVG 按 [MIT License](LICENSE) 发布。使用、修改和分发时请保留许可及版权声明。

第三方依赖、字体和图标适用各自许可，详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。贡献流程见 [CONTRIBUTING.md](CONTRIBUTING.md)，安全问题可通过 [SECURITY.md](SECURITY.md) 中的私密报告入口提交。
