# 石磨机静态样板与公共查看器实施方案

> 按 `executing-plans` 技能分批执行；本轮已经用户授权开发，不自动提交或推送 Git。

**目标：** 在基础巧克力页加入照片 10／11 对应的可旋转石磨机静态样板，并让它与现有涂层机共用查看器。

**架构：** 采用共享渲染/相机/热点/生命周期底座和独立场景适配器。动画时钟与播放控件参数化；涂层机状态求值仍属于涂层场景。石磨机本轮没有动画控制器，不渲染空壳播放按钮。

**技术栈：** 沿用 Python、TypeScript、three.js、Vite、Vitest；不新增运行依赖，不用 Blender。

## 范围与证据

- 已实际查看照片 10 与展牌 11：保留开口圆盘、双石辊、横梁/立柱/调节手柄、中心轴和侧传动部件。
- 展牌介绍研磨用途，但不能据此确定具体运动关系、历史年代、工况和完整配置。静态样板不转动石辊或整个料盘。
- 投料区用上方开口作示意；前侧可见机构只标注外形，不能认定它就是出料阀。出料口、取料方式和转向待核实，不添加假管道。
- 工艺说明复用正文“初步研磨”：可可碎粒 → 可可浆/可可液块；不是直接制得脱脂可可粉，也不把压榨塞进这台机器。
- 本轮停在造型确认；不做研磨动画、完整基础巧克力流程或其他新设备。
- UI 延续奶油纸色/深绿，机器采用米灰金属、可可棕支架和浅色石辊；石材颜色由代码生成，不修改/上传照片。

## 选择与取舍

采用最小场景适配器，而非复制整个查看器或建立通用流程编辑器。模型工厂返回部件、热点和可选动画适配器；渲染器不导入具体设备。这样可用两种不同能力的场景检验边界，又不提前设计批量流程编排。

## 任务 1：公共功能与场景数据

**文件：**
- 新增 `web/three/src/core/playback.ts`、`web/three/src/registry.ts`、`web/three/src/scenes/enrobed-view.ts`。
- 修改 `web/three/src/core/types.ts`、`core/timeline.ts`、`ui/controls.ts`、`viewer.ts`、`bootstrap.ts`。
- 修改 `web/export_scene_data.py`、`web/scene_content.py`、`web/content.py`、`web/build_all.py`。
- 测试 `web/three/tests/playback.test.ts`、`registry.test.ts`、`web/tests/test_scene_export.py`。

步骤：
1. 先写通用时钟不同总时长、场景加载白名单和静态数据约束测试，运行确认缺少实现时失败。
2. 把时钟总时长变为构造参数；控件接收阶段数据及状态文案函数，不导入涂层 JSON。
3. 在类型中分离通用设备与涂层专用网带方法；引入 SceneDefinition/SceneInstance，动画为可选能力。
4. 把涂层模型、物料、标签和状态求值组合移动到场景适配器；公共查看器保留相机、光照、按需循环、离屏挂起、键盘、热点、销毁和失败处理。
5. 通过已知 ID 懒加载各场景；未知 ID 报错回退，不拼接任意模块路径。
6. 场景 ID 与页面 slug 解耦；导出静态场景的零时长/空阶段，关联指定正文步骤及原始步骤编号。
7. 运行既有涂层时间轴和模型测试，保持原动画和 75 秒分镜不变。

完成标准：涂层功能不变，核心查看器不依赖某种设备；独立时钟可使用其他总时长。

## 任务 2：石磨机静态模型

**文件：** 新增 `web/three/src/machines/stone-mill.ts`、`scenes/stone-mill-view.ts`、`core/machine-resources.ts`、`tests/stone-mill.test.ts`。

步骤：
1. 先写双辊、料盘空腔、有限尺寸、热点边界、无动画实例、外壳复原和幂等释放测试。
2. 使用旋转曲面做有厚度的开口圆盘，不用实心圆柱挡住石辊；用横轴圆柱做两个石辊。
3. 保留横梁、立柱、中心连接轴、左端调节手柄、前侧机构和侧传动轮廓；不添加猜测的进出料管道。
4. 用稳定顶点颜色区分石材与金属；共享部件高亮和资源释放，维持静态几何合批。
5. 默认完整外观，工作区示意隐藏局部盘壁；静态标签描述投料示意和研磨区域，未知取料方式通过文字说明。
6. 验证没有自启动动画或持续帧循环。

完成标准：照片中的主要轮廓可对应；可旋转查看开口和石辊；证据不足处明确标记。

## 任务 3：页面集成、回归与交付

**文件：** 修改 `web/three_markup.py`、`web/build.py`、`web/three/src/viewer.css`、`web/tests/test_build_integration.py`、`web/test_site.py`、相关 README/ASSETS/验收记录。

步骤：
1. 把照片对照、观察角度与模型载入模板复用；只有动画场景生成播放控件。
2. 在 `chocolate.html#equipment-3d` 加入石磨机，与 `enrobed.html` 分别按需加载场景。
3. 静态说明包含初步研磨输入/输出、展牌入口、正文 `#step-3` 链接及“研磨动画尚未接入”。
4. 运行类型检查、全部 TS/Python 测试与完整构建；核对其他八页不变。
5. 复用已核实的仅监听 127.0.0.1 的预览服务，记录实际地址。Chrome DevTools 先 list_pages，再创建独立任务页面。
6. 检查桌面、390/320 像素视口、旋转/缩放/热点/工作视图、照片弹窗、失败重试和静态空闲帧数。
7. 涂层回归：播放/暂停、拖动、阶段、结束/重播、离屏挂起；核对另一场景模块不在点击前被加载。
8. 更新验收记录并交给用户确认。没有真实手机测试时明确说明，不把模拟视口当作实体设备验证。

验证命令（仓库根目录；默认不新开可见终端）：

```powershell
python -X utf8 web/export_scene_data.py
node web/three/node_modules/vitest/vitest.mjs run --root web/three
python -X utf8 -m unittest discover -s web/tests -v
python -X utf8 web/build_all.py
python -X utf8 web/test_site.py
python -X utf8 web/start_preview.py
```

## 执行状态

- [x] 公共底座、通用时钟和多场景数据
- [x] 石磨机静态模型
- [x] 双页面集成与回归
- [x] 用户静态造型确认（2026-10-08 已确认，并授权提交及推送；研磨动画另行开发）

## 核对资料

- 本地照片 10／11、`web/content.py` 的初步研磨段落。
- [ICCO：Processing Cocoa](https://www.icco.org/processing-cocoa/)：研磨碎粒所得膏状/流动态物料，与后续压榨制粉的区别；不用于推定这台展品结构。
- [three.js LatheGeometry](https://threejs.org/docs/pages/LatheGeometry.html)：有厚度圆盘的旋转截面建模。

实施补充：浏览器检查发现 320 像素窄屏的加载按钮被舞台裁切，已修复公共占位布局；两设备均验证按钮完整可见。新增静态场景数据、适配器、资源释放与公共模块依赖边界测试。结果见 `web/three/石磨机验收记录.md`。
