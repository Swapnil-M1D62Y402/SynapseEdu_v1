
async def generate_mcqs(topic: str, num_questions: int) -> list[dict]:
    mcqs = []
    for i in range(num_questions):
        mcqs.append({
            "question": f"MCQ {i+1} on {topic}?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option A"
        })
    return mcqs
