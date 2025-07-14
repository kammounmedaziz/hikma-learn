import httpx
from django.conf import settings

def generate_quiz_from_prompt(prompt):
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "mistral",
        "messages": [
            {"role": "system", "content": "You generate quiz questions with answers."},
            {"role": "user", "content": prompt}
        ]
    }

    response = httpx.post("https://openrouter.ai/api/v1/chat/completions", json=payload, headers=headers)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]
