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
    assets_dir = utils_dir.parent.parent / "assets"
    public_dir = utils_dir.parent.parent / "public" / "pdfs"
    public_dir.mkdir(exist_ok=True)

    generate_all_tests()

    # 1. Tests_ABCD.pdf
    test_pdfs = [tests_dir / f"test_{t}.pdf" for t in ["A", "B", "C", "D"]]
    for pdf in test_pdfs:
        if not pdf.exists():
            print(f"Error: No se encontró {pdf}")
            sys.exit(1)

    writer = PdfWriter()
    for test_id, pdf_path in zip(["A", "B", "C", "D"], test_pdfs):
        for page in PdfReader(str(pdf_path)).pages:
            writer.add_page(page)
        print(f"Añadido: test_{test_id}.pdf")

    tests_output = public_dir / "Tests_ABCD.pdf"
    with open(str(tests_output), "wb") as f:
        writer.write(f)
    print(f"✅ public/pdfs/Tests_ABCD.pdf ({len(PdfReader(str(tests_output)).pages)} páginas)")

    # 2. Docs_Alumnado.pdf (Hoja Informativa + Consentimiento informado)
    doc_pdfs = [
        assets_dir / "Hoja Informativa.pdf",
        assets_dir / "Consentimiento informado.pdf",
    ]
    for pdf in doc_pdfs:
        if not pdf.exists():
            print(f"Error: No se encontró {pdf}")
            sys.exit(1)

    writer2 = PdfWriter()
    for pdf_path in doc_pdfs:
        for page in PdfReader(str(pdf_path)).pages:
            writer2.add_page(page)
        print(f"Añadido: {pdf_path.name}")

    docs_output = public_dir / "Docs_Alumnado.pdf"
    with open(str(docs_output), "wb") as f:
        writer2.write(f)
    print(f"✅ public/pdfs/Docs_Alumnado.pdf ({len(PdfReader(str(docs_output)).pages)} páginas)")


if __name__ == "__main__":
    generate_all_tests_pdf()
