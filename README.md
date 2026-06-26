# ADP 样板间 · 腾讯 CSIG 大模型应用实践

> Agent Development Platform · 8 个强样板间展示页面
> 基于「焱云—大模型应用实践汇总表」85 条案例筛选沉淀

## 目录结构

```
.
├── index.html               # 入口页面
├── assets/
│   ├── css/main.css         # 全部样式（腾讯蓝科技风 + 响应式）
│   └── js/app.js            # 渲染 + 路由 + 对话 Demo 打字机
├── data/
│   └── templates.json       # 数据层（所有内容均在此修改）
└── README.md
```

## 本地启动

> ⚠️ 必须通过 HTTP 服务器访问，不能直接 `file://` 双击打开（fetch 加载 JSON 会被浏览器拦截）。

任选其一：

```bash
# Python 3
python3 -m http.server 8000

# Node.js
npx serve -p 8000

# VSCode：右键 index.html → Open with Live Server
```

然后浏览器打开 `http://localhost:8000`。

## 功能速览

- **首页总览**：8 个样板间卡片网格 + 数据看板 + 5 类核心能力矩阵
- **侧边栏导航**：1-8 编号快速切换
- **样板间详情**：业务痛点 / 核心能力 / Agent 编排流程图 / 量化成效 / 对话 Demo
- **对话 Demo**：左侧预设话术 + 右侧聊天界面，模拟意图识别、工具调用、知识检索、模型推理全过程，最终回答带打字机效果
- **响应式**：PC（>=1100px）/ Pad（768-1099px）/ 手机（<768px）三套布局

## 当前内容状态

| # | 样板间 | 状态 |
|---|--------|------|
| 1 | AI 装维助手 | ✅ 精装样板间（含 3 条预设话术） |
| 2 | 云网故障智能处置 1-5-10 | ⏳ 框架占位 |
| 3 | ChatBI 智能问数 | ⏳ 框架占位 |
| 4 | 工程建设智能监管 | ⏳ 框架占位 |
| 5 | 客服工单智能分析 | ⏳ 框架占位 |
| 6 | 一线支撑助手（智慧优问） | ⏳ 框架占位 |
| 7 | 智能变更申请（五级变更） | ⏳ 框架占位 |
| 8 | 网络配置智能稽核 | ⏳ 框架占位 |

## 如何补充其他样板间内容

打开 `data/templates.json`，找到对应样板间，删除 `"placeholder": true`，按下面字段补全即可，刷新页面立即生效：

```jsonc
{
  "orchestration": {
    "nodes": [
      { "id": "n1", "type": "input",  "label": "用户输入", "desc": "..." },
      { "id": "n2", "type": "intent", "label": "意图识别", "desc": "..." },
      { "id": "n3", "type": "tool",   "label": "工具调用", "desc": "..." },
      { "id": "n4", "type": "rag",    "label": "知识检索", "desc": "..." },
      { "id": "n5", "type": "llm",    "label": "模型推理", "desc": "..." },
      { "id": "n6", "type": "output", "label": "结果生成", "desc": "..." }
    ]
  },
  "metrics": [
    { "name": "...", "value": 100, "unit": "..." }
  ],
  "demo": {
    "presets": [
      {
        "title": "话术标题",
        "user": "用户问题",
        "steps": [
          { "type": "intent", "text": "..." },
          { "type": "tool",   "text": "..." },
          { "type": "rag",    "text": "..." },
          { "type": "answer", "text": "最终回答（带打字机效果）" },
          { "type": "action", "text": "执行的实际动作" }
        ]
      }
    ]
  }
}
```

可用的 `step.type`：`intent` / `tool` / `rag` / `multimodal` / `llm` / `answer` / `action`

## 后续升级路径

当前是 **JSON 数据驱动**，无后端、可直接发布静态页。
后续如果需要在线编辑/多人协作，可平滑升级到 **CloudBase 云开发**：

1. 在 CloudBase 创建数据库集合 `adp_templates`，导入 `data/templates.json`
2. 把 `app.js` 中的 `fetch('./data/templates.json')` 替换为 CloudBase SDK 查询
3. 增加一个简易管理后台页面（CloudBase 提供数据库可视化编辑器）

## 技术栈

- 纯 HTML5 + CSS3 + 原生 JavaScript（无框架、无构建）
- 设计语言：腾讯蓝科技风（#0052D9 主色 + 深蓝渐变 + 数据可视化氛围）
- 兼容：现代浏览器（Chrome / Edge / Safari / Firefox 最新两个大版本）
