export default {
    routes: [
      {
        method: 'POST',
        path: '/auth/google/mobile',
        handler: 'google-auth.mobileConnect',
        config: {
          policies: [],
          auth: false,
        },
      },
    ],
  };