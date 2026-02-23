# command: `python build_full_pdf.py`

import subprocess
import sys
from pathlib import Path
from PyPDF2 import PdfReader, PdfWriter
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import io


def generate_all_tests():
    """Generate all test PDFs using build_test_pdf.py"""
    script_path = Path(__file__).parent / "build_test_pdf.py"

    for test_id in ["A", "B", "C", "D"]:
        print(f"Generating test {test_id}...")
        result = subprocess.run(
            [sys.executable, str(script_path), test_id], capture_output=True, text=True
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


def add_pdf_pages(writer, pdf_path, name):
    """Add all pages from a PDF file to the writer"""
    reader = PdfReader(str(pdf_path))
    for page in reader.pages:
        writer.add_page(page)
    print(f"Añadido: {name} ({len(reader.pages)} páginas)")


def generate_full_pdf():
    """Merge all PDFs into one final document"""
    utils_dir = Path(__file__).parent
    data_dir = utils_dir / "data"
    public_dir = utils_dir.parent.parent / "public"

    generate_all_tests()

    instructions_pdf = utils_dir / "hoja_instrucciones_profes.pdf"
    hoja_informativa_pdf = utils_dir / "Hoja informativa.pdf"
    consentimiento_pdf = utils_dir / "Consentimiento informado.pdf"
    test_pdfs = [data_dir / f"examen_modelo_{t}.pdf" for t in ["A", "B", "C", "D"]]
    output_pdf = public_dir / "profe_instrucciones_y_tests.pdf"

    required_pdfs = [
        (instructions_pdf, "hoja_instrucciones_profes.pdf"),
        (hoja_informativa_pdf, "Hoja informativa.pdf"),
        (consentimiento_pdf, "Consentimiento informado.pdf"),
    ]
    for pdf_path, name in required_pdfs:
        if not pdf_path.exists():
            print(f"Error: No se encontró {name}")
            sys.exit(1)

    for pdf in test_pdfs:
        if not pdf.exists():
            print(f"Error: No se encontró {pdf}")
            sys.exit(1)

    writer = PdfWriter()

    # 1. Add instructions (2 pages)
    add_pdf_pages(writer, instructions_pdf, "hoja_instrucciones_profes.pdf")

    # 2. Add Hoja Informativa (1 page)
    add_pdf_pages(writer, hoja_informativa_pdf, "Hoja informativa.pdf")

    # 3. Add blank page (separator)
    blank_buffer = create_blank_page(A4)
    blank_reader = PdfReader(blank_buffer)
    writer.add_page(blank_reader.pages[0])
    print("Añadida: página en blanco (separador)")

    # 4. Add Consentimiento Informado (1 page)
    add_pdf_pages(writer, consentimiento_pdf, "Consentimiento informado.pdf")

    # 5. Add blank page (separator)
    blank_buffer2 = create_blank_page(A4)
    blank_reader2 = PdfReader(blank_buffer2)
    writer.add_page(blank_reader2.pages[0])
    print("Añadida: página en blanco (separador)")

    # 6. Add all test PDFs (2 pages each = 8 pages)
    for test_id, pdf_path in zip(["A", "B", "C", "D"], test_pdfs):
        test_reader = PdfReader(str(pdf_path))
        for page in test_reader.pages:
            writer.add_page(page)
        print(f"Añadido: examen_modelo_{test_id}.pdf")

    # Write final PDF
    with open(str(output_pdf), "wb") as f:
        writer.write(f)

    # Count pages in final PDF
    reader = PdfReader(str(output_pdf))
    total_pages = len(reader.pages)

    print(f"\n✅ PDF completo generado: public/profe_instrucciones_y_tests.pdf")
    print(f"📄 Total de páginas: {total_pages}")


if __name__ == "__main__":
    generate_full_pdf()
