#!/usr/bin/env node
/**
 * 数据校验器（零依赖）
 * 用法：node tools/validate.mjs
 *
 * 校验范围：
 *  - manifest.json 结构与引用的分块文件是否存在
 *  - categories / industries / 各 case 文件的必填字段与类型
 *  - 引用完整性：template.category、template.industries[]、industry.relatedCases[]
 *  - id 唯一性、case 文件名与其 id 是否一致
 *  - demo.presets[].steps[].type 与 orchestration.nodes[].type 是否为已知类型
 *
 * 退出码：通过为 0，存在错误为 1（可用于 CI / pre-commit）。
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(ROOT, 'data');

// 与 assets/js/app.js 中 STEP_LABELS 保持一致的已知步骤 / 节点类型
const KNOWN_TYPES = new Set([
  'input', 'intent', 'plan', 'tool', 'rag', 'multimodal', 'llm',
  'answer', 'action', 'output', 'chart', 'table', 'doc', 'image', 'verdict',
]);
const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

const errors = [];
const err = (where, msg) => errors.push(`✗ [${where}] ${msg}`);

function load(rel) {
  const abs = join(DATA, rel);
  if (!existsSync(abs)) {
    err(rel, '文件不存在');
    return null;
  }
  try {
    return JSON.parse(readFileSync(abs, 'utf-8'));
  } catch (e) {
    err(rel, `JSON 解析失败：${e.message}`);
    return null;
  }
}

const isStr = (v) => typeof v === 'string' && v.length > 0;
const isArr = (v) => Array.isArray(v);
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

function requireFields(where, obj, fields) {
  for (const [name, check] of Object.entries(fields)) {
    if (!check(obj[name])) err(where, `字段 ${name} 缺失或类型错误`);
  }
}

// ---------- manifest ----------
const manifest = load('manifest.json');
if (!manifest) finish();

if (!isObj(manifest.parts)) err('manifest.json', 'parts 缺失或非对象');
if (!isArr(manifest.cases)) err('manifest.json', 'cases 缺失或非数组');

// ---------- categories ----------
const categories = load(manifest.parts.categories || 'categories.json');
const catIds = new Set();
if (isArr(categories)) {
  categories.forEach((c, i) => {
    const w = `categories[${i}]`;
    requireFields(w, c, { id: isStr, name: isStr });
    if (c.color != null && !HEX.test(c.color)) err(w, `color 非法（应为 #RGB/#RRGGBB）：${c.color}`);
    if (catIds.has(c.id)) err(w, `id 重复：${c.id}`);
    catIds.add(c.id);
  });
} else {
  err('categories.json', '应为数组');
}

// ---------- industries ----------
const industries = load(manifest.parts.industries || 'industries.json');
const indIds = new Set();
if (isArr(industries)) {
  industries.forEach((it, i) => {
    const w = `industries[${i}](${it && it.id})`;
    requireFields(w, it, { id: isStr, name: isStr, tagline: isStr });
    if (it.scenarios != null && !isArr(it.scenarios)) err(w, 'scenarios 应为数组');
    if (it.relatedCases != null && !isArr(it.relatedCases)) err(w, 'relatedCases 应为数组');
    if (indIds.has(it.id)) err(w, `id 重复：${it.id}`);
    indIds.add(it.id);
  });
} else {
  err('industries.json', '应为数组');
}

// product / meta 仅做基本存在性与类型校验
const product = load(manifest.parts.product || 'product.json');
if (product && !isObj(product)) err('product.json', '应为对象');
load(manifest.parts.meta || 'meta.json');

// ---------- cases ----------
const tplIds = new Set();
const cases = [];
manifest.cases.forEach((rel) => {
  const t = load(rel);
  if (!t) return;
  const w = `${rel}`;
  // 核心必填字段（14 个案例均具备）
  requireFields(w, t, {
    id: isStr, name: isStr, shortName: isStr, category: isStr, tagline: isStr,
    capabilities: isArr, kpis: isArr, metrics: isArr,
    painPoints: isArr, industries: isArr, demo: isObj,
  });
  // 可选字段：缺省时应用会展示「可补全」占位；若存在则校验类型
  if (t.orchestration != null && !isObj(t.orchestration)) err(w, 'orchestration 应为对象');
  if (t.build != null && !isObj(t.build)) err(w, 'build 应为对象');
  if (t.deploy != null && !isObj(t.deploy)) err(w, 'deploy 应为对象');
  // 文件名应与 id 一致
  const fileId = basename(rel).replace(/\.json$/, '');
  if (t.id && t.id !== fileId) err(w, `文件名(${fileId}) 与 id(${t.id}) 不一致`);
  if (tplIds.has(t.id)) err(w, `id 重复：${t.id}`);
  tplIds.add(t.id);

  // orchestration.nodes 类型
  if (isObj(t.orchestration) && isArr(t.orchestration.nodes)) {
    t.orchestration.nodes.forEach((n, ni) => {
      if (!KNOWN_TYPES.has(n.type)) err(w, `orchestration.nodes[${ni}].type 未知：${n.type}`);
    });
  }
  // demo.presets[].steps[].type
  if (isObj(t.demo) && isArr(t.demo.presets)) {
    t.demo.presets.forEach((p, pi) => {
      (p.steps || []).forEach((s, si) => {
        if (!KNOWN_TYPES.has(s.type)) err(w, `demo.presets[${pi}].steps[${si}].type 未知：${s.type}`);
      });
    });
  }
  cases.push({ rel, t });
});

// ---------- 引用完整性 ----------
cases.forEach(({ rel, t }) => {
  if (t.category && !catIds.has(t.category)) err(rel, `category 引用不存在：${t.category}`);
  (t.industries || []).forEach((id) => {
    if (!indIds.has(id)) err(rel, `industries 引用不存在：${id}`);
  });
});
(industries || []).forEach((it, i) => {
  (it.relatedCases || []).forEach((id) => {
    if (!tplIds.has(id)) err(`industries[${i}](${it.id})`, `relatedCases 引用不存在的案例：${id}`);
  });
});

finish();

function finish() {
  if (errors.length) {
    console.error(errors.join('\n'));
    console.error(`\n校验未通过：${errors.length} 个问题`);
    process.exit(1);
  }
  console.log(
    `✓ 校验通过：${catIds.size} 分类 / ${indIds.size} 行业 / ${tplIds.size} 案例`
  );
}
