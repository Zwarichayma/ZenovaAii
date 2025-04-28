export default ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
<<<<<<< HEAD
    keys: env.array('APP_KEYS', '575557'),
=======
    keys: env.array('APP_KEYS'),
    url: env("PUBLIC_URL", "http://localhost:1337"),
>>>>>>> 4edb00bba8161c8d2317c9879a1af7825131ca87
  },
});
