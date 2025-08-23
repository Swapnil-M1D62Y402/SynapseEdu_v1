const pythonAPI = require('../config/python-api');

const mcqController = {
  async createMCQs(req, res, next) {
    try {
      const {
        topic,
        num_questions = 5,
        provider = 'openai',
        studyKitId,
        topics,
        use_retriever = true,
        collection_name
      } = req.body;

      if (!topic && !studyKitId && !topics) {
        return res.status(400).json({
          error: 'Either topic, studyKitId, or topics array is required'
        });
      }

      const response = await pythonAPI.post('/mcq/create', {
        topic,
        num_questions,
        provider,
        studyKitId,
        topics,
        use_retriever,
        collection_name
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

module.exports = mcqController;