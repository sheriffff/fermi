import json
import sys
from pathlib import Path
from dotenv import load_dotenv
from google import genai

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

PROMPT_FILE = Path(__file__).parent / "prompt_llm_solve_question.md"
MODEL = "gemini-3-pro-preview"


def load_prompt(question: str) -> str:
    template = PROMPT_FILE.read_text(encoding="utf-8")
    return template.replace("[PEGA AQUÍ TU PREGUNTA]", question)


def solve(question: str) -> dict:
    client = genai.Client()
    prompt = load_prompt(question)

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
    )

    text = "".join(p.text for p in response.candidates[0].content.parts if p.text).strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0].strip()

    data = json.loads(text)
    data["q_p05_p95"] = round(data["p95"] / data["p05"], 2) if data["p05"] else None
    return data


if __name__ == "__main__":
    question = "¿Cuántos granos de arroz hay en el típico paquete de 1kg?"

    result = solve(question)

    print(json.dumps(result, indent=2, ensure_ascii=False))
