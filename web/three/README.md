# 3D 设备观察室：公共查看器与程序化模型

当前版本：V0.4，2026-10-09。石磨机新增 60 秒典型研磨动画；涂层机保留已获确认的 V0.2 动画。两场景分别使用 60 秒 / 四阶段与 75 秒 / 五阶段配置，共用播放器和查看器。

涂层机 V0.2：在已确认的程序化模型上完成第二批任务 4–6：确定性时间轴、物料变化和互动讲解。75 秒是教学编排，不是真实加工时间；没有模拟真实流体、真实冷却设备或精密内部结构。

## 查看涂层机

从项目根目录执行 `python -X utf8 web/start_preview.py`，在输出的实际地址后打开 `enrobed.html#equipment-3d`。点击“加载 3D 模型”后：

- 拖动旋转，滚轮或双指缩放；也可使用加减按钮。
- 主动点击“播放工序”，观看两路输入 → 淋涂/底涂 → 控量回收 → 独立冷却 → 输出对照；播完停住，不自动循环。
- 暂停、重播；拖动进度会暂停并跳到准确状态。工序按钮和上/下一步跳到各阶段中间的关键帧，保持暂停。
- “工作部件示意”隐藏局部挡板和罩体；“完整外观”恢复外壳，不改变教学时间。
- 使用“立体／正面／俯视”和“复位视角”。
- 点击模型编号或右侧部件名，高亮并显示说明。
- 点击“放大对照”并排查看原始设备照片，点击照片或展牌打开原有放大窗口。
- 画布获得焦点后，方向键旋转，`+` / `-` 缩放。

照片、文字和输入输出说明先显示；three.js 主体在点击加载后才下载，动画不自动开始。默认不循环，离屏/后台临时挂起；用户主动暂停后不会因回到页面而自动播放。尊重减少动态效果偏好，可静帧逐步阅读或主动播放。文件协议不保证能加载 ES 模块，请使用本地 HTTP；无需将项目上传外网。

## 查看石磨机研磨动画

打开 `chocolate.html#equipment-3d`，点击加载模型，再主动播放。约 60 秒的四段讲解：

| 教学时间 | 内容 |
|---|---|
| 0–10 秒 | 可可碎粒从上方开口进入盘内，投料位置为示意 |
| 10–28 秒 | 盘面与石辊相对运动，颗粒反复经过接触区并逐渐细化 |
| 28–46 秒 | 粗颗粒变少、变细，连续浆态表面逐渐出现 |
| 46–60 秒 | 运动停在结果画面，对照可可碎粒与可可液块，不演示取料 |

支持旋转/缩放、三个预设视角、四组部件高亮和实拍 10／11 对照。默认工作区域示意：隐藏前半盘壁与上缘，不表示真实设备可这样拆开；完整外观可随时恢复，不改变时间。阶段按钮跳到 5、19、37、53 秒并暂停；所有讲解仍关联正文第 3 步。暂停、重播、进度拖动、离屏挂起、减少动态偏好和错误重试沿用公共逻辑。

盘面转动与双石辊自转只是教学约定，不能证明照片中设备的实际驱动、转向或速度；60 秒也不是生产时间。输入为可可碎粒，结果为含细小固体的可可浆／可可液块，不是加水化开，不是脱脂可可粉或成品巧克力。未知出料接口仍不创建，结果留在盘内。

## 开发环境与命令

实测 Node.js 24.14.0、npm 11.9.0、Python 3.12.6。锁定 three.js 0.186.1、Vite 8.3.3、Vitest 5.0.3、TypeScript 5.9.3、three 类型 0.186.0。引擎约束见 `package.json`，安装以 `package-lock.json` 为准。

从仓库根目录：

```powershell
npm --prefix web/three ci
python -X utf8 web/export_scene_data.py
npm --prefix web/three run typecheck
npm --prefix web/three run test
python -X utf8 -m unittest discover -s web/tests -v
python -X utf8 web/build_all.py
python -X utf8 web/test_site.py
```

`build_all.py` 会重新导出场景数据、构建模块并生成包含 3D 的页面，任何子过程失败均非零退出。通过 Node 直接运行 TypeScript 和 Vite 入口，避免 `npm run` 再派生 `.cmd` / shell 的启动链；Windows 使用无窗口标记并保留标准输出和错误。预览继续复用项目现有隐藏启动器，不额外启动 Vite 服务。

`generated/enrobed.json` 和 `generated/stone-mill.json` 来自 `content.py` 和 `scene_content.py`，不手动编辑；删除该目录后运行导出器或完整构建即可恢复。`npm run test` 是单次执行，不会开启监听进程。

## 结构与资源约束

- `src/bootstrap.ts`：轻量加载入口、失败提示、照片对照开关。
- `src/registry.ts`：设备 ID 白名单与动态模块加载，不从 DOM 拼接模块路径。
- `src/core/types.ts`：`SceneDefinition`、`SceneInstance` 和设备接口；动画能力可选，静态场景不创建空播放器。
- `src/viewer.ts`：公共相机、光照、单一帧循环、热点、离屏挂起、上下文丢失与释放，不直接依赖任何设备。
- `src/scenes/enrobed-view.ts`、`stone-mill-view.ts`：设备适配器，提供模型、标签、视图参数与可选动画。
- `src/core/playback.ts`：按总时长配置的通用播放器，与设备及 DOM 无关。
- `src/core/timeline.ts`：涂层专用纯函数状态求值。位置/包覆/冷却只依赖教学时间，倒退不保留上一状态。
- `src/scenes/stone-mill-timeline.ts`：纯函数研磨状态、固定种子粒子轨迹及平滑起止角度；可准确倒退。
- `src/scenes/stone-mill-process.ts`：96 个实例化碎粒、独立浆态表面和示意纹路；只更新矩阵、可见性与材质，不逐帧创建网格。
- `src/scenes/enrobed.ts`、`src/products/`、`src/effects/`：物料、实体外层、巧克力幕、底涂、流向标记及抽象冷却区。
- `src/ui/`：播放器、同步讲解、物料状态与标签语义；完整正文仍通过稳定步骤 ID 关联。
- `src/machines/enrober.ts`、`stone-mill.ts`：独立模型、部件与可确认的接口；高亮/资源释放共用 `core/machine-resources.ts`。石磨盘壁使用 LatheGeometry，石辊使用确定性顶点颜色，无额外贴图。
- `src/geometry/`：几何辅助函数、共享材质及按部件/材质合并静态几何，保留独立外壳和运动网带。
- `../three_markup.py`：静态 HTML 和无 JavaScript 时仍可读的边界说明。

输出仅位于 `../dist/assets/three/`，不得将 Vite 输出改成上层 `dist`。已有图文构建仍可用 `python web/build.py` 单独执行，但它会移除页面中的 3D 入口。

播放时只有一个 `requestAnimationFrame` 循环；暂停时仅在相机、尺寸、部件选择等变化时绘制，空闲不持续刷新；离屏不绘制，也不推进工序时间。物料几何预先建立，不在每帧创建网格。部件高亮使用临时材质副本，取消时释放；销毁模型时共享资源只释放一次。

构建按共享依赖与场景自动拆块：查看器约 380 KB，共用几何/three 依赖块约 209 KB，共用控制/辅助块约 8.8 KB；石磨机约 12.9 KB，涂层机约 16.5 KB（均为未压缩文件大小）。点击加载后只请求当前场景及共用块，不预加载另一台设备。当前构建没有 500 KB 单块告警；拆块不等于减少全部下载总量。许可随产物输出至 `THIRD_PARTY_LICENSES.md`。

## 事实边界与下一步

模型轮廓参考用户照片 25／26；尺寸、背面和隐藏连接是简化示意。按钮并不代表真实机器控制功能。全包覆、回流路径和独立蓝色冷却区展示典型原理，不证明原设备的配置；控量不等于凝固；下游包装只作文字说明。

石磨机外形参考照片 10／11，具体出料口、取料方式和石辊转向待核实，不把前侧可见机构认定为出料阀。石磨静态造型、典型原理示意方向及本批动画效果均已获用户确认。

新增场景时，先在 `scene_content.py` 配置页面映射与正文稳定 ID，再增加模型及场景适配器、注册白名单并补测试；不要复制公共查看器。正文编号由导出器保留，场景 ID 不必等于页面 slug。

V0.2 动画效果已获用户确认。后续仍需真实移动端性能测试，不代表九条工艺线全部完成。当前验证见 [研磨动画验收记录](研磨动画验收记录.md)，静态与公共底座历史见 [石磨机验收记录](石磨机验收记录.md)，涂层机历史见 [验收记录](验收记录.md)。

## 本批技术核对

- [three.js MeshStandardMaterial](https://threejs.org/docs/pages/MeshStandardMaterial.html)：使用独立几何外层及表面粗糙度变化，不用颜色替换冒充包覆。
- [MDN requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)：使用帧时间戳推进教学时间。
- [MDN Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)：隐藏页面时暂停推进，恢复时不累计后台时差。

- [ICCO Processing Cocoa](https://www.icco.org/processing-cocoa/)：碎粒研磨与后续压榨制粉的区别，不用于推定展品机构。
- [three.js LatheGeometry](https://threejs.org/docs/pages/LatheGeometry.html)：开口圆盘的旋转截面建模。

- [CocoaTown Melanger](https://cocoatown.com/pages/melanger)：现代石磨的运动与石上研磨原理参照，不证明本展品传动；不引用加工参数。
