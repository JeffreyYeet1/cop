from fastapi import APIRouter, Depends, HTTPException, Request, status
from typing import List
from schemas.peka import Task, PekaResponse, GeneralResponse
from services.peka_service import PekaService
from api.dependencies import get_current_user
from schemas.user import User
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

class GeneralQueryRequest(BaseModel):
    query: str

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

@router.post("/query", response_model=GeneralResponse)
async def handle_general_query(
    request: Request,
    query_request: GeneralQueryRequest,
    current_user: User = Depends(get_current_user)
):
    """Handle general productivity queries"""
    logger.info(f"Received query request from user {current_user.email}")
    logger.debug(f"Request body: {query_request}")
    try:
        cohere_api_key = get_cohere_api_key()
        logger.debug("Initializing PekaService")
        peka_service = PekaService(cohere_api_key)
        logger.debug("Processing query request")
        response = await peka_service.handle_general_query(query_request.query)
        logger.debug(f"Response: {response}")
        return response
    except HTTPException as e:
        logger.error(f"HTTP error in handle_general_query: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error in handle_general_query: {str(e)}")
        logger.exception("Full traceback:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing query: {str(e)}"
        ) 