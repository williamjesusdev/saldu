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

export interface AlertMessage {
  type: 'success' | 'error';
  text: string;
}

export interface MessageResponse {
  message: string;
}

export interface InviteResponse {
  id: string;
  token: string;
  expiresAt: string;
  used: boolean;
  email?: string;
}

export interface PageMetadata {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface PageResponse<T> {
  content: T[];
  page: PageMetadata;
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: Record<string, string>;
}
