"""校验首期场景并导出给前端；导入本模块不会生成网页。"""
import copy
import json
import math
from pathlib import Path

from content import PAGES, SOURCES
from scene_content import ENROBED_SCENE

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
    page = next((p for p in pages if p['slug'] == scene['id']), None)
    if page is None:
        raise ValueError('场景找不到对应工艺页')
    steps = copy.deepcopy(page['steps'])
    step_ids = unique_ids(steps, '正文步骤')
    unique_ids(scene['phases'], '动画阶段')
    unique_ids(scene['parts'], '设备部件')
    duration = scene['duration']
    if not isinstance(duration, (int, float)) or not math.isfinite(duration) or duration <= 0:
        raise ValueError('总时长必须为有限正数')
    previous_end = 0
    for phase in scene['phases']:
        start, end = phase['start'], phase['end']
        if any(not isinstance(t, (int, float)) or not math.isfinite(t) for t in (start, end)):
            raise ValueError('阶段时间必须为有限数')
        if start != previous_end or end <= start:
            raise ValueError('阶段时间有重叠、空档或非法时长')
        if not phase['stepIds'] or not set(phase['stepIds']).issubset(step_ids):
            raise ValueError('阶段引用未知步骤')
        previous_end = end
    if previous_end != duration:
        raise ValueError('阶段未覆盖完整时长')
    for item in scene['parts'] + scene['phases']:
        if item['evidence'] not in ('photo', 'reference', 'schematic'):
            raise ValueError('未知证据类型')
        if not item.get('refs') or any(key not in sources or key not in page['sources'] for key in item['refs']):
            raise ValueError('缺失或未知资料来源')
    scene['steps'] = [{key: s[key] for key in ('id', 'label', 'input', 'action', 'output', 'refs')} for s in steps]
    scene['sources'] = {key: {'title': sources[key][0], 'url': sources[key][1]} for key in page['sources']}
    return scene


def export_scene(destination=DESTINATION):
    data = build_scene_data()
    destination = Path(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(data, ensure_ascii=False, indent=2, allow_nan=False) + '\n', encoding='utf-8')
    return destination


if __name__ == '__main__':
    print(f'已导出场景数据：{export_scene()}')
