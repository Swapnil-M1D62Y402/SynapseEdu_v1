const pythonAPI = require('../config/python-api');

const ragController = {
  async chatWithRAG(req, res, next) {
    try {
      const {
        query,
        provider = 'openai',
        collection,
        k = 4
      } = req.body;

      if (!query) {
        return res.status(400).json({
          error: 'Query is required for RAG chat'
        });
      }

      const response = await pythonAPI.post('/rag/chat', {
        query,
        provider,
        collection,
        k
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

module.exports = ragController;