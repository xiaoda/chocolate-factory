"""完整构建：导出数据 → 类型检查/Vite → 含 3D 的静态站点。"""
from pathlib import Path
import os
import shutil
import subprocess
import sys

from export_scene_data import export_scenes
from build import build_site

HERE = Path(__file__).resolve().parent
FRONTEND = HERE / 'three'


def frontend_commands():
    """直接运行编译器，避免 npm run 再派生 .cmd / shell 的启动链。"""
    node = shutil.which('node')
    if not node:
        raise RuntimeError('缺少 Node.js，请先准备与 package.json engines 兼容的环境。')
    entries = [('类型检查', 'typescript/bin/tsc', '--noEmit'), ('构建 3D 模块', 'vite/bin/vite.js', 'build')]
    commands = []
    for label, entry, argument in entries:
        script = FRONTEND / 'node_modules' / entry
        if not script.is_file():
            raise RuntimeError(f'缺少构建依赖：{script}；请运行 npm --prefix web/three ci。')
        commands.append((label, [node, str(script), argument]))
    return commands


def main():
    if not (FRONTEND / 'node_modules/vite').is_dir():
        raise RuntimeError('前端依赖尚未准备，请运行 npm --prefix web/three ci。')
    for path in export_scenes():
        print(f'场景数据：{path}', flush=True)
    for label, command in frontend_commands():
        print(f'{label}…', flush=True)
        result = subprocess.run(command, cwd=FRONTEND, capture_output=True, text=True, encoding='utf-8',
                                creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
        print(result.stdout, end='', flush=True)
        if result.stderr:
            print(result.stderr, end='', file=sys.stderr, flush=True)
        result.check_returncode()
    build_site(with_3d=True)


if __name__ == '__main__':
    main()
