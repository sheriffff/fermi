# command: `python utils/generate_full_pdf.py`
# Generates a full PDF with:
# - 1 page: pdf_instrucciones_profes.pdf
# - 1 blank page
# - 8 pages: all tests A, B, C, D (2 pages each)
# Total: 10 pages

import subprocess
import sys
from PyPDF2 import PdfReader, PdfWriter
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import io
import os

def generate_all_tests():
    """Generate all test PDFs using generate_test_pdf.py"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    script_path = os.path.join(script_dir, "generate_test_pdf.py")

    for test_id in ['A', 'B', 'C', 'D']:
        print(f"Generating test {test_id}...")
        result = subprocess.run(
            [sys.executable, script_path, test_id],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            print(f"Error generating test {test_id}: {result.stderr}")
            sys.exit(1)
        print(result.stdout.strip())

def create_blank_page(page_size=A4):
    """Create a blank page as bytes with the given size"""
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=page_size)
    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer

def get_page_size(pdf_path):
    """Get the page size of the first page of a PDF"""
    reader = PdfReader(pdf_path)
    first_page = reader.pages[0]
    width = float(first_page.mediabox.width)
    height = float(first_page.mediabox.height)
    return (width, height)

def generate_full_pdf():
    """Merge all PDFs into one final document"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, "data")

    # Generate all test PDFs first
    generate_all_tests()

    # Paths to source files
    instructions_pdf = os.path.join(data_dir, "pdf_instrucciones_profes.pdf")
    test_pdfs = [os.path.join(data_dir, f"examen_modelo_{t}.pdf") for t in ['A', 'B', 'C', 'D']]
    output_pdf = os.path.join(data_dir, "profe_imprimir.pdf")

    # Check instructions file exists
    if not os.path.exists(instructions_pdf):
        print(f"Error: No se encontró {instructions_pdf}")
        sys.exit(1)

    # Check all test files exist
    for pdf in test_pdfs:
        if not os.path.exists(pdf):
            print(f"Error: No se encontró {pdf}")
            sys.exit(1)

    # Create PDF writer
    writer = PdfWriter()

    # Add instructions page, scaled to A4
    instructions_reader = PdfReader(instructions_pdf)
    instr_page = instructions_reader.pages[0]
    instr_width = float(instr_page.mediabox.width)
    instr_height = float(instr_page.mediabox.height)

    # Calculate scale factor to fit A4 width
    a4_width, a4_height = A4
    scale = a4_width / instr_width

    # Scale the page
    instr_page.scale(scale, scale)
    writer.add_page(instr_page)
    print(f"Añadido: pdf_instrucciones_profes.pdf (escalado de {instr_width:.0f}x{instr_height:.0f} a {a4_width:.0f}x{instr_height*scale:.0f})")

    # Add blank page with A4 size
    blank_buffer = create_blank_page(A4)
    blank_reader = PdfReader(blank_buffer)
    writer.add_page(blank_reader.pages[0])
    print("Añadida: página en blanco")

    # Add all test PDFs (2 pages each = 8 pages)
    for test_id, pdf_path in zip(['A', 'B', 'C', 'D'], test_pdfs):
        test_reader = PdfReader(pdf_path)
        for page in test_reader.pages:
            writer.add_page(page)
        print(f"Añadido: examen_modelo_{test_id}.pdf")

    # Write final PDF
    with open(output_pdf, 'wb') as f:
        writer.write(f)

    # Count pages in final PDF
    reader = PdfReader(output_pdf)
    total_pages = len(reader.pages)

    print(f"\n✅ PDF completo generado: {output_pdf}")
    print(f"📄 Total de páginas: {total_pages}")

if __name__ == "__main__":
    generate_full_pdf()
