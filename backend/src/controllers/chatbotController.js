const { getAIResponse } = require('../services/aiService');

const handleMessage = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty.' });
    }

    const user = req.user || null;
    const result = await getAIResponse(message.trim(), { user, history });
    return res.json({
      success: true,
      reply: result.reply,
      calculation: result.calculation || null,
      source: result.source || 'ai',
    });
  } catch (err) {
    console.error('[Chatbot Controller] Error handling message:', err);
    return res.status(500).json({
      success: false,
      message: 'InflationWise AI Assistant is temporarily unavailable. Please try again later.',
    });
  }
};

module.exports = {
  handleMessage,
};
