export default (config, { strapi }) => {
    return async (ctx, next) => {
      // Si utilisateur déjà authentifié, passer
      if (ctx.state.user) {
        return await next();
      }
  
      // Récupérer l'anonymousId de l'en-tête
      const anonymousId = ctx.request.header['x-anonymous-id'];
      if (!anonymousId) {
        return await next();
      }
  
      // Ajouter au contexte
      ctx.state.anonymousId = anonymousId;
      
      // Enregistrer/mettre à jour l'utilisateur anonyme
      try {
        const existingUser = await strapi.db.query('api::anonymous-user.anonymous-user').findOne({
          where: { anonymousId }
        });
  
        if (existingUser) {
          await strapi.db.query('api::anonymous-user.anonymous-user').update({
            where: { id: existingUser.id },
            data: { lastActivity: new Date() }
          });
        } else {
          await strapi.db.query('api::anonymous-user.anonymous-user').create({
            data: {
              anonymousId,
              lastActivity: new Date(),
              convertedToUser: false
            }
          });
        }
        
        return await next();
      } catch (error) {
        strapi.log.error('Error in anonymous-auth middleware:', error);
        return await next();
      }
    };
  };