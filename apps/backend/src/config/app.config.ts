export const appConfig = () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    accessSecret:  process.env.JWT_ACCESS_SECRET  || 'injeniorw-access-secret-change-in-prod',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'injeniorw-refresh-secret-change-in-prod',
    accessExpiresIn:  process.env.JWT_ACCESS_EXPIRES  || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  },

  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  mtnMomo: {
    baseUrl:      process.env.MTN_MOMO_BASE_URL      || 'https://sandbox.momodeveloper.mtn.com',
    primaryKey:   process.env.MTN_MOMO_PRIMARY_KEY   || '',
    secondaryKey: process.env.MTN_MOMO_SECONDARY_KEY || '',
    userId:       process.env.MTN_MOMO_USER_ID       || '',
    apiKey:       process.env.MTN_MOMO_API_KEY       || '',
    environment:  process.env.MTN_MOMO_ENVIRONMENT   || 'sandbox',
    currency:     process.env.MTN_MOMO_CURRENCY      || 'RWF',
  },

  storage: {
    provider:    process.env.STORAGE_PROVIDER    || 'local',
    bucket:      process.env.S3_BUCKET           || 'injeniorw-uploads',
    region:      process.env.AWS_REGION          || 'eu-west-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID   || '',
    secretKey:   process.env.AWS_SECRET_KEY      || '',
  },

  email: {
    from:     process.env.EMAIL_FROM     || 'noreply@injeniorw.com',
    host:     process.env.EMAIL_HOST     || 'smtp.gmail.com',
    port:     parseInt(process.env.EMAIL_PORT || '587', 10),
    user:     process.env.EMAIL_USER     || '',
    password: process.env.EMAIL_PASSWORD || '',
  },

  platform: {
    feePercent: parseFloat(process.env.PLATFORM_FEE_PERCENT || '8'),
  },
})
