// src/api/anonymous-user/controllers/anonymous-user.ts

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
    try {
      // Récupérer toutes les collections du modèle Strapi
      const contentTypes = Object.keys(strapi.contentTypes);
      
      // Filtrer pour ne garder que les API content types (pas les admin ou plugins)
      const apiContentTypes = contentTypes.filter(type => type.startsWith('api::'));
      
      // Pour chaque content type, vérifier s'il a un champ anonymousId
      for (const contentType of apiContentTypes) {
        const model = strapi.contentTypes[contentType];
        const attributes = model.attributes || {};
        
        // Vérifier si ce modèle a un champ anonymousId
        if (attributes.anonymousId) {
          const collection = contentType.split('::')[1].split('.')[0];
          
          strapi.log.info(`Migrating data for collection: ${collection}`);
          
          // Trouver tous les éléments avec cet anonymousId
          const items = await strapi.db.query(contentType).findMany({
            where: { anonymousId }
          });
          
          strapi.log.info(`Found ${items.length} items to migrate in ${collection}`);
          
          // Mettre à jour chaque élément
          for (const item of items) {
            await strapi.db.query(contentType).update({
              where: { id: item.id },
              data: {
                user: userId,
                anonymousId: null
              }
            });
          }
        }
      }
      
      strapi.log.info('Data migration completed successfully');
    } catch (error) {
      strapi.log.error('Error during data migration:', error);
      throw error;
    }
  }
}));