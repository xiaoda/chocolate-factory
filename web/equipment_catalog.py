"""动画入口的编辑文案；时长、照片、正文映射仍以场景数据为准。"""
from export_scene_data import build_scene_data
from scene_content import SCENES


ANIMATION_COPY = {
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
}


def animation_entries():
    entries = []
    for scene_id, copy in ANIMATION_COPY.items():
        raw = SCENES[scene_id]
        if raw['status'] != 'animated-prototype':
            continue
        scene = build_scene_data(raw)
        slug = scene.get('pageSlug', scene['id'])
        entries.append(dict(copy, id=scene_id, name=scene['name'], pageSlug=slug,
                            href=f'{slug}.html#equipment-3d', photo=scene['photos']['machine'],
                            duration=scene['duration'], phaseCount=len(scene['phases']),
                            stepIds=list(dict.fromkeys(sid for phase in scene['phases'] for sid in phase['stepIds']))))
    return entries
