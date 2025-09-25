import pythonAPI from '../config/python-api.js';

const flashcardController = {
  async createFlashcards(req, res, next) {
    try {
      const {
        topic,
        num_flashcards = 5,
        provider = 'openai',
        studyKitId,
        topics,
        use_retriever = true
      } = req.body;

      if (!topic && !studyKitId && !topics) {
        return res.status(400).json({
          error: 'Either topic, studyKitId, or topics array is required'
        });
      }

      const response = await pythonAPI.post('/flashcard/create', {
        topic,
        num_flashcards,
        provider,
        studyKitId,
        topics,
        use_retriever
      });

      res.json({
        success: true,
        data: response.data
      });

    } catch (error) {
      next(error);
    }
  }
};

export default flashcardController;