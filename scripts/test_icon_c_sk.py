import os
from PIL import Image, ImageDraw, ImageFont

FONT_PATH = r'C:\Windows\Fonts\georgiab.ttf'
# Also check if Arial Bold or Segoe UI Bold is available for clean sans-serif
SANS_FONT_PATH = r'C:\Windows\Fonts\seguisb.ttf' # Segoe UI Semibold
SANS_BOLD_PATH = r'C:\Windows\Fonts\seguiemb.ttf' # Segoe UI Bold / seguisb.ttf
ARIAL_BOLD = r'C:\Windows\Fonts\arialbd.ttf'

def render_c_sk(size=512, font_choice='arial', amber='#FF9F0A'):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)
    
    font_file = ARIAL_BOLD if font_choice == 'arial' else FONT_PATH
    
    # C size: ~58% of canvas
    c_size = int(size * 0.58)
    # SK size: ~26% of canvas
    sk_size = int(size * 0.26)
    
    c_font = ImageFont.truetype(font_file, c_size)
    sk_font = ImageFont.truetype(font_file, sk_size)
    
    c_bbox = draw.textbbox((0, 0), "C", font=c_font)
    sk_bbox = draw.textbbox((0, 0), "SK", font=sk_font)
    
    c_w = c_bbox[2] - c_bbox[0]
    c_h = c_bbox[3] - c_bbox[1]
    sk_w = sk_bbox[2] - sk_bbox[0]
    sk_h = sk_bbox[3] - sk_bbox[1]
    
    gap = int(size * 0.02)
    total_w = c_w + gap + sk_w
    
    start_x = (size - total_w) / 2
    
    # Vertically center the C glyph
    c_y = (size - c_h) / 2 - c_bbox[1]
    c_x = start_x - c_bbox[0]
    
    # Subscript SK: baseline aligned near the bottom of C
    # c_bottom is c_bbox[3] relative to c_y
    c_bottom = c_y + c_bbox[3]
    sk_y = c_bottom - sk_bbox[3]
    sk_x = start_x + c_w + gap - sk_bbox[0]
    
    # Draw C and SK
    draw.text((c_x, c_y), "C", font=c_font, fill=amber)
    draw.text((sk_x, sk_y), "SK", font=sk_font, fill=amber)
    
    return img

if __name__ == '__main__':
    img1 = render_c_sk(512, 'arial')
    img1.save(r'E:\CALCULATOR\test_icon_arial.png')
    img2 = render_c_sk(512, 'georgia')
    img2.save(r'E:\CALCULATOR\test_icon_georgia.png')
    print("Generated sample C_SK icons successfully!")
