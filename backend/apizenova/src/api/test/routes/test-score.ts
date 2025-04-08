// src/api/test/routes/test-score.ts

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/tests/:id/calculate-score',
      handler: 'test-score.calculateScore',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/tests/:id/score-history',
      handler: 'test-score.getScoreHistory',
      config: {
        auth: false,
      },
    },
  ],
};