import crypto from 'crypto';

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // excludes O, I
const LOWER = 'abcdefghijkmnopqrstuvwxyz'; // excludes l, o? (prompt: 0/O/1/l/I)
// Note: prompt specifies "no ambiguous characters (0/O/1/l/I)"
const LOWER_UNAMBIGUOUS = 'abcdefghijkmnopqrstuvwxyz'; // excluding 'l'
const DIGITS_UNAMBIGUOUS = '23456789'; // excluding 0, 1
const ALL_UNAMBIGUOUS = UPPER + LOWER_UNAMBIGUOUS + DIGITS_UNAMBIGUOUS;

const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  'password123!',
  'qwerty',
  'qwerty123',
  'qwerty1234',
  '12345678',
  '123456789',
  '1234567890',
  'admin123',
  'welcome123',
  'letmein123',
  'changeme123',
]);

/**
 * Generates a cryptographically secure 12-character temporary password
 * grouped like Kx7m-Pq4R-t9Wz (3 groups of 4 separated by hyphens).
 * Contains no ambiguous characters (0, O, 1, l, I).
 * Guaranteed to contain at least 1 uppercase, 1 lowercase, and 1 digit.
 */
export function generateTemporaryPassword(): string {
  const chars: string[] = [
    UPPER[crypto.randomInt(0, UPPER.length)],
    LOWER_UNAMBIGUOUS[crypto.randomInt(0, LOWER_UNAMBIGUOUS.length)],
    DIGITS_UNAMBIGUOUS[crypto.randomInt(0, DIGITS_UNAMBIGUOUS.length)],
  ];

  for (let i = 0; i < 9; i++) {
    chars.push(ALL_UNAMBIGUOUS[crypto.randomInt(0, ALL_UNAMBIGUOUS.length)]);
  }

  // Cryptographic Fisher-Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    const temp = chars[i];
    chars[i] = chars[j];
    chars[j] = temp;
  }

  return `${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}-${chars.slice(8, 12).join('')}`;
}

export interface PasswordValidationResult {
  valid: boolean;
  message?: string;
}

export interface UserPasswordContext {
  userId?: string;
  email?: string;
  name?: string;
  currentPassword?: string;
}

/**
 * Validates that a new password meets the security policy:
 * - min 10, max 72 characters
 * - must contain upper, lower and digit
 * - must not contain the user's ID, email local-part or name
 * - must not be in a list of common passwords
 * - must differ from the current one
 */
export function validateNewPassword(
  newPassword: string,
  user?: UserPasswordContext
): PasswordValidationResult {
  if (!newPassword || typeof newPassword !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }

  if (newPassword.length < 10) {
    return { valid: false, message: 'Password must be at least 10 characters long.' };
  }

  if (newPassword.length > 72) {
    return { valid: false, message: 'Password must not exceed 72 characters.' };
  }

  if (!/[A-Z]/.test(newPassword)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }

  if (!/[a-z]/.test(newPassword)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter.' };
  }

  if (!/[0-9]/.test(newPassword)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }

  const pwLower = newPassword.toLowerCase();

  // Check common passwords
  if (COMMON_PASSWORDS.has(pwLower)) {
    return { valid: false, message: 'Password is too common. Please choose a stronger password.' };
  }

  if (user) {
    // Must differ from current password
    if (user.currentPassword && newPassword === user.currentPassword) {
      return { valid: false, message: 'New password must be different from the current password.' };
    }

    // Must not contain user's ID
    if (user.userId && user.userId.trim().length >= 3) {
      if (pwLower.includes(user.userId.trim().toLowerCase())) {
        return { valid: false, message: 'Password must not contain your Login ID.' };
      }
    }

    // Must not contain email local-part
    if (user.email && user.email.includes('@')) {
      const localPart = user.email.split('@')[0].trim().toLowerCase();
      if (localPart.length >= 3 && pwLower.includes(localPart)) {
        return { valid: false, message: 'Password must not contain parts of your email address.' };
      }
    }

    // Must not contain user's name or name parts
    if (user.name) {
      const nameParts = user.name
        .split(/\s+/)
        .map((p) => p.trim().toLowerCase())
        .filter((p) => p.length >= 3);

      for (const part of nameParts) {
        if (pwLower.includes(part)) {
          return { valid: false, message: 'Password must not contain parts of your name.' };
        }
      }
    }
  }

  return { valid: true };
}
