# Open Pathway

[![Public project checks](https://github.com/LENSFORGET/open-pathway/actions/workflows/ci.yml/badge.svg)](https://github.com/LENSFORGET/open-pathway/actions/workflows/ci.yml)

**把下一步，留给可能。** 一个独立、双语、注重隐私的成长规划交互作品。

Open Pathway is a bilingual, local-only planning experience built with React and Vite. Explore a direction, create a small plan, check your readiness, and reflect in a demo workspace.

![Original pathway illustration](public/images/pathway.svg)

本项目以虚构情境展示产品设计、前端工程、多步骤交互和数据边界设计。它是个人开源作品，不代表任何商业机构，也不提供实际顾问服务。无需 API Key、账号或云端数据库即可完整运行。

## 可以体验什么

| 页面       | 路径          | 能力                                                |
| ---------- | ------------- | --------------------------------------------------- |
| 双语首页   | `/`           | 响应式布局、原创插画、项目理念、功能入口            |
| 探索评估   | `/assessment` | 五步问卷、方向分支、草稿恢复、可解释结果、JSON 导出 |
| 准备度自查 | `/readiness`  | 八个问题、五个维度、透明计分、待准备清单            |
| 知识手册   | `/qa`         | 固定知识问答、问题切换、可链接的条目、数据使用说明  |
| 演示工作台 | `/staff`      | 虚构记录、本机结果、状态更新、筛选、JSON 导出       |

`/renewal-check` 是准备度页面的兼容入口，不包含签证或资格判断。`/staff` 是公开演示界面，不是生产后台，也没有登录或身份验证。

## 本地运行

使用 Node.js 22 或更高版本及 npm：

```sh
git clone https://github.com/LENSFORGET/open-pathway.git
cd open-pathway
npm ci
npm run dev
```

打开终端显示的本地地址。首次安装会下载依赖；页面运行时的字体、图标与插画全部由本站提供，不调用外部 API。

```sh
npm run build        # 编译前端并准备静态托管适配器
npm run preview      # 预览构建产物
npm test             # 先 build，再执行模型、语言和托管测试
npm run audit:public # 检查允许发布的文件及常见秘密信息模式
npm run check        # build + tests + public audit
npm run package:public # 检查后生成 open-pathway-source.tgz
```

归档只包含审核范围内的源文件，不含依赖目录、构建缓存、Git 历史或部署账号信息。测试使用 Node.js 内置测试运行器，不需要额外测试框架。

## 推荐体验顺序

1. 从首页进入探索评估，选择「职涯与技能」，观察第三题的选项变化。
2. 完成五步，查看报告中的选择依据；返回第一题修改方向，确认旧分支答案被清除。
3. 把结果加入本机工作台，修改状态并试用状态筛选。
4. 完成八题准备度检查，查看五维度结果及待准备事项。
5. 在知识手册阅读数据说明，再通过页尾按钮清除演示资料。

使用 `?lang=tc` 或 `?lang=en` 可以指定界面语言；也可在顶部切换。中文浏览器默认繁体中文，其他语言默认英文。

## 技术设计

- **React 19 + Vite**：按 URL 路径呈现页面，没有远程后端依赖。
- **可解释规则**：纯函数按预设选项生成建议；准备度每题 0–2 分，再换算百分比。它不是经过验证的能力、心理或专业评估工具。
- **有边界的储存**：只将允许的选项代码和状态写入 `sessionStorage`；恢复时再次校验。语言偏好单独写入 `localStorage`。
- **可访问性**：原生单选框、字段组、键盘焦点、跳转正文链接、移动菜单、减少动态效果偏好。
- **可移植托管**：输出 `dist/client`，另附可选的静态 Sites worker；不绑定任何部署账号或域名。
- **持续检查**：GitHub Actions 运行构建、单元测试和公开发布审查。

```text
src/
  App.jsx                页面、交互和本机工作台
  model.js               问题、分支、规则、数据白名单
  siteLanguage.js        语言检测与跨页面偏好
  styles.css             响应式视觉系统
public/images/           原创、可审阅的 SVG 插画
tests/                   规则、隐私边界、语言及静态托管测试
scripts/                 构建、公开审查及干净归档
worker/                  可选静态资源适配器
```

## 数据与隐私

不收集姓名、电话号码、邮箱、证件、自由文本或文件；不发送邮件、消息或表单；不读取任何现有业务系统。示例记录为代码中编写的虚构项目编号。问答来自本仓库固定内容，不是 AI 服务。

| 数据                                   | 保存位置                          | 清除方式               |
| -------------------------------------- | --------------------------------- | ---------------------- |
| 预设选项、保存的演示计划、准备度与状态 | 当前分页面会话的 `sessionStorage` | 页尾「清除演示资料」   |
| 语言偏好                               | 本机 `localStorage`               | 同一个清除按钮         |
| 内建示例的临时状态                     | 页面内存                          | 刷新页面或清除演示资料 |
| 手动导出的 JSON                        | 使用者下载目录                    | 使用者自行删除下载文件 |

浏览器还原分页可能恢复 `sessionStorage`，因此请使用明确的清除按钮。储存被禁用时，当前页面继续使用内存，刷新后可能丢失进度。此项目不会删除同一浏览器中其他网站的数据。

公开部署后，托管服务商可能保留标准访问日志；前端本机处理不等于托管平台没有日志。本仓库没有分析埋点或追踪 SDK。

## 复用与发布

项目仓库：[LENSFORGET/open-pathway](https://github.com/LENSFORGET/open-pathway)。欢迎通过 Fork 复用，或通过 Pull Request 贡献改进。

**只发布本项目目录，或解压后的 `open-pathway-source.tgz` 内容。不要上传上一级工作区。**

如果要从源码归档建立一个独立仓库，先解压到空目录，再初始化 Git。归档不包含 Git 历史或远程配置。检查后创建第一个提交：

```sh
git init -b main
npm run check
git status --short
git add .
git diff --cached --stat
git diff --cached
git commit -m "Initial open-source release"
```

然后在自己的 GitHub 创建一个空仓库，根据 GitHub 提供的地址添加 `origin` 并推送 `main`。提交作者请使用自己的 GitHub 身份或 GitHub 提供的 noreply 邮箱。

`audit:public` 是可重复的文件边界与常见模式检查，不是知识产权结论，也无法证明不存在所有类型的隐私信息。新增图片、文案和依赖时仍应检查来源与授权。

## 部署

在自己的托管账户中新建静态站点，构建命令设为 `npm run build`，静态目录设为 `dist/client`。仓库自带通用 `vercel.json` 路由与安全响应头，不含项目 ID、账号 ID、密钥或环境变量。

其他静态托管服务需要将应用页面回退到 `index.html`。本项目使用站点根路径资源；直接部署到 GitHub Pages 的仓库子路径尚未配置，需先调整 base 和路由。发布到 GitHub 仓库与发布可访问网站是两个独立步骤。

当前版本没有生产数据库、真实身份验证、付费功能或生成式 AI。若扩展为真实服务，需要另行设计认证、服务端验证、访问控制和数据保留策略；不要把这个演示工作台当作生产管理系统。

## 开源许可与素材

本仓库原创代码、文字与几何 SVG 按 [MIT License](LICENSE) 发布。允许使用、修改、分发和商业使用，并须保留许可及版权声明。许可文本参照 [Open Source Initiative 的 MIT 页面](https://opensource.org/license/mit)。

第三方依赖、字体和图标仍适用各自许可，详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。MIT 声明仅适用于贡献者有权授权的内容，不授予其他主体的商标或作品权利。

贡献方式见 [CONTRIBUTING.md](CONTRIBUTING.md)，安全问题处理见 [SECURITY.md](SECURITY.md)。
