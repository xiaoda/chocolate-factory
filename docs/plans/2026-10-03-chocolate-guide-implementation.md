# 巧克力工艺图解手册实施计划

> 执行说明：按 writing-plans 的分步计划推进，在本会话直接实施与验证；用户已确认页面方案。当前目录不是 Git 仓库，不创建 worktree、不擅自提交。

**目标：** 交付总览与 9 个可独立阅读的工艺 HTML 页面，插入对应实拍和有来源的补充资料。

**架构：** `web/content.py` 保存工艺数据；`web/build.py` 生成 `web/dist/*.html`；共享静态 CSS/JS。所有正文直接写入 HTML，图片下载/复制到输出目录，离线可用。

**技术栈：** Python 标准库、语义化 HTML、响应式 CSS、渐进增强 JavaScript、Chrome DevTools MCP。

---

### 任务 1：内容和资产
- 新建 `web/content.py`：九类产品的步骤、输入输出、照片与来源。
- 新建 `web/dist/assets/photos/`、`web/dist/assets/reference/`：复制所用原照并下载已核对许可的两张资料图。
- 新建 `web/ASSETS.md`：原文件映射、图像作者和许可。
- 新建 `web/test_site.py`：首先运行，确认缺少生成页面时失败。

### 任务 2：首个可预览页面
- 新建 `web/build.py`、`web/dist/assets/style.css`、`web/dist/assets/app.js`。
- 首先生成总览与基础巧克力页面，保留明确的产品导航与步骤来源。
- 新建 `web/serve.py`：只服务 dist，端口 0 自动分配，禁止目录浏览和路径越界。
- 通过隐藏子进程运行，记录 `web/.preview/` 日志与运行信息；HTTP 检查后建立本任务独立浏览器页面。
- 桌面 snapshot 与 screenshot 验证第一版视觉，不把连接成功等同于渲染成功。

### 任务 3：九种工艺与交互
- 补全八个分支页；复用模板，不复制样式逻辑。
- 实现分类筛选、锚点目录、照片放大、打印、阅读进度；无 JavaScript 仍可读全部正文和看原图。
- 每页明确实拍证据与补全范围；提供图注、展牌和来源。
- 运行 `python web/build.py`，预期生成 10 个 HTML。

### 任务 4：验证和交付
- 运行 `python web/test_site.py`，预期 10 页及全部本地引用、图片替代文字与元信息检查通过。
- 浏览器检查十页的图像加载、视口溢出、控制台错误；桌面 1440×1000，手机 390×844/320×780。
- 实测分类筛选、照片弹窗关闭/焦点恢复、页面跳转与移动目录；抽查打印样式和放大阅读。
- 输出 `web/验收记录.md` 和 `web/README.md`，说明本机入口、离线使用、重建和服务管理。
- 将 dist 压缩为便于分享的本地 ZIP。不得上传公网。
