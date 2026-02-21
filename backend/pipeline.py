"""Pipecat pipeline for outbound AI cold calls."""

import os
import json
import logging
from typing import Optional

from pipecat.frames.frames import EndFrame, LLMMessagesFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineTask, PipelineParams
from pipecat.processors.aggregators.llm_response import LLMAssistantResponseAggregator, LLMUserResponseAggregator
from pipecat.services.openai import OpenAISTTService
from pipecat.services.elevenlabs import ElevenLabsTTSService
from pipecat.services.anthropic import AnthropicLLMService
from pipecat.transports.services.daily import DailyParams, DailyTransport

from prompts import get_qualification_prompt

logger = logging.getLogger(__name__)


class CallPipeline:
    """Manages a single AI call pipeline using Pipecat."""

    def __init__(
        self,
        lead_phone: str,
        lead_name: str,
        agent_name: str = "your agent",
        brokerage: str = "the brokerage",
        area: str = "your area",
        room_url: Optional[str] = None,
        room_token: Optional[str] = None,
    ):
        self.lead_phone = lead_phone
        self.lead_name = lead_name
        self.agent_name = agent_name
        self.brokerage = brokerage
        self.area = area
        self.room_url = room_url
        self.room_token = room_token
        self.qualification_data = {}

    async def run(self):
        """Build and run the Pipecat pipeline."""

        transport = DailyTransport(
            self.room_url,
            self.room_token,
            "Harvey",
            DailyParams(
                audio_out_enabled=True,
                audio_out_sample_rate=16000,
                audio_in_enabled=True,
                audio_in_sample_rate=16000,
                vad_enabled=True,
                vad_analyzer=None,  # uses default silero
                transcription_enabled=False,
            ),
        )

        stt = OpenAISTTService(
            api_key=os.getenv("OPENAI_API_KEY"),
            model="whisper-1",
        )

        llm = AnthropicLLMService(
            api_key=os.getenv("ANTHROPIC_API_KEY"),
            model="claude-sonnet-4-20250514",
        )

        tts = ElevenLabsTTSService(
            api_key=os.getenv("ELEVENLABS_API_KEY"),
            voice_id=os.getenv("ELEVENLABS_VOICE_ID", "pNInz6obpgDQGcFmaJgB"),  # default: Adam
            params=ElevenLabsTTSService.InputParams(
                stability=0.6,
                similarity_boost=0.8,
                style=0.3,
            ),
        )

        system_prompt = get_qualification_prompt(self.agent_name, self.brokerage, self.area)
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"[Call connected. The lead's name is {self.lead_name}. Start with your greeting.]"},
        ]

        user_response = LLMUserResponseAggregator(messages)
        assistant_response = LLMAssistantResponseAggregator(messages)

        pipeline = Pipeline([
            transport.input(),
            stt,
            user_response,
            llm,
            tts,
            transport.output(),
            assistant_response,
        ])

        task = PipelineTask(
            pipeline,
            params=PipelineParams(allow_interruptions=True),
        )

        @transport.event_handler("on_first_participant_joined")
        async def on_first_participant_joined(transport, participant):
            logger.info(f"Participant joined: {participant['id']}")
            await task.queue_frames([LLMMessagesFrame(messages)])

        @transport.event_handler("on_participant_left")
        async def on_participant_left(transport, participant, reason):
            logger.info(f"Participant left: {reason}")
            await task.queue_frames([EndFrame()])

        runner = PipelineRunner()
        await runner.run(task)

        return self.qualification_data


async def start_call_pipeline(
    lead_phone: str,
    lead_name: str,
    agent_name: str,
    brokerage: str,
    area: str,
    room_url: str,
    room_token: str,
) -> dict:
    """Entry point to start an AI call pipeline."""
    pipeline = CallPipeline(
        lead_phone=lead_phone,
        lead_name=lead_name,
        agent_name=agent_name,
        brokerage=brokerage,
        area=area,
        room_url=room_url,
        room_token=room_token,
    )
    result = await pipeline.run()
    return result
