from typing import List, Dict, Any, Optional
import os
import requests
from .config import Settings


class LLMProvider:
    def complete_chat(self, messages: List[Dict[str, str]], temperature: Optional[float] = None, max_tokens: Optional[int] = None) -> str:
        raise NotImplementedError


class AzureOpenAIProvider(LLMProvider):
    def __init__(self, endpoint: str, api_key: str, deployment: str, api_version: str) -> None:
        self.endpoint = endpoint.rstrip('/')
        self.api_key = api_key
        self.deployment = deployment
        self.api_version = api_version

    def complete_chat(self, messages: List[Dict[str, str]], temperature: Optional[float] = None, max_tokens: Optional[int] = None) -> str:
        url = f"{self.endpoint}/openai/deployments/{self.deployment}/chat/completions?api-version={self.api_version}"
        headers = {
            "Content-Type": "application/json",
            "api-key": self.api_key,
        }
        payload: Dict[str, Any] = {
            "messages": messages,
        }
        if temperature is not None:
            payload["temperature"] = temperature
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens

        r = requests.post(url, headers=headers, json=payload, timeout=120)
        r.raise_for_status()
        data = r.json()
        # Azure returns { choices: [ { message: { content } } ] }
        content = data["choices"][0]["message"]["content"]
        return content


def get_llm_provider(settings: Settings) -> LLMProvider:
    provider = (settings.LLM_PROVIDER or "azure").lower()
    if provider == "azure":
        if not settings.AZURE_OPENAI_ENDPOINT or not settings.AZURE_OPENAI_KEY:
            raise RuntimeError("Azure OpenAI not configured: set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_KEY")
        return AzureOpenAIProvider(
            endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_KEY,
            deployment=settings.AZURE_DEPLOYMENT_NAME,
            api_version=settings.AZURE_API_VERSION,
        )
    else:
        raise RuntimeError(f"Unsupported LLM provider: {provider}")

