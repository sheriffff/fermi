# Generador de PDFs imprimible para profes

## Prerrequisitos
- Subir a mano `hoja_instrucciones_profes.pdf` (está en Drive) a `utils/pdf_generator/`
- Subir a mano `Hoja Informativa.pdf` (está en Drive) a `utils/pdf_generator/`
- Subir a mano `Consentimiento Informado.pdf` (está en Drive) a `utils/pdf_generator/`
- Subir a mano `questions.xlsx` (está en Drive) a `public/`

## Generación
Puedes imprimir un solo test ejecutando simplemente
`python generate_test_pdf.py A`

o puedes imprimir el PDF completo con `python generate_full_pdf.py`, que contiene
- 2 páginas de instrucciones


- 1 página con la Hoja Informativa
- 1 página en blanco (separador)


- 1 página con el Consentimiento Informado
- 1 página en blanco (separador)


- 2 páginas por modelo de test A, B, C y D
- (total 10 páginas para imprimir en 2 caras y tener una hoja por modelo)


