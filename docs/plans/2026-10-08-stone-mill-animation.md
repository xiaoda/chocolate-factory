# 石磨机研磨动画实施方案

> 执行方式：使用 executing-plans 的分批实现与验证流程，在当前任务中执行；不派子代理，不自动提交或推送。用户已要求继续开发研磨动画。

**目标：** 在已确认的石磨机造型上讲清可可碎粒经研磨形成可可浆的典型过程。

**架构：** 复用 SceneDefinition、公共 TimelinePlayer 和播放控件。新增石磨专用纯函数时间轴与物料场景，所有状态只由教学时间求值，跳转和倒退不累积误差。保留照片依据与原理示意的区分，不新增未经确认的出料接口。

**技术栈：** 现有 three.js / TypeScript / Vite / Vitest / Python 静态生成器；无新依赖、Blender、外部模型或流体引擎。

## 方案与边界

推荐约 60 秒典型原理示意：0–10 秒认识投料，10–28 秒反复碾磨，28–46 秒形成浆态，46–60 秒对照结果。另一种方案只显示物料变化，不动机械；真实运动复原需补充设备资料。用户已明确选择“按典型原理示意开发”。

- 运动采用料盘研磨面相对石辊运动、石辊自转的教学约定，不能证明照片中展品的驱动形式、方向或速度。固定横梁、立柱、底座及前侧未知机构不跟着旋转。
- 投料从上方开口示意，不造料斗、管线；结果留在盘内，不伪造出口或取料动作。
- 粗颗粒逐渐变细并被连续浆态表面取代，不用“换成棕色”代替形态变化，不表现加水或压榨。
- 输出是含可可脂和非脂固体的可可浆／可可液块，不是脱脂可可粉，也不是可直接包装的巧克力。
- 60 秒是讲解编排，不能用来推导真实研磨时间、粒径、温度、速度或配方。
- 默认不自动播放；可播放/暂停、重播、拖动、阶段跳转、旋转缩放；离屏和后台挂起，播完停止。

## 任务 1：数据和确定性时间轴

文件：修改 `web/scene_content.py`、`web/tests/test_stone_scene.py`；新增 `web/three/src/scenes/stone-mill-timeline.ts`、`web/three/tests/stone-mill-timeline.test.ts`。

1. 先写失败测试：四阶段连续覆盖 60 秒且都引用 nib-grinding / 正文第 3 步；无效输入、边界、顺播/倒退一致；研磨结束后机械角度不再改变。
2. 配置阶段文案、证据边界、来源；保留导出器的静态契约测试，但改为专门的静态 fixture。
3. 实现 `evaluateGrinding(seconds)` 返回 phase、投料进度、颗粒细化、浆态比例与研磨角度；机械开始和结束平滑缓动，结果阶段停住。
4. `python -X utf8 web/export_scene_data.py` 后运行新增 Vitest / Python 测试，预期通过。

## 任务 2：模型运动与物料

文件：修改 `src/core/types.ts`、`src/machines/stone-mill.ts`；新增 `src/scenes/stone-mill-process.ts`、`tests/stone-mill-process.test.ts`，补充 `tests/stone-mill.test.ts`。

1. 先测石辊轴向、双辊相对旋转、研磨底盘和固定件分离；原造型、工作视图、高亮及释放测试保留。
2. 使用共享几何/InstancedMesh 表示有限数量碎粒；固定种子分布，投料落点避开横梁与石辊上方。
3. 浆态为盘内浅层独立几何；粒子缩小、表面逐渐连续，少量表面纹路说明形态。不能每帧创建/销毁网格或材质。
4. 测试跳转回零可恢复、状态不含 NaN、结束无飞行碎粒、几何数量不增长、资源只释放一次。

## 任务 3：场景和界面接入

文件：修改 `src/scenes/stone-mill-view.ts`、`web/three_markup.py`、`src/viewer.css`、`tests/scene-adapters.test.ts`、`web/tests/test_build_integration.py`、`web/test_site.py`。

1. 页面文案按设备 ID 配置，不能按 animated 状态把石磨标题错当涂层机；播放器时长、阶段数量和初始讲解由数据生成。
2. 复用公共播放器；默认工作区域示意，保留完整外观与照片对照。
3. 四阶段按钮和同步讲解；始终可见“教学运动示意”边界；结果说明不用假出料路径表达。
4. 标签只保留当前最有用的 1–2 项；窄屏加载按钮、操作按钮和讲解不能裁切/横向溢出。
5. 更新自动集成测试，确保石磨 60 秒 / 4 阶段、涂层 75 秒 / 5 阶段，其他 8 页无 3D 变动。

## 任务 4：浏览器、回归和交付

1. 完整构建、类型检查、全部单元测试和站点检查。
2. `python -X utf8 web/start_preview.py` 核实并复用本任务服务，记录 PID、cwd、实际端口；不弹新终端。
3. Chrome DevTools 先 list_pages，再创建本任务唯一 isolatedContext；所有操作显式指定返回的 pageId。
4. 实际截图检查四个阶段、默认/完整外观、桌面和 390/320 手机模拟视口，核对颗粒不穿出盘壁、浆态确实可辨。
5. 播放、暂停、倒退/重播、阶段/正文链接、结束停止、离屏/后台挂起、减少动态偏好、失败重试及实例数量回归；回归涂层动画。
6. 记录绘制调用、几何数量与空闲帧；不把模拟视口当实体手机，不承诺未经实测的 FPS。
7. 更新 README、素材边界和独立验收记录；交付预览等待用户确认，不自动 commit/push。

验证命令：

```powershell
python -X utf8 web/export_scene_data.py
node web/three/node_modules/vitest/vitest.mjs run --root web/three
python -X utf8 -m unittest discover -s web/tests -v
python -X utf8 web/build_all.py
python -X utf8 web/test_site.py
python -X utf8 web/start_preview.py
```

## 执行状态

- [x] 数据与时间轴
- [x] 机械运动和物料场景
- [x] 双设备界面集成
- [x] 浏览器验收和文档
- [x] 用户动画效果确认（2026-10-09：用户反馈“效果不错”，并要求提交、推送 GitHub）

## 核对资料

- 用户照片 10／11：只用于外形依据，不用于推定看不到的机械传动。
- [ICCO Processing Cocoa](https://www.icco.org/processing-cocoa/)：碎粒研磨的浆态结果，以及后续压榨制粉的独立性。
- [CocoaTown Melanger](https://cocoatown.com/pages/melanger)、[12SLTA](https://cocoatown.com/products/ecgc12slta-melanger/)：现代石磨的石上研磨、旋转容器与石辊作为典型原理参考；不是本展品的型号证明，不引用其工艺参数。
