"""Lightweight, local text embeddings for vector similarity search."""

from fastembed import TextEmbedding


# BGE-small produces 384-dimensional embeddings and runs locally through ONNX.
embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")


def get_embedding(text: str) -> list[float]:
    """Return a 384-dimensional embedding suitable for vector storage and search."""
    if not text or not text.strip():
        return []

    embedding = next(embedding_model.embed([text]))
    return embedding.tolist()
