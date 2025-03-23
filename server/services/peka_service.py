from langchain_community.chat_models import ChatCohere
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from datetime import datetime
import json
from typing import List, Optional, Dict, Union
from schemas.peka import Task, TaskRecommendation, PekaResponse, GeneralResponse
from fastapi import HTTPException
import logging
from pydantic import BaseModel
import cohere

logger = logging.getLogger(__name__)

class PekaService:
    def __init__(self, cohere_api_key: str):
        try:
            if not cohere_api_key:
                raise ValueError("Cohere API key is not provided")
            
            logger.info("Initializing PekaService with Cohere API")
            logger.debug(f"Using Cohere API key: {cohere_api_key[:5]}...")
            
            # Initialize Cohere client with timeout settings
            self.client = cohere.Client(
                api_key=cohere_api_key,
                timeout=30  # 30 second timeout
            )
            
            # Test the connection
            try:
                self.client.generate(
                    prompt="Test connection",
                    max_tokens=1,
                    temperature=0.1,
                    k=0,
                    stop_sequences=["\n"],
                    return_likelihoods='NONE'
                )
                logger.info("Successfully connected to Cohere API")
            except Exception as e:
                logger.error(f"Failed to connect to Cohere API: {str(e)}")
                raise HTTPException(
                    status_code=503,
                    detail="Failed to connect to Cohere API. Please check your internet connection and API key."
                )
            
            self.llm = ChatCohere(
                model="command",
                temperature=0.7,
                cohere_api_key=cohere_api_key,
                verbose=True,
                streaming=False,
                timeout=30  # 30 second timeout
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

    async def handle_query(self, query: str) -> Dict:
        """Handle any type of query and return a unified response using a single Cohere API call."""
        try:
            prompt = f"""You are Peka, a friendly AI assistant. The user said: "{query}"

Figure out what they want and respond in JSON format. They might use casual language, typos, or slang - that's okay!

IMPORTANT: You must classify the intent as one of these three:

1. "create" - ONLY if they explicitly want to:
   - Create a task, todo, or reminder
   - Schedule something for a specific time
   - Set a deadline for something
   - Add something to their list
   - Plan an activity

2. "analyze" - if they want to:
   - Check their progress
   - Review their tasks
   - Get insights about their productivity
   - See task statistics
   - Get recommendations
   - Need help prioritizing tasks
   - Ask what tasks they should do
   - Get task management advice

3. "general" - for ANY other type of query or question

CRITICAL: For task creation, you MUST:
1. Extract the EXACT time duration if mentioned by the user (e.g., "30 minutes", "2 hours", "1.5 hours")
2. Convert the duration to minutes
3. Use that exact duration in estimated_duration
4. If no duration is specified, only then use a default of 30 minutes

Examples:

For "create" intent with duration:
User: "Create a task for studying for 45 minutes"
{{
    "intent": "create",
    "task_details": {{
        "title": "Study Session",
        "description": "Focused study session",
        "priority": "medium",
        "estimated_duration": 45
    }},
    "message": "I've created a task for your 45-minute study session.",
    "action_items": ["Prepare study materials", "Find a quiet place", "Set a timer for 45 minutes"]
}}

User: "Add a 2 hour task for project planning"
{{
    "intent": "create",
    "task_details": {{
        "title": "Project Planning",
        "description": "Detailed project planning session",
        "priority": "high",
        "estimated_duration": 120
    }},
    "message": "I've created a task for 2 hours of project planning.",
    "action_items": ["Gather project requirements", "Set up planning documents", "Schedule any necessary meetings"]
}}

For "create" intent without duration (use default):
User: "Create a task to call John"
{{
    "intent": "create",
    "task_details": {{
        "title": "Call John",
        "description": "Make a phone call to John",
        "priority": "medium",
        "estimated_duration": 30
    }},
    "message": "I've created a task for calling John with a default duration of 30 minutes.",
    "action_items": ["Prepare any topics to discuss", "Find a quiet time to call"]
}}

For "analyze" intent:
{{
    "intent": "analyze",
    "task_details": null,
    "message": "Let me analyze your tasks and provide personalized recommendations.",
    "action_items": ["Review your task list", "Check task priorities", "Update task statuses"]
}}

For "general" intent:
{{
    "intent": "general",
    "task_details": null,
    "message": "Here are some tips to boost your productivity:",
    "action_items": ["Create a daily schedule", "Take regular breaks", "Set clear goals"]
}}

IMPORTANT: Your response must be a complete, valid JSON object. Do not include any text before or after the JSON. Do not use markdown code blocks."""

            try:
                # Single API call to handle everything
                response = self.client.generate(
                    prompt=prompt,
                    max_tokens=1000,  # Increased to ensure complete response
                    temperature=0.3,
                    k=0,
                    stop_sequences=["\n\n"],  # Stop on double newline to ensure complete response
                    return_likelihoods='NONE'
                )
            except Exception as e:
                logger.error(f"Failed to generate response from Cohere: {str(e)}")
                raise HTTPException(
                    status_code=503,
                    detail="Failed to connect to Cohere API. Please try again later."
                )
            
            # Clean the response text to ensure it's valid JSON
            response_text = response.generations[0].text.strip()
            # Remove any markdown code block markers if present
            response_text = response_text.replace('```json', '').replace('```', '').strip()
            
            try:
                response_data = json.loads(response_text)
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response: {response_text}")
                logger.error(f"JSON error: {str(e)}")
                # If JSON parsing fails, return a general response
                response_data = {
                    "intent": "general",
                    "task_details": None,
                    "message": "I'm not sure what you want to do. Could you explain it differently?",
                    "action_items": ["Try explaining it another way", "Give me more details"]
                }
            
            # Add timestamp
            response_data['timestamp'] = datetime.utcnow().isoformat()
            
            # If the intent is "analyze", we need to make a call to the analyze endpoint
            if response_data.get('intent') == 'analyze':
                try:
                    # Get the current user's tasks
                    tasks = await self.get_user_tasks()  # You'll need to implement this method
                    if tasks:
                        # Call the analyze endpoint
                        analyze_response = await self.analyze_tasks(tasks)
                        # Merge the analyze response with our current response
                        response_data.update({
                            'message': analyze_response.explanation,
                            'action_items': analyze_response.top_recommendation.reason.split('. ') if analyze_response.top_recommendation else []
                        })
                except Exception as e:
                    logger.error(f"Failed to analyze tasks: {str(e)}")
                    # If analysis fails, keep the original response but add a note
                    response_data['message'] = "I tried to analyze your tasks but encountered an error. " + response_data['message']
            
            # Validate task details if present
            if response_data.get('task_details'):
                task_data = response_data['task_details']
                task_data['priority'] = task_data.get('priority', 'low').lower()
                if task_data['priority'] not in ['high', 'medium', 'low']:
                    task_data['priority'] = 'low'
                
                task_data['estimated_duration'] = max(1, min(
                    int(task_data.get('estimated_duration', 30)),
                    1440  # Max 24 hours
                ))
            
            return response_data

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in handle_query: {str(e)}")
            logger.exception("Full traceback:")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process query: {str(e)}"
            )

    def detect_query_intent(self, query: str) -> str:
        """Detect the intent of the query using Cohere."""
        prompt = f"""Analyze the following query and determine its intent. The intent should be one of:
        - 'create': If the user wants to create a new task, schedule something, or add a new item to their list
        - 'analyze': If the user wants to analyze, review, check status, or get insights about their tasks
        - 'general': For any other type of query or question

        Examples:
        - "create a task for meeting tomorrow" -> create
        - "add a reminder for dentist appointment" -> create
        - "how are my tasks going?" -> analyze
        - "check my progress" -> analyze
        - "what's the weather?" -> general
        - "help me be more productive" -> general

        Query: "{query}"

        Respond with ONLY the intent (create/analyze/general), nothing else."""

        try:
            response = self.client.generate(
                prompt=prompt,
                max_tokens=10,
                temperature=0.1,  # Low temperature for more consistent results
                k=0,
                stop_sequences=["\n"],
                return_likelihoods='NONE'
            )
            
            intent = response.generations[0].text.strip().lower()
            if intent not in ['create', 'analyze', 'general']:
                logger.warning(f"Unexpected intent from Cohere: {intent}, defaulting to 'general'")
                return 'general'
            return intent
            
        except Exception as e:
            logger.error(f"Failed to detect intent with Cohere: {str(e)}")
            return 'general'  # Fallback to general on error

    def parse_task_details(self, query: str) -> Dict:
        """Parse task details from the query using Cohere."""
        prompt = f"""Extract task details from the following query. Provide a JSON response with:
        - title: A concise but descriptive title
        - description: A detailed description of the task
        - priority: One of 'high', 'medium', or 'low'
        - estimated_duration: Duration in minutes (default to 30 if not specified)

        Query: "{query}"

        Respond with ONLY a JSON object in this format:
        {{
            "title": "Task title",
            "description": "Task description",
            "priority": "high/medium/low",
            "estimated_duration": number
        }}"""

        try:
            response = self.client.generate(
                prompt=prompt,
                max_tokens=200,
                temperature=0.3,
                k=0,
                stop_sequences=["\n"],
                return_likelihoods='NONE'
            )
            
            # Parse the response
            task_data = json.loads(response.generations[0].text.strip())
            
            # Validate and clean the data
            task_data['priority'] = task_data.get('priority', 'low').lower()
            if task_data['priority'] not in ['high', 'medium', 'low']:
                task_data['priority'] = 'low'
            
            task_data['estimated_duration'] = max(1, min(
                int(task_data.get('estimated_duration', 30)),
                1440  # Max 24 hours
            ))
            
            return task_data
            
        except Exception as e:
            logger.error(f"Failed to parse task details with Cohere: {str(e)}")
            # Fallback to basic parsing
            return {
                'title': query.strip(),
                'description': '',
                'priority': 'low',
                'estimated_duration': 30
            }

    def _create_task_prompt(self, tasks: List[Task]) -> str:
        try:
            tasks_json = json.dumps([task.model_dump() for task in tasks], default=str)
            logger.debug(f"Creating task prompt for tasks: {tasks_json}")
            
            prompt = f"""You are Peka, an AI productivity assistant. Analyze the following to-do list and provide detailed recommendations.

Tasks:
{tasks_json}
Should not exceed 200 words.

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

Provide a helpful, actionable response that focuses on learning. Or  productivity, time management, or personal development. Your response should be:
1. Practical and actionable
2. Based on proven productivity principles
3. Tailored to the user's specific question
4. Encouraging and motivating 
5. Should not exceed 200 words.

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

    def _create_task_creation_prompt(self, task_details: dict) -> str:
        try:
            logger.debug(f"Creating task creation prompt for details: {task_details}")
            prompt = f"""You are Peka, an AI productivity assistant. The user wants to create a task with the following details:

Title: {task_details.get('title', '')}
Description: {task_details.get('description', '')}
Priority: {task_details.get('priority', 'low')}
Estimated Duration: {task_details.get('estimated_duration', 30)} minutes

Please analyze these details and provide a response that:
1. Confirms the task creation
2. Suggests any improvements to the task details
3. Provides context about why this task is important
4. Offers any relevant productivity tips

Provide a JSON response with the following structure:
{{
    "task_id": 0,  // This will be set by the server 
    "title": "The task title",
    "description": "The task description",
    "priority": "high|medium|low",
    "estimated_duration": duration in minutes,
    "message": "A helpful message about the task and suggestions"
}}"""
            logger.debug(f"Created task creation prompt: {prompt[:100]}...")
            return prompt
        except Exception as e:
            logger.error(f"Failed to create task creation prompt: {str(e)}")
            logger.exception("Full traceback:")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create task creation prompt: {str(e)}"
            )

    async def create_task(self, task_details: dict) -> dict:
        try:
            logger.info(f"Creating task with details: {task_details}")
            prompt = ChatPromptTemplate.from_messages([
                ("system", "You are Peka, an AI productivity assistant. Always respond with valid JSON."),
                ("user", "{input}")
            ])
            logger.debug("Created chat prompt template")

            # Create a custom parser for task creation response
            class TaskCreationResponse(BaseModel):
                task_id: int = 0
                title: str
                description: str
                priority: str
                estimated_duration: int
                message: str

            parser = PydanticOutputParser(pydantic_object=TaskCreationResponse)
            chain = prompt | self.llm | parser
            logger.debug("Created processing chain")

            logger.debug("Invoking chain with task creation prompt")
            response = chain.invoke({"input": self._create_task_creation_prompt(task_details)})
            logger.debug(f"Received response: {response}")
            
            # Convert the response to a dict and add the task details
            response_dict = response.model_dump()
            response_dict.update(task_details)
            
            logger.info("Task creation completed successfully")
            return response_dict
        except Exception as e:
            logger.error(f"Failed to create task: {str(e)}")
            logger.exception("Full traceback:")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create task: {str(e)}"
            )

    def _create_unified_prompt(self, query: str, intent: str, task_details: Optional[Dict] = None) -> str:
        """Create a prompt for the AI based on the query intent."""
        if intent == 'create':
            return f"""You are Peka, an AI productivity assistant. The user wants to create a task with the following details:
Title: {task_details['title']}
Description: {task_details['description']}
Priority: {task_details['priority']}
Estimated Duration: {task_details['estimated_duration']} minutes

Please provide a friendly confirmation message and any relevant suggestions for completing this task effectively."""
        
        elif intent == 'analyze':
            return f"""You are Peka, an AI productivity assistant. The user wants to analyze their tasks:
Query: {query}

Please provide:
1. A clear explanation of task prioritization
2. Specific recommendations for task management
3. Actionable steps to improve productivity"""
        
        else:
            return f"""You are Peka, an AI productivity assistant. The user has a general query:
Query: {query}

Please provide helpful advice and actionable steps to improve their productivity."""

    def _extract_action_items(self, message: str) -> List[str]:
        """Extract action items from the AI's response."""
        # Simple extraction of bullet points or numbered lists
        import re
        action_items = []
        
        # Match bullet points or numbered lists
        lines = message.split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith(('•', '-', '*', '1.', '2.', '3.')):
                # Clean up the line
                clean_line = re.sub(r'^[•\-*]\s*|\d+\.\s*', '', line)
                if clean_line:
                    action_items.append(clean_line)
        
        return action_items 