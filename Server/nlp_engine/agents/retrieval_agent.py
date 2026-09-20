from nlp_engine.rag_service import rag_store

class KnowledgeRetrievalAgent:
    def execute(self, diagnosis_output):
        category = diagnosis_output.get('category', 'General')
        diagnosis = diagnosis_output.get('diagnosis', '')
        query_text = f"Category: {category}. {diagnosis}".strip()
        
        # Call M2 vector store
        try:
            retrieved_docs = rag_store.search(query_text, top_k=3)
        except Exception as e:
            print("RAG search error in KnowledgeRetrievalAgent:", e)
            retrieved_docs = []

        sources = list({doc['source'] for doc in retrieved_docs if isinstance(doc, dict) and 'source' in doc}) if retrieved_docs else ["General Support SOP"]
        evidence = [doc['text'] for doc in retrieved_docs if isinstance(doc, dict) and 'text' in doc] if retrieved_docs else []

        return {
            "retrieved_evidence": evidence,
            "sources": sources,
            "has_evidence": len(evidence) > 0
        }