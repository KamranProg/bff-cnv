export default {
  providers: [
    {
      type: 'customJwt',
      applicationID: process.env['CONVEX_APP_ID'] ?? 'bff-cnv-app',
      issuer:
        process.env['BFF_PUBLIC_URL'] ??
        'https://bff-cnv-ng-bff-3000.<region>.devtunnels.ms',
      jwks:
        (process.env['BFF_PUBLIC_URL'] ??
          'https://bff-cnv-ng-bff-3000.<region>.devtunnels.ms') +
        '/.well-known/jwks.json',
      algorithm: 'RS256',
    },
  ],
} as const;
