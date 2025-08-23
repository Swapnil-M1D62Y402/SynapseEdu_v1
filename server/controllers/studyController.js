// controllers/studyController.js
import axios from "axios";

const PYTHON_BACKEND = "http://localhost:5000"; // replace with actual Python backend URL

// Chat with RAG
export const chatRag = async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND}/rag/chat`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create Test
export const createTest = async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND}/test/create`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create Flashcard
export const createFlashcard = async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND}/flashcard/create`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Summarizer
export const summarizeText = async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND}/summarizer/`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create MCQ
export const createMcq = async (req, res) => {
  try {
    const response = await axios.post(`${PYTHON_BACKEND}/mcq/create`, req.body);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
