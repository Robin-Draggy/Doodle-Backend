import Redis from "ioredis";

export const redis = new Redis({
  host: "redis-19506.c12.us-east-1-4.ec2.cloud.redislabs.com",
  port: 19506,
  password: "yYClaqqrsqQWwfPWv0CpaCu6ckeg9W3E",
});

redis.on('connect', () => {
  console.log('✅ Successfully connected to Redis Cloud');
});

redis.on('error', (error) => {
  console.error('❌ Redis Cloud connection error:', error);
});