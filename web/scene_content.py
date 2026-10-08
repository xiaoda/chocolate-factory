"""3D 场景的展示映射；正文仍以 content.py 为唯一来源。"""

ENROBED_SCENE = {
    'id': 'enrobed',
    'schemaVersion': 1,
    'status': 'static-prototype',
    'name': '巧克力涂层机',
    'duration': 75,
    'photos': {'machine': 'assets/photos/25.jpg', 'plate': 'assets/photos/26.jpg'},
    'boundary': '外形参考实拍 25／26；尺寸、背面与隐藏连接为简化示意。物料方向用于讲解，不是历史配置测绘。',
    'parts': [
        {'id': 'conveyor', 'number': '01', 'name': '输送网带', 'evidence': 'photo',
         'description': '芯体沿网带通过工作区。网孔让多余涂层料离开产品；这台设备不负责制作饼干本身。', 'refs': ['enrobe']},
        {'id': 'coatingHead', 'number': '02', 'name': '涂层头与料槽', 'evidence': 'photo',
         'description': '展牌描述浆泵把巧克力料送到上方涂层头。槽口位置与尺寸经过简化，模型尚未演示液体流动。', 'refs': ['enrobe']},
        {'id': 'blowerGuide', 'number': '03', 'name': '吹风与控量区域', 'evidence': 'reference',
         'description': '结合展牌理解吹风、振动对包覆量的控制。它们不是把巧克力彻底吹干，后续仍需冷却定型。', 'refs': ['enrobe']},
        {'id': 'cabinet', 'number': '04', 'name': '机柜与控制面板', 'evidence': 'photo',
         'description': '保留前置控制箱、柜门、支腿等辨识特征。按钮为外观简化，不代表设备的真实操作功能。', 'refs': ['enrobe']},
    ],
    'phases': [
        {'id': 'inputs', 'start': 0, 'end': 12, 'stepIds': ['core-preparation', 'coating-preparation'], 'title': '认识两路输入', 'evidence': 'reference', 'refs': ['enrobe', 'temper']},
        {'id': 'coating', 'start': 12, 'end': 30, 'stepIds': ['enrobing'], 'title': '经过涂层区', 'evidence': 'reference', 'refs': ['enrobe']},
        {'id': 'control', 'start': 30, 'end': 44, 'stepIds': ['coating-control'], 'title': '控量与回收', 'evidence': 'reference', 'refs': ['enrobe']},
        {'id': 'cooling', 'start': 44, 'end': 63, 'stepIds': ['cooling-packaging'], 'title': '冷却定型', 'evidence': 'schematic', 'refs': ['cooling']},
        {'id': 'output', 'start': 63, 'end': 75, 'stepIds': ['cooling-packaging'], 'title': '检查输出', 'evidence': 'reference', 'refs': ['cooling', 'storage']},
    ],
}
