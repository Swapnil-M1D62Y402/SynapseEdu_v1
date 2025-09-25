import pythonAPI from '../config/python-api.js';

const testController = {
  async createTest(req, res, next) {
    try {
      const {
        topic,
        num_questions = 5,
        difficulty = 'easy',
        provider = 'openai',
        studyKitId
      } = req.body;

      if (!topic && !studyKitId) {
        return res.status(400).json({
          error: 'Either topic or studyKitId is required'
        });
      }

      const response = await pythonAPI.post('/test_creation/create', {
        topic,
        num_questions,
        difficulty,
        provider,
        studyKitId
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

export default testController;