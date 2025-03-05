import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::anonymous-user.anonymous-user', ({ strapi }) => ({
  async convertToUser(ctx) {
    try {
      const { anonymousId } = ctx.request.body;
      
      if (!ctx.state.user) {
        return ctx.unauthorized('You must be logged in');
      }
      
      if (!anonymousId) {
        return ctx.badRequest('Anonymous ID is required');
      }
      
      const userId = ctx.state.user.id;
      
      // Trouver l'utilisateur anonyme
      const anonymousUser = await strapi.db.query('api::anonymous-user.anonymous-user').findOne({
        where: { anonymousId }
      });

      if (!anonymousUser) {
        return ctx.notFound('Anonymous user not found');
      }

      // Mettre à jour l'utilisateur anonyme
      await strapi.db.query('api::anonymous-user.anonymous-user').update({
        where: { id: anonymousUser.id },
        data: {
          convertedToUser: true,
          user: userId
        }
      });

      // Migrer les données
      await this.migrateData(anonymousId, userId);
      
      return ctx.send({
        success: true,
        message: 'Anonymous data successfully migrated to user account'
      });
    } catch (error) {
      strapi.log.error('Error in convertToUser:', error);
      return ctx.internalServerError('An error occurred during conversion');
    }
  },
  
  async migrateData(anonymousId, userId) {
    // Migrer les données de teste
    const testes = await strapi.db.query('api::teste.teste').findMany({
      where: { anonymousId }
    });

    for (const teste of testes) {
      await strapi.db.query('api::teste.teste').update({
        where: { id: teste.id },
        data: {
          user: userId,
          anonymousId: null
        }
      });
    }

    // Migrer les résultats
    const results = await strapi.db.query('api::result.result').findMany({
      where: { anonymousId }
    });

    for (const result of results) {
      await strapi.db.query('api::result.result').update({
        where: { id: result.id },
        data: {
          user: userId,
          anonymousId: null
        }
      });
    }
  }
}));