// controllers/ingestionController.js
const pythonAPI = require('../config/python-api');

const ingestionController = {
  async ingestPendingSources(req, res, next) {
    try {
      const {
        limit = 50,
        max_concurrency = 5,
        collection_name
      } = req.body;

      const response = await pythonAPI.post('/ingestion/ingest/pending', {
        limit,
        max_concurrency,
        collection_name
      });

      res.json({
        success: true,
        data: response.data
      });

    } catch (error) {
      next(error);
    }
  },

  async ingestStudyKitSources(req, res, next) {
    try {
      const {
        studyKitId,
        max_concurrency = 5,
        collection_name
      } = req.body;

      if (!studyKitId) {
        return res.status(400).json({
          error: 'studyKitId is required'
        });
      }

      const response = await pythonAPI.post('/ingestion/ingest/study-kit', {
        studyKitId,
        max_concurrency,
        collection_name
      });

      res.json({
        success: true,
        data: response.data
      });

    } catch (error) {
      next(error);
    }
  },

  async ingestPendingSourcesBackground(req, res, next) {
    try {
      const {
        limit = 50,
        max_concurrency = 5,
        collection_name
      } = req.body;

      const response = await pythonAPI.post('/ingestion/ingest/background/pending', {
        limit,
        max_concurrency,
        collection_name
      });

      res.json({
        success: true,
        data: response.data
      });

    } catch (error) {
      next(error);
    }
  },

  async ingestStudyKitBackground(req, res, next) {
    try {
      const {
        studyKitId,
        max_concurrency = 5,
        collection_name
      } = req.body;

      if (!studyKitId) {
        return res.status(400).json({
          error: 'studyKitId is required'
        });
      }

      const response = await pythonAPI.post('/ingestion/ingest/background/study-kit', {
        studyKitId,
        max_concurrency,
        collection_name
      });

      res.json({
        success: true,
        data: response.data
      });

    } catch (error) {
      next(error);
    }
  },

  async getIngestionStatus(req, res, next) {
    try {
      const response = await pythonAPI.get('/ingestion/ingest/status');

      res.json({
        success: true,
        data: response.data
      });

    } catch (error) {
      next(error);
    }
  }
};

module.exports = ingestionController;