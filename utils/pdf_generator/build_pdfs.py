# command: `python build_pdfs.py`

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


def build_tests_abcd(tests_dir, public_dir):
    generate_all_tests()

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

    output = public_dir / "Tests_ABCD.pdf"
    with open(str(output), "wb") as f:
        writer.write(f)
    print(f"✅ public/pdfs/Tests_ABCD.pdf ({len(PdfReader(str(output)).pages)} páginas)")


def build_docs_alumnado(assets_dir, public_dir):
    doc_pdfs = [
        assets_dir / "Hoja Informativa.pdf",
        assets_dir / "Consentimiento informado.pdf",
    ]
    for pdf in doc_pdfs:
        if not pdf.exists():
            print(f"Error: No se encontró {pdf}")
            sys.exit(1)

    writer = PdfWriter()
    for pdf_path in doc_pdfs:
        for page in PdfReader(str(pdf_path)).pages:
            writer.add_page(page)
        print(f"Añadido: {pdf_path.name}")

    output = public_dir / "Docs_Alumnado.pdf"
    with open(str(output), "wb") as f:
        writer.write(f)
    print(f"✅ public/pdfs/Docs_Alumnado.pdf ({len(PdfReader(str(output)).pages)} páginas)")


if __name__ == "__main__":
    utils_dir = Path(__file__).parent
    tests_dir = utils_dir / "tests"
    assets_dir = utils_dir.parent.parent / "assets"
    public_dir = utils_dir.parent.parent / "public" / "pdfs"
    public_dir.mkdir(exist_ok=True)

    build_tests_abcd(tests_dir, public_dir)
    build_docs_alumnado(assets_dir, public_dir)
