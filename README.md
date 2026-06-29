# 腾讯云 ADP · 智能体开发平台样板间

> Agent Development Platform · 企业级智能体应用样板展示站
> 围绕「产品能力 — 行业方案 — 落地案例」三层叙事，沉淀 14 个可交互的智能体样板案例

一个纯静态、数据驱动的展示站点：用真实的业务场景，演示腾讯云 ADP（智能体开发平台）如何把「知识推理 / 流程编排 / 内容生成 / 安全治理」等能力，转化为可评审、可上线、可追踪的业务结果。

## 目录结构

```
.
├── index.html               # 单页入口（顶部 3 大板块导航 + 内容区切换）
├── assets/
│   ├── css/
│   │   ├── main.css         # 主样式（腾讯蓝科技风 + 响应式）
│   │   └── mode-fix.css     # 移动端适配与配色微调
│   ├── js/app.js            # 渲染 + 路由 + 对话 Demo 引擎
│   └── images/              # Logo、海报、配图等静态资源
├── data/
│   └── templates.json       # 唯一数据层（所有展示内容均在此维护）
└── README.md
```

## 本地启动

> 必须通过 HTTP 服务器访问，不能直接 `file://` 双击打开（`fetch` 加载 JSON 会被浏览器拦截）。

任选其一：

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve -p 8000

# VSCode：右键 index.html → Open with Live Server
```

然后浏览器打开 `http://localhost:8000`。

## 站点结构（3 大板块）

| 板块 | 内容 |
|------|------|
| **主页** | 产品定位、四大核心能力亮点、能力矩阵、关键指标看板 |
| **案例介绍** | 14 个智能体样板案例，按 5 类能力分类筛选，每个案例含可交互对话 Demo |
| **行业解决方案** | 8 个行业入口，每个行业聚合典型场景与关联案例 |

### 案例详情包含

业务痛点 → 核心能力 → Agent 编排流程图 → 量化成效（KPI / Metrics）→ **可交互对话 Demo** → 搭建路径（build）→ 部署上线路径（deploy）。

对话 Demo 不止打字机回答，还支持图表、表格、文档卡片、判责结论、隐患识图等多种富媒体步骤，完整还原「意图识别 → 工具调用 → 知识检索 → 模型推理 → 结果产出」全过程。

## 案例总览（14 个）

> 案例为面向各行业的独立样板，按业务能力归入 5 类，可在「案例介绍」板块筛选。

| # | 案例 | 能力分类 | 主要行业 |
|---|------|---------|---------|
| 1 | 企业知识库 RAG 问答助手 | 服务营销 | 教育 / 政务 / 金融 / 医疗 |
| 2 | 智能装维助手 | 服务营销 | 运营商 |
| 3 | 云网故障智能处置（1-5-10） | 云网运维 | 运营商 / 制造 / 能源 |
| 4 | 智能问数助手（ChatBI） | 数据分析 | 金融 / 零售 / 教育 / 制造 |
| 5 | 工程建设智能监管 | 工程建设 | 制造 / 能源 / 零售 |
| 6 | 客服工单智能分析 | 运营治理 | 运营商 / 金融 / 政务 等 |
| 7 | AI 管理驾驶舱 | 运营治理 | 金融 / 零售 / 制造 |
| 8 | 一线支撑助手（智慧优问） | 服务营销 | 运营商 / 政务 |
| 9 | 智能变更申请（五级变更） | 云网运维 | 运营商 / 政务 |
| 10 | 网络配置智能稽核 | 云网运维 | 运营商 / 能源 |
| 11 | 理财顾问 Copilot（智能投顾） | 服务营销 | 金融 |
| 12 | AI 智能助教 | 服务营销 | 教育 |
| 13 | 门店导购 Copilot | 服务营销 | 零售消费 |
| 14 | 智能导诊助手 | 服务营销 | 医疗 |

**能力分类**：服务营销 · 云网运维 · 数据分析 · 工程建设 · 运营治理
**覆盖行业**：金融 · 医疗 · 政务 · 运营商 · 制造 · 能源 · 教育 · 零售消费

## 如何维护内容

所有展示内容都集中在 `data/templates.json`，改完刷新页面即生效，**无需改动 HTML / JS**。

- `product`：主页的产品定位、核心能力亮点、能力矩阵、指标看板
- `industries`：行业解决方案板块的 8 个行业（含典型场景与 `relatedCases` 关联案例）
- `categories`：5 类能力分类（用于案例筛选）
- `templates`：案例数组，每条案例的结构如下：

```jsonc
{
  "id": "case-id",
  "name": "案例名称",
  "shortName": "短名（导航/标签用）",
  "category": "service | ops | data | engineer | governance",
  "industries": ["telecom", "finance"],   // 所属行业 id
  "tagline": "一句话卖点",
  "highlight": true,                        // 是否首页强推
  "kpis":   [{ "label": "...", "value": "...", "trend": "up|down" }],
  "painPoints":   ["业务痛点 ..."],
  "capabilities": [{ "key": "...", "name": "...", "desc": "..." }],
  "orchestration": {                        // Agent 编排流程图
    "nodes": [
      { "id": "n1", "type": "input",  "label": "...", "desc": "..." },
      { "id": "n2", "type": "intent", "label": "...", "desc": "..." }
    ]
  },
  "metrics": [{ "name": "...", "value": "...", "unit": "..." }],
  "demo": { "presets": [ /* 对话 Demo，见下 */ ] },
  "build":  { "intro": "...", "steps": [{ "title": "...", "desc": "..." }] },
  "deploy": { "intro": "...", "steps": [{ "title": "...", "desc": "..." }] }
}
```

### 对话 Demo 步骤类型

每个 `demo.presets[]` 含 `title` / `user` / `steps[]`，`step.type` 可用：

| type | 用途 |
|------|------|
| `intent` | 意图识别 |
| `tool` | 工具 / 接口调用 |
| `rag` | 知识检索 |
| `multimodal` | 多模态识别（识图 / OCR 等） |
| `llm` | 模型推理 |
| `answer` | 最终回答（支持 Markdown，带打字机效果） |
| `action` | 执行的实际动作 |
| `chart` | 图表（`chartType`: `bar` / `hbar` / `pie` / `line`，配 `bars[]`） |
| `image` | 配图 / 识别结果（`shot` 为图注） |
| `table` | 表格（`columns[]` + `rows[]`） |
| `doc` | 文档卡片（`doc.title` / `meta` / `body[]`） |
| `verdict` | 判责 / 校验结论（`verdict.result` / `tone` / `summary` / `points[]`） |

`orchestration.nodes[].type` 可用：`input` / `intent` / `tool` / `rag` / `multimodal` / `llm` / `action` / `output`。

## 部署

纯静态站点，无后端、无构建步骤，可直接托管到任意静态服务（GitHub Pages / 对象存储 / CDN 等）。当前通过 GitHub Pages 发布：推送到 `main` 即自动重建。

## 技术栈

- 纯 HTML5 + CSS3 + 原生 JavaScript（无框架、无构建、零依赖）
- 设计语言：腾讯蓝科技风（`#0052D9` 主色 + 品牌蓝 `#0068B5` + 数据可视化氛围）
- 响应式：PC / Pad / 手机 三套布局自适应
- 兼容：现代浏览器（Chrome / Edge / Safari / Firefox 最新两个大版本）
