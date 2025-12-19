# Knowledge Base Processing Rules

## Document Ingestion Pipeline
1. **Extraction**: Text is extracted from uploaded PDF, DOCX, or TXT files.
2. **Cleaning**: Removal of excessive whitespace, boilerplate, and normalized encoding.
3. **Chunking**: Recursive Character Text Splitting.
    - **Chunk Size**: 1000 characters.
    - **Overlap**: 200 characters.
4. **Embedding**: Using Google Gemini `text-embedding-004`.
5. **Storage**: Vector and metadata stored in PostgreSQL (pgvector).

## Retrieval Strategy
- **Top-K**: 4 chunks.
- **Type**: Similarity search based on cosine distance.
- **Filtering**: Strictly filtered by `company_id`.

## Privacy & Security
- Documents are stored in per-tenant folders in Firebase Storage.
- Embeddings are logically isolated by `company_id` in the database.
- Data is never used to train global models.
