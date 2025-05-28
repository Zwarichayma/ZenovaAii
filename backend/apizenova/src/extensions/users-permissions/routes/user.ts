export default {
  routes: [
    {
      method: 'GET',
      path: '/users/me',
      handler: 'user.me',
      config: {
        middlewares: ['global::get-own-profile'],
      },
    },
    {
      method: 'PUT',
      path: '/users/me',
      handler: 'user.updateMe',
      config: {
        middlewares: ['plugin::users-permissions.is-authenticated'],
      },
    },
  ],
};