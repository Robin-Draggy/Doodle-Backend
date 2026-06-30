export const bkashConfig = Object.freeze({
  base_url: process.env.BKASH_BASE_URL,

  username: process.env.BKASH_USERNAME,

  password: process.env.BKASH_PASSWORD,

  app_key: process.env.BKASH_APP_KEY,

  app_secret: process.env.BKASH_APP_SECRET,

  callbackUrl: process.env.BKASH_CALLBACK_URL,
});

const required = [
  "base_url",
  "username",
  "password",
  "app_key",
  "app_secret",
  "callbackUrl",
];

for (const key of required) {
  if (!bkashConfig[key]) {
    throw new Error(
      `Missing bKash configuration: ${key}`
    );
  }
}