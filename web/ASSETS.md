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

涂层机模型由 `web/three/src/machines/enrober.ts` 的程序化几何体生成，以用户照片 25／26 为造型参考；没有使用 Blender、第三方机器模型或上传照片。尺寸、背面和隐藏连接为简化示意。物料、全包覆、回流和独立冷却段由代码绘制，用于典型原理讲解，不证明实拍设备的具体配置。石磨机模型由 `web/three/src/machines/stone-mill.ts` 生成，以照片 10／11 为造型参考；本版为静态结构样板，不补造出料口或隐藏传动。两场景共享查看器，未使用新增第三方图片或模型。three.js 及其附加组件的许可随构建保存在 `dist/assets/three/THIRD_PARTY_LICENSES.md`。
