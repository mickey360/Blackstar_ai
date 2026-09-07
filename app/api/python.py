from http.server import BaseHTTPRequestHandler
import json, statistics

def execute(payload):
    data = payload.get('input')
    mode = payload.get('mode','stats')
    if mode == 'stats' and isinstance(data,list):
        nums=[x for x in data if isinstance(x,(int,float)) and not isinstance(x,bool)]
        return {'count':len(nums),'min':min(nums) if nums else None,'max':max(nums) if nums else None,'mean':statistics.mean(nums) if nums else None,'language':'python'}
    if mode == 'dedupe' and isinstance(data,list):
        seen=[]; keys=set()
        for x in data:
            k=json.dumps(x,sort_keys=True,default=str)
            if k not in keys: keys.add(k); seen.append(x)
        return {'items':seen,'language':'python'}
    return {'value':data,'language':'python'}

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            n=int(self.headers.get('content-length','0')); body=json.loads(self.rfile.read(n) or '{}')
            out=execute(body); raw=json.dumps(out).encode()
            self.send_response(200); self.send_header('Content-Type','application/json'); self.end_headers(); self.wfile.write(raw)
        except Exception as exc:
            raw=json.dumps({'error':str(exc)}).encode(); self.send_response(400); self.send_header('Content-Type','application/json'); self.end_headers(); self.wfile.write(raw)
