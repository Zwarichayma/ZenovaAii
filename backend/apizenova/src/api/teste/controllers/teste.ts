import { factories } from '@strapi/strapi';

interface Reponse {
  documentId: string; // Changé de id à documentId
  texte: string;
  coefficient: number;
}

interface Question {
  documentId: string; // Changé de id à documentId
  texte: string;
  point: number;
  reponses: Reponse[];
}

interface Interpretation {
  documentId: string; // Changé de id à documentId
  scoreMin: number;
  scoreMax: number;
  niveau: string;
  description: string;
}

interface Teste {
  id: number;
  title: string;
  description: string;
  questions: Question[];
  interpretations: Interpretation[];
}

export default factories.createCoreController('api::teste.teste', ({ strapi }) => ({
  async calculateScore(ctx) {
    try {
      const { userResponses, testTitle } = ctx.request.body;

      // Validation des entrées
      if (!testTitle) return ctx.badRequest('Le titre du test est requis.');
      if (!userResponses || Object.keys(userResponses).length === 0) {
        return ctx.badRequest('Les réponses de l\'utilisateur sont requises.');
      }

      // Récupération du test avec les relations
      const tests = await strapi.entityService.findMany('api::teste.teste', {
        filters: { title: testTitle },
        populate: {
          questions: {
            populate: ['reponses']
          },
          interpretations: true
        }
      }) as unknown as Teste[];

      if (!tests.length) return ctx.notFound('Test introuvable');
      const teste = tests[0];

      // Debug: Afficher la structure complète du test
      console.log('Structure du test récupérée:', JSON.stringify(teste, null, 2));

      // Calcul du score
      let totalScore = 0;
      
      for (const question of teste.questions) {
        const questionDocId = question.documentId; // Utilisation de documentId
        const userAnswerId = userResponses[questionDocId]; // Plus besoin de conversion
        
        if (!userAnswerId) {
          console.log(`Aucune réponse pour la question ${questionDocId}`);
          continue;
        }

        const reponse = question.reponses.find(r => r.documentId === userAnswerId);
        
        if (reponse) {
          console.log(`Question ${questionDocId}: Réponse ${userAnswerId} -> +${reponse.coefficient}`);
          totalScore += reponse.coefficient;
        } else {
          console.log(`Réponse ${userAnswerId} introuvable pour la question ${questionDocId}`);
        }
      }

      console.log('Score total calculé:', totalScore);

      // Recherche de l'interprétation
      const interpretation = teste.interpretations.find(
        i => totalScore >= i.scoreMin && totalScore <= i.scoreMax
      );

      // Création du résultat
      const result = await strapi.entityService.create('api::result.result', {
        data: {
          teste: teste.id,
          score: totalScore,
          interpretation: interpretation?.documentId, // Utilisation de documentId
          date: new Date(),
          publishedAt: new Date()
        },
      });

      // Réponse finale
      return ctx.send({
        success: true,
        data: {
          resultId: result.id,
          testTitle: teste.title,
          totalScore,
          maxPossibleScore: teste.questions.reduce((acc, q) => {
            const maxCoeff = Math.max(...q.reponses.map(r => r.coefficient));
            return acc + maxCoeff;
          }, 0),
          interpretation: interpretation ? {
            niveau: interpretation.niveau,
            description: interpretation.description
          } : null
        }
      });

    } catch (error) {
      console.error('Erreur dans calculateScore:', error);
      return ctx.internalServerError('Une erreur est survenue');
    }
  }
}));