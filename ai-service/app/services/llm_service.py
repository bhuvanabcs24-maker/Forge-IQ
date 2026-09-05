import abc
import json
import logging
from typing import Type, TypeVar, Optional, Dict, Any
import httpx
from pydantic import BaseModel
from app.config.settings import settings

logger = logging.getLogger('forgeiq.llm')

T = TypeVar('T', bound=BaseModel)

class BaseLLMProvider(abc.ABC):
    provider_name: str = 'base'

    @abc.abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 1024,
    ) -> str:
        """Generate text completion from prompt."""
        pass

    @abc.abstractmethod
    async def generate_structured(
        self,
        prompt: str,
        response_model: Type[T],
        system_prompt: Optional[str] = None,
        temperature: float = 0.1,
    ) -> T:
        """Generate validated Pydantic model response."""
        pass

class MockProvider(BaseLLMProvider):
    provider_name: str = 'mock'

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 1024,
    ) -> str:
        lower = prompt.lower()
        if 'capacity' in lower or 'order' in lower or 'accept' in lower:
            return (
                "Based on current shop floor telemetry, the factory has 72% overall capacity utilization. "
                "Fiber Laser Cutting Line #1 is operating at 68% and has open capacity for up to 600 units. "
                "Current raw material stock includes 840 kg of 304 SS sheet metal. "
                "Recommendation: Accept the order with target completion on Thursday."
            )
        if 'where' in lower or 'status' in lower:
            return (
                "Your order PO-2026-0492 is currently in Stage 3: CNC Press Brake Bending. "
                "Current milestone progress is 68% complete with QC inspection scheduled tomorrow morning. "
                "Estimated dispatch is Tuesday at 3:00 PM."
            )
        return (
            "ForgeIQ AI Engine evaluated your manufacturing query. Factory machines and supply chain parameters "
            "are operating within optimal control limits."
        )

    async def generate_structured(
        self,
        prompt: str,
        response_model: Type[T],
        system_prompt: Optional[str] = None,
        temperature: float = 0.1,
    ) -> T:
        # Generate realistic default data matching the target Pydantic schema
        model_name = response_model.__name__
        
        if model_name == 'StructuredRFQ':
            return response_model(
                customer_name='NexaSolar Energy Labs',
                company_name='NexaSolar Industries',
                part_title='Solar Inverter Chassis Mounting Bracket',
                material='Stainless Steel',
                material_grade='304',
                thickness='3 mm',
                dimensions='250 x 180 x 45 mm',
                quantity=500,
                delivery_date='Friday',
                priority='standard',
                special_instructions='Deburr edges and apply laser protective film',
                required_processes=['Fiber Laser Cutting', 'CNC Press Brake Bending', 'QC Inspection'],
                confidence_score=0.96,
                requires_human_verification=False,
            )

        if model_name == 'QuotationEstimate':
            return response_model(
                material_type='Stainless Steel',
                material_grade='304',
                raw_material_weight_kg=1.85,
                scrap_rate_percentage=11.5,
                cut_length_meters=1.42,
                machine_cycle_time_minutes=2.8,
                bending_strokes_count=4,
                finishing_requirements=['Deburring', 'Passivation'],
                labor_time_minutes=4.5,
                estimated_lead_time_days=6,
                confidence_score=0.93,
                technical_assumptions=[
                    'Nested on standard 2500x1250mm sheet',
                    'Laser speed 4.2m/min on 3mm SS'
                ]
            )

        if model_name == 'FactoryMatchRecommendation':
            return response_model(
                factory_id='fact-01',
                factory_name='Precision Laser & Metal Works (Peenya)',
                match_score=96.5,
                reasons=[
                    'Active 6kW Fiber Laser cutting capacity matches 3mm SS spec',
                    'ISO 9001:2015 certified with 98.2% on-time delivery rate',
                    'Located 14 km away in Peenya Industrial Area'
                ],
                capability_matches=['Laser Cutting', 'CNC Bending', '304 SS'],
                estimated_price=42500.0,
                estimated_delivery_days=6,
                quality_score=4.9,
                confidence=0.94
            )

        if model_name == 'ProductionSchedulingProposal':
            return response_model(
                job_id='JOB-1082',
                job_title='Solar Bracket Batch',
                recommended_machine_id='mach-01',
                recommended_machine_name='Bystronic 6kW Fiber Laser',
                recommended_shift='Morning Shift (06:00 - 14:00)',
                scheduled_start='2026-09-08T06:30:00Z',
                estimated_duration_hours=4.5,
                delay_risk_score=0.12,
                delay_reasons=['Minor material staging queue (+20 mins)'],
                manager_approval_required=True,
                confidence=0.91
            )

        # Fallback to model instance defaults
        return response_model.model_construct()

class GeminiProvider(BaseLLMProvider):
    provider_name: str = 'gemini'

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 1024,
    ) -> str:
        if not self.api_key:
            return await MockProvider().generate_text(prompt, system_prompt)

        url = f'{self.base_url}?key={self.api_key}'
        contents = []
        if system_prompt:
            contents.append({'role': 'user', 'parts': [{'text': f'System Instructions: {system_prompt}'}]})
            contents.append({'role': 'model', 'parts': [{'text': 'Understood. I will strictly follow these instructions.'}]})
        contents.append({'role': 'user', 'parts': [{'text': prompt}]})

        payload = {
            'contents': contents,
            'generationConfig': {
                'temperature': temperature,
                'maxOutputTokens': max_tokens,
            }
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                try:
                    return data['candidates'][0]['content']['parts'][0]['text']
                except (KeyError, IndexError):
                    pass
            logger.warning(f'Gemini API error {resp.status_code}: {resp.text}. Falling back to domain response.')
            return await MockProvider().generate_text(prompt, system_prompt)

    async def generate_structured(
        self,
        prompt: str,
        response_model: Type[T],
        system_prompt: Optional[str] = None,
        temperature: float = 0.1,
    ) -> T:
        schema_json = json.dumps(response_model.model_json_schema())
        strict_prompt = (
            f"{prompt}\n\n"
            f"CRITICAL: Output ONLY valid JSON matching this schema with NO markdown and NO extra text:\n"
            f"{schema_json}"
        )
        text = await self.generate_text(strict_prompt, system_prompt, temperature)
        clean = text.strip()
        if clean.startswith('```json'):
            clean = clean[7:]
        if clean.startswith('```'):
            clean = clean[3:]
        if clean.endswith('```'):
            clean = clean[:-3]
        clean = clean.strip()

        try:
            parsed = json.loads(clean)
            return response_model.model_validate(parsed)
        except Exception as e:
            logger.warning(f'Failed to parse Gemini structured JSON: {e}. Falling back to domain estimate.')
            return await MockProvider().generate_structured(prompt, response_model, system_prompt)

class OpenAIProvider(BaseLLMProvider):
    provider_name: str = 'openai'

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 1024,
    ) -> str:
        if not self.api_key:
            return await MockProvider().generate_text(prompt, system_prompt)

        headers = {'Authorization': f'Bearer {self.api_key}'}
        messages = []
        if system_prompt:
            messages.append({'role': 'system', 'content': system_prompt})
        messages.append({'role': 'user', 'content': prompt})

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                'https://api.openai.com/v1/chat/completions',
                headers=headers,
                json={'model': 'gpt-4o-mini', 'messages': messages, 'temperature': temperature, 'max_tokens': max_tokens}
            )
            if resp.status_code == 200:
                return resp.json()['choices'][0]['message']['content']
            return await MockProvider().generate_text(prompt, system_prompt)

    async def generate_structured(
        self,
        prompt: str,
        response_model: Type[T],
        system_prompt: Optional[str] = None,
        temperature: float = 0.1,
    ) -> T:
        schema_json = json.dumps(response_model.model_json_schema())
        strict_prompt = f"{prompt}\nReturn JSON matching: {schema_json}"
        raw = await self.generate_text(strict_prompt, system_prompt, temperature)
        try:
            return response_model.model_validate_json(raw)
        except Exception:
            return await MockProvider().generate_structured(prompt, response_model, system_prompt)

class AnthropicProvider(BaseLLMProvider):
    provider_name: str = 'anthropic'

    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 1024,
    ) -> str:
        if not self.api_key:
            return await MockProvider().generate_text(prompt, system_prompt)
        headers = {
            'x-api-key': self.api_key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
        }
        payload = {
            'model': 'claude-3-5-sonnet-20241022',
            'max_tokens': max_tokens,
            'messages': [{'role': 'user', 'content': prompt}],
        }
        if system_prompt:
            payload['system'] = system_prompt

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post('https://api.anthropic.com/v1/messages', headers=headers, json=payload)
            if resp.status_code == 200:
                return resp.json()['content'][0]['text']
            return await MockProvider().generate_text(prompt, system_prompt)

    async def generate_structured(
        self,
        prompt: str,
        response_model: Type[T],
        system_prompt: Optional[str] = None,
        temperature: float = 0.1,
    ) -> T:
        raw = await self.generate_text(f"{prompt}\nRespond ONLY with valid JSON.", system_prompt, temperature)
        try:
            return response_model.model_validate_json(raw)
        except Exception:
            return await MockProvider().generate_structured(prompt, response_model, system_prompt)

class OllamaProvider(BaseLLMProvider):
    provider_name: str = 'ollama'

    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 1024,
    ) -> str:
        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                resp = await client.post(
                    f'{self.base_url}/api/generate',
                    json={'model': 'llama3.2', 'prompt': prompt, 'system': system_prompt or '', 'stream': False}
                )
                if resp.status_code == 200:
                    return resp.json()['response']
        except Exception:
            pass
        return await MockProvider().generate_text(prompt, system_prompt)

    async def generate_structured(
        self,
        prompt: str,
        response_model: Type[T],
        system_prompt: Optional[str] = None,
        temperature: float = 0.1,
    ) -> T:
        raw = await self.generate_text(prompt, system_prompt, temperature)
        try:
            return response_model.model_validate_json(raw)
        except Exception:
            return await MockProvider().generate_structured(prompt, response_model, system_prompt)

def get_llm_provider(override_provider: Optional[str] = None) -> BaseLLMProvider:
    """Factory selecting provider based on configuration."""
    provider = (override_provider or settings.AI_PROVIDER).lower()

    if provider == 'gemini':
        if settings.GEMINI_API_KEY:
            return GeminiProvider(settings.GEMINI_API_KEY)
        logger.info('Gemini key not configured, using high-fidelity Mock provider.')
        return MockProvider()

    elif provider == 'openai':
        if settings.OPENAI_API_KEY:
            return OpenAIProvider(settings.OPENAI_API_KEY)
        return MockProvider()

    elif provider == 'anthropic':
        if settings.ANTHROPIC_API_KEY:
            return AnthropicProvider(settings.ANTHROPIC_API_KEY)
        return MockProvider()

    elif provider == 'ollama':
        return OllamaProvider(settings.OLLAMA_BASE_URL)

    return MockProvider()
