export interface IMfaProvider {
  generateSecret(userId: string): Promise<{
    secret: string;
    otpauthUrl: string;
  }>;

  verifyCode(secret: string, code: string): Promise<boolean>;
}


