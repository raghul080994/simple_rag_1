from typing import List, Tuple
from pydantic import BaseModel
from fastapi import UploadFile
from pypdf import PdfReader
import io
import re


class Chunk(BaseModel):
    id: str
    text: str
    source: str
    page: int
    chunk_index: int

    def metadata(self):
        return {
            "source": self.source,
            "page": self.page,
            "chunk": self.chunk_index,
        }


class UploadStats(BaseModel):
    filename: str
    pages: int
    chunks: int


def clean_text(text: str) -> str:
    # Basic normalization, collapse spaces
    text = text.replace("\x00", "")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def chunk_text(text: str, target_chunk_chars: int = 1200, overlap: int = 200) -> List[str]:
    if not text:
        return []
    chunks = []
    start = 0
    n = len(text)
    while start < n:
        end = min(start + target_chunk_chars, n)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= n:
            break
        start = max(end - overlap, 0)
    return chunks


def extract_chunks_from_pdf_files(files: List[UploadFile], target_chunk_chars: int = 1200, overlap: int = 200) -> Tuple[List[Chunk], List[UploadStats]]:
    all_chunks: List[Chunk] = []
    stats: List[UploadStats] = []

    for f in files:
        data = await_read_upload_file(f)
        reader = PdfReader(io.BytesIO(data))
        file_chunks_count = 0
        page_count = len(reader.pages)
        for page_number, page in enumerate(reader.pages, start=1):
            try:
                extracted = page.extract_text() or ""
            except Exception:
                extracted = ""
            text = clean_text(extracted)
            if not text:
                continue
            chunks = chunk_text(text, target_chunk_chars, overlap)
            for ci, ch in enumerate(chunks):
                cid = f"{f.filename}-{page_number}-{ci}"
                all_chunks.append(Chunk(id=cid, text=ch, source=f.filename, page=page_number, chunk_index=ci))
                file_chunks_count += 1

        stats.append(UploadStats(filename=f.filename, pages=page_count, chunks=file_chunks_count))

    return all_chunks, stats


def await_read_upload_file(file: UploadFile) -> bytes:
    # FastAPI UploadFile.file works as SpooledTemporaryFile; .read() is sync in our context
    contents = file.file.read()
    if isinstance(contents, bytes):
        return contents
    return contents.encode("utf-8")

