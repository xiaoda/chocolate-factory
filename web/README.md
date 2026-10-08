# 可可工艺笔记

一份用参观实拍理解制作流程的本地图解手册。共 **1 个总览＋9 个独立工艺单页**，包含 27 张实拍设备/展牌照片和 2 张公共领域/CC0 资料图。

## 直接阅读

- 本机预览：运行 `python -X utf8 web/start_preview.py`，使用当次返回的地址，不沿用历史临时端口。
- 本地入口：`dist/index.html`。离线时可用浏览器打开；请完整保留 `dist`，不要只复制某个 HTML，否则图片和样式会丢失。
- 分享包：项目根目录的 `可可工艺笔记-离线版.zip`。先完整解压，再打开其中的 `index.html`。本项目未发布到公网。
- 每个产品页是独立的长页面，可以从头读完，也可在流程速览中点击步骤跳转。
- 点击设备照片或“阅读展牌”可放大；按 Esc 或点击“关闭”返回。放大窗口内可另开原图。
- 各页下方有易混淆点、自测、照片索引及来源。公网来源链接需要联网，正文与照片不需要联网。

## 页面

| 文件 | 内容 |
|---|---|
| `dist/index.html` | 工艺总览与分类筛选 |
| `dist/chocolate.html` | 基础巧克力：可可采后处理至成型包装 |
| `dist/coins.html` | 金币：币坯、覆箔与压印 |
| `dist/enrobed.html` | 涂层：芯体、网带淋涂与冷却 |
| `dist/panned.html` | 巧克力球：滚动包衣、逐层凝固与抛光 |
| `dist/filled.html` | 夹心：模壳型主线与涂层型对照 |
| `dist/lollipop.html` | 模压棒棒糖：熬糖、均条与插棒成型 |
| `dist/fondant.html` | 方登糖基：冷却搅打形成微晶糖膏 |
| `dist/cut-candy.html` | 切块糖果：不同糖体的共同分切后段 |
| `dist/milk-tablets.html` | 奶片：粉体准备、填模与压片 |

## 重新启动本地预览

在项目目录现有终端执行（需要 Python 3；不需要安装第三方包）：

```powershell
python -X utf8 web/start_preview.py
```

脚本在核实进程归属与 HTTP 响应后复用已有服务，否则隐藏启动本任务服务。终端输出当前实际 URL；端口自动分配，**重启后不一定还是 54898**。不会打开新终端或自动抢占浏览器焦点。

仅停止本任务预览：

```powershell
python -X utf8 web/start_preview.py --stop
```

运行信息位于 `.preview/server.json`；日志为 `.preview/stdout.log` 和 `.preview/stderr.log`。服务只监听 `127.0.0.1`，只提供 `dist`，禁用目录浏览和越界路径。

## 修改与重建

### 3D 设备观察室

本地 HTTP 预览打开 `enrobed.html#equipment-3d`，点击“加载 3D 模型”，再主动播放。V0.2 支持 75 秒工序讲解、暂停/重播/拖动进度、五个阶段关键帧、工作部件/完整外观切换，以及原有旋转、缩放、部件说明和实拍对照。冷却段和回流路径是补充原理示意，教学时间不对应真实加工时间。V0.3 在 `chocolate.html#equipment-3d` 新增石磨机静态样板：四组部件高亮、工作区域示意、实拍 10／11 对照和正文第三步链接；本轮没有研磨动画，不虚构出料口。两台设备复用查看器与资源管理，按场景懒加载。完整构建：

```powershell
npm --prefix web/three ci
python -X utf8 web/build_all.py
python -X utf8 -m unittest discover -s web/tests -v
npm --prefix web/three run test
python -X utf8 web/test_site.py
```

源代码、技术边界、锁定版本和验证说明见 [`three/README.md`](three/README.md) 、[`three/石磨机验收记录.md`](three/石磨机验收记录.md) 与涂层机历史 [`three/验收记录.md`](three/验收记录.md)。3D 运行依赖已本地打包，不需要联网；安装开发依赖需要网络。直接双击 HTML 时保留图文阅读，3D 请改用本地 HTTP。原有 ZIP 尚未更新。

### 原有图文构建

以下 `build.py` 命令只生成图文页面，不插入 3D；恢复 3D 入口请使用上面的 `build_all.py`。

- `content.py`：步骤文案、图片对应关系、引用来源。
- `build.py`：页面模板与生成逻辑。
- `dist/assets/style.css`、`dist/assets/app.js`：共享样式与交互。
- `ASSETS.md`：图片作者、许可和原图映射。

```powershell
python -X utf8 web/build.py
python -X utf8 web/test_site.py
```

重建使用项目原有 `photos` 文件夹；不会修改照片原件。两个公网资料图已经下载保存在 `dist/assets/reference`，无需重建时联网。

## 内容边界

这不是生产操作规程。页面分别标注实拍依据与资料补全；照片不能证明各台机器来自同一配套生产线。切块糖果页只解释共同后段，不虚构不同糖果共享同一前处理；夹心页明确区分两条典型路线。具体配方、食品安全控制和保质期需另行验证。
