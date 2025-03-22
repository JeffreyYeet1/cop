from typing import List, Optional
from datetime import datetime
from db.supabase import create_supabase_client
from schemas.onboarding import OnboardingAnswer, OnboardingAnswerCreate

supabase = create_supabase_client()

async def create_onboarding_answer(user_id: str, answer: OnboardingAnswerCreate) -> Optional[OnboardingAnswer]:
    try:
        answer_data = {
            "user_id": user_id,
            "question": answer.question,
            "answer": answer.answer,
            "created_at": datetime.utcnow().isoformat()
        }
        
        print(f"Attempting to create onboarding answer: {answer_data}")
        result = supabase.from_("onboarding_answers").insert(answer_data).execute()
        print(f"Supabase response: {result}")
        
        if result.data:
            created_answer = OnboardingAnswer(
                id=result.data[0].get('id'),
                user_id=result.data[0].get('user_id'),
                question=result.data[0].get('question'),
                answer=result.data[0].get('answer'),
                created_at=datetime.fromisoformat(result.data[0].get('created_at'))
            )
            print(f"Successfully created answer: {created_answer}")
            return created_answer
    except Exception as e:
        print(f"Error creating onboarding answer: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
    return None

async def get_user_onboarding_answers(user_id: str) -> List[OnboardingAnswer]:
    try:
        print(f"Fetching onboarding answers for user: {user_id}")
        result = supabase.from_("onboarding_answers").select("*").eq("user_id", user_id).execute()
        print(f"Supabase response: {result}")
        
        answers = []
        for item in result.data:
            answer = OnboardingAnswer(
                id=item.get('id'),
                user_id=item.get('user_id'),
                question=item.get('question'),
                answer=item.get('answer'),
                created_at=datetime.fromisoformat(item.get('created_at'))
            )
            answers.append(answer)
        
        print(f"Found {len(answers)} answers")
        return answers
    except Exception as e:
        print(f"Error getting onboarding answers: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return [] 