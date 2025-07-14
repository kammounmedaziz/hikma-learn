def build_prompt(student, topic_knowledge):
    prompt = "You are a quiz generator for middle school education. "
    prompt += "Generate multiple-choice questions with correct answers and explanations.\n"
    
    for topic in topic_knowledge:
        prompt += f"\nTopic: {topic.topic} (Level: {topic.level})"
        if topic.weakness:
            prompt += " [Student is weak in this topic.]"

    prompt += "\nCreate 5 questions total."
    return prompt
