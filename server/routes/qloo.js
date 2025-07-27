const express = require('express');
const axios = require('axios');
const router = express.Router();

const QLOO_BASE_URL = process.env.QLOO_BASE_URL || 'https://hackathon.api.qloo.com';
const QLOO_API_KEY = process.env.QLOO_API_KEY;

// Search for an entity (movie, music, etc.)
router.get('/search', async (req, res) => {
  const { query, type } = req.query;
  try {
    const searchResp = await axios.get(`${QLOO_BASE_URL}/search`, {
      params: { query, types: type },
      headers: { Authorization: `Bearer ${QLOO_API_KEY}` },
    });
    res.json(searchResp.data.results);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to search Qloo' });
  }
});

// Get recommendations (related entities)
router.get('/recommendations', async (req, res) => {
  const { entityId, type } = req.query;
  try {
    const insightsResp = await axios.post(
      `${QLOO_BASE_URL}/v2/insights`,
      {
        signal: { interests: { entities: [entityId] } },
        filter: { type },
      },
      {
        headers: { Authorization: `Bearer ${QLOO_API_KEY}` },
      }
    );
    res.json(insightsResp.data.related);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get antitheses (discomfort/opposite recommendations)
router.get('/antitheses', async (req, res) => {
  const { entityId, type } = req.query;
  try {
    const insightsResp = await axios.post(
      `${QLOO_BASE_URL}/v2/insights`,
      {
        signal: { interests: { entities: [entityId] } },
        filter: { type },
      },
      {
        headers: { Authorization: `Bearer ${QLOO_API_KEY}` },
      }
    );
    // Return the last 5 as "opposites" (improve logic as needed)
    res.json((insightsResp.data.related || []).slice(-5));
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get antitheses' });
  }
});

module.exports = router;
