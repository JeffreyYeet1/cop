from langchain.chat_models import ChatCohere
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from datetime import datetime
import json
from typing import List
from schemas.peka import Task, TaskRecommendation, PekaResponse

class PekaService:
    def __init__(self, cohere_api_key: str):
        self.llm = ChatCohere(
            model="command",
            temperature=0.7,
            cohere_api_key=cohere_api_key
        )
        self.parser = PydanticOutputParser(pydantic_object=PekaResponse)

    def _create_prompt(self, tasks: List[Task]) -> str:
        tasks_json = json.dumps([task.model_dump() for task in tasks], default=str)
        
        return f"""You are Peka, an AI productivity assistant. Analyze the following to-do list and provide detailed recommendations.

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

Provide:
1. A sorted list of tasks in order of importance/urgency
2. A top recommendation for which task to focus on next
3. A detailed explanation (2-3 paragraphs) of:
   - Why tasks were ordered in this specific way
   - The reasoning behind the top recommendation
   - Any potential risks or considerations
   - How this ordering aligns with productivity best practices

{self.parser.get_format_instructions()}"""

    async def analyze_tasks(self, tasks: List[Task]) -> PekaResponse:
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are Peka, an AI productivity assistant."),
            ("user", "{input}")
        ])

        chain = prompt | self.llm | self.parser
        response = await chain.ainvoke({"input": self._create_prompt(tasks)})
        return response 