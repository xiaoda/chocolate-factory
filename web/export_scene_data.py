"""校验静态/动画场景并导出给前端；导入本模块不会生成网页。"""
import copy
import json
import math
from pathlib import Path

from content import PAGES, SOURCES
from scene_content import ENROBED_SCENE, SCENES

DESTINATION = Path(__file__).resolve().parent / 'three/generated/enrobed.json'


def unique_ids(items, label):
    ids = [item.get('id') for item in items]
    if not ids or any(not isinstance(i, str) or not i.strip() for i in ids) or len(set(ids)) != len(ids):
        raise ValueError(f'{label} 缺失或重复 ID')
    return set(ids)


def build_scene_data(scene=None, pages=None, sources=None):
    scene = copy.deepcopy(ENROBED_SCENE if scene is None else scene)
    pages = PAGES if pages is None else pages
    sources = SOURCES if sources is None else sources
    page = next((p for p in pages if p['slug'] == scene.get('pageSlug', scene['id'])), None)
    if page is None:
        raise ValueError('场景找不到对应工艺页')
    steps = [dict(copy.deepcopy(step), number=i + 1) for i, step in enumerate(page['steps'])]
    if 'stepIds' in scene:
        selected = scene['stepIds']
        if not selected or len(selected) != len(set(selected)) or not set(selected).issubset({s.get('id') for s in steps}):
            raise ValueError('场景引用未知或重复正文步骤')
        steps = [s for s in steps if s.get('id') in selected]
    step_ids = unique_ids(steps, '正文步骤')
    if scene['phases']:
        unique_ids(scene['phases'], '动画阶段')
    unique_ids(scene['parts'], '设备部件')
    duration = scene['duration']
    if scene['status'] == 'static-prototype':
        if duration != 0 or scene['phases']:
            raise ValueError('静态场景不能包含动画时间或阶段')
    elif scene['status'] != 'animated-prototype' or not isinstance(duration, (int, float)) or not math.isfinite(duration) or duration <= 0 or not scene['phases']:
        raise ValueError('动画总时长必须为有限正数并包含阶段')
    previous_end = 0
    for phase in scene['phases']:
        start, end = phase['start'], phase['end']
        if any(not isinstance(t, (int, float)) or not math.isfinite(t) for t in (start, end)):
            raise ValueError('阶段时间必须为有限数')
        if start != previous_end or end <= start:
            raise ValueError('阶段时间有重叠、空档或非法时长')
        if not phase['stepIds'] or not set(phase['stepIds']).issubset(step_ids):
            raise ValueError('阶段引用未知步骤')
        if any(not isinstance(phase.get('caption', {}).get(key), str) or not phase['caption'][key].strip() for key in ('input', 'action', 'output', 'note')):
            raise ValueError('阶段讲解不完整')
        previous_end = end
    if previous_end != duration:
        raise ValueError('阶段未覆盖完整时长')
    for item in scene['parts'] + scene['phases']:
        if item['evidence'] not in ('photo', 'reference', 'schematic'):
            raise ValueError('未知证据类型')
        if not item.get('refs') or any(key not in sources or key not in page['sources'] for key in item['refs']):
            raise ValueError('缺失或未知资料来源')
    scene['steps'] = [{key: s[key] for key in ('id', 'number', 'label', 'input', 'action', 'output', 'refs')} for s in steps]
    scene['sources'] = {key: {'title': sources[key][0], 'url': sources[key][1]} for key in page['sources']}
    return scene


def export_scene(destination=DESTINATION, scene=None):
    data = build_scene_data(scene)
    destination = Path(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(data, ensure_ascii=False, indent=2, allow_nan=False) + '\n', encoding='utf-8')
    return destination


def export_scenes(directory=DESTINATION.parent):
    return [export_scene(Path(directory) / f'{key}.json', scene) for key, scene in SCENES.items()]


if __name__ == '__main__':
    for path in export_scenes():
        print(f'已导出场景数据：{path}')
