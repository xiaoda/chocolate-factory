# 涂层机 3D 静态样板

当前版本：V0.1，2026-10-08。按开发方案完成第一批任务 1–3，供确认程序化模型造型；没有制作工艺动画、真实流体、冷却隧道或精密内部结构。

## 查看

从项目根目录执行 `python -X utf8 web/start_preview.py`，在输出的实际地址后打开 `enrobed.html#equipment-3d`。点击“加载 3D 模型”后：

- 拖动旋转，滚轮或双指缩放；也可使用加减按钮。
- 使用“立体／正面／俯视”和“复位视角”。
- 点击模型编号或右侧部件名，高亮并显示说明。
- 点击“放大对照”并排查看原始设备照片，点击照片或展牌打开原有放大窗口。
- 画布获得焦点后，方向键旋转，`+` / `-` 缩放。

照片、文字和输入输出说明先显示；three.js 的主体在点击加载后才下载。没有后台自动旋转或工序播放。文件协议不保证能加载 ES 模块，请使用本地 HTTP；无需将项目上传外网。

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

`generated/enrobed.json` 来自 `content.py` 和 `scene_content.py`，不手动编辑；删除该目录后运行导出器或完整构建即可恢复。`npm run test` 是单次执行，不会开启监听进程。

## 结构与资源约束

- `src/bootstrap.ts`：轻量加载入口、失败提示、照片对照开关。
- `src/viewer.ts`：相机、光照、交互、按需渲染、上下文丢失处理与释放。
- `src/machines/enrober.ts`：独立命名的部件、进出料接口、热点、高亮与模型释放。
- `src/geometry/`：几何辅助函数和共享材质。
- `../three_markup.py`：静态 HTML 和无 JavaScript 时仍可读的边界说明。

输出仅位于 `../dist/assets/three/`，不得将 Vite 输出改成上层 `dist`。已有图文构建仍可用 `python web/build.py` 单独执行，但它会移除页面中的 3D 入口。

查看器只在相机、尺寸、部件选择等变化时绘制，空闲不持续刷新；离屏不绘制。部件高亮使用临时材质副本，取消时释放；销毁模型时共享资源只释放一次。

three.js 库主体约 590 KB（未压缩传输量），按需加载；Vite 的 500 KB 块大小提示是已知告警，不是构建失败。当前无需为了消除提示把同一次加载的渲染器再拆成多个强依赖块。许可随产物输出至 `THIRD_PARTY_LICENSES.md`。

## 事实边界与下一步

模型轮廓参考用户照片 25／26；尺寸、背面和隐藏连接是简化示意。按钮并不代表真实机器控制功能，台面上的芯体和巧克力片只表达位置，尚未发生输送和包覆。

下一步先收集造型意见，再继续开发方案中的时间轴、物料变化与工序控制，不因静态模型可旋转就将整条工艺动画标记完成。浏览器验证及已知限制见 [验收记录](验收记录.md)。
