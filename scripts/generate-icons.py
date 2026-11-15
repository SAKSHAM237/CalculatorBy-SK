import os
from PIL import Image, ImageDraw, ImageFont

# Android densities and their icon sizes (px)
DENSITIES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

RES_DIR = r'E:\CALCULATOR\android\app\src\main\res'
FONT_PATH = r'C:\Windows\Fonts\georgiab.ttf'

def create_icon(size: int, is_round: bool) -> Image.Image:
    # Render at 4x for super sampling / anti-aliasing
    scale = 4
    canvas_size = size * scale
    
    # 32-bit RGBA image
    img = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Background shape
    bg_color = (0, 0, 0, 255) # Pure black
    amber_color = (255, 159, 10, 255) # #FF9F0A
    
    if is_round:
        draw.ellipse([(0, 0), (canvas_size - 1, canvas_size - 1)], fill=bg_color)
    else:
        # Modern rounded squircle (corner radius ~ 22%)
        radius = int(canvas_size * 0.22)
        draw.rounded_rectangle([(0, 0), (canvas_size - 1, canvas_size - 1)], radius=radius, fill=bg_color)
        
    # Font size is ~ 72% of canvas
    font_size = int(canvas_size * 0.72)
    font = ImageFont.truetype(FONT_PATH, font_size)
    
    # Draw letter 'S' centered
    text = "S"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center text
    x = (canvas_size - text_width) / 2 - bbox[0]
    y = (canvas_size - text_height) / 2 - bbox[1]
    
    draw.text((x, y), text, font=font, fill=amber_color)
    
    # Downsample to target size with high quality Lanczos filter
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

for density, size in DENSITIES.items():
    folder = os.path.join(RES_DIR, density)
    os.makedirs(folder, exist_ok=True)
    
    # Standard icon
    icon_square = create_icon(size, is_round=False)
    square_path = os.path.join(folder, 'ic_launcher.png')
    icon_square.save(square_path, format='PNG')
    
    # Round icon
    icon_round = create_icon(size, is_round=True)
    round_path = os.path.join(folder, 'ic_launcher_round.png')
    icon_round.save(round_path, format='PNG')
    
    print(f"Generated {density} ({size}x{size}): {square_path} and {round_path}")

print("All Android launcher icons successfully updated!")
