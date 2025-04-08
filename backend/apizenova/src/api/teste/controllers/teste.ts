import { factories } from '@strapi/strapi';

interface Reponse {
  documentId: string;
  texte: string;
  coefficient: number;
}

interface Question {
  documentId: string;
  texte: string;
  point: number;
  reponses: Reponse[];
}

interface Interpretation {
  documentId: string;
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
  // Méthode create modifiée pour prendre en compte les utilisateurs anonymes
  async create(ctx) {
    try {
      // Vérifier si l'utilisateur est authentifié ou anonyme
      if (ctx.state.user) {
        // Utilisateur authentifié
        ctx.request.body.data = {
          ...ctx.request.body.data,
          user: ctx.state.user.id
        };
      } else if (ctx.state.anonymousId) {
        // Utilisateur anonyme
        ctx.request.body.data = {
          ...ctx.request.body.data,
          anonymousId: ctx.state.anonymousId
        };
      }
      
      // Continuer avec la création standard
      return await super.create(ctx);
    } catch (error) {
      strapi.log.error('Error in teste create:', error);
      return ctx.internalServerError('An error occurred');
    }
  },
  
  // Méthode find modifiée pour prendre en compte les utilisateurs anonymes
  async find(ctx) {
    try {
      // Initialiser les filtres s'ils n'existent pas
      if (!ctx.query) ctx.query = {};
      if (!ctx.query.filters) ctx.query.filters = {};
      
      // Adapter les filtres en fonction de l'utilisateur
      if (ctx.state.user) {
        // Utilisateur authentifié
        ctx.query.filters = {
          ...(typeof ctx.query.filters === 'object' ? ctx.query.filters : {}),
          user: ctx.state.user.id
        };
      } else if (ctx.state.anonymousId) {
        // Utilisateur anonyme
        ctx.query.filters = {
          ...(typeof ctx.query.filters === 'object' ? ctx.query.filters : {}),
          anonymousId: ctx.state.anonymousId
        };
      }
      
      // Continuer avec la recherche standard
      return await super.find(ctx);
    } catch (error) {
      strapi.log.error('Error in teste find:', error);
      return ctx.internalServerError('An error occurred');
    }
  },
  
  // Méthode findOne modifiée pour prendre en compte les utilisateurs anonymes
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      
      // Vérifier que l'utilisateur a accès à cette entrée
      const entry = await strapi.db.query('api::teste.teste').findOne({
        where: { id }
      });
      
      if (!entry) {
        return ctx.notFound('Entry not found');
      }
      
      // Vérifier l'accès
      const hasAccess = 
        (ctx.state.user && entry.user && entry.user.id === ctx.state.user.id) || 
        (ctx.state.anonymousId && entry.anonymousId === ctx.state.anonymousId);
      
      if (!hasAccess && entry.user) {
        return ctx.forbidden('You do not have access to this entry');
      }
      
      // Continuer avec la recherche standard
      return await super.findOne(ctx);
    } catch (error) {
      strapi.log.error('Error in teste findOne:', error);
      return ctx.internalServerError('An error occurred');
    }
  },
  
  // Votre méthode calculateScore existante, modifiée pour prendre en compte les utilisateurs anonymes
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
        const questionDocId = question.documentId;
        const userAnswerId = userResponses[questionDocId];
        
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

      // Préparation des données pour le résultat
      const resultData: any = {
        teste: teste.id,
        score: totalScore,
        interpretation: interpretation?.documentId,
        date: new Date(),
        publishedAt: new Date()
      };
      
      // Ajouter l'utilisateur ou l'anonymousId selon le cas
      if (ctx.state.user) {
        resultData.user = ctx.state.user.id;
      } else if (ctx.state.anonymousId) {
        resultData.anonymousId = ctx.state.anonymousId;
      }

      // Création du résultat
      const result = await strapi.entityService.create('api::result.result', {
        data: resultData,
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