import os
from PIL import Image, ImageDraw, ImageFont

FONTS = {
    'segoe': r'C:\Windows\Fonts\seguisb.ttf',
    'arial_bd': r'C:\Windows\Fonts\arialbd.ttf',
    'georgia_bd': r'C:\Windows\Fonts\georgiab.ttf',
}

def render_variant(font_path, c_pct, sk_pct, offset_y_pct, gap_pct, filename):
    size = 512
    img = Image.new('RGBA', (size, size), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)
    
    c_size = int(size * c_pct)
    sk_size = int(size * sk_pct)
    
    c_font = ImageFont.truetype(font_path, c_size)
    sk_font = ImageFont.truetype(font_path, sk_size)
    
    c_bbox = draw.textbbox((0, 0), "C", font=c_font)
    sk_bbox = draw.textbbox((0, 0), "SK", font=sk_font)
    
    c_w = c_bbox[2] - c_bbox[0]
    c_h = c_bbox[3] - c_bbox[1]
    sk_w = sk_bbox[2] - sk_bbox[0]
    sk_h = sk_bbox[3] - sk_bbox[1]
    
    gap = int(size * gap_pct)
    total_w = c_w + gap + sk_w
    start_x = (size - total_w) / 2
    
    c_x = start_x - c_bbox[0]
    c_y = (size - c_h) / 2 - c_bbox[1]
    
    # Subscript positioning
    sk_x = start_x + c_w + gap - sk_bbox[0]
    # Align bottom of SK with bottom of C + offset
    sk_y = (c_y + c_bbox[3]) - sk_bbox[3] + int(size * offset_y_pct)
    
    amber = (255, 159, 10, 255)
    draw.text((c_x, c_y), "C", font=c_font, fill=amber)
    draw.text((sk_x, sk_y), "SK", font=sk_font, fill=amber)
    
    out_path = os.path.join(r'C:\Users\1973s\.gemini\antigravity\brain\bbe35ccf-d2d4-4029-9e0e-867893c1ed49', filename)
    img.save(out_path)
    print(f"Saved {filename}")

render_variant(FONTS['arial_bd'], 0.62, 0.22, -0.01, 0.01, 'var_arial_subscript.png')
render_variant(FONTS['segoe'], 0.64, 0.22, -0.01, 0.01, 'var_segoe_subscript.png')
render_variant(FONTS['georgia_bd'], 0.62, 0.22, 0.00, 0.01, 'var_georgia_subscript.png')
