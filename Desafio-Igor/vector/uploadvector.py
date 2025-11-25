import os
import json
import time
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

ARQUIVO_JSONL = "clima_kb.jsonl"
VECTOR_STORE_NAME = "clima-insights-kb"
VECTOR_STORE_ID = os.getenv("VECTOR_STORE_ID")  # opcional: reuse se já tiver um
LIMITE_BLOCOS = 1000  # segurança, se quiser travar


def criar_ou_pegar_vector_store() -> str:
    global VECTOR_STORE_ID

    if VECTOR_STORE_ID:
        print(f"Usando VECTOR_STORE_ID existente: {VECTOR_STORE_ID}")
        return VECTOR_STORE_ID

    vs = client.vector_stores.create(
        name=VECTOR_STORE_NAME,
        metadata={"projeto": "gdash_clima", "tipo": "kb_meteorologia"},
    )
    VECTOR_STORE_ID = vs.id
    print("Vector store criado:", vs.id)
    print("⚠️ Salve esse ID no .env como VECTOR_STORE_ID para reutilizar depois.")
    return vs.id


def upload_blocos(vector_store_id: str, caminho_jsonl: str):
    total_enviados = 0

    with open(caminho_jsonl, "r", encoding="utf-8") as f:
        for linha in f:
            linha = linha.strip()
            if not linha:
                continue

            try:
                bloco = json.loads(linha)
            except json.JSONDecodeError as e:
                print(f"❌ Linha inválida no JSONL: {e}")
                continue

            id_bloco = bloco.get("id_bloco") or f"bloco_{total_enviados}"
            tipo = bloco.get("tipo", "")
            tags = bloco.get("tags", [])
            fonte = bloco.get("fonte", "")

            # 👉 Aqui o conteúdo do arquivo vai ser o JSON do bloco inteiro
            conteudo_json = json.dumps(bloco, ensure_ascii=False, indent=2)

            # Sobe o arquivo para a API (como se fosse um “doc” isolado)
            file = client.files.create(
                file=(f"{id_bloco}.json", conteudo_json, "application/json"),
                purpose="assistants",
            )

            # Anexa o arquivo ao vector store com atributos e chunking fixo
            vs_file = client.vector_stores.files.create(
                vector_store_id=vector_store_id,
                file_id=file.id,
                attributes={
                    "id_bloco": id_bloco,
                    "tipo": tipo,
                    "tags": ",".join(tags) if isinstance(tags, list) else str(tags),
                    "fonte": fonte,
                },
                chunking_strategy={
                    "type": "static",
                    "static": {
                        "max_chunk_size_tokens": 500,
                        "chunk_overlap_tokens": 100,
                    },
                },
            )

            print(
                f"✅ Bloco enviado: {id_bloco} | file_id={file.id} | "
                f"vs_file_id={vs_file.id}"
            )

            total_enviados += 1
            if total_enviados >= LIMITE_BLOCOS:
                print("⚠️ Limite de blocos atingido, parando.")
                break

            time.sleep(0.3)  # só pra ser gentil com a API

    print(f"\n[✔] Upload finalizado. Total enviado: {total_enviados}")


if __name__ == "__main__":
    vs_id = criar_ou_pegar_vector_store()
    print("Iniciando upload bloco a bloco do arquivo:", ARQUIVO_JSONL)
    upload_blocos(vs_id, ARQUIVO_JSONL)
    print("Pronto! Base de clima registrada bloco a bloco no vector store.")
