import subprocess
import os

CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
OUT_DIR = r'C:\Users\1973s\.gemini\antigravity\brain\bbe35ccf-d2d4-4029-9e0e-867893c1ed49'

def test_svg(c_size, sk_size, dy, dx, filename, is_round=False, is_squircle=False):
    bg_shape = '<circle cx="256" cy="256" r="256" fill="#000000"/>' if is_round else (
        '<rect width="512" height="512" rx="115" fill="#000000"/>' if is_squircle else
        '<rect width="512" height="512" fill="#000000"/>'
    )
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    {bg_shape}
    <text x="240" y="325" text-anchor="middle" font-family="'Segoe UI', -apple-system, Roboto, Helvetica, Arial, sans-serif" font-weight="900" fill="#FF9F0A">
        <tspan font-size="{c_size}">C</tspan><tspan font-size="{sk_size}" dy="{dy}" dx="{dx}" font-weight="800">SK</tspan>
    </text>
</svg>'''
    
    html_path = os.path.join(OUT_DIR, 'test_svg.html')
    png_path = os.path.join(OUT_DIR, filename)
    
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
    print(f"Rendered {filename}")

test_svg(310, 110, 45, 6, 'c_sk_v1.png', is_squircle=True)
test_svg(320, 115, 50, 4, 'c_sk_v2.png', is_squircle=True)
test_svg(300, 120, 40, 8, 'c_sk_v3.png', is_squircle=True)
