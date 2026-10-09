# 图片来源与使用说明

## 用户实拍

原图位于项目 photos 文件夹，网页只复制，不改写原件。下表编号沿用原文件名。

| 输出文件 | 原文件 |
|---|---|
| dist/assets/photos/08.jpg | 微信图片_20261003231051_8_293.jpg |
| dist/assets/photos/10.jpg | 微信图片_20261003231051_10_293.jpg |
| dist/assets/photos/11.jpg | 微信图片_20261003231051_11_293.jpg |
| dist/assets/photos/12.jpg | 微信图片_20261003231051_12_293.jpg |
| dist/assets/photos/15.jpg | 微信图片_20261003231051_15_293.jpg |
| dist/assets/photos/16.jpg | 微信图片_20261003231051_16_293.jpg |
| dist/assets/photos/17.jpg | 微信图片_20261003231051_17_293.jpg |
| dist/assets/photos/18.jpg | 微信图片_20261003231051_18_293.jpg |
| dist/assets/photos/19.jpg | 微信图片_20261003231051_19_293.jpg |
| dist/assets/photos/20.jpg | 微信图片_20261003231051_20_293.jpg |
| dist/assets/photos/21.jpg | 微信图片_20261003231051_21_293.jpg |
| dist/assets/photos/22.jpg | 微信图片_20261003231051_22_293.jpg |
| dist/assets/photos/23.jpg | 微信图片_20261003231051_23_293.jpg |
| dist/assets/photos/24.jpg | 微信图片_20261003231051_24_293.jpg |
| dist/assets/photos/25.jpg | 微信图片_20261003231051_25_293.jpg |
| dist/assets/photos/26.jpg | 微信图片_20261003231051_26_293.jpg |
| dist/assets/photos/27.jpg | 微信图片_20261003231051_27_293.jpg |
| dist/assets/photos/28.jpg | 微信图片_20261003231051_28_293.jpg |
| dist/assets/photos/30.jpg | 微信图片_20261003231051_30_293.jpg |
| dist/assets/photos/31.jpg | 微信图片_20261003231051_31_293.jpg |
| dist/assets/photos/32.jpg | 微信图片_20261003231051_32_293.jpg |
| dist/assets/photos/34.jpg | 微信图片_20261003231051_34_293.jpg |
| dist/assets/photos/35.jpg | 微信图片_20261003231051_35_293.jpg |
| dist/assets/photos/36.jpg | 微信图片_20261003231051_36_293.jpg |
| dist/assets/photos/37.jpg | 微信图片_20261003231051_37_293.jpg |
| dist/assets/photos/38.jpg | 微信图片_20261003231051_38_293.jpg |
| dist/assets/photos/39.jpg | 微信图片_20261003231051_39_293.jpg |

## 公网补充图

均下载到本地用于离线阅读，未修改原始图像；页面可能通过 CSS 等比缩放/裁切展示，可打开完整原图。

- `dist/assets/reference/cacao-pod.jpg`：剖开的可可果，种子外包裹着白色果肉；作者：Keith Weller / USDA ARS；许可：公共领域；[原始文件与许可说明](https://commons.wikimedia.org/wiki/File:Cacao-pod-k4636-14.jpg)。
- `dist/assets/reference/gold-coins.jpg`：巧克力圆片与金色箔纸，展示金币产品的内外结构；作者：Evan-Amos；许可：CC0 1.0；[原始文件与许可说明](https://commons.wikimedia.org/wiki/File:Chocolate-Gold-Coins.jpg)。

## 3D 设备观察室

涂层机模型由 `web/three/src/machines/enrober.ts` 的程序化几何体生成，以用户照片 25／26 为造型参考；没有使用 Blender、第三方机器模型或上传照片。尺寸、背面和隐藏连接为简化示意。物料、全包覆、回流和独立冷却段由代码绘制，用于典型原理讲解，不证明实拍设备的具体配置。石磨机模型由 `web/three/src/machines/stone-mill.ts` 生成，以照片 10／11 为造型参考；V0.4 用代码绘制碎粒、浆态表面和典型研磨运动；盘面转动与石辊自转为教学约定，不证明本展品实际传动，不补造出料口。五辊精磨机由 `web/three/src/machines/five-roll.ts` 生成，以照片 19／20 为造型参考；V0.7 保留已确认的五辊、立架、顶部电机与面板造型，辊径和布局不是测量结果。用代码叠加 60 秒典型精磨动画：相邻辊反向、逐级传料与颗粒细化；相对速度、料膜厚度和颗粒大小仅为教学约定，不对应真实参数。侧面 SVG 原理图与 3D 共用时间状态，不是展品剖面；刮取和粉片状结果只在小图示意，不向机器补造刮刀或出料口。金色短线是运动标记；蓝色光纹不作料流依据。完整外观隐藏教学叠加，辊组观察隐藏局部罩体，不代表实际拆卸；仪表不绑定生产控制。原理依据为 EP1165239B1 与制造商资料，链接见正文来源。三台设备共享查看器，同页切换释放旧实例；未使用新增第三方图片或模型。three.js 及其附加组件的许可随构建保存在 `dist/assets/three/THIRD_PARTY_LICENSES.md`。
