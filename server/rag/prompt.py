from typing import List, Dict, Optional


SYSTEM_PROMPT = (
    "You are a helpful assistant that answers strictly using the provided context. "
    "Cite sources inline using [source:page:chunk] where available. "
    "If the answer cannot be found in the context, say you don't know."
)


def build_rag_messages(question: str, contexts: List[str], guidance: Optional[str] = None) -> List[Dict[str, str]]:
    context_block = "\n\n".join([f"<ctx id={i+1}>\n{c}\n</ctx>" for i, c in enumerate(contexts)])
    user_prompt = (
        (guidance + "\n\n" if guidance else "") +
        "Use the context below to answer the question. "
        "Cite sources as [source:page:chunk] by matching nearby text.\n\n" +
        f"Context:\n{context_block}\n\nQuestion: {question}"
    )
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]
    return messages

