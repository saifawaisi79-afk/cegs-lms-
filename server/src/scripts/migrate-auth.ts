import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { User, IUser } from '../models/User.js';
import { StudentProfile } from '../models/Profiles.js';
import { Counter } from '../models/Counter.js';
import { setCounterMinSeq } from '../services/idService.js';
import { generateTemporaryPassword } from '../services/passwordService.js';

export async function runAuthMigration(): Promise<{
  mentorsCount: number;
  studentsCount: number;
  adminsCount: number;
  rotatedCount: number;
  filePath: string;
}> {
  const timestamp = Date.now();
  const rotatedCredentials: { userId: string; email: string; role: string; tempPass: string }[] = [];

  // 1. Process Mentors
  const mentors = await User.find({ role: 'mentor' }).sort({ createdAt: 1 }).select('+password');
  let highestMentorSeq = 0;

  for (const mentor of mentors) {
    if (mentor.userId) {
      const match = mentor.userId.match(/^MNTR(\d+)$/i);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > highestMentorSeq) highestMentorSeq = seq;
      }
    }
  }

  for (const mentor of mentors) {
    let modified = false;
    if (!mentor.userId) {
      highestMentorSeq++;
      const numStr = highestMentorSeq < 10000 ? String(highestMentorSeq).padStart(4, '0') : String(highestMentorSeq);
      mentor.userId = `MNTR${numStr}`;
      modified = true;
    }
    if (mentor.mustChangePassword === undefined || !mentor.mustChangePassword) {
      mentor.mustChangePassword = true;
      modified = true;
    }
    if (modified) {
      await mentor.save();
    }
  }
  await setCounterMinSeq('MNTR', highestMentorSeq);

  // 2. Process Students
  const students = await User.find({ role: 'student' }).sort({ createdAt: 1 }).select('+password');
  let highestStudentSeq = 0;

  for (const student of students) {
    if (student.userId) {
      const match = student.userId.match(/^STD(\d+)$/i);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > highestStudentSeq) highestStudentSeq = seq;
      }
    }
  }

  for (const student of students) {
    let modified = false;
    if (!student.userId) {
      highestStudentSeq++;
      const numStr = highestStudentSeq < 10000 ? String(highestStudentSeq).padStart(4, '0') : String(highestStudentSeq);
      student.userId = `STD${numStr}`;
      modified = true;
    }
    if (student.mustChangePassword === undefined || !student.mustChangePassword) {
      student.mustChangePassword = true;
      modified = true;
    }
    if (modified) {
      await student.save();
    }

    // Align rollNumber with userId if needed
    const profile = await StudentProfile.findOne({ user: student._id });
    if (profile && (!profile.rollNumber || profile.rollNumber.startsWith('CEGS-'))) {
      profile.rollNumber = student.userId;
      await profile.save();
    }
  }
  await setCounterMinSeq('STD', highestStudentSeq);

  // 3. Process Admins
  const admins = await User.find({ role: 'admin' }).sort({ createdAt: 1 }).select('+password');
  let highestAdminSeq = 0;

  for (const admin of admins) {
    if (admin.userId) {
      const match = admin.userId.match(/^ADM(\d+)$/i);
      if (match) {
        const seq = parseInt(match[1], 10);
        if (seq > highestAdminSeq) highestAdminSeq = seq;
      }
    }
  }

  for (const admin of admins) {
    if (!admin.userId) {
      highestAdminSeq++;
      const numStr = highestAdminSeq < 10000 ? String(highestAdminSeq).padStart(4, '0') : String(highestAdminSeq);
      admin.userId = `ADM${numStr}`;
      await admin.save();
    }
  }
  await setCounterMinSeq('ADM', highestAdminSeq);

  // 4. Rotate passwords matching Password123! across all users
  const allUsers = await User.find().select('+password');
  let rotatedCount = 0;

  for (const u of allUsers) {
    if (u.password) {
      const isDefault = await bcrypt.compare('Password123!', u.password);
      if (isDefault) {
        const tempPass = generateTemporaryPassword();
        u.password = tempPass; // Will be re-hashed by pre-save hook with BCRYPT_ROUNDS
        u.mustChangePassword = true;
        u.tokenVersion = (u.tokenVersion || 0) + 1;
        await u.save();

        rotatedCredentials.push({
          userId: u.userId || '',
          email: u.email,
          role: u.role,
          tempPass,
        });
        rotatedCount++;
      }
    }
  }

  // Write CSV file
  const csvFileName = `credentials-migration-${timestamp}.csv`;
  // Save in server directory or current working directory
  const csvDir = path.resolve(process.cwd(), process.cwd().endsWith('server') ? '.' : 'server');
  const csvPath = path.join(csvDir, csvFileName);

  const csvRows = ['User ID,Email,Role,Temporary Password,Updated At'];
  for (const cred of rotatedCredentials) {
    csvRows.push(`"${cred.userId}","${cred.email}","${cred.role}","${cred.tempPass}","${new Date().toISOString()}"`);
  }
  fs.writeFileSync(csvPath, csvRows.join('\n'), 'utf8');

  return {
    mentorsCount: mentors.length,
    studentsCount: students.length,
    adminsCount: admins.length,
    rotatedCount,
    filePath: csvPath,
  };
}

async function main() {
  try {
    await connectDB();
    const result = await runAuthMigration();
    console.log(`
================================================================
🔒 CEGS LMS AUTH MIGRATION COMPLETED
================================================================
Mentors Processed : ${result.mentorsCount}
Students Processed: ${result.studentsCount}
Admins Processed  : ${result.adminsCount}
Passwords Rotated : ${result.rotatedCount}
Credentials File  : ${result.filePath}
----------------------------------------------------------------
⚠️  IMPORTANT:
The generated CSV file contains the newly generated temporary passwords.
Please store this file safely in your secure password manager and
delete it from disk immediately after review.
================================================================
`);
  } catch (err) {
    console.error('Auth migration failed:', err);
    process.exit(1);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
}

if (process.argv[1]?.endsWith('migrate-auth.ts') || process.argv[1]?.endsWith('migrate-auth.js')) {
  main();
}
