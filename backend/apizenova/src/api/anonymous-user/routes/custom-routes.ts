export default {
    routes: [
      {
        method: 'POST',
        path: '/anonymous-users/convert',
        handler: 'anonymous-user.convertToUser',
        config: {
          policies: []
        }
      }
    ]
  };