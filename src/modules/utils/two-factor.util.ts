import { randomBytes, createHash } from 'crypto';

export class TwoFactorUtils {
  static generateBackupCodes(): string[] {
    return Array.from({ length: 5 }, () => randomBytes(6).toString('hex'));
  }

  static hashCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  static hashBackupCodes(codes: string[]): string[] {
    return codes.map((code) => this.hashCode(code));
  }

  static verifyBackupCode(
    inputCode: string,
    storedCodes: string[],
  ): { isValid: boolean; updatedCodes: string[] } {
    const hashedInput = this.hashCode(inputCode);
    const codeIndex = storedCodes.findIndex((code) => code === hashedInput);

    if (codeIndex === -1) return { isValid: false, updatedCodes: storedCodes };

    storedCodes.splice(codeIndex, 1);
    return { isValid: true, updatedCodes: storedCodes };
  }
}
