// libs/shared-types/src/user.dto.ts
// Shared DTOs used by Angular & BFF (non-Convex specific)
export type Role = 'user' | 'admin';

export interface MeResponse {
  id: string;
  email: string;
  roles: Role[];
}

export interface LoginStartResponse {
  redirectUrl: string;
}
