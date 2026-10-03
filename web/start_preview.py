"""隐藏启动/复用本任务服务；--stop 只停止已核实归属的服务。"""
from pathlib import Path
from urllib.request import urlopen
import argparse
import hashlib
import json
import subprocess
import sys
import time

HERE = Path(__file__).resolve().parent
LOGS = HERE / '.preview'
STATE = LOGS / 'server.json'
SCRIPT = (HERE / 'serve.py').resolve()
HIDDEN = subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0

def process_is_ours(info):
    if info.get('root') != str((HERE / 'dist').resolve()):
        return False
    pid = int(info['pid'])
    if sys.platform != 'win32':
        return False  # 本任务运行在 Windows；其他平台不自动接管旧进程。
    command = f'Get-CimInstance Win32_Process -Filter "ProcessId = {pid}" | Select-Object -ExpandProperty CommandLine'
    proc = subprocess.run(['powershell','-NoProfile','-Command',command],capture_output=True,text=True,creationflags=HIDDEN,timeout=10)
    return proc.returncode == 0 and str(SCRIPT).lower() in proc.stdout.lower()

def healthy(info):
    # 不信任元信息中的任意远程 URL，只请求本机和合法 TCP 端口。
    port = int(info['port'])
    if not 0 < port < 65536:
        return False
    with urlopen(f'http://127.0.0.1:{port}/index.html',timeout=3) as r:
        return hashlib.sha256(r.read()).digest() == hashlib.sha256((HERE/'dist/index.html').read_bytes()).digest()

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--stop',action='store_true')
args = parser.parse_args()
LOGS.mkdir(exist_ok=True)
info = None
if STATE.exists():
    try:
        candidate = json.loads(STATE.read_text('utf-8'))
        if process_is_ours(candidate):
            info = candidate
    except (OSError,ValueError,subprocess.SubprocessError):
        pass

if args.stop:
    if info:
        subprocess.run(['powershell','-NoProfile','-Command',f'Stop-Process -Id {int(info["pid"])} -ErrorAction Stop'],creationflags=HIDDEN,check=True)
        print(f'已停止本任务预览服务，PID {info["pid"]}。')
    else:
        print('没有确认归属的运行服务；未停止任何进程。')
    sys.exit(0)

if info:
    if healthy(info):
        print(f'复用本任务服务：{info["url"]}（PID {info["pid"]}）')
        sys.exit(0)
    raise RuntimeError('已确认本任务服务进程，但 HTTP 检查未通过。请检查 .preview 日志；未重复启动。')

with (LOGS/'stdout.log').open('a',encoding='utf-8') as out,(LOGS/'stderr.log').open('a',encoding='utf-8') as err:
    child = subprocess.Popen([sys.executable,'-X','utf8',str(SCRIPT)],cwd=HERE,stdin=subprocess.DEVNULL,stdout=out,stderr=err,creationflags=HIDDEN)
for _ in range(50):
    if child.poll() is not None:
        raise RuntimeError(f'预览服务退出，退出码 {child.returncode}；请查看 .preview/stderr.log')
    if STATE.exists():
        try:
            info=json.loads(STATE.read_text('utf-8'))
        except json.JSONDecodeError:
            time.sleep(.2)
            continue
        if info['pid']==child.pid and healthy(info):
            print(f'预览已启动：{info["url"]}（PID {child.pid}）')
            print(f'工作目录：{HERE}\n日志目录：{LOGS}')
            break
    time.sleep(.2)
else:
    child.terminate()  # 仅终止本次启动、未通过健康检查的子进程。
    raise RuntimeError('启动超时；已终止本次未就绪的子进程。')
