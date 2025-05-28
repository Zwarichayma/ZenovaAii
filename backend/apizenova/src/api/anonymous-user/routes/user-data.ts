export default {
    routes: [
      {
        method: 'GET',
        path: '/user-data',
        handler: 'user-data.getUserData',
        config: {
          policies: [],
          middlewares: [],
          description: 'Get all data associated with a user or anonymous user',
          tag: {
            plugin: 'anonymous-user',
            name: 'User Data'
          }
        }
      }
    ]
  };