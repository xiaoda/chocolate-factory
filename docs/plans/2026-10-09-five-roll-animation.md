# V0.7 五辊精磨动画实施计划

> 使用 writing-plans 编写，并按 executing-plans 分批实现、验证；用户已确认 V0.6 造型，并选择“3D 动画＋侧面原理小图”。不派子代理。计划开始时本地 V0.6 尚未提交，为保留已确认的基线，在当前工作区增量开发；用户现已确认 V0.7 动画效果，并明确要求一并提交、推送。

**目标：** 用 60 秒、五阶段的交互讲解解释预混料入辊、逐级传料与颗粒细化；保留已确认外形和旧两套动画。

**架构：** 新增纯时间轴求值器、预分配的 three.js 料膜／转向标记，以及独立 SVG 侧面原理图。共用播放器、阶段讲解和单帧循环；3D 与 SVG 都从同一个时间状态更新，暂停、跳转、倒退不残留旧状态。

**技术栈：** 现有 Python、TypeScript、three.js、Vite、Vitest、unittest；原生 SVG，无新依赖、Blender、外部模型或图片上传。

## 依据与设计决策

- 用户在 2026-10-09 确认五辊静态造型；本轮只增加运动能力与教学叠加，不改辊筒尺寸、立架、电机、面板布局。
- [EP1165239B1《Milling device》](https://patents.google.com/patent/EP1165239B1/en)：核对检索索引提供的技术说明段落，支持相邻辊反向、差速逐级传膜、第五辊移除料膜；示例工况不作为本模型参数。全文直接打开受限，未声称查看专利附图。
- [Royal Duyvis Wiener 五辊机](https://duyviswiener.com/equipment/chocolate-processing/five-roll-refiner/)：检索内容用于核对精磨后进入精炼、辊隙／辊速可控及刮取机构的典型用途，不对应展品配置。
- [Bühler Finer S](https://www.buhlergroup.com/global/en/products/finer_s_five-rollerrefiner.html)：核对颗粒细化用途，不采用宣传产能或生产参数。
- 比较方案：仅 3D 辊面动画易被背面遮挡；3D＋侧面 SVG 可读性最好（采用，用户已选择）；完整物理仿真成本高且资料不足（不做）。
- 侧面小图是独立原理图，不是展品剖视图。刮刀／取料只出现在小图，不向机器添加物料接口；粉片状结果不是脱脂可可粉或成品巧克力。
- 相对速度、颜色、料膜厚度、颗粒大小、时间均为教学约定。不显示真实 rpm、辊隙、温度、产能、粒度或可操作的生产控制。
- 完整外观模式隐藏教学叠加，但不改变时间；默认工作示意。金色短线为运动标记，非实拍辊面纹理；不复刻蓝色光纹。

## 分镜

| 时间 | 阶段 | 画面与重点 |
|---|---|---|
| 0–10 | 认识预混料 | 原料已按配方预混；不是整豆或仅一份石磨可可浆 |
| 10–22 | 辊隙与转向 | 相邻辊反向，物料被带入接触区；运动标记帮助辨识 |
| 22–40 | 逐级传料 | 料膜沿辊面逐级向上，背面路径由侧面图补充 |
| 40–50 | 顶部刮取 | 小图用独立刮取示意和粉片表达典型结果，不定位展品出料口 |
| 50–60 | 结果对照 | 停在结果画面，颗粒细化但不是溶解；后续仍需精炼等处理 |

所有阶段关联正文第 4 步 `roller-refining`。造型参数与片段 URL 保持不变。

## 任务 1：数据与页面契约

文件：`web/scene_content.py`、`web/content.py`、`web/equipment_catalog.py`、`web/three_markup.py`、`web/build.py`；测试 `web/tests/test_five_roll_scene.py`、`test_animation_entry.py`、`test_build_integration.py`、`web/test_site.py`。

1. 先更新期望：五辊 animated、duration=60、5 阶段、来源有效、正文编号 4；同页 9 个阶段按钮、两套唯一进度控件。
2. 运行 `python -X utf8 -m unittest discover -s web/tests -p test_five_roll_scene.py -v`，预期旧静态配置失败。
3. 添加五段讲解与来源索引；更新边界、卡片、图文模板和侧面图容器，首页为 3 套动画。保留静态配置校验能力及旧两台链接。
4. 重跑测试；不改正文步骤文字，只补来源。

## 任务 2：纯时间轴与机械接口

文件：新增 `web/three/src/machines/five-roll-layout.ts`、`scenes/five-roll-timeline.ts`；修改 `machines/five-roll.ts`、`core/types.ts`；测试 `tests/five-roll-timeline.test.ts`、`five-roll.test.ts`。

1. 写失败测试：阶段端点、非法时间、确定性、顺序成膜、相邻转向与递增速度、结果停止、倒退还原。
2. 提取已确认的辊心／半径常量供模型和路径共同使用；提供 `setRollAngles(angles)`，仅转动辊筒，不推测电机联动。
3. 实现 `evaluateRefining(seconds)`：角度由平滑速度积分求得，料膜覆盖／刮取进度由绝对时间求得；不依赖墙钟和逐帧累加。
4. `rollSurfacePoint(index, progress)` 生成沿辊面、前后交替的料膜弧；测试接触端点连续性、与辊向一致性。
5. 运行 `node web/three/node_modules/vitest/vitest.mjs run --root web/three tests/five-roll-timeline.test.ts tests/five-roll.test.ts`。

## 任务 3：3D 料膜与同步侧面图

文件：新增 `scenes/five-roll-process.ts`、`ui/five-roll-diagram.ts`；修改 `scenes/five-roll-view.ts`、`viewer.css`；新增过程测试，更新适配器独立性测试。

1. 先测试几何数量稳定、可逆状态、释放幂等、适配器时长与标签。
2. 预分配五层贴辊料膜与运动标记；改变 drawRange／矩阵，不逐帧创建 geometry/material。不伪造真实物料口。
3. SVG 使用相同辊布局与时间状态，绘制五辊、转向、料膜路径、刮取与颗粒对照；标注“原理图／非展品剖面”。
4. 复用 `TimelinePlayer`、`bindProcessControls`；SVG 仅在共享 update 中更新，无第二个 RAF。销毁时清空图形并隐藏容器。
5. “完整外观”隐藏教学叠加；切换设备仍独占，重载时间归零。

## 任务 4：完整验收与文档

1. 完整构建 `python -X utf8 web/build_all.py`（类型检查＋Vite＋10 页 HTML）。
2. 全量 Vitest、`python -X utf8 -m unittest discover -s web/tests -v`、`python -X utf8 web/test_site.py`。
3. Chrome DevTools 先 list_pages，创建本任务独立 context；启动器确认真实 HTTP 地址。测试五段、暂停／重播／拖动／倒退、原理图同步、完整外观、切换释放、静止不持续帧、错误重试。
4. 实看桌面和手机模拟截图，核对文字、图形、控制区和横向溢出；回归石磨与涂层，不声称真实手机性能已测。
5. 更新 README、ASSETS 生成说明及 `web/three/五辊动画验收记录.md`；保留 V0.6 验收为历史并标注用户已确认。

## 进度

- [x] 造型与呈现方案确认、原理资料核对
- [x] 数据与页面契约
- [x] 时间轴与机械接口
- [x] 3D 过程与侧面图
- [x] 自动化、浏览器与文档验收
- [x] 用户动画效果确认（2026-10-09，用户要求提交并推送）

验收见 [`../../web/three/五辊动画验收记录.md`](../../web/three/五辊动画验收记录.md)：69 项测试通过，已实看桌面和 390／320 手机模拟截图，验证同步、倒退、离屏、切换和重试。侧面图前置到桌面侧栏，并以通用 `data-animation-region` 纳入查看器可见性判断，手机只看小图时也能继续。真实手机性能尚未验证。
