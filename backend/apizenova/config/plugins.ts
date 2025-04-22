export default ({ env }) => ({
  // Enable the users-permissions plugin which is required for authentication
  "users-permissions": {
    config: {
      jwtSecret: env("JWT_SECRET"),
      jwt: {
        expiresIn: "7d",
      },
      providers: {
        // Configure the Google provider
        google: {
          enabled: true,
          clientId: env("GOOGLE_CLIENT_ID"),
          clientSecret: env("GOOGLE_CLIENT_SECRET"),
          callback: env("GOOGLE_REDIRECT_URI", "http://localhost:1337/api/connect/google/callback"),
          scope: ["email", "profile"],
        },
      },
    },
  },
})
