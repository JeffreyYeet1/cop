from fastapi import APIRouter, Depends, HTTPException, Request, status
from typing import List
from schemas.peka import Task, PekaResponse, GeneralResponse
from services.peka_service import PekaService
from services.todo_service import create_todo
from api.dependencies import get_current_user
from schemas.user import User
from schemas.todo import TodoCreate
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

router = APIRouter(
    tags=["peka"]
)

class AnalyzeTasksRequest(BaseModel):
    tasks: List[Task]

class QueryRequest(BaseModel):
    query: str

class CreateTaskRequest(BaseModel):
    title: str
    description: str = ""
    priority: str = "low"
    estimated_duration: int = 30

def get_cohere_api_key():
    api_key = os.getenv("COHERE_API_KEY")
    logger.debug(f"Loading Cohere API key: {'Found' if api_key else 'Not found'}")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="Cohere API key not configured. Please set COHERE_API_KEY environment variable."
        )
    return api_key

@router.post("/analyze", response_model=PekaResponse)
async def analyze_tasks(
    request: Request,
    task_request: AnalyzeTasksRequest,
    current_user: User = Depends(get_current_user)
):
    """Analyze tasks and provide recommendations"""
    logger.info(f"Received analyze request from user {current_user.email}")
    logger.debug(f"Request body: {task_request}")
    try:
        cohere_api_key = get_cohere_api_key()
        logger.debug("Initializing PekaService")
        peka_service = PekaService(cohere_api_key)
        logger.debug("Processing analyze request")
        response = await peka_service.analyze_tasks(task_request.tasks)
        logger.debug(f"Response: {response}")
        return response
    except HTTPException as e:
        logger.error(f"HTTP error in analyze_tasks: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error in analyze_tasks: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing tasks: {str(e)}"
        )

@router.post("/query", response_model=dict)
async def handle_query(
    request: Request,
    query_request: QueryRequest,
    current_user: User = Depends(get_current_user)
):
    """Handle all queries through a unified endpoint"""
    logger.info(f"Received query request from user {current_user.email}")
    logger.debug(f"Request body: {query_request}")
    try:
        cohere_api_key = get_cohere_api_key()
        logger.debug("Initializing PekaService")
        peka_service = PekaService(cohere_api_key)
        logger.debug("Processing unified query")
        
        # Get AI response
        logger.debug(f"Sending query to PekaService: {query_request.query}")
        response = await peka_service.handle_query(query_request.query)
        logger.debug(f"AI response: {response}")

        # If this is a task creation request, create the task in the database
        if response['intent'] == 'create' and response['task_details']:
            logger.debug("Detected task creation intent")
            todo_data = TodoCreate(
                title=response['task_details']['title'],
                description=response['task_details']['description'],
                priority=response['task_details']['priority'],
                estimated_duration=response['task_details']['estimated_duration']
            )
            
            logger.debug(f"Creating todo in database: {todo_data}")
            created_todo = create_todo(todo_data, current_user.id)
            logger.debug(f"Created todo: {created_todo}")

            # Update response with actual task ID
            response['task_details']['task_id'] = created_todo.id
            response['message'] = f"Task created successfully! {response['message']}"
        
        logger.info("Successfully processed query")
        return response
    except HTTPException as e:
        logger.error(f"HTTP error in handle_query: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error in handle_query: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing query: {str(e)}"
        )

@router.post("/create-task", response_model=dict)
async def create_task(
    request: Request,
    task_request: CreateTaskRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a new task with AI assistance"""
    logger.info(f"Received task creation request from user {current_user.email}")
    logger.debug(f"Request body: {task_request}")
    try:
        cohere_api_key = get_cohere_api_key()
        logger.debug("Initializing PekaService")
        peka_service = PekaService(cohere_api_key)
        logger.debug("Processing task creation request")
        
        # Get AI-enhanced task details
        ai_response = await peka_service.create_task(task_request.model_dump())
        logger.debug(f"AI response: {ai_response}")

        # Create todo in database
        todo_data = TodoCreate(
            title=ai_response['title'],
            description=ai_response['description'],
            priority=ai_response['priority'],
            estimated_duration=ai_response['estimated_duration']
        )
        
        logger.debug(f"Creating todo in database: {todo_data}")
        created_todo = create_todo(todo_data, current_user.id)
        logger.debug(f"Created todo: {created_todo}")

        # Update response with actual task ID
        ai_response['task_id'] = created_todo.id
        ai_response['message'] = f"Task created successfully! {ai_response['message']}"
        
        return ai_response
    except HTTPException as e:
        logger.error(f"HTTP error in create_task: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error in create_task: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating task: {str(e)}"
        ) 