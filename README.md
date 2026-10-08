# 可可工艺笔记

用巧克力博物馆的参观实拍，理解巧克力与糖果的典型制造流程。

项目包含 **1 个总览入口＋9 个独立工艺单页**：基础巧克力、金币巧克力、涂层巧克力、巧克力球、夹心巧克力、棒棒糖、方登糖基、切块糖果和奶片。每页提供流程速览、步骤解释、设备照片、展牌放大、易混淆点、自测和参考资料。

## 阅读与预览

完整下载或克隆仓库后，可以用浏览器打开 [`web/dist/index.html`](web/dist/index.html)。请保留整个 `web/dist` 目录，页面的样式、交互和图片均使用本地相对路径，正文不依赖网络。

Windows 本地 HTTP 预览（Python 3，无第三方依赖）：

```powershell
python -X utf8 web/start_preview.py
```

使用命令输出的实际地址。服务只监听 `127.0.0.1`，自动分配端口；隐藏启动，不另开终端。停止已核实归属的本任务服务：

```powershell
python -X utf8 web/start_preview.py --stop
```

## 3D 设备静态样板

涂层巧克力页新增“设备观察室”：打开本地预览地址下的 `enrobed.html#equipment-3d`，点击“加载 3D 模型”。支持拖动旋转、缩放、立体/正面/俯视、部件说明和实拍对照。

当前只完成涂层机静态造型，**工序动画尚未接入**；没有使用 Blender，也没有上传照片。运行素材随网页本地打包，3D 需通过 HTTP 预览，不能保证直接双击 HTML 可用；图文仍可直接离线阅读。

## 修改与验证

完整构建（包含 3D；首次需安装兼容的 Node.js，依赖已锁定）：

```powershell
npm --prefix web/three ci
python -X utf8 web/build_all.py
npm --prefix web/three run test
python -X utf8 -m unittest discover -s web/tests -v
python -X utf8 web/test_site.py
```

只构建原有图文版（会移除页面中的 3D 入口，不删除 3D 文件）：

```powershell
python -X utf8 web/build.py
python -X utf8 web/test_site.py
```

| 路径 | 内容 |
|---|---|
| `photos/` | 34 张原始参观照片 |
| `web/content.py` | 工艺步骤、照片映射与资料来源 |
| `web/build.py` | 静态 HTML 生成器 |
| `web/build_all.py`、`web/three/` | 3D 完整构建、程序化模型及查看器源码 |
| `web/dist/` | 可直接阅读的完整网页与本地素材 |
| `web/serve.py`、`web/start_preview.py` | 本地只读预览服务与启动器 |
| `web/test_site.py` | 页面结构、本地引用和工艺数据检查 |
| `docs/plans/` | 页面设计与实施记录 |

更多说明见 [`web/README.md`](web/README.md)，图片作者及许可见 [`web/ASSETS.md`](web/ASSETS.md)。预览日志、运行信息、Python 缓存和 ZIP 分发包不纳入版本控制。

3D 样板的运行与维护见 [`web/three/README.md`](web/three/README.md)，本批验收见 [`web/three/验收记录.md`](web/three/验收记录.md)。根目录原有 ZIP 未在本批更新，不包含本次样板。

## 资料边界

照片与展牌仅用于确认展品用途；未拍到的典型工序通过资料补全，并在页面中明确区分。不能从照片推定这些机器历史上属于同一条生产线。

本项目用于工艺学习，**不是生产操作规程**。配方、食品安全控制和保质期需要另行验证。用户实拍图片不因进入此仓库而自动成为公共领域作品；两张公网补充图的具体许可见各自图注及图片来源说明。
