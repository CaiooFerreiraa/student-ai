export type UserEntity = {
  id: string;
  name: string | null;
  email: string;
  passwordHash: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};
