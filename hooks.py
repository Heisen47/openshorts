import os
import subprocess
import urllib.request
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FONT_DIR = "fonts"
SANS_URL = "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf"
SERIF_URL = "https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSerif/NotoSerif-Bold.ttf"
SANS_PATH = os.path.join(FONT_DIR, "NotoSans-Bold.ttf")
SERIF_PATH = os.path.join(FONT_DIR, "NotoSerif-Bold.ttf")
FONT_PATH = SANS_PATH

def download_font_if_needed():
    """Downloads modern font for hook text if not present."""
    if not os.path.exists(FONT_DIR):
        os.makedirs(FONT_DIR)
    
    target_path = SANS_PATH
    target_url = SANS_URL
    if not os.path.exists(target_path):
        # If serif already exists, we can use it, but try downloading sans
        print(f"⬇️ Downloading modern font from {target_url}...")
        try:
            req = urllib.request.Request(target_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as response, open(target_path, 'wb') as out_file:
                out_file.write(response.read())
            print("✅ Modern font downloaded.")
        except Exception as e:
            print(f"⚠️ Sans font download failed ({e}), checking serif fallback...")
            if not os.path.exists(SERIF_PATH):
                try:
                    req = urllib.request.Request(SERIF_URL, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(req, timeout=10) as response, open(SERIF_PATH, 'wb') as out_file:
                        out_file.write(response.read())
                except Exception:
                    pass

def get_loaded_font(size):
    """Loads best available TTF font."""
    download_font_if_needed()
    for path in [SANS_PATH, SERIF_PATH]:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()

def create_hook_image(text, target_width, output_image_path="hook_overlay.png", font_scale=1.0, theme="obsidian"):
    """
    Generates a premium viral clips channel hook card with modern typography,
    subtle frosted background, glowing border, and retention badge.
    """
    download_font_if_needed()

    # Theme palettes
    themes = {
        "obsidian": {
            "bg": (18, 20, 30, 244),
            "border": (255, 255, 255, 45),
            "border_width": 2,
            "text": (255, 255, 255, 255),
            "badge_bg": (234, 179, 8, 45),
            "badge_border": (251, 191, 36, 110),
            "badge_text": (251, 191, 36, 255),
            "badge_label": "WAIT FOR IT",
            "shadow": (0, 0, 0, 160),
        },
        "cyber": {
            "bg": (10, 14, 25, 246),
            "border": (34, 211, 238, 120),
            "border_width": 2,
            "text": (255, 255, 255, 255),
            "badge_bg": (34, 211, 238, 45),
            "badge_border": (34, 211, 238, 140),
            "badge_text": (34, 211, 238, 255),
            "badge_label": "MUST WATCH",
            "shadow": (0, 0, 0, 180),
        },
        "clean-white": {
            "bg": (255, 255, 255, 246),
            "border": (0, 0, 0, 25),
            "border_width": 1,
            "text": (15, 23, 42, 255),
            "badge_bg": (0, 0, 0, 18),
            "badge_border": (0, 0, 0, 35),
            "badge_text": (30, 41, 59, 255),
            "badge_label": "POV",
            "shadow": (0, 0, 0, 130),
        },
        "minimal": {
            "bg": (12, 12, 16, 230),
            "border": (255, 255, 255, 30),
            "border_width": 1,
            "text": (248, 250, 252, 255),
            "badge_label": None,
            "shadow": (0, 0, 0, 150),
        }
    }
    t = themes.get(theme, themes["obsidian"])

    # Configuration
    padding_x = int(32 * font_scale)
    padding_y = int(24 * font_scale)
    line_spacing = int(14 * font_scale)
    cornerradius = int(22 * font_scale)
    shadow_offset = (0, 12)
    shadow_blur = 16

    base_font_size = int(target_width * 0.046)
    font_size = max(18, int(base_font_size * font_scale))
    font = get_loaded_font(font_size)

    badge_font_size = max(11, int(font_size * 0.52))
    badge_font = get_loaded_font(badge_font_size)

    # Wrap text logic (Pixel-based)
    dummy_img = Image.new('RGBA', (1, 1))
    draw = ImageDraw.Draw(dummy_img)

    max_text_width = target_width - (2 * padding_x)
    paragraphs = text.split('\n')
    lines = []

    for p in paragraphs:
        if not p.strip():
            lines.append("")
            continue
        words = p.split()
        current_line = []
        for word in words:
            test_line = ' '.join(current_line + [word])
            bbox = draw.textbbox((0, 0), test_line, font=font)
            w = bbox[2] - bbox[0]
            if w <= max_text_width:
                current_line.append(word)
            else:
                if current_line:
                    lines.append(' '.join(current_line))
                    current_line = [word]
                else:
                    lines.append(word)
                    current_line = []
        if current_line:
            lines.append(' '.join(current_line))

    max_line_width = 0
    text_heights = []
    for line in lines:
        if not line:
            text_heights.append(font_size)
            continue
        bbox = draw.textbbox((0, 0), line, font=font)
        max_line_width = max(max_line_width, bbox[2] - bbox[0])
        text_heights.append(bbox[3] - bbox[1])

    # Badge dimensions
    badge_label = t.get("badge_label")
    badge_h = 0
    badge_w = 0
    badge_margin_bottom = 0
    if badge_label:
        bb = draw.textbbox((0, 0), badge_label, font=badge_font)
        badge_w = (bb[2] - bb[0]) + int(24 * font_scale)
        badge_h = (bb[3] - bb[1]) + int(10 * font_scale)
        badge_margin_bottom = int(12 * font_scale)

    content_w = max(max_line_width, badge_w)
    box_width = max(content_w + (2 * padding_x), int(target_width * 0.35))

    total_text_height = sum(text_heights) + (len(text_heights) - 1) * line_spacing if text_heights else font_size
    box_height = total_text_height + (2 * padding_y) + (badge_h + badge_margin_bottom if badge_label else 0)

    canvas_pad = 50
    canvas_w = box_width + (canvas_pad * 2)
    canvas_h = box_height + (canvas_pad * 2)

    img = Image.new('RGBA', (canvas_w, canvas_h), (0, 0, 0, 0))
    draw_shadow = ImageDraw.Draw(img)

    # 1. Shadow
    shadow_box = [
        (canvas_pad + shadow_offset[0], canvas_pad + shadow_offset[1]),
        (canvas_pad + box_width + shadow_offset[0], canvas_pad + box_height + shadow_offset[1])
    ]
    draw_shadow.rounded_rectangle(shadow_box, radius=cornerradius, fill=t["shadow"])
    img = img.filter(ImageFilter.GaussianBlur(shadow_blur))

    draw_final = ImageDraw.Draw(img)
    main_box = [
        (canvas_pad, canvas_pad),
        (canvas_pad + box_width, canvas_pad + box_height)
    ]

    # 2. Main Box Fill & Luminous Border
    draw_final.rounded_rectangle(
        main_box,
        radius=cornerradius,
        fill=t["bg"],
        outline=t["border"],
        width=t.get("border_width", 1)
    )

    current_y = canvas_pad + padding_y

    # 3. Badge Pill
    if badge_label:
        bx = canvas_pad + (box_width - badge_w) // 2
        by = current_y
        badge_box = [(bx, by), (bx + badge_w, by + badge_h)]
        draw_final.rounded_rectangle(
            badge_box,
            radius=int(badge_h / 2),
            fill=t["badge_bg"],
            outline=t["badge_border"],
            width=1
        )
        tbb = draw_final.textbbox((0, 0), badge_label, font=badge_font)
        tw = tbb[2] - tbb[0]
        th = tbb[3] - tbb[1]
        draw_final.text(
            (bx + (badge_w - tw) // 2, by + (badge_h - th) // 2 - 1),
            badge_label,
            font=badge_font,
            fill=t["badge_text"]
        )
        current_y += badge_h + badge_margin_bottom

    # 4. Text lines
    for i, line in enumerate(lines):
        if not line:
            current_y += font_size + line_spacing
            continue
        bbox = draw_final.textbbox((0, 0), line, font=font)
        line_w = bbox[2] - bbox[0]
        line_h = text_heights[i] if i < len(text_heights) else bbox[3] - bbox[1]
        x = canvas_pad + (box_width - line_w) // 2
        draw_final.text((x, current_y), line, font=font, fill=t["text"])
        current_y += line_h + line_spacing

    img.save(output_image_path)
    return output_image_path, canvas_w, canvas_h

def add_hook_to_video(video_path, text, output_path, position="top", font_scale=1.0, theme="obsidian"):
    """
    Overlays text hook onto video.
    position: 'top', 'center', 'bottom'
    font_scale: float multiplier (1.0 = default)
    theme: 'obsidian', 'cyber', 'clean-white', 'minimal'
    """
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video {video_path} not found")

    try:
        cmd = ['ffprobe', '-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=s=x:p=0', video_path]
        res = subprocess.check_output(cmd).decode().strip()
        dims = res.split('\n')[0].split('x')
        video_width = int(dims[0])
        video_height = int(dims[1])
    except Exception as e:
        print(f"⚠️ FFprobe failed: {e}. Assuming 1080x1920")
        video_width = 1080
        video_height = 1920

    target_box_width = int(video_width * 0.88)
    hook_filename = f"temp_hook_{os.path.basename(video_path)}.png"

    try:
        img_path, box_w, box_h = create_hook_image(
            text, target_box_width, hook_filename, font_scale=font_scale, theme=theme
        )

        overlay_x = (video_width - box_w) // 2
        if position == "center":
            overlay_y = (video_height - box_h) // 2
        elif position == "bottom":
            overlay_y = int(video_height * 0.66)
        else:
            overlay_y = int(video_height * 0.14)

        print(f"🎬 Overlaying premium hook ({theme}): '{text}' at {overlay_x},{overlay_y}")

        ffmpeg_cmd = [
            'ffmpeg', '-y',
            '-i', video_path,
            '-i', img_path,
            '-filter_complex', f"[0:v][1:v]overlay={overlay_x}:{overlay_y},setsar=1",
            '-c:a', 'copy',
            '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '18',
            '-aspect', '9:16', '-movflags', '+faststart',
            output_path
        ]

        subprocess.run(ffmpeg_cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(f"✅ Hook added to {output_path}")
        return True

    except subprocess.CalledProcessError as e:
        print(f"❌ FFmpeg Error: {e.stderr.decode() if e.stderr else 'Unknown'}")
        raise e
    except Exception as e:
        print(f"❌ Hook Gen Error: {e}")
        raise e
    finally:
        if os.path.exists(hook_filename):
            os.remove(hook_filename)
