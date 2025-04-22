module.exports = ({ env }) => ({
    // Enable the users-permissions plugin which is required for authentication
    "users-permissions": {
      config: {
        jwt: {
          expiresIn: "7d",
        },
        providers: {
          // Configure the Google provider
          google: {
            enabled: true,
            config: {
              clientId: env("GOOGLE_CLIENT_ID"),
              clientSecret: env("GOOGLE_CLIENT_SECRET"),
              callback: `${env("STRAPI_URL", "http://localhost:1337")}/api/auth/google/callback`,
              scope: ["email", "profile"],
            },
          },
        },
      },
    },
  })
  