import type { Core } from "@strapi/strapi";

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx, next) => {
    strapi.log.info("In get-own-profile middleware.");

    // Vérifier si l'utilisateur est authentifié
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized("Vous devez être connecté pour accéder à cette ressource");
    }

    // Si la route est /api/users/me, récupérer le profil de l'utilisateur connecté
    if (ctx.request.url.includes("/api/users/me")) {
      try {
        const userId = user.id;
        
        // Utiliser populate: true pour récupérer toutes les relations
        const userProfile = await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
          populate: '*'  // Utiliser '*' au lieu d'un objet
        });

        if (!userProfile) {
          return ctx.notFound("Utilisateur non trouvé");
        }

        // Supprimer les champs sensibles
        delete userProfile.password;
        delete userProfile.resetPasswordToken;
        delete userProfile.confirmationToken;
        
        console.log("Profil utilisateur récupéré avec succès:", userId);

        ctx.body = { data: userProfile };
        return;
      } catch (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        return ctx.badRequest("Une erreur est survenue lors de la récupération du profil");
      }
    }

    await next();
  };
};