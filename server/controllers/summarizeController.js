const pythonAPI = require('../config/python-api');

const summarizerController = {
  async summarizeText(req, res, next) {
    try {
      const { text, provider = 'openai' } = req.body;

      if (!text) {
        return res.status(400).json({ 
          error: 'Text is required for summarization' 
        });
      }

      const response = await pythonAPI.post('/summarizer/', {
        text,
        provider
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

module.exports = summarizerController;