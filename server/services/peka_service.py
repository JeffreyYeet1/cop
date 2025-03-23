from langchain_community.chat_models import ChatCohere
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from datetime import datetime
import json
from typing import List, Optional
from schemas.peka import Task, TaskRecommendation, PekaResponse, GeneralResponse
from fastapi import HTTPException
import logging

logger = logging.getLogger(__name__)

class PekaService:
    def __init__(self, cohere_api_key: str):
        try:
            if not cohere_api_key:
                raise ValueError("Cohere API key is not provided")
            
            logger.info("Initializing PekaService with Cohere API")
            logger.debug(f"Using Cohere API key: {cohere_api_key[:5]}...")
            
            self.llm = ChatCohere(
                model="command",
                temperature=0.7,
                cohere_api_key=cohere_api_key,
                verbose=True,  # Enable verbose logging
                streaming=False  # Disable streaming for now
            )
            logger.debug("ChatCohere model initialized")
            
            self.task_parser = PydanticOutputParser(pydantic_object=PekaResponse)
            self.general_parser = PydanticOutputParser(pydantic_object=GeneralResponse)
            logger.debug("Output parsers initialized")
            
            logger.info("PekaService initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize PekaService: {str(e)}")
            logger.exception("Full traceback:")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to initialize Peka service: {str(e)}"
            )

    def _create_task_prompt(self, tasks: List[Task]) -> str:
        try:
            tasks_json = json.dumps([task.model_dump() for task in tasks], default=str)
            logger.debug(f"Creating task prompt for tasks: {tasks_json}")
            
            prompt = f"""You are Peka, an AI productivity assistant. Analyze the following to-do list and provide detailed recommendations.

Tasks:
{tasks_json}

Consider the following factors when analyzing tasks:
1. Priority (high, medium, low)
   - High priority tasks often have immediate impact or deadlines
   - Medium priority tasks are important but can be scheduled
   - Low priority tasks can be deferred if needed

2. Estimated duration (shorter tasks might be quicker wins)
   - Quick wins can build momentum
   - Longer tasks might need to be broken down
   - Consider time of day and energy levels

3. Age of the task (older tasks may be more time-sensitive)
   - Stale tasks might indicate procrastination
   - Recent tasks might be more relevant
   - Consider if older tasks are still valid

4. Progress (unfinished or stalled tasks may need focus)
   - In-progress tasks might need completion to free up mental space
   - Stalled tasks might need reevaluation
   - Completed tasks should be celebrated

Provide a JSON response with the following structure:
{{
    "sorted_tasks": [list of task IDs in order of importance],
    "top_recommendation": {{
        "task_id": ID of the recommended task,
        "reason": "Detailed explanation of why this task should be prioritized"
    }},
    "explanation": "Detailed explanation of the task ordering and recommendations"
}}"""
            logger.debug(f"Created task prompt: {prompt[:100]}...")
            return prompt
        except Exception as e:
            logger.error(f"Failed to create task prompt: {str(e)}")
            logger.exception("Full traceback:")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create task prompt: {str(e)}"
            )

    def _create_general_prompt(self, query: str) -> str:
        try:
            logger.debug(f"Creating general prompt for query: {query}")
            prompt = f"""You are Peka, an AI productivity assistant. The user has asked: "{query}"

Provide a helpful, actionable response that focuses on productivity, time management, or personal development. Your response should be:
1. Practical and actionable
2. Based on proven productivity principles
3. Tailored to the user's specific question
4. Encouraging and motivating

Provide a JSON response with the following structure:
{{
    "response": "Your detailed response here",
    "action_items": ["List", "of", "actionable", "items"],
    "timestamp": "Current timestamp in ISO format"
}}"""
            logger.debug(f"Created general prompt: {prompt[:100]}...")
            return prompt
        except Exception as e:
            logger.error(f"Failed to create general prompt: {str(e)}")
            logger.exception("Full traceback:")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create general prompt: {str(e)}"
            )

    async def analyze_tasks(self, tasks: List[Task]) -> PekaResponse:
        try:
            logger.info(f"Analyzing {len(tasks)} tasks")
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are Peka, an AI productivity assistant. Always respond with valid JSON."),
                ("user", "{input}")
            ])
            logger.debug("Created chat prompt template")

            chain = prompt | self.llm | self.task_parser
            logger.debug("Created processing chain")

            logger.debug("Invoking chain with task prompt")
            response = chain.invoke({"input": self._create_task_prompt(tasks)})
            logger.debug(f"Received response: {response}")
            
            logger.info("Task analysis completed successfully")
            return response
        except Exception as e:
            logger.error(f"Failed to analyze tasks: {str(e)}")
            logger.exception("Full traceback:")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to analyze tasks: {str(e)}"
            )

    async def handle_general_query(self, query: str) -> GeneralResponse:
        try:
            logger.info(f"Handling general query: {query}")
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are Peka, an AI productivity assistant. Always respond with valid JSON."),
                ("user", "{input}")
            ])
            logger.debug("Created chat prompt template")

            chain = prompt | self.llm | self.general_parser
            logger.debug("Created processing chain")

            logger.debug("Invoking chain with general prompt")
            response = chain.invoke({"input": self._create_general_prompt(query)})
            logger.debug(f"Received response: {response}")
            
            logger.info("General query handled successfully")
            return response
        except Exception as e:
            logger.error(f"Failed to process general query: {str(e)}")
            logger.exception("Full traceback:")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process general query: {str(e)}"
            ) 