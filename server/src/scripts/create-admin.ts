import readline from 'readline';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { setCounterMinSeq } from '../services/idService.js';
import { validateNewPassword } from '../services/passwordService.js';

function promptHidden(query: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const stdin = process.stdin;
    const onData = (char: any) => {
      char = char + '';
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.removeListener('data', onData);
          break;
        default:
          process.stdout.write('\x1B[2K\x1B[200D' + query + '*'.repeat(rl.line.length));
          break;
      }
    };

    process.stdin.on('data', onData);

    rl.question(query, (value) => {
      rl.close();
      console.log('');
      resolve(value.trim());
    });
  });
}

function promptVisible(query: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(query, (val) => {
      rl.close();
      resolve(val.trim());
    });
  });
}

export async function createOrResetAdmin(): Promise<void> {
  const isReset = process.argv.includes('--reset');

  const existingAdmin = await User.findOne({ role: 'admin' });

  if (existingAdmin && !isReset) {
    console.error(`
❌ Refusing to create admin:
An administrator account (${existingAdmin.email}, ID: ${existingAdmin.userId || 'ADM0001'}) already exists.
To reset this administrator password and revoke all sessions, re-run with --reset:
  npm run create-admin -- --reset
`);
    process.exit(1);
  }

  let name = process.env.ADMIN_NAME || '';
  let email = process.env.ADMIN_EMAIL || '';
  let password = process.env.ADMIN_PASSWORD || '';

  if (!name && !existingAdmin) {
    name = await promptVisible('Enter Admin Full Name: ');
  } else if (!name && existingAdmin) {
    name = existingAdmin.name;
  }

  if (!email && !existingAdmin) {
    email = await promptVisible('Enter Admin Email Address: ');
  } else if (!email && existingAdmin) {
    email = existingAdmin.email;
  }

  if (!password) {
    password = await promptHidden('Enter Admin Password: ');
  }

  if (!name) {
    console.error('❌ Admin full name is required.');
    process.exit(1);
  }

  if (!email || !email.includes('@')) {
    console.error('❌ Valid admin email is required.');
    process.exit(1);
  }

  const validation = validateNewPassword(password, {
    userId: existingAdmin?.userId || 'ADM0001',
    email,
    name,
  });

  if (!validation.valid) {
    console.error(`❌ Password does not meet security requirements: ${validation.message}`);
    process.exit(1);
  }

  if (existingAdmin && isReset) {
    existingAdmin.password = password;
    existingAdmin.mustChangePassword = false;
    existingAdmin.passwordChangedAt = new Date();
    existingAdmin.tokenVersion = (existingAdmin.tokenVersion || 0) + 1;
    existingAdmin.failedLoginAttempts = 0;
    existingAdmin.lockUntil = undefined;
    if (name) existingAdmin.name = name;
    if (email) existingAdmin.email = email.toLowerCase().trim();
    if (!existingAdmin.userId) existingAdmin.userId = 'ADM0001';
    await existingAdmin.save();

    await RefreshToken.updateMany({ user: existingAdmin._id }, { revokedAt: new Date() });
    await setCounterMinSeq('ADM', 1);

    console.log(`
================================================================
✅ ADMIN PASSWORD RESET SUCCESSFULLY
================================================================
Login ID   : ${existingAdmin.userId}
Email      : ${existingAdmin.email}
Sessions   : All prior sessions have been revoked.
================================================================
`);
    return;
  }

  // Create new ADM0001
  const newAdmin = await User.create({
    userId: 'ADM0001',
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password, // Pre-save hook will hash with bcrypt cost 12
    role: 'admin',
    mustChangePassword: false,
    isActive: true,
    isFirstLogin: false,
  });

  await setCounterMinSeq('ADM', 1);

  console.log(`
================================================================
🎉 FIRST ADMIN ACCOUNT CREATED SUCCESSFULLY
================================================================
Login ID   : ${newAdmin.userId}
Name       : ${newAdmin.name}
Email      : ${newAdmin.email}
Role       : System Administrator (Full Access)
================================================================
`);
}

async function main() {
  try {
    await connectDB();
    await createOrResetAdmin();
  } catch (err) {
    console.error('Fatal error in create-admin:', err);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

if (process.argv[1]?.endsWith('create-admin.ts') || process.argv[1]?.endsWith('create-admin.js')) {
  main();
}
