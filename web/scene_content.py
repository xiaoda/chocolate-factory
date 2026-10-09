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
    'status': 'animated-prototype', 'name': '石磨机', 'duration': 60,
    'phases': [
        {'id': 'feeding', 'start': 0, 'end': 10, 'stepIds': ['nib-grinding'], 'title': '认识投料', 'evidence': 'schematic', 'refs': ['icco']},
        {'id': 'crushing', 'start': 10, 'end': 28, 'stepIds': ['nib-grinding'], 'title': '反复碾磨', 'evidence': 'schematic', 'refs': ['icco', 'stone-motion']},
        {'id': 'liquefying', 'start': 28, 'end': 46, 'stepIds': ['nib-grinding'], 'title': '形成浆态', 'evidence': 'reference', 'refs': ['icco']},
        {'id': 'result', 'start': 46, 'end': 60, 'stepIds': ['nib-grinding'], 'title': '对照结果', 'evidence': 'reference', 'refs': ['icco']},
    ],
    'stepIds': ['nib-grinding'],
    'photos': {'machine': 'assets/photos/10.jpg', 'plate': 'assets/photos/11.jpg'},
    'boundary': '外形参照实拍 10／11；投料位置、盘面转动和双石辊自转均为教学运动示意，不代表这台展品的真实驱动形式、转向或速度。60 秒为讲解时间，非实际研磨时长；尺寸、颗粒大小与浆态变化不代表生产参数。本机具体出料口和取料方式待核实，不把前侧机构认定为出料阀，不演示取料、加水或压榨制粉。',
    'parts': [
        {'id': 'bowl', 'number': '01', 'name': '开口圆盘与盘壁', 'evidence': 'photo', 'refs': ['icco'],
         'description': '照片可见开口圆盘包围两只石辊。上方开口仅作为投料区示意；“工作区域示意”可隐藏前半盘壁，便于观察，不表示真实机器能这样拆开。'},
        {'id': 'stones', 'number': '02', 'name': '双石辊与接触区', 'evidence': 'photo', 'refs': ['icco'],
         'description': '保留两只浅色厚石辊和水平连接轴的辨识特征。动画以盘面相对石辊运动、石辊自转说明反复碾磨，转向和速度是教学约定，不是对这台展品的传动复原。'},
        {'id': 'bridge', 'number': '03', 'name': '横梁、立柱与手柄', 'evidence': 'photo', 'refs': ['icco'],
         'description': '上方浅色横梁、棕色立柱、左侧手柄与中心连接参照照片简化。调节机构的内部结构和操作功能尚未核实，不将手柄做成可操作的生产控制。'},
        {'id': 'drive', 'number': '04', 'name': '底座与侧面机构', 'evidence': 'photo', 'refs': ['icco'],
         'description': '保留底座、左侧传动外形和前侧可见机构；不从外观推断隐藏齿轮。具体出料口和取料方式待核实，不补造出口或料流。'},
    ],
}

STONE_CAPTIONS = {
    'feeding': ('经过焙炒、破碎脱壳的可可碎粒', '碎粒由上方开口落入盘内。投料位置只作示意，原料不是整颗带壳可可豆。', '等待研磨的可可碎粒', '播放本段只说明初步研磨，不演示烘焙、脱壳或加水。'),
    'crushing': ('盘内仍有明显颗粒的可可碎粒', '盘面与石辊的相对运动使物料反复经过接触区，颗粒逐渐变细。', '逐渐细化的可可物料', '双辊自转与盘面运动是教学约定，不代表这台展品的实际转向、传动关系或速度。'),
    'liquefying': ('逐渐细化的可可物料', '研磨破坏组织、释放可可脂，细小固体分散在脂肪中，物料逐渐呈浆态。', '含可可脂与非脂固体的可可浆', '不是加水化开，也不是把所有固体溶解；画面只表现典型形态变化，不模拟真实流体。'),
    'result': ('经过研磨的可可物料', '定格观察：开始时是碎粒，现在是含细小固体的可可浆，也称可可液块。', '可供后续巧克力加工的可可液块', '结果仍留在盘内，取料方式未演示。它不等于脱脂可可粉，也不是可直接包装的成品巧克力。'),
}
for phase in STONE_MILL_SCENE['phases']:
    phase['caption'] = dict(zip(('input', 'action', 'output', 'note'), STONE_CAPTIONS[phase['id']]))

FIVE_ROLL_SCENE = {
    'id': 'five-roll', 'pageSlug': 'chocolate', 'schemaVersion': 1,
    'status': 'animated-prototype', 'name': '五辊精磨机', 'duration': 60,
    'phases': [
        {'id': 'premix', 'start': 0, 'end': 10, 'stepIds': ['roller-refining'], 'title': '认识预混料', 'evidence': 'reference', 'refs': ['bean', 'roll-principle']},
        {'id': 'nip', 'start': 10, 'end': 22, 'stepIds': ['roller-refining'], 'title': '辊隙与转向', 'evidence': 'schematic', 'refs': ['roll-principle']},
        {'id': 'transfer', 'start': 22, 'end': 40, 'stepIds': ['roller-refining'], 'title': '逐级传料', 'evidence': 'schematic', 'refs': ['roll-principle']},
        {'id': 'scraping', 'start': 40, 'end': 50, 'stepIds': ['roller-refining'], 'title': '顶部刮取', 'evidence': 'schematic', 'refs': ['roll-principle', 'roll-refiner']},
        {'id': 'refined', 'start': 50, 'end': 60, 'stepIds': ['roller-refining'], 'title': '结果对照', 'evidence': 'reference', 'refs': ['roll-principle', 'roll-refiner']},
    ],
    'stepIds': ['roller-refining'],
    'photos': {'machine': 'assets/photos/19.jpg', 'plate': 'assets/photos/20.jpg'},
    'boundary': '外形参照实拍 19／20；尺寸与辊位非测量复原。辊向、相对速度、料膜与金色运动标记均为典型原理示意，不证明展品真实传动；60 秒是教学编排，膜厚、颗粒大小不是生产参数。侧面图不是展品剖面，刮取只在小图示意，不向模型补造出料口；蓝色光纹不作料流依据。“完整外观”隐藏教学叠加但不改变进度；局部罩体隐藏不代表真实拆卸。粉片状精磨料不是脱脂可可粉，也不是成品巧克力。',
    'parts': [
        {'id': 'rollers', 'number': '01', 'name': '五根辊筒', 'evidence': 'photo', 'refs': ['bean'],
         'description': '保留五根水平辊筒和下部错位的已确认外形。相邻辊反向与逐级传料演示典型原理；金色短线帮助看清运动，不是辊面真实纹理，速度和辊隙不是生产参数。'},
        {'id': 'frame', 'number': '02', 'name': '立架与底框', 'evidence': 'photo', 'refs': ['bean'],
         'description': '浅色左右立架和底部横框参照照片保留。上部横挡可在“辊组观察”中隐藏，仅帮助看清辊筒，不表示真实设备可以这样拆卸。'},
        {'id': 'drive', 'number': '03', 'name': '顶部电机与侧罩', 'evidence': 'photo', 'refs': ['bean'],
         'description': '保留左上深色电机、散热筋和浅色侧罩的外形。罩内传动关系不可从照片确认，因此不补画齿轮、传动带或内部连接。'},
        {'id': 'controls', 'number': '04', 'name': '仪表与控制面板', 'evidence': 'photo', 'refs': ['bean'],
         'description': '右侧竖长仪表面板和左侧小面板作外观简化。仪表没有真实读数，按钮不能操作，不提供生产参数或设备操作指引。'},
    ],
}

FIVE_ROLL_CAPTIONS = {
    'premix': ('按配方预混、适合辊式精磨的混合料', '示意料团进入底部双辊区域，准备被带成料膜。', '等待精磨的预混料', '不是整颗可可豆，也不是把石磨可可浆直接当作已配料的巧克力。'),
    'nip': ('底部双辊间的预混料', '相邻辊反向运动，接触区形成挤压与剪切；金色短线只帮助识别辊筒运动。', '随辊面传递的物料薄层', '转向与相对速度是典型原理示意，不复原展品驱动，也不提供调机参数。'),
    'transfer': ('附着在辊面上的料膜', '物料逐级转到后续辊筒，经过接触区细化；前后交替的路径可在侧面小图中看清。', '颗粒逐渐细化的混合料', '料膜厚度与固体颗粒大小是不同概念；画面只定性示意，不把膜厚当作粒度读数。'),
    'scraping': ('到达第五辊的精磨料膜', '侧面原理图示意把顶部料膜刮下，并收集为粉片状精磨料。', '等待后续加工的精磨混合料', '刮取位置只在小图说明典型原理，不证明展品的实际刮刀、出料口或输送配置。'),
    'refined': ('经过辊式精磨的混合料', '对照可见：固体颗粒变细，但并未全部溶解。', '颗粒更细、仍需精炼等后续处理的混合料', '粉片状精磨料仍含脂肪与配方组分，不是脱脂可可粉，也不是可直接包装的成品巧克力。'),
}
for phase in FIVE_ROLL_SCENE['phases']:
    phase['caption'] = dict(zip(('input', 'action', 'output', 'note'), FIVE_ROLL_CAPTIONS[phase['id']]))

SCENES = {scene['id']: scene for scene in (ENROBED_SCENE, STONE_MILL_SCENE, FIVE_ROLL_SCENE)}
PAGE_SCENES = {'enrobed': ('enrobed',), 'chocolate': ('stone-mill', 'five-roll')}
