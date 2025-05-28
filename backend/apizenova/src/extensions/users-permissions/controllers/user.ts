import type { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async me(ctx) {
    // Cette fonction est vide car le middleware get-own-profile s'occupe déjà de tout
    return ctx.body;
  },

  async updateMe(ctx) {
    if (!ctx.state.user) {
      return ctx.unauthorized("Vous devez être connecté pour mettre à jour votre profil");
    }

    const userId = ctx.state.user.id;
    const { data } = ctx.request.body;

    try {
      // Filtrer les champs sensibles qu'un utilisateur ne devrait pas pouvoir modifier
      const allowedFields = ['bio', 'phoneNumber', 'address', 'avatar'];
      const filteredData = Object.keys(data)
        .filter(key => allowedFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = data[key];
          return obj;
        }, {});

      // Trouver l'utilisateur d'abord pour vérifier qu'il existe
      const userExists = await strapi.query('plugin::users-permissions.user').findOne({
        where: { id: userId }
      });

      if (!userExists) {
        return ctx.notFound("Utilisateur non trouvé");
      }

      // Mettre à jour l'utilisateur avec la syntaxe correcte pour populate
      const updatedUser = await strapi.entityService.update('plugin::users-permissions.user', userId, {
        data: filteredData,
        populate: '*'  // Utiliser '*' au lieu d'un objet
      });

      // Supprimer les champs sensibles
      delete updatedUser.password;
      delete updatedUser.resetPasswordToken;
      delete updatedUser.confirmationToken;

      return { data: updatedUser };
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      return ctx.badRequest("Une erreur est survenue lors de la mise à jour du profil");
    }
  }
});