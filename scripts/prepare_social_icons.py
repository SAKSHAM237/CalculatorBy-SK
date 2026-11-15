import urllib.request
import os
import json
import base64
import subprocess
import re

OUT_DIR = r'E:\CALCULATOR\src\assets\social'
os.makedirs(OUT_DIR, exist_ok=True)
CHROME_PATH = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

SOURCES = {
    'linkedin': 'https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/linkedin.svg',
    'github': 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/github.svg',
    'leetcode': 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/leetcode.svg',
    'codechef': 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/codechef.svg',
    'x': 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/x.svg',
    'instagram': 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/instagram.svg',
}

svg_paths = {}
for key, url in SOURCES.items():
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode('utf-8')
        start = content.find('<path')
        end = content.rfind('</svg>')
        svg_paths[key] = content[start:end]
    print(f'Fetched {key}')

def make_html(key):
    inner = svg_paths[key]
    if key == 'linkedin':
        return f'''<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;width:128px;height:128px;display:flex;align-items:center;justify-content:center;">
        <svg width="128" height="128" viewBox="0 0 128 128">
            <rect width="128" height="128" rx="28" fill="#0A66C2"/>
            <g transform="translate(24, 24) scale(3.3333)" fill="#FFFFFF">
                {inner}
            </g>
        </svg>
    </body></html>'''
    elif key == 'github':
        return f'''<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;width:128px;height:128px;display:flex;align-items:center;justify-content:center;">
        <svg width="128" height="128" viewBox="0 0 128 128">
            <rect width="128" height="128" rx="28" fill="#24292E"/>
            <g transform="translate(24, 24) scale(3.3333)" fill="#FFFFFF">
                {inner}
            </g>
        </svg>
    </body></html>'''
    elif key == 'leetcode':
        return f'''<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;width:128px;height:128px;display:flex;align-items:center;justify-content:center;">
        <svg width="128" height="128" viewBox="0 0 128 128">
            <rect width="128" height="128" rx="28" fill="#282828"/>
            <g transform="translate(24, 24) scale(3.3333)" fill="#FFA116">
                {inner}
            </g>
        </svg>
    </body></html>'''
    elif key == 'codechef':
        return f'''<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;width:128px;height:128px;display:flex;align-items:center;justify-content:center;">
        <svg width="128" height="128" viewBox="0 0 128 128">
            <rect width="128" height="128" rx="28" fill="#5B4638"/>
            <g transform="translate(24, 24) scale(3.3333)" fill="#FFFFFF">
                {inner}
            </g>
        </svg>
    </body></html>'''
    elif key == 'x':
        return f'''<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;width:128px;height:128px;display:flex;align-items:center;justify-content:center;">
        <svg width="128" height="128" viewBox="0 0 128 128">
            <rect width="128" height="128" rx="28" fill="#000000" stroke="#333333" stroke-width="4"/>
            <g transform="translate(26, 26) scale(3.1666)" fill="#FFFFFF">
                {inner}
            </g>
        </svg>
    </body></html>'''
    elif key == 'instagram':
        return f'''<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;width:128px;height:128px;display:flex;align-items:center;justify-content:center;">
        <svg width="128" height="128" viewBox="0 0 128 128">
            <defs>
                <radialGradient id="ig-rg" cx="30%" cy="107%" r="150%">
                    <stop stop-color="#fdf497" offset="0%" />
                    <stop stop-color="#fdf497" offset="5%" />
                    <stop stop-color="#fd5949" offset="45%" />
                    <stop stop-color="#d6249f" offset="60%" />
                    <stop stop-color="#285AEB" offset="90%" />
                </radialGradient>
            </defs>
            <rect width="128" height="128" rx="28" fill="url(#ig-rg)"/>
            <g transform="translate(24, 24) scale(3.3333)" fill="#FFFFFF">
                {inner}
            </g>
        </svg>
    </body></html>'''

base64_results = {}

for key in SOURCES.keys():
    tmp_html = os.path.join(OUT_DIR, f'temp_{key}.html')
    tmp_png = os.path.join(OUT_DIR, f'{key}.png')
    with open(tmp_html, 'w', encoding='utf-8') as f:
        f.write(make_html(key))
        
    cmd = [
        CHROME_PATH,
        '--headless=new',
        '--disable-gpu',
        '--default-background-color=00000000',
        f'--screenshot={tmp_png}',
        '--window-size=128,128',
        tmp_html
    ]
    subprocess.run(cmd, check=True)
    
    with open(tmp_png, 'rb') as f:
        b64 = base64.b64encode(f.read()).decode('utf-8')
        base64_results[key] = f"data:image/png;base64,{b64}"
        
    os.remove(tmp_html)
    print(f'Generated {key}.png ({os.path.getsize(tmp_png)} bytes)')

ts_content = "export const OFFICIAL_ICONS: Record<string, string> = " + json.dumps(base64_results, indent=2) + ";\n"
with open(r'E:\CALCULATOR\src\assets\socialIcons.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print("Saved E:\\CALCULATOR\\src\\assets\\socialIcons.ts successfully!")
