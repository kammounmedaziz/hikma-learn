from rest_framework.decorators import api_view
from rest_framework.response import Response
from .services.openrouter_client import generate_quiz_from_prompt

@api_view(["GET"])
def test_quiz_generation(request):
    prompt = """
    You are an AI quiz generator.
    Generate 3 simple multiple-choice questions on basic algebra.
    """
    try:
        quiz_text = generate_quiz_from_prompt(prompt)
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    return Response({"quiz": quiz_text})
