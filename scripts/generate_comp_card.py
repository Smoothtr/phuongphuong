from pathlib import Path
from shutil import copyfile

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "comp-card-phuong-phuong.pdf"
PUBLIC_COPY = ROOT / "public" / "comp-card-phuong-phuong.pdf"
IMAGE = ROOT / "public" / "images" / "hero-main.jpg"

PAPER = HexColor("#F5F1EC")
INK = HexColor("#171312")
WINE = HexColor("#7C2E32")
LINE = HexColor("#B8ADA4")


def draw_rule(pdf, x, y, width):
    pdf.setStrokeColor(LINE)
    pdf.setLineWidth(0.55)
    pdf.line(x, y, x + width, y)


def draw_image_cover(pdf, path, x, y, width, height):
    image = ImageReader(str(path))
    image_width, image_height = image.getSize()
    scale = max(width / image_width, height / image_height)
    scaled_width = image_width * scale
    scaled_height = image_height * scale
    crop_x = x + (width - scaled_width) / 2
    crop_y = y + (height - scaled_height) / 2

    pdf.saveState()
    clip = pdf.beginPath()
    clip.rect(x, y, width, height)
    pdf.clipPath(clip, stroke=0, fill=0)
    pdf.drawImage(image, crop_x, crop_y, scaled_width, scaled_height, mask="auto")
    pdf.restoreState()


def draw_label_value(pdf, label, value, x, y, width):
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica", 6.7)
    pdf.drawString(x, y, label.upper())
    pdf.setFont("Helvetica-Bold", 8.6)
    value_width = stringWidth(value, "Helvetica-Bold", 8.6)
    pdf.drawString(x + width - value_width, y, value)
    draw_rule(pdf, x, y - 7, width)


def build_comp_card():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_COPY.parent.mkdir(parents=True, exist_ok=True)

    page_width, page_height = A4
    pdf = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    pdf.setTitle("Phuong Phuong - Comp Card")
    pdf.setAuthor("Phuong Phuong")
    pdf.setSubject("Model and Actress Comp Card")
    pdf.setFillColor(PAPER)
    pdf.rect(0, 0, page_width, page_height, stroke=0, fill=1)

    margin = 42
    image_x = margin
    image_y = 150
    image_width = 292
    image_height = 482
    panel_x = image_x + image_width + 32
    panel_width = page_width - panel_x - margin

    pdf.setFillColor(INK)
    pdf.setFont("Times-Bold", 11)
    pdf.drawString(margin, 796, "PP")
    pdf.setFillColor(WINE)
    pdf.setFont("Helvetica", 6.4)
    pdf.drawRightString(page_width - margin, 798, "MODEL CARD / 2026")

    pdf.setFillColor(INK)
    pdf.setFont("Times-Bold", 32)
    pdf.drawString(margin, 734, "PHUONG")
    pdf.setFillColor(WINE)
    pdf.drawString(margin, 698, "PHUONG")
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica", 8)
    pdf.drawString(margin + 2, 677, "MODEL / ACTRESS")

    draw_image_cover(pdf, IMAGE, image_x, image_y, image_width, image_height)
    pdf.setFillColor(PAPER)
    pdf.rect(image_x, image_y, image_width, 32, stroke=0, fill=1)
    pdf.setFillColor(INK)
    pdf.setFont("Helvetica", 6.6)
    pdf.drawString(image_x + 10, image_y + 19, "PHUONG PHUONG")
    pdf.setFont("Helvetica", 6)
    pdf.drawRightString(image_x + image_width - 10, image_y + 19, "VIETNAM")

    pdf.setFillColor(INK)
    pdf.setFont("Helvetica", 6.5)
    pdf.drawString(panel_x, 614, "MEASUREMENTS")
    draw_rule(pdf, panel_x, 604, panel_width)

    rows = [
        ("Height", "166 cm"),
        ("Leg", "94 cm"),
        ("Bust / Waist / Hips", "79 / 58 / 85"),
        ("Dress", "XS / S"),
        ("Shoes", "EU 38"),
        ("Hair / Eyes", "Black / Dark brown"),
    ]

    y = 578
    for label, value in rows:
        draw_label_value(pdf, label, value, panel_x, y, panel_width)
        y -= 38

    pdf.setFillColor(WINE)
    pdf.setFont("Times-Italic", 12)
    pdf.drawString(panel_x, 326, "Fashion. Beauty.")
    pdf.drawString(panel_x, 309, "Commercial. Acting.")

    pdf.setFillColor(INK)
    pdf.setFont("Helvetica", 6.5)
    pdf.drawString(panel_x, 260, "BOOKING")
    draw_rule(pdf, panel_x, 250, panel_width)
    pdf.setFont("Helvetica", 7.2)
    pdf.drawString(panel_x, 228, "phuongvule2003@gmail.com")
    pdf.drawString(panel_x, 211, "instagram.com/hii.phuog")
    pdf.drawString(panel_x, 194, "Based in Vietnam")

    draw_rule(pdf, margin, 110, page_width - margin * 2)
    pdf.setFont("Helvetica", 6.2)
    pdf.setFillColor(INK)
    pdf.drawString(margin, 91, "PHUONG PHUONG  /  MODEL & ACTRESS")
    pdf.drawRightString(page_width - margin, 91, "FOR BOOKING ENQUIRIES")

    pdf.save()
    copyfile(OUTPUT, PUBLIC_COPY)
    print(f"Created {OUTPUT}")
    print(f"Copied {PUBLIC_COPY}")


if __name__ == "__main__":
    build_comp_card()
