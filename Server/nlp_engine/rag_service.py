import os

_embedder = None
_kb_loaded = False


def _get_embedder():
    global _embedder

    if _embedder is None:
        from sentence_transformers import SentenceTransformer

        _embedder = SentenceTransformer('all-MiniLM-L6-v2')

    return _embedder


class VectorStore:
    def __init__(self, dimension=384):
        import faiss

        self.dimension = dimension
        self.index = faiss.IndexFlatL2(dimension)
        self.documents = []

    def reset(self):
        """Clears the FAISS index and documents list."""
        import faiss

        self.index = faiss.IndexFlatL2(self.dimension)
        self.documents = []

    def add_documents(self, docs):
        """
        docs: list of dicts [{'text': str, 'full_content': str, 'source': str, 'team': str, 'category': str}]
        """
        if not docs:
            return
        self.documents.extend(docs)
        texts = [doc['text'] for doc in docs]
        embeddings = _get_embedder().encode(texts, convert_to_numpy=True)
        self.index.add(embeddings.astype('float32'))

    def search(self, query, top_k=3, score_threshold=1.2):
        if self.index.ntotal == 0:
            return []
        
        query_vector = _get_embedder().encode([query], convert_to_numpy=True).astype('float32')
        distances, indices = self.index.search(query_vector, top_k)
        
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < len(self.documents) and idx != -1:
                if dist <= score_threshold:
                    results.append(self.documents[idx])
        
        # Fallback: return top match if nothing passes strict threshold
        if not results and indices[0][0] != -1 and indices[0][0] < len(self.documents):
            results.append(self.documents[indices[0][0]])

        return results


# Singleton VectorStore instance
rag_store = VectorStore()


def load_kb_articles():
    global _kb_loaded

    rag_store.reset()

    try:
        from tickets.models import Article
        
        articles = []
        if hasattr(Article, 'objects'):
            try:
                # Standard Django ORM Query
                articles = list(Article.objects.filter(status="published"))
                if not articles:
                    articles = list(Article.objects.all())
            except Exception:
                # MongoEngine Query Fallback
                try:
                    articles = list(Article.objects(status="published"))
                    if not articles:
                        articles = list(Article.objects())
                except Exception as mongo_err:
                    print("Mongo Query Error:", mongo_err)

        docs = []
        for art in articles:
            title_text = getattr(art, 'title', 'Knowledge Article')
            # Check all common body text attributes across Django/Mongo models
            content_text = getattr(art, 'content', '') or getattr(art, 'description', '') or getattr(art, 'body', '')

            full_content_str = content_text.strip() if content_text.strip() else title_text

            docs.append({
                "text": f"{title_text}. {full_content_str}".strip(),
                "full_content": full_content_str,
                "source": title_text,
                "team": getattr(art, 'assigned_team', getattr(art, 'team', 'IT Helpdesk')),
                "category": getattr(art, 'category', 'General')
            })

        if docs:
            rag_store.add_documents(docs)
            _kb_loaded = True
            return
    except Exception as e:
        print("Database KB query warning:", e)

    # Fallback seed articles with explicit steps
    default_articles = [
        {
            "text": "For billing issues, verify recent invoice history, check declined status on payment gateway, and update stored payment methods.",
            "full_content": "1. Verify recent invoice history in the portal.\n2. Check gateway payment failure logs for declined reason codes.\n3. Request client to update stored payment methods or re-authenticate card details.",
            "source": "Billing & Invoice Policy",
            "team": "Finance Team",
            "category": "Billing"
        },
        {
            "text": "For VPN access issues, check Cisco AnyConnect status, verify server credentials, reset 2FA token, and ensure port 443 is unblocked.",
            "full_content": "1. Verify Cisco AnyConnect client service status.\n2. Re-authenticate user credentials against active directory.\n3. Reset 2FA token in corporate auth portal.\n4. Check firewall settings to ensure TCP port 443 is unblocked.",
            "source": "VPN Troubleshooting Guide",
            "team": "Network Team",
            "category": "VPN"
        },
        {
            "text": "For password resets or account lockouts, use the self-service SSO portal or request an admin secret link through IT support.",
            "full_content": "1. Direct user to self-service SSO recovery page.\n2. Unlock account in identity management portal.\n3. Issue temporary reset token link via verified identity email.",
            "source": "Account Management SOP",
            "team": "IT Helpdesk",
            "category": "Account"
        }
    ]
    rag_store.add_documents(default_articles)
    _kb_loaded = True


def get_rag_resolution(ticket_title, ticket_description=""):
    """
    Search vector store and extract exact content from matched Knowledge Base articles.
    """
    if not _kb_loaded:
        load_kb_articles()

    query = f"{ticket_title} {ticket_description}".strip()
    matches = rag_store.search(query, top_k=1)

    if not matches:
        return {
            "confidence": 50,
            "suggested_action_steps": [
                "1. Gather additional error diagnostic logs from user device.",
                "2. Check service status page for active platform outages.",
                "3. Escalate ticket to tier 2 technical team."
            ],
            "grounded_sources": ["Standard Operating Procedure"],
            "assigned_team": "IT Helpdesk",
            "category": "General"
        }

    matched_doc = matches[0]
    raw_content = matched_doc.get("full_content") or matched_doc.get("text", "")
    source_title = matched_doc.get("source", "Knowledge Base Article")
    
    # Direct line-by-line extraction
    if "\n" in raw_content:
        steps = [line.strip() for line in raw_content.split("\n") if line.strip()]
    else:
        # Wrap raw content directly so exact database text renders
        steps = [raw_content.strip()]

    return {
        "confidence": 85,
        "suggested_action_steps": steps,
        "grounded_sources": [source_title],
        "assigned_team": matched_doc.get("team", "IT Helpdesk"),
        "category": matched_doc.get("category", "Account")
    }


def generate_solution(ticket_title, ticket_description=""):
    """Return a non-empty, customer-facing solution from the current RAG store."""
    resolution = get_rag_resolution(ticket_title, ticket_description)
    steps = [
        str(step).strip()
        for step in resolution.get("suggested_action_steps", [])
        if str(step).strip()
    ]
    return "\n".join(steps) or (
        "We could not generate a detailed automated solution. "
        "Please review the ticket with a support specialist."
    )
