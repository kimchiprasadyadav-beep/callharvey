"""Pipecat pipeline for outbound AI cold calls via Twilio."""

import os
import sys
import logging

from pipecat.frames.frames import LLMMessagesFrame, EndFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.services.deepgram.stt import DeepgramSTTService
from pipecat.services.elevenlabs.tts import ElevenLabsTTSService
from pipecat.services.openai.llm import OpenAILLMService
from pipecat.processors.aggregators.openai_llm_context import OpenAILLMContext
from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.transports.websocket.fastapi import (
    FastAPIWebsocketTransport,
    FastAPIWebsocketParams,
)
from pipecat.serializers.twilio import TwilioFrameSerializer

from prompts import get_qualification_prompt

logger = logging.getLogger(__name__)


async def run_harvey_pipeline(
    websocket,
    stream_sid: str,
    lead_name: str = "there",
    agent_name: str = "your agent",
    brokerage: str = "Harvey Realty",
    area: str = "your area",
):
    """Run the Harvey AI caller pipeline over a Twilio media stream."""

    transport = FastAPIWebsocketTransport(
        websocket=websocket,
        params=FastAPIWebsocketParams(
            audio_out_enabled=True,
            add_wav_header=False,
            vad_enabled=True,
            vad_analyzer=SileroVADAnalyzer(),
            vad_audio_passthrough=True,
            serializer=TwilioFrameSerializer(stream_sid),
        ),
    )

    stt = DeepgramSTTService(
        api_key=os.getenv("DEEPGRAM_API_KEY"),
        model="nova-3",
        language="en",
    )

    llm = OpenAILLMService(
        api_key=os.getenv("OPENAI_API_KEY"),
        model="gpt-4o",
    )

    tts = ElevenLabsTTSService(
        api_key=os.getenv("ELEVENLABS_API_KEY"),
        voice_id=os.getenv("ELEVENLABS_VOICE_ID", "pNInz6obpgDQGcFmaJgB"),
    )

    system_prompt = get_qualification_prompt(agent_name, brokerage, area)
    messages = [
        {"role": "system", "content": system_prompt},
    ]

    context = OpenAILLMContext(messages=messages)
    context_aggregator = llm.create_context_aggregator(context)

    pipeline = Pipeline([
        transport.input(),        # Twilio WebSocket audio in
        stt,                      # Deepgram STT
        context_aggregator.user(),
        llm,                      # Claude
        tts,                      # ElevenLabs TTS
        transport.output(),       # Twilio WebSocket audio out
        context_aggregator.assistant(),
    ])

    task = PipelineTask(
        pipeline,
        params=PipelineParams(allow_interruptions=True),
    )

    @transport.event_handler("on_client_connected")
    async def on_client_connected(transport, client):
        logger.info("Twilio media stream connected")
        # Harvey introduces himself
        messages.append({
            "role": "user",
            "content": f"[Call connected. The lead's name is {lead_name}. Introduce yourself and start the conversation.]",
        })
        await task.queue_frames([LLMMessagesFrame(messages)])

    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(transport, client):
        logger.info("Twilio media stream disconnected")
        await task.queue_frames([EndFrame()])

    runner = PipelineRunner(handle_sigint=False)
    await runner.run(task)
