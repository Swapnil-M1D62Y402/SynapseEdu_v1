import asyncio
from typing import Optional
from langchain_openai import ChatOpenAI 
from langchain_groq import ChatGroq 
from langchain.schema import HumanMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser


from dotenv import load_dotenv
import openai
import os
load_dotenv()


class LLMProvider:
    def __init__(self, provider: str = "openai", model:str = "gpt-4o", temperature: float = 0.0):
        self.parser = StrOutputParser()
        if provider == "openai":
            openai.api_key = os.getenv("OPENAI_API_KEY")
            self.llm = ChatOpenAI(
                model=model,
                temperature=temperature,
                streaming=False)
        elif provider == "groq":
            self.llm = ChatGroq(
                model=model,
                temperature=temperature,
                streaming=False,
                groq_api_key=os.getenv("GROQ_API_KEY"))
        else:
            raise ValueError(f"Unsupported provider: {provider}")
    
    async def generate(self, system_prompt: str, user_prompt: str, max_tokens: Optional[int] = None) -> str:
        """
        Send prompts to the chat model and return plain text using StrOutputParser.
        """
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]

        # If the model supports async prediction, use it
        if hasattr(self.llm, "apredict_messages"):
            result = await self.llm.apredict_messages(messages)
        else:
            # Run sync call safely in async context
            result = await asyncio.to_thread(self.llm.predict_messages, messages)

        # Directly parse the result into a string
        return self.parser.invoke(result)
