import subprocess
import os
import shutil
from PIL import Image

CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
PROJECT_ROOT = r'E:\CALCULATOR'

def make_svg(shape='squircle'):
    # shape: 'squircle', 'round', 'full'
    if shape == 'round':
        bg = '<circle cx="256" cy="256" r="256" fill="#000000"/>'
    elif shape == 'squircle':
        bg = '<rect width="512" height="512" rx="112" fill="#000000"/>'
    else: # full
        bg = '<rect width="512" height="512" fill="#000000"/>'
        
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    {bg}
    <text x="215" y="330" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-weight="900" fill="#FF9F0A">
        <tspan font-size="315">C</tspan><tspan font-size="105" dy="48" dx="8" font-weight="800">SK</tspan>
    </text>
</svg>'''

# 1. Save Web favicon.svg
favicon_path = os.path.join(PROJECT_ROOT, 'public', 'favicon.svg')
with open(favicon_path, 'w', encoding='utf-8') as f:
    f.write(make_svg('squircle'))
print("Saved public/favicon.svg")

# Render high-res master PNGs
master_squircle = os.path.join(PROJECT_ROOT, 'master_squircle.png')
master_round = os.path.join(PROJECT_ROOT, 'master_round.png')
master_full = os.path.join(PROJECT_ROOT, 'master_full.png')

for shape, out_file in [('squircle', master_squircle), ('round', master_round), ('full', master_full)]:
    temp_html = os.path.join(PROJECT_ROOT, f'temp_{shape}.html')
    with open(temp_html, 'w', encoding='utf-8') as f:
        f.write(f'<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;width:512px;height:512px;">{make_svg(shape)}</body></html>')
    cmd = [
        CHROME,
        '--headless=new',
        '--disable-gpu',
        '--default-background-color=00000000',
        f'--screenshot={out_file}',
        '--window-size=512,512',
        temp_html
    ]
    subprocess.run(cmd, check=True)
    if os.path.exists(temp_html):
        os.remove(temp_html)
    print(f"Rendered master {shape}")

# Android Densities
ANDROID_DENSITIES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

im_squircle = Image.open(master_squircle)
im_round = Image.open(master_round)
im_full = Image.open(master_full)

res_dir = os.path.join(PROJECT_ROOT, 'android', 'app', 'src', 'main', 'res')
for folder, size in ANDROID_DENSITIES.items():
    folder_path = os.path.join(res_dir, folder)
    os.makedirs(folder_path, exist_ok=True)
    
    # ic_launcher.png (squircle)
    out_sq = im_squircle.resize((size, size), Image.Resampling.LANCZOS)
    out_sq.save(os.path.join(folder_path, 'ic_launcher.png'), 'PNG')
    
    # ic_launcher_round.png (round)
    out_rd = im_round.resize((size, size), Image.Resampling.LANCZOS)
    out_rd.save(os.path.join(folder_path, 'ic_launcher_round.png'), 'PNG')
    print(f"Generated Android {folder} ({size}x{size})")

# iOS AppIcon
ios_dir = os.path.join(PROJECT_ROOT, 'ios', 'HelloWorld', 'Images.xcassets', 'AppIcon.appiconset')
os.makedirs(ios_dir, exist_ok=True)

IOS_SIZES = {
    'icon-20@2x.png': 40,
    'icon-20@3x.png': 60,
    'icon-29@2x.png': 58,
    'icon-29@3x.png': 87,
    'icon-40@2x.png': 80,
    'icon-40@3x.png': 120,
    'icon-60@2x.png': 120,
    'icon-60@3x.png': 180,
    'icon-1024.png': 1024,
}

# iOS expects opaque RGB images (no alpha channel)
im_full_rgb = im_full.convert('RGB')

for filename, size in IOS_SIZES.items():
    out_ios = im_full_rgb.resize((size, size), Image.Resampling.LANCZOS)
    out_ios.save(os.path.join(ios_dir, filename), 'PNG')
    print(f"Generated iOS {filename} ({size}x{size})")

# Cleanup masters
for m in [master_squircle, master_round, master_full]:
    if os.path.exists(m):
        os.remove(m)

print("All C_SK icons generated successfully across Web, Android, and iOS!")
