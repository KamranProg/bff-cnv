export default {
  providers: [
    {
      type: 'customJwt',
      applicationID: 'bff-cnv-app',
      issuer: process.env['BFF_URL'] ?? 'http://localhost:3000',
      jwks: (process.env['BFF_URL'] ?? 'http://localhost:3000') + '/.well-known/jwks.json',
      algorithm: 'RS256',
    },
  ],
} as const;
