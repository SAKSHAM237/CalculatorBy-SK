import subprocess
import os

CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
OUT_DIR = r'C:\Users\1973s\.gemini\antigravity\brain\bbe35ccf-d2d4-4029-9e0e-867893c1ed49'

def render_icon(name, x, y, dy, dx, c_size=310, sk_size=105):
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <rect width="512" height="512" rx="112" fill="#000000"/>
    <text x="{x}" y="{y}" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" fill="#FF9F0A">
        <tspan font-size="{c_size}">C</tspan><tspan font-size="{sk_size}" dy="{dy}" dx="{dx}" font-weight="800">SK</tspan>
    </text>
</svg>'''
    
    html_path = os.path.join(OUT_DIR, f'temp_{name}.html')
    png_path = os.path.join(OUT_DIR, f'{name}.png')
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(f'<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;width:512px;height:512px;">{svg}</body></html>')
        
    cmd = [
        CHROME,
        '--headless=new',
        '--disable-gpu',
        '--default-background-color=00000000',
        f'--screenshot={png_path}',
        '--window-size=512,512',
        html_path
    ]
    subprocess.run(cmd, check=True)
    if os.path.exists(html_path):
        os.remove(html_path)

render_icon('icon_c_sk_centered', 215, 330, 48, 8, c_size=315, sk_size=105)
render_icon('icon_c_sk_centered2', 210, 330, 48, 8, c_size=320, sk_size=100)
print("Rendered centered versions!")
