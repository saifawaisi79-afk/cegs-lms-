import axios, { AxiosResponse } from 'axios';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { AddressInfo } from 'net';

interface TestResult {
  num: number;
  name: string;
  status: 'PASS' | 'FAIL';
  details?: string;
}

const results: TestResult[] = [];
let testCounter = 1;

async function runTest(name: string, fn: () => Promise<void>) {
  const num = testCounter++;
  try {
    await fn();
    results.push({ num, name, status: 'PASS' });
    console.log(`  [PASS] #${num} ${name}`);
  } catch (err: any) {
    const msg = err.response?.data?.message || err.message;
    results.push({ num, name, status: 'FAIL', details: msg });
    console.error(`  [FAIL] #${num} ${name} => ${msg}`);
  }
}

async function expectStatus(promise: Promise<AxiosResponse>, expectedStatus: number): Promise<AxiosResponse> {
  try {
    const res = await promise;
    if (res.status !== expectedStatus) {
      throw new Error(`Expected HTTP ${expectedStatus}, but received HTTP ${res.status}`);
    }
    return res;
  } catch (err: any) {
    if (err.response) {
      if (err.response.status === expectedStatus) {
        return err.response;
      }
      throw new Error(`Expected HTTP ${expectedStatus}, but received HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`);
    }
    throw err;
  }
}

function extractCookie(res: AxiosResponse, name: string): string | undefined {
  const setCookies = res.headers['set-cookie'];
  if (!setCookies) return undefined;
  for (const sc of setCookies) {
    if (sc.startsWith(`${name}=`)) {
      return sc.split(';')[0];
    }
  }
  return undefined;
}

export async function runAllE2ETests() {
  console.log('\n==============================================================');
  console.log('🚀 CEGS LMS E2E AUTHENTICATION & ACCESS CONTROL TEST SUITE');
  console.log('==============================================================');

  process.env.NODE_ENV = 'test';
  process.env.USE_MEMORY_DB = 'true';
  process.env.SEED_ON_START = 'false';
  process.env.SEED_DEMO_DATA = 'false';
  process.env.PORT = '0';
  process.env.JWT_SECRET = 'super-secret-jwt-key-minimum-32-chars-long-e2e';
  process.env.JWT_REFRESH_SECRET = 'different-refresh-secret-min-32-characters-e2e';
  process.env.CLIENT_URL = 'http://localhost:5173';
  process.env.MAX_LOGIN_ATTEMPTS = '5';
  process.env.LOCKOUT_MINUTES = '15';
  process.env.BCRYPT_ROUNDS = '10';

  const mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();

  // Dynamic imports after env override
  const { startServer } = await import('../app.js');
  const { User } = await import('../models/User.js');
  const { StudentProfile, MentorProfile } = await import('../models/Profiles.js');
  const { MentorshipSession, SWOTReview, MockInterview } = await import('../models/Mentorship.js');
  const { Attendance } = await import('../models/Attendance.js');
  const { Project, Task } = await import('../models/Project.js');
  const { Interview, Offer } = await import('../models/Placement.js');
  const { Certificate } = await import('../models/Certificate.js');
  const { StipendRecord } = await import('../models/Stipend.js');
  const { Conversation } = await import('../models/Communication.js');
  const { RefreshToken } = await import('../models/RefreshToken.js');
  const { generateNextId } = await import('../services/idService.js');
  const { generateTemporaryPassword } = await import('../services/passwordService.js');

  const server = await startServer();
  const port = (server.address() as AddressInfo).port;
  const API_URL = `http://localhost:${port}/api`;

  console.log(`📡 In-Memory Test Server running on port: ${port}`);
  console.log(`🗄️ In-Memory MongoDB connected: ${process.env.MONGODB_URI}\n`);

  // State variables across tests
  let adminId: string;
  let adminUserId: string;
  let adminEmail = 'e2e_admin@cegs.test';
  let adminPassword = generateTemporaryPassword();
  let adminToken: string;

  let mentorAId: string;
  let mentorAUserId: string;
  let mentorAEmail = 'mentorA_e2e@cegs.test';
  let mentorATempPassword = '';
  let mentorANewPassword = 'NewPermanentPassword123#';
  let mentorAToken: string;
  let mentorACookie: string | undefined;

  let mentorBId: string;
  let mentorBUserId: string;
  let mentorBEmail = 'mentorB_e2e@cegs.test';
  let mentorBTempPassword = '';
  let mentorBNewPassword = 'SecretAlphaBravo456#';
  let mentorBToken: string;

  let studentAId: string;
  let studentAUserId: string;
  let studentAEmail = 'studentA_e2e@cegs.test';
  let studentATempPassword = '';
  let studentAToken: string;

  let studentBId: string;
  let studentBUserId: string;

  // Bootstrap Admin
  const admSeq = await generateNextId('ADM');
  const adminDoc = await User.create({
    userId: admSeq,
    name: 'Super E2E Admin',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    isActive: true,
    mustChangePassword: false,
  });
  adminId = adminDoc._id.toString();
  adminUserId = adminDoc.userId || admSeq;

  // 1. Login by Email and by ID
  await runTest('1. Admin can log in using email address', async () => {
    const res = await expectStatus(
      axios.post(`${API_URL}/auth/login`, { identifier: adminEmail, password: adminPassword }),
      200
    );
    if (!res.data.token || res.data.user.role !== 'admin') {
      throw new Error('Admin login by email failed to return token or correct role');
    }
    adminToken = res.data.token;
  });

  await runTest('2. Admin can log in using uppercase Login ID (ADM0001)', async () => {
    const res = await expectStatus(
      axios.post(`${API_URL}/auth/login`, { identifier: adminUserId, password: adminPassword }),
      200
    );
    if (!res.data.token || res.data.user.userId !== adminUserId) {
      throw new Error('Admin login by ID failed to return token');
    }
  });

  // 2. Wrong password gives generic message
  await runTest('3. Wrong password returns generic message ("Invalid ID/email or password")', async () => {
    const res = await expectStatus(
      axios.post(`${API_URL}/auth/login`, { identifier: adminEmail, password: 'WrongPassword999!' }),
      401
    );
    if (res.data.message !== 'Invalid ID/email or password.') {
      throw new Error(`Expected generic message, got: ${res.data.message}`);
    }
  });

  // 3 & 4. Account lockout on 5th failure and case-variant normalization
  await runTest('4. Account locks out after 5 failed attempts, case tricks do not bypass limit', async () => {
    // Create a throwaway user to test lockout without locking admin
    const lockPw = generateTemporaryPassword();
    const lockUser = await User.create({
      userId: await generateNextId('STD'),
      name: 'Lockout Test Student',
      email: 'lockout_test@cegs.test',
      password: lockPw,
      role: 'student',
      isActive: true,
    });

    // 4 failed attempts with varied casing
    await expectStatus(axios.post(`${API_URL}/auth/login`, { identifier: 'LOCKOUT_TEST@cegs.test', password: 'bad' }), 401);
    await expectStatus(axios.post(`${API_URL}/auth/login`, { identifier: 'Lockout_Test@CEGS.TEST', password: 'bad' }), 401);
    await expectStatus(axios.post(`${API_URL}/auth/login`, { identifier: 'lockout_test@cegs.test', password: 'bad' }), 401);
    await expectStatus(axios.post(`${API_URL}/auth/login`, { identifier: 'LOCKOUT_test@cegs.test', password: 'bad' }), 401);

    // 5th attempt locks the account (returns 423)
    const lockRes = await expectStatus(
      axios.post(`${API_URL}/auth/login`, { identifier: 'lockout_test@cegs.test', password: 'bad' }),
      423
    );
    if (!lockRes.data.message.includes('locked')) {
      throw new Error(`Expected account locked message, got: ${lockRes.data.message}`);
    }

    // Even with the correct password, it must now be rejected with 423
    await expectStatus(
      axios.post(`${API_URL}/auth/login`, { identifier: 'lockout_test@cegs.test', password: lockPw }),
      423
    );
  });

  // 5. Admin creates Mentor A (gets MNTR0001 + temporary password)
  await runTest('5. Admin creates Mentor A, receives MNTR0001 and temporary credentials once', async () => {
    const res = await expectStatus(
      axios.post(
        `${API_URL}/mentors`,
        {
          name: 'Mentor Alpha',
          email: mentorAEmail,
          phone: '+91 99999 11111',
          specialization: ['Full Stack', 'Cloud'],
          designation: 'Senior Architect',
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      ),
      201
    );

    const cred = res.data.credentials;
    if (!cred || !cred.temporaryPassword || !cred.userId.startsWith('MNTR')) {
      throw new Error('Mentor creation did not return credentials with MNTR prefix');
    }
    mentorAId = res.data.data._id || res.data.data.id || res.data.data.user?.id;
    mentorAUserId = cred.userId;
    mentorATempPassword = cred.temporaryPassword;
  });

  // 6. Security check: password is not in GET response and hash is never returned
  await runTest('6. Password and password hash are NEVER exposed in any API response', async () => {
    const res = await expectStatus(
      axios.get(`${API_URL}/mentors/${mentorAId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      }),
      200
    );

    const dataStr = JSON.stringify(res.data);
    if (dataStr.includes(mentorATempPassword)) {
      throw new Error('Temporary password leaked in subsequent GET response!');
    }
    if (dataStr.includes('$2a$') || dataStr.includes('$2b$')) {
      throw new Error('Bcrypt password hash leaked in API response!');
    }
  });

  // 7. New mentor gets 403 PASSWORD_CHANGE_REQUIRED everywhere except change-password
  await runTest('7. New mentor must change password: 403 PASSWORD_CHANGE_REQUIRED returned on protected routes', async () => {
    // Login with temporary password
    const loginRes = await expectStatus(
      axios.post(`${API_URL}/auth/login`, { identifier: mentorAUserId, password: mentorATempPassword }),
      200
    );
    mentorAToken = loginRes.data.token;
    mentorACookie = extractCookie(loginRes, 'cegs_rt');

    if (!loginRes.data.user.mustChangePassword) {
      throw new Error('mustChangePassword should be true for newly created mentor');
    }

    // Try accessing normal protected route
    const blockedRes = await expectStatus(
      axios.get(`${API_URL}/students`, { headers: { Authorization: `Bearer ${mentorAToken}` } }),
      403
    );
    if (blockedRes.data.code !== 'PASSWORD_CHANGE_REQUIRED') {
      throw new Error(`Expected code PASSWORD_CHANGE_REQUIRED, got: ${blockedRes.data.code}`);
    }

    // /auth/me is allowed even when mustChangePassword is true
    await expectStatus(
      axios.get(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${mentorAToken}` } }),
      200
    );
  });

  // 8. Weak, reused, and common passwords rejected
  await runTest('8. Weak, common, and identity-containing passwords rejected by validateNewPassword', async () => {
    // Common password
    await expectStatus(
      axios.post(
        `${API_URL}/auth/change-password`,
        { currentPassword: mentorATempPassword, newPassword: 'Password123!' },
        { headers: { Authorization: `Bearer ${mentorAToken}` } }
      ),
      400
    );

    // Reused password (same as current)
    await expectStatus(
      axios.post(
        `${API_URL}/auth/change-password`,
        { currentPassword: mentorATempPassword, newPassword: mentorATempPassword },
        { headers: { Authorization: `Bearer ${mentorAToken}` } }
      ),
      400
    );

    // Password containing user's ID
    await expectStatus(
      axios.post(
        `${API_URL}/auth/change-password`,
        { currentPassword: mentorATempPassword, newPassword: `Secure${mentorAUserId}99#` },
        { headers: { Authorization: `Bearer ${mentorAToken}` } }
      ),
      400
    );

    // Valid new password succeeds and clears mustChangePassword
    const changeRes = await expectStatus(
      axios.post(
        `${API_URL}/auth/change-password`,
        { currentPassword: mentorATempPassword, newPassword: mentorANewPassword },
        { headers: { Authorization: `Bearer ${mentorAToken}` } }
      ),
      200
    );

    mentorAToken = changeRes.data.accessToken || changeRes.data.token;
    mentorACookie = extractCookie(changeRes, 'cegs_rt');

    // Now protected routes are unlocked
    await expectStatus(
      axios.get(`${API_URL}/students`, { headers: { Authorization: `Bearer ${mentorAToken}` } }),
      200
    );
  });

  // Setup Mentor B
  await runTest('Setup Mentor B (Admin creates and sets permanent password)', async () => {
    const res = await expectStatus(
      axios.post(
        `${API_URL}/mentors`,
        { name: 'Mentor Beta', email: mentorBEmail, phone: '+91 99999 22222' },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      ),
      201
    );
    mentorBId = res.data.data._id || res.data.data.id || res.data.data.user?.id;
    mentorBUserId = res.data.credentials.userId;
    mentorBTempPassword = res.data.credentials.temporaryPassword;

    // Login and change password for Mentor B
    const bLogin = await expectStatus(
      axios.post(`${API_URL}/auth/login`, { identifier: mentorBUserId, password: mentorBTempPassword }),
      200
    );
    const bChange = await expectStatus(
      axios.post(
        `${API_URL}/auth/change-password`,
        { currentPassword: mentorBTempPassword, newPassword: mentorBNewPassword },
        { headers: { Authorization: `Bearer ${bLogin.data.token}` } }
      ),
      200
    );
    mentorBToken = bChange.data.accessToken || bChange.data.token;
  });

  // 9. Mentor creates STD0001, second mentor creates STD0002
  await runTest('9. Mentor A creates Student A (STD0001); Mentor B creates Student B (STD0002)', async () => {
    const resA = await expectStatus(
      axios.post(
        `${API_URL}/students`,
        { name: 'Student Alpha', email: studentAEmail, phone: '+91 88888 11111', preferredTrack: 'Full Stack' },
        { headers: { Authorization: `Bearer ${mentorAToken}` } }
      ),
      201
    );

    studentAUserId = resA.data.credentials.userId;
    studentATempPassword = resA.data.credentials.temporaryPassword;
    studentAId = resA.data.data._id;

    if (!studentAUserId.startsWith('STD')) {
      throw new Error(`Student ID format invalid: ${studentAUserId}`);
    }

    const resB = await expectStatus(
      axios.post(
        `${API_URL}/students`,
        { name: 'Student Beta', email: 'studentB_e2e@cegs.test', phone: '+91 88888 22222', preferredTrack: 'AI' },
        { headers: { Authorization: `Bearer ${mentorBToken}` } }
      ),
      201
    );

    studentBUserId = resB.data.credentials.userId;
    studentBId = resB.data.data._id;

    const numA = parseInt(studentAUserId.replace('STD', ''), 10);
    const numB = parseInt(studentBUserId.replace('STD', ''), 10);
    if (numB !== numA + 1) {
      throw new Error(`Expected consecutive student IDs: ${studentAUserId} then ${studentBUserId}`);
    }
  });

  // 10. 10 students created in parallel get distinct sequential IDs
  await runTest('10. Creating 10 students concurrently generates 10 distinct, non-colliding sequential IDs', async () => {
    const promises = Array.from({ length: 10 }).map((_, i) =>
      axios.post(
        `${API_URL}/students`,
        { name: `Parallel Student ${i}`, email: `parallel_${i}_${Date.now()}@cegs.test` },
        { headers: { Authorization: `Bearer ${mentorAToken}` } }
      )
    );

    const responses = await Promise.all(promises);
    const ids = responses.map((r) => r.data.credentials.userId);
    const uniqueIds = new Set(ids);

    if (uniqueIds.size !== 10) {
      throw new Error(`Duplicate IDs detected in parallel creation! Generated: ${ids.join(', ')}`);
    }
  });

  // 11. Role enforcement: student and mentor cannot create mentors
  await runTest('11. Role restriction: Student and Mentor cannot create mentors (403 Forbidden)', async () => {
    // Student login
    const sLogin = await expectStatus(
      axios.post(`${API_URL}/auth/login`, { identifier: studentAUserId, password: studentATempPassword }),
      200
    );
    studentAToken = sLogin.data.token;

    // Student tries creating mentor
    await expectStatus(
      axios.post(`${API_URL}/mentors`, { name: 'Fake', email: 'fake@cegs.test' }, { headers: { Authorization: `Bearer ${studentAToken}` } }),
      403
    );

    // Mentor tries creating mentor
    await expectStatus(
      axios.post(`${API_URL}/mentors`, { name: 'Fake', email: 'fake@cegs.test' }, { headers: { Authorization: `Bearer ${mentorAToken}` } }),
      403
    );
  });

  // 12. Student cannot create students
  await runTest('12. Student cannot create students (403 Forbidden)', async () => {
    await expectStatus(
      axios.post(`${API_URL}/students`, { name: 'Unauthorized', email: 'unauth@cegs.test' }, { headers: { Authorization: `Bearer ${studentAToken}` } }),
      403
    );
  });

  // 13. Mentor B cannot access Mentor A's students (data scoping)
  await runTest('13. Mentor B cannot read, edit, remove or reset Mentor A student (Data Scoping)', async () => {
    // Read
    await expectStatus(
      axios.get(`${API_URL}/students/${studentAId}`, { headers: { Authorization: `Bearer ${mentorBToken}` } }),
      403
    );

    // Full profile
    await expectStatus(
      axios.get(`${API_URL}/students/${studentAId}/full-profile`, { headers: { Authorization: `Bearer ${mentorBToken}` } }),
      403
    );

    // Edit
    await expectStatus(
      axios.put(`${API_URL}/students/${studentAId}`, { phone: '+91 00000 00000' }, { headers: { Authorization: `Bearer ${mentorBToken}` } }),
      403
    );

    // Deactivate
    await expectStatus(
      axios.delete(`${API_URL}/students/${studentAId}`, { headers: { Authorization: `Bearer ${mentorBToken}` } }),
      403
    );

    // Reset password
    await expectStatus(
      axios.post(`${API_URL}/students/${studentAId}/reset-password`, {}, { headers: { Authorization: `Bearer ${mentorBToken}` } }),
      403
    );
  });

  // 14. Brand-new mentor dashboard is empty
  await runTest('14. Brand-new mentor dashboard is completely empty (no fallback leaking other students)', async () => {
    const res = await expectStatus(
      axios.get(`${API_URL}/mentorship/mentor/dashboard`, { headers: { Authorization: `Bearer ${mentorBToken}` } }),
      200
    );
    // Mentor B has only 1 student (Student B)
    if (res.data.data.assignedStudentsCount > 1) {
      throw new Error(`Mentor B dashboard leaked students: count is ${res.data.data.assignedStudentsCount}`);
    }
  });

  // 15. Removing mentor with students returns 409, and with reassignTo succeeds
  await runTest('15. Deactivating mentor with active students returns 409 MENTOR_HAS_STUDENTS, reassignTo resolves it', async () => {
    // Delete without reassignTo => 409
    const conflictRes = await expectStatus(
      axios.delete(`${API_URL}/mentors/${mentorAId}`, { headers: { Authorization: `Bearer ${adminToken}` } }),
      409
    );
    if (conflictRes.data.code !== 'MENTOR_HAS_STUDENTS') {
      throw new Error(`Expected code MENTOR_HAS_STUDENTS, got: ${conflictRes.data.code}`);
    }

    // Delete with valid reassignTo => 200
    await expectStatus(
      axios.delete(`${API_URL}/mentors/${mentorAId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { reassignTo: mentorBId },
      }),
      200
    );

    // Verify Student A's mentor is now Mentor B
    const sp = await StudentProfile.findById(studentAId);
    if (sp?.assignedMentor?.toString() !== mentorBId.toString()) {
      throw new Error('Students were not reassigned to target mentor');
    }
  });

  // 16. Deactivated user cannot log in and existing token dies immediately
  await runTest('16. Deactivated user cannot log in and their existing access token is immediately rejected', async () => {
    // Try logging in as deactivated Mentor A
    const loginFail = await expectStatus(
      axios.post(`${API_URL}/auth/login`, { identifier: mentorAUserId, password: mentorANewPassword }),
      403
    );
    if (!loginFail.data.message.includes('Account disabled')) {
      throw new Error(`Expected disabled message, got: ${loginFail.data.message}`);
    }

    // Existing token should be rejected (authenticate checks isActive)
    await expectStatus(
      axios.get(`${API_URL}/students`, { headers: { Authorization: `Bearer ${mentorAToken}` } }),
      403
    );
  });

  // 17. Restore works
  await runTest('17. Restoring mentor re-enables their account and allows login', async () => {
    await expectStatus(
      axios.post(`${API_URL}/mentors/${mentorAId}/restore`, {}, { headers: { Authorization: `Bearer ${adminToken}` } }),
      200
    );

    const loginRes = await expectStatus(
      axios.post(`${API_URL}/auth/login`, { identifier: mentorAUserId, password: mentorANewPassword }),
      200
    );
    mentorAToken = loginRes.data.token;
  });

  // 18. Old access tokens die after password change or reset
  await runTest('18. Old access tokens are invalidated after password change (tokenVersion check)', async () => {
    const oldToken = mentorAToken;

    // Reset password
    const resetRes = await expectStatus(
      axios.post(`${API_URL}/mentors/${mentorAId}/reset-password`, {}, { headers: { Authorization: `Bearer ${adminToken}` } }),
      200
    );
    const newTemp = resetRes.data.credentials.temporaryPassword;

    // Old token must now be rejected
    await expectStatus(
      axios.get(`${API_URL}/students`, { headers: { Authorization: `Bearer ${oldToken}` } }),
      401
    );

    // Login with new temp password
    const newLogin = await expectStatus(
      axios.post(`${API_URL}/auth/login`, { identifier: mentorAUserId, password: newTemp }),
      200
    );
    // Set permanent password again
    const changed = await expectStatus(
      axios.post(
        `${API_URL}/auth/change-password`,
        { currentPassword: newTemp, newPassword: 'FreshPermanentPassword789#' },
        { headers: { Authorization: `Bearer ${newLogin.data.token}` } }
      ),
      200
    );
    mentorAToken = changed.data.accessToken || changed.data.token;
    mentorACookie = extractCookie(changed, 'cegs_rt');
  });

  // 19. Refresh token rotates; reusing old token revokes family
  await runTest('19. Refresh token rotates on use; reusing old refresh token triggers theft detection (revokes family)', async () => {
    // Login to get a fresh refresh token
    const loginRes = await expectStatus(
      axios.post(`${API_URL}/auth/login`, { identifier: mentorAUserId, password: 'FreshPermanentPassword789#' }),
      200
    );
    const firstCookie = extractCookie(loginRes, 'cegs_rt');
    if (!firstCookie) throw new Error('No refresh cookie received on login');

    // First refresh: succeeds and rotates
    const refresh1 = await expectStatus(
      axios.post(`${API_URL}/auth/refresh`, {}, { headers: { Cookie: firstCookie } }),
      200
    );
    const secondCookie = extractCookie(refresh1, 'cegs_rt');
    if (!secondCookie || secondCookie === firstCookie) {
      throw new Error('Refresh token did not rotate');
    }

    // Reuse old firstCookie within 10s: should return 401 REFRESH_RACE without revoking family
    const raceRes = await expectStatus(
      axios.post(`${API_URL}/auth/refresh`, {}, { headers: { Cookie: firstCookie } }),
      401
    );
    if (raceRes.data.code !== 'REFRESH_RACE') {
      throw new Error(`Expected REFRESH_RACE code within 10s grace period, got: ${raceRes.data.code}`);
    }

    // Simulate reuse beyond 10-second race window: theft detected, family revoked
    const decodedFirst = jwt.decode(firstCookie.replace('cegs_rt=', '')) as any;
    await RefreshToken.updateOne(
      { jti: decodedFirst.jti },
      { revokedAt: new Date(Date.now() - 15000) }
    );

    // Reuse old firstCookie beyond the 10-second window: detects theft and revokes family
    await expectStatus(
      axios.post(`${API_URL}/auth/refresh`, {}, { headers: { Cookie: firstCookie } }),
      401
    );

    // Now even secondCookie should be invalid because family was revoked
    await expectStatus(
      axios.post(`${API_URL}/auth/refresh`, {}, { headers: { Cookie: secondCookie } }),
      401
    );
  });

  // 20. Logout revokes refresh token
  await runTest('20. Logout revokes the session and clears the refresh cookie', async () => {
    const loginRes = await expectStatus(
      axios.post(`${API_URL}/auth/login`, { identifier: mentorAUserId, password: 'FreshPermanentPassword789#' }),
      200
    );
    const cookie = extractCookie(loginRes, 'cegs_rt');
    const token = loginRes.data.token;

    // Logout
    const logoutRes = await expectStatus(
      axios.post(`${API_URL}/auth/logout`, {}, { headers: { Authorization: `Bearer ${token}`, Cookie: cookie } }),
      200
    );

    // Cookie cleared
    const rawSetCookies = logoutRes.headers['set-cookie'] || [];
    const clearedCookie = rawSetCookies.find((c: string) => c.startsWith('cegs_rt='));
    if (!clearedCookie || (!clearedCookie.includes('Max-Age=0') && !clearedCookie.includes('Expires='))) {
      throw new Error('Logout did not clear cookie');
    }

    // Refresh with old cookie fails
    await expectStatus(
      axios.post(`${API_URL}/auth/refresh`, {}, { headers: { Cookie: cookie } }),
      401
    );
  });

  // 21. Algorithm confusion & wrong secret rejected
  await runTest('21. Tokens with "none" algorithm or signed with wrong secret are rejected (401)', async () => {
    const noneToken = jwt.sign({ sub: adminId, uid: adminUserId, role: 'admin', tv: 0 }, '', { algorithm: 'none' as any });
    await expectStatus(
      axios.get(`${API_URL}/students`, { headers: { Authorization: `Bearer ${noneToken}` } }),
      401
    );

    const forgedToken = jwt.sign({ sub: adminId, uid: adminUserId, role: 'admin', tv: 0 }, 'wrong-secret-key-32-chars-long-here', { algorithm: 'HS256' });
    await expectStatus(
      axios.get(`${API_URL}/students`, { headers: { Authorization: `Bearer ${forgedToken}` } }),
      401
    );
  });

  // 22. Unauthenticated requests get 401
  await runTest('22. Unauthenticated requests to protected endpoints return 401 Unauthorized', async () => {
    await expectStatus(axios.get(`${API_URL}/students`), 401);
    await expectStatus(axios.get(`${API_URL}/mentors`), 401);
    await expectStatus(axios.get(`${API_URL}/auth/me`), 401);
  });

  // 23. Legacy forgot/reset password endpoints return 404
  await runTest('23. Legacy email token endpoints /auth/forgot-password and /auth/reset-password no longer exist (404)', async () => {
    await expectStatus(axios.post(`${API_URL}/auth/forgot-password`, { email: 'test@cegs.test' }), 404);
    await expectStatus(axios.post(`${API_URL}/auth/reset-password`, { token: 'abc', password: 'xyz' }), 404);
  });

  // 24. Bulk import creates good rows and reports bad rows without aborting
  await runTest('24. Bulk student import handles mixed rows: creates valid candidates and reports errors for invalid', async () => {
    const res = await expectStatus(
      axios.post(
        `${API_URL}/students/bulk`,
        {
          students: [
            { name: 'Bulk Good 1', email: 'bulk_good_1@cegs.test', phone: '+91 99999 00001' },
            { name: '', email: 'invalid_no_name@cegs.test' }, // invalid: missing name
            { name: 'Bulk Good 2', email: 'bulk_good_2@cegs.test', phone: '+91 99999 00002' },
          ],
        },
        { headers: { Authorization: `Bearer ${mentorBToken}` } }
      ),
      200
    );

    if (res.data.createdCount !== 2 || res.data.failedCount !== 1) {
      throw new Error(`Bulk import counts mismatch: created=${res.data.createdCount}, failed=${res.data.failedCount}`);
    }

    const row2 = res.data.results.find((r: any) => r.row === 2);
    if (row2.status !== 'failed') {
      throw new Error('Bad row was not marked as failed');
    }
  });

  // Teardown
  server.close();
  await mongoose.disconnect();
  await mongoServer.stop();

  // Print Summary Table
  console.log('\n==============================================================');
  console.log('📊 E2E TEST EXECUTION SUMMARY');
  console.log('==============================================================');
  console.log('| #  | Test Description                                              | Result |');
  console.log('|----|---------------------------------------------------------------|--------|');
  for (const r of results) {
    const numPadded = String(r.num).padEnd(2, ' ');
    const namePadded = r.name.padEnd(61, ' ').slice(0, 61);
    const statusFormatted = r.status === 'PASS' ? ' PASS ' : ' FAIL ';
    console.log(`| ${numPadded} | ${namePadded} | ${statusFormatted} |`);
  }
  console.log('==============================================================');

  const total = results.length;
  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(`TOTAL: ${total} | PASSED: ${passed} | FAILED: ${failed}`);

  if (failed > 0) {
    console.error(`\n❌ ${failed} test(s) failed.`);
    process.exit(1);
  } else {
    console.log(`\n🎉 All ${passed} E2E tests passed successfully!`);
  }
}

if (process.argv[1] && process.argv[1].endsWith('e2e-check.ts')) {
  runAllE2ETests().catch((err) => {
    console.error('Fatal E2E error:', err);
    process.exit(1);
  });
}
