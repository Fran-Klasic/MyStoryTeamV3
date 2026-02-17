export type User = {
  id: string;
  username: string;
  email: string;
  bio?: string;
};

export type AuthResponse = {
  accessToken: string;
};

export type Credentials = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  repeatPassword: string;
};
