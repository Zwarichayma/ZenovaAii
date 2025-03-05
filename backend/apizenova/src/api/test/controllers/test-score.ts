// src/api/test/controllers/test-score.ts



interface StrapiQuestion {
  id: number;
  question: string;
}

interface TestEntry {
  id: number;
  questions: any[];
  result_interpretation: {
    [key: string]: string;
  };
}

module.exports = {
  async calculateScore(ctx) {
    try {
      const { id } = ctx.params;
      const { answers } = ctx.request.body;

      // Validation des entrées
      if (!answers || !Array.isArray(answers)) {
        return ctx.badRequest("Invalid answers format");
      }

      // Récupération du test
      const entry = await strapi.db.query("api::test.test").findOne({
        where: { id },
        populate: ['questions'],
      }) as TestEntry | null;

      if (!entry) {
        return ctx.notFound("Test not found");
      }

      // Vérification que le nombre de réponses correspond au nombre de questions
      const questions = Array.isArray(entry.questions) ? entry.questions : [];
      if (answers.length !== questions.length) {
        return ctx.badRequest("Number of answers does not match number of questions");
      }

      // Validation des réponses
      const validAnswers = ["Never", "Sometimes", "Often", "Always"];
      const invalidAnswer = answers.find(answer => !validAnswers.includes(answer));
      if (invalidAnswer) {
        return ctx.badRequest(`Invalid answer value: ${invalidAnswer}`);
      }

      const pointsMap: Record<string, number> = {
        "Never": 0,
        "Sometimes": 1,
        "Often": 2,
        "Always": 3,
      };

      let totalScore = answers.reduce((sum, answer) => sum + pointsMap[answer], 0);

      // Interprétation du score
      let interpretation = "No interpretation available";
      if (entry.result_interpretation && typeof entry.result_interpretation === "object") {
        for (const range in entry.result_interpretation) {
          const [min, max] = range.split("_").slice(1).map(Number);
          if (totalScore >= min && totalScore <= max) {
            interpretation = entry.result_interpretation[range];
            break;
          }
        }
      }

      // Sauvegarder le score dans la collection test-score
      await strapi.db.query('api::test-score.test-score').create({
        data: {
          test: id,
          score: totalScore,
          answers,
          interpretation,
          date: new Date(),
          publishedAt: new Date()
        }
      });

      return ctx.send({
        totalScore,
        interpretation,
        maxPossibleScore: questions.length * 3,
        numberOfQuestions: questions.length
      });

    } catch (error) {
      console.error("Error in calculateScore:", error);
      return ctx.internalServerError("An error occurred while calculating the score");
    }
  },

  // Méthode pour récupérer l'historique des scores
  async getScoreHistory(ctx) {
    try {
      const { id } = ctx.params;

      const scores = await strapi.db.query('api::test-score.test-score').findMany({
        where: {
          test: id
        },
        orderBy: { date: 'desc' }
      });

      return ctx.send(scores);

    } catch (error) {
      console.error("Error in getScoreHistory:", error);
      return ctx.internalServerError("An error occurred while fetching score history");
    }
  }
};