"""仅监听本机、只服务 dist 的只读预览；无目录列表。"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote, urlsplit
import os
import json

HERE = Path(__file__).resolve().parent
ROOT = (HERE / 'dist').resolve()
STATE = HERE / '.preview'
STATE.mkdir(exist_ok=True)

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs):
        super().__init__(*args,directory=str(ROOT),**kwargs)
    def list_directory(self,path):
        self.send_error(403,'Directory listing disabled')
        return None
    def send_head(self):
        raw = unquote(urlsplit(self.path).path)
        parts = raw.replace('\\','/').split('/')
        if '..' in parts or any(p.startswith('.') and p not in ('','.') for p in parts):
            self.send_error(403,'Path not allowed')
            return None
        target = Path(self.translate_path(self.path)).resolve()
        if not target.is_relative_to(ROOT):
            self.send_error(403,'Path not allowed')
            return None
        return super().send_head()
    def end_headers(self):
        self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        super().end_headers()

server = ThreadingHTTPServer(('127.0.0.1',0),Handler)
port = server.server_address[1]
info = dict(pid=os.getpid(),cwd=str(HERE),root=str(ROOT),host='127.0.0.1',port=port,url=f'http://127.0.0.1:{port}/',command='python web/serve.py')
(STATE/'server.json').write_text(json.dumps(info,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(info,ensure_ascii=False),flush=True)
try:
    server.serve_forever()
finally:
    server.server_close()
