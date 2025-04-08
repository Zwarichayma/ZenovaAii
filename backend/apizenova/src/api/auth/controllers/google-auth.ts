import { Context } from 'koa';
import { OAuth2Client } from 'google-auth-library';

interface GooglePayload {
  email: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  role: any;
  [key: string]: any;
}

interface AdvancedSettings {
  default_role: string;
  [key: string]: any;
}

const sanitizeUser = (user: User) => {
  const { password, resetPasswordToken, confirmationToken, ...sanitizedUser } = user;
  return sanitizedUser;
};

export default {
  async mobileConnect(ctx: Context) {
    const { access_token } = ctx.request.body as { access_token?: string };
    
    if (!access_token) {
      return ctx.badRequest('Access token is required');
    }
    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      return ctx.badRequest('Google Client ID not configured');
    }
    
    try {
      // Vérifier le token avec Google
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({
        idToken: access_token,
        audience: clientId,
      });
      
      const payload = ticket.getPayload() as GooglePayload | undefined;
      
      if (!payload || !payload.email) {
        return ctx.badRequest('Email not found in Google token');
      }
      
      const { email, name, picture } = payload;
      
      // Chercher l'utilisateur ou le créer
      const pluginStore = await strapi.store({ type: 'plugin', name: 'users-permissions' });
      const settings = await pluginStore.get({ key: 'advanced' }) as AdvancedSettings;
      
      const role = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: settings.default_role } });
      
      // Chercher l'utilisateur
      const user = await strapi
        .query('plugin::users-permissions.user')
        .findOne({ where: { email } }) as User | null;
      
      // Récupérer l'anonymousId s'il existe
      const anonymousId = ctx.request.header['x-anonymous-id'] as string | undefined;
      
      if (user) {
        // Utilisateur existant
        if (user.blocked) {
          return ctx.badRequest('Your account has been blocked by an administrator');
        }
        
        // Générer JWT
        const jwt = strapi.plugins['users-permissions'].services.jwt.issue({ id: user.id });
        
        // Si un anonymousId est fourni, convertir les données anonymes
        if (anonymousId) {
          try {
            // Migrer les données de manière générique
            await this.migrateAnonymousData(anonymousId, user.id);
            
            // Mettre à jour l'utilisateur anonyme
            const anonymousUser = await strapi.db.query('api::anonymous-user.anonymous-user').findOne({
              where: { anonymousId }
            });
            
            if (anonymousUser) {
              await strapi.db.query('api::anonymous-user.anonymous-user').update({
                where: { id: anonymousUser.id },
                data: {
                  convertedToUser: true,
                  user: user.id
                }
              });
            }
          } catch (error) {
            console.error('Error migrating anonymous data:', error);
            // Continuer même en cas d'erreur de migration
          }
        }
        
        return { jwt, user: sanitizeUser(user) };
      } else {
        // Créer un nouvel utilisateur
        const username = email.split('@')[0];
        const newUser = await strapi
          .query('plugin::users-permissions.user')
          .create({
            data: {
              username,
              email,
              provider: 'google',
              confirmed: true,
              blocked: false,
              role: role.id,
              // Stocker l'image de profil si disponible
              profilePicture: picture || null
            },
          }) as User;
        
        // Générer JWT
        const jwt = strapi.plugins['users-permissions'].services.jwt.issue({ id: newUser.id });
        
        // Si un anonymousId est fourni, convertir les données anonymes
        if (anonymousId) {
          try {
            // Migrer les données de manière générique
            await this.migrateAnonymousData(anonymousId, newUser.id);
            
            // Mettre à jour l'utilisateur anonyme
            const anonymousUser = await strapi.db.query('api::anonymous-user.anonymous-user').findOne({
              where: { anonymousId }
            });
            
            if (anonymousUser) {
              await strapi.db.query('api::anonymous-user.anonymous-user').update({
                where: { id: anonymousUser.id },
                data: {
                  convertedToUser: true,
                  user: newUser.id
                }
              });
            }
          } catch (error) {
            console.error('Error migrating anonymous data:', error);
            // Continuer même en cas d'erreur de migration
          }
        }
        
        return { jwt, user: sanitizeUser(newUser) };
      }
    } catch (error) {
      console.error(error);
      return ctx.badRequest('Invalid google auth token');
    }
  },
  
  // Méthode de migration générique des données anonymes
  async migrateAnonymousData(anonymousId: string, userId: number) {
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
          
          console.log(`Migrating data for collection: ${collection}`);
          
          // Trouver tous les éléments avec cet anonymousId
          const items = await strapi.db.query(contentType).findMany({
            where: { anonymousId }
          });
          
          console.log(`Found ${items.length} items to migrate in ${collection}`);
          
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
      
      console.log('Data migration completed successfully');
    } catch (error) {
      console.error('Error during data migration:', error);
      throw error;
    }
  }
};