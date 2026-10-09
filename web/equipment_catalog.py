"""设备入口的编辑文案；静态观察与动画分开标识。"""
from export_scene_data import build_scene_data
from scene_content import SCENES


EQUIPMENT_COPY = {
    'stone-mill': {
        'shortName': '石磨机', 'category': '原料加工', 'title': '碎粒，如何变成可可浆？',
        'input': '可可碎粒', 'output': '可可浆／可可液块',
        'description': '观察石辊与盘面的相对运动，看颗粒细化、形成浆态。',
    },
    'enrobed': {
        'shortName': '涂层机', 'category': '产品包覆', 'title': '饼干，如何穿上巧克力外衣？',
        'input': '已制好的芯体 ＋ 巧克力料', 'output': '冷却定型的涂层产品',
        'description': '跟随芯体经过淋涂与控量，再进入独立冷却示意区。',
    },
    'five-roll': {
        'shortName': '五辊机', 'category': '配料后精磨', 'title': '混合料，怎样一层层磨细？',
        'input': '按配方预混的巧克力混合料', 'output': '颗粒更细的混合料',
        'description': '看料膜沿五辊逐级传递，用侧面原理小图读懂背面路径与刮取。',
    },
}


def equipment_entries():
    entries = []
    for scene_id, copy in EQUIPMENT_COPY.items():
        raw = SCENES[scene_id]
        scene = build_scene_data(raw)
        slug = scene.get('pageSlug', scene['id'])
        animated = scene['status'] == 'animated-prototype'
        anchor = 'equipment-five-roll' if scene_id == 'five-roll' else 'equipment-3d'
        steps = (sid for phase in scene['phases'] for sid in phase['stepIds']) if animated else (step['id'] for step in scene['steps'])
        entries.append(dict(copy, id=scene_id, name=scene['name'], pageSlug=slug,
                            href=f'{slug}.html#{anchor}', anchor=anchor, animated=animated, photo=scene['photos']['machine'],
                            duration=scene['duration'], phaseCount=len(scene['phases']),
                            stepIds=list(dict.fromkeys(steps))))
    return entries


def animation_entries():
    return [entry for entry in equipment_entries() if entry['animated']]
