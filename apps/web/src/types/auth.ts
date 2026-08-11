export interface LoginResponse {
  tokenType: string;
  token: string;
  expiresIn: number;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  hasConsented: boolean;
}

export interface AccessRequestResponse {
  requestId: string;
  email: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface InviteResponse {
  id: string;
  token: string;
  expiresAt: string;
  used: boolean;
  email?: string;
}
