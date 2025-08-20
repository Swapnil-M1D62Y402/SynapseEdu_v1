
async def generate_flashcard(topic: str, num_cards: int):
    return [f"Flashcard {i+1} about {topic}" for i in range(num_cards)]
