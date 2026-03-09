# command: `python build_all_tests_pdf.py`

import subprocess
import sys
from pathlib import Path
from PyPDF2 import PdfReader, PdfWriter


def generate_all_tests():
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


def generate_all_tests_pdf():
    utils_dir = Path(__file__).parent
    tests_dir = utils_dir / "tests"
    public_dir = utils_dir.parent.parent / "public" / "pdfs"
    public_dir.mkdir(exist_ok=True)

    generate_all_tests()

    test_pdfs = [tests_dir / f"test_{t}.pdf" for t in ["A", "B", "C", "D"]]
    output_pdf = public_dir / "Tests_ABCD.pdf"

    for pdf in test_pdfs:
        if not pdf.exists():
            print(f"Error: No se encontró {pdf}")
            sys.exit(1)

    writer = PdfWriter()
    for test_id, pdf_path in zip(["A", "B", "C", "D"], test_pdfs):
        reader = PdfReader(str(pdf_path))
        for page in reader.pages:
            writer.add_page(page)
        print(f"Añadido: test_{test_id}.pdf")

    with open(str(output_pdf), "wb") as f:
        writer.write(f)

    total_pages = len(PdfReader(str(output_pdf)).pages)
    print(f"\n✅ PDF generado: public/pdfs/Tests_ABCD.pdf")
    print(f"📄 Total de páginas: {total_pages}")


if __name__ == "__main__":
    generate_all_tests_pdf()
