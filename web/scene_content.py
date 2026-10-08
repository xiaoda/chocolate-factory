"""3D 场景的展示映射；正文仍以 content.py 为唯一来源。"""

ENROBED_SCENE = {
    'id': 'enrobed',
    'schemaVersion': 1,
    'status': 'animated-prototype',
    'name': '巧克力涂层机',
    'duration': 75,
    'photos': {'machine': 'assets/photos/25.jpg', 'plate': 'assets/photos/26.jpg'},
    'boundary': '外形参考实拍 25／26；尺寸、背面与隐藏连接为简化示意。全包覆、回流路径和蓝色冷却段展示典型原理，不证明实拍设备的具体配置。75 秒为教学时间，非真实加工时长；不模拟真实流体或生产参数。',
    'parts': [
        {'id': 'conveyor', 'number': '01', 'name': '输送网带', 'evidence': 'photo',
         'description': '芯体沿网带通过工作区。网孔让多余涂层料离开产品；这台设备不负责制作饼干本身。', 'refs': ['enrobe']},
        {'id': 'coatingHead', 'number': '02', 'name': '涂层头与料槽', 'evidence': 'photo',
         'description': '展牌描述浆泵把巧克力料送到上方涂层头。动画用巧克力幕和独立底涂区说明全包覆；槽口、流量与隐藏连接均为原理示意。', 'refs': ['enrobe']},
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

# 分镜短文服务于当前画面；完整正文仍通过 stepIds 关联导出，不改写原文。
PHASE_CAPTIONS = {
    'inputs': ('已制好的饼干芯体 ＋ 准备好的巧克力料', '两路输入各司其职：网带接收芯体，供料管将巧克力送往涂层头。', '准备进入涂层区的芯体', '这台机器不烤饼干；巧克力料的调温等准备在此前完成。'),
    'coating': ('排列好的芯体 ＋ 可流动的巧克力料', '网带把芯体带过巧克力幕，上方淋涂、下方底涂，独立外层逐渐包住芯体。', '带有湿润涂层的产品', '本演示选择全包覆配置；只从上面淋过，不等于底部已经包好。'),
    'control': ('刚包覆、可能带有多余巧克力的产品', '通过适度吹风和振动控量；多余料落到接料区，棕色流向标记展示回收路径。', '包覆量更均匀，但仍未充分凝固的产品', '控量不是冷却，更不是把巧克力“吹干”。回收路径为典型原理示意。'),
    'cooling': ('离开涂层机、尚需定型的产品', '产品进入独立的蓝色冷却示意区。跟踪标签显示由未充分凝固到定型的变化。', '外层逐渐定型的产品', '蓝框是补充工序示意，不是实拍机器的一部分；时间和外观变化不代表生产参数。'),
    'output': ('已经完成冷却定型的涂层产品', '对照进入时的浅色芯体与现在的独立巧克力外层，检查包覆后再进入包装环节。', '芯体 ＋ 已定型的巧克力外衣', '包装仅作文字说明，未模拟检验设备或包装机构。'),
}
for phase in ENROBED_SCENE['phases']:
    phase['caption'] = dict(zip(('input', 'action', 'output', 'note'), PHASE_CAPTIONS[phase['id']]))

STONE_MILL_SCENE = {
    'id': 'stone-mill', 'pageSlug': 'chocolate', 'schemaVersion': 1,
    'status': 'static-prototype', 'name': '石磨机', 'duration': 0, 'phases': [],
    'stepIds': ['nib-grinding'],
    'photos': {'machine': 'assets/photos/10.jpg', 'plate': 'assets/photos/11.jpg'},
    'boundary': '外形参照实拍 10／11；尺寸、背面和隐藏机构为简化示意。投料区域仅作提示，具体出料口、取料方式及石辊转向待核实。本版没有研磨动画，不把前侧机构认定为出料阀，也不演示压榨制粉。',
    'parts': [
        {'id': 'bowl', 'number': '01', 'name': '开口圆盘与盘壁', 'evidence': 'photo', 'refs': ['icco'],
         'description': '照片可见开口圆盘包围两只石辊。上方开口仅作为投料区示意；“工作区域示意”可隐藏前半盘壁，便于观察，不表示真实机器能这样拆开。'},
        {'id': 'stones', 'number': '02', 'name': '双石辊与接触区', 'evidence': 'photo', 'refs': ['icco'],
         'description': '保留两只浅色厚石辊和水平连接轴的辨识特征。研磨原理在正文说明；本轮不推定石辊、料盘各自的转向或速度。'},
        {'id': 'bridge', 'number': '03', 'name': '横梁、立柱与手柄', 'evidence': 'photo', 'refs': ['icco'],
         'description': '上方浅色横梁、棕色立柱、左侧手柄与中心连接参照照片简化。调节机构的内部结构和操作功能尚未核实，不将手柄做成可操作的生产控制。'},
        {'id': 'drive', 'number': '04', 'name': '底座与侧面机构', 'evidence': 'photo', 'refs': ['icco'],
         'description': '保留底座、左侧传动外形和前侧可见机构；不从外观推断隐藏齿轮。具体出料口和取料方式待核实，不补造出口或料流。'},
    ],
}

SCENES = {scene['id']: scene for scene in (ENROBED_SCENE, STONE_MILL_SCENE)}
PAGE_SCENES = {'enrobed': 'enrobed', 'chocolate': 'stone-mill'}
