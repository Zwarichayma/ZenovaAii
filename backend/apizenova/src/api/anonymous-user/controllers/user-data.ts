import { factories } from '@strapi/strapi';
import { Context } from 'koa';

// Définir les interfaces pour les types
interface UserData {
  id?: number;
  username?: string;
  email?: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
  anonymousData?: any;
  [key: string]: any; // Pour permettre d'autres propriétés
}

interface ResultData {
  userData: UserData;
  relatedData: {
    [key: string]: any[];
  };
}

export default factories.createCoreController('api::anonymous-user.anonymous-user', ({ strapi }) => ({
  async getUserData(ctx: Context) {
    try {
      // Déterminer si nous cherchons par userId ou anonymousId
      let userId: number | null = null;
      let anonymousId: string | null = null;
      
      // Si l'utilisateur est connecté, utiliser son ID
      if (ctx.state.user) {
        userId = ctx.state.user.id;
      } 
      // Sinon, chercher par anonymousId fourni dans la requête
      else {
        anonymousId = ctx.request.query.anonymousId as string;
        if (!anonymousId) {
          return ctx.badRequest('Either authentication or anonymousId is required');
        }
      }
      
      // Préparer l'objet de résultat avec les types appropriés
      const result: ResultData = {
        userData: {},
        relatedData: {}
      };
      
      // Si nous avons un anonymousId, récupérer les données de l'utilisateur anonyme
      if (anonymousId) {
        const anonymousUser = await strapi.db.query('api::anonymous-user.anonymous-user').findOne({
          where: { anonymousId }
        });
        
        if (!anonymousUser) {
          return ctx.notFound('Anonymous user not found');
        }
        
        result.userData = anonymousUser;
      } 
      // Si nous avons un userId, récupérer les données de l'utilisateur
      else if (userId) {
        const user = await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id: userId }
        });
        
        if (!user) {
          return ctx.notFound('User not found');
        }
        
        // Exclure les informations sensibles
        const { password, resetPasswordToken, confirmationToken, ...safeUserData } = user;
        result.userData = safeUserData as UserData;
        
        // Vérifier si cet utilisateur a des données anonymes associées
        const anonymousData = await strapi.db.query('api::anonymous-user.anonymous-user').findOne({
          where: { user: userId }
        });
        
        if (anonymousData) {
          // Maintenant TypeScript sait que result.userData est de type UserData qui peut avoir anonymousData
          result.userData.anonymousData = anonymousData;
        }
      }
      
      // Récupérer toutes les données associées dans les autres collections
      const contentTypes = Object.keys(strapi.contentTypes);
      const apiContentTypes = contentTypes.filter(type => type.startsWith('api::'));
      
      // Pour chaque content type, vérifier s'il a un champ user ou anonymousId
      for (const contentType of apiContentTypes) {
        const model = strapi.contentTypes[contentType];
        const attributes = model.attributes || {};
        const collection = contentType.split('::')[1].split('.')[0];
        
        // Ignorer la collection anonymous-user car déjà traitée
        if (collection === 'anonymous-user') continue;
        
        result.relatedData[collection] = [];
        
        // Chercher par userId si disponible
        if (userId && attributes.user) {
          const items = await strapi.db.query(contentType).findMany({
            where: { user: userId }
          });
          
          if (items.length > 0) {
            result.relatedData[collection] = [...result.relatedData[collection], ...items];
          }
        }
        
        // Chercher par anonymousId si disponible
        if (anonymousId && attributes.anonymousId) {
          const items = await strapi.db.query(contentType).findMany({
            where: { anonymousId }
          });
          
          if (items.length > 0) {
            result.relatedData[collection] = [...result.relatedData[collection], ...items];
          }
        }
        
        // Si aucune donnée trouvée pour cette collection, supprimer l'entrée
        if (result.relatedData[collection].length === 0) {
          delete result.relatedData[collection];
        }
      }
      
      return result;
    } catch (error) {
      strapi.log.error('Error in getUserData:', error);
      return ctx.internalServerError('An error occurred while fetching user data');
    }
  }
}));