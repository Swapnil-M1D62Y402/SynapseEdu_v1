
async def generate_test(topic: str, num_questions: int = 5, difficulty: str = "easy") -> list[str]:

    return [f"Dummy Question {i+1} on {topic} with difficulty: {difficulty}" for i in range(num_questions)]