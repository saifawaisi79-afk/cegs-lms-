import axios from 'axios';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { AddressInfo } from 'net';

const results: { name: string; status: 'PASS' | 'FAIL'; error?: string }[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, status: 'PASS' });
    console.log(`✅ PASS: ${name}`);
  } catch (err: any) {
    results.push({ name, status: 'FAIL', error: err.message });
    console.error(`❌ FAIL: ${name} -`, err.message);
  }
}

async function expectStatus(promise: Promise<any>, status: number) {
  try {
    const res = await promise;
    throw new Error(`Expected request to fail with status ${status}, but it succeeded with status ${res.status}.`);
  } catch (err: any) {
    if (err.message.includes('Expected request to fail')) throw err;
    if (err.response?.status !== status) {
      throw new Error(`Expected status ${status}, got ${err.response?.status}`);
    }
  }
}

async function runE2E() {
  process.env.USE_MEMORY_DB = 'true';
  process.env.PORT = '0';
  
  console.log('--- STARTING E2E CHECKS (MEMORY DB) ---');
  const mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();

  // Dynamically import to ensure ENV picks up overridden process.env
  const { startServer } = await import('../index.js');
  const { User } = await import('../models/User.js');
  const { StudentProfile } = await import('../models/Profiles.js');
  const { Project, Task, ProjectFile } = await import('../models/Project.js');
  const { Offer } = await import('../models/Placement.js');
  const { Conversation, Message } = await import('../models/Communication.js');

  const server = await startServer();
  const port = (server.address() as AddressInfo).port;
  const API_URL = `http://localhost:${port}/api`;

  let adminId: any, student1Id: any, student2Id: any, mentorId: any;
  let student1ProfileId: any, student2ProfileId: any;
  let adminToken: any, student1Token: any, student2Token: any, mentorToken: any;
  let projectId: any, task1Id: any, task2Id: any, offerId: any, conversationId: any;

  try {
    // 1. Setup specific users for tests
    const admin = await User.create({ name: 'E2E Admin', email: 'admin_e2e@test.com', password: 'password', role: 'admin', isActive: true });
    adminId = admin._id;
    
    const student1 = await User.create({ name: 'E2E Student 1', email: 's1_e2e@test.com', password: 'password', role: 'student', isActive: true });
    student1Id = student1._id;
    const sp1 = await StudentProfile.create({ user: student1Id, phone: '123' });
    student1ProfileId = sp1._id;

    const student2 = await User.create({ name: 'E2E Student 2', email: 's2_e2e@test.com', password: 'password', role: 'student', isActive: true });
    student2Id = student2._id;
    const sp2 = await StudentProfile.create({ user: student2Id, phone: '456' });
    student2ProfileId = sp2._id;

    const mentor = await User.create({ name: 'E2E Mentor', email: 'mentor_e2e@test.com', password: 'password', role: 'mentor', isActive: true });
    mentorId = mentor._id;

    // Login users
    adminToken = (await axios.post(`${API_URL}/auth/login`, { email: 'admin_e2e@test.com', password: 'password' })).data.token;
    student1Token = (await axios.post(`${API_URL}/auth/login`, { email: 's1_e2e@test.com', password: 'password' })).data.token;
    student2Token = (await axios.post(`${API_URL}/auth/login`, { email: 's2_e2e@test.com', password: 'password' })).data.token;
    mentorToken = (await axios.post(`${API_URL}/auth/login`, { email: 'mentor_e2e@test.com', password: 'password' })).data.token;

    // 2. Setup project & offer & conversation
    const project1 = await Project.create({ title: 'Proj 1', description: 'desc', objective: 'obj', startDate: new Date(), endDate: new Date(), teamMembers: [student1Id], status: 'Planning' });
    projectId = project1._id;

    const offer = await Offer.create({ student: student1Id, companyName: 'E2E Corp', role: 'Dev', compensation: '10 LPA', status: 'Received' });
    offerId = offer._id;
    
    const conv = await Conversation.create({ participants: [student1Id, mentorId], lastMessageAt: new Date() });
    conversationId = conv._id;

    // RUN TESTS

    await test('Unauthenticated request gets 401', async () => {
      await expectStatus(axios.get(`${API_URL}/projects`), 401);
    });

    await test('Student gets 403 on admin routes', async () => {
      await expectStatus(axios.post(`${API_URL}/students`, {}, { headers: { Authorization: `Bearer ${student1Token}` } }), 403);
    });

    await test('Student cannot read another student profile', async () => {
      await expectStatus(axios.get(`${API_URL}/students/${student2Id}`, { headers: { Authorization: `Bearer ${student1Token}` } }), 403);
    });

    await test('Mentor cannot read unassigned student profile', async () => {
      // mentor is not assigned to student1 or student2
      await expectStatus(axios.get(`${API_URL}/students/${student1Id}`, { headers: { Authorization: `Bearer ${mentorToken}` } }), 403);
    });

    await test('Student gets 403 on another student profile update', async () => {
      await expectStatus(axios.put(`${API_URL}/students/${student2ProfileId}`, { city: 'NY' }, { headers: { Authorization: `Bearer ${student1Token}` } }), 403);
    });

    await test('Mentor gets 403 on editing student profile', async () => {
      await expectStatus(axios.put(`${API_URL}/students/${student1ProfileId}`, { city: 'NY' }, { headers: { Authorization: `Bearer ${mentorToken}` } }), 403);
    });

    await test('Student cannot update another student offer', async () => {
      await expectStatus(axios.put(`${API_URL}/placement/offers/${offerId}`, { status: 'Accepted' }, { headers: { Authorization: `Bearer ${student2Token}` } }), 403);
    });

    await test('Student CAN set status on their own offer', async () => {
      const res = await axios.put(`${API_URL}/placement/offers/${offerId}`, { status: 'Accepted' }, { headers: { Authorization: `Bearer ${student1Token}` } });
      if (res.data.data.status !== 'Accepted') throw new Error('Status was not updated');
    });

    await test('Creating a task with sprintNumber works', async () => {
      const res = await axios.post(`${API_URL}/projects/tasks`, {
        title: 'New Task',
        project: projectId,
        sprintNumber: 3,
        status: 'TODO'
      }, { headers: { Authorization: `Bearer ${student1Token}` } });
      task1Id = res.data.data._id;
      if (res.data.data.sprintNumber !== 3) throw new Error('sprintNumber mismatch');
      if (res.data.data.title !== 'New Task') throw new Error('Title mismatch');
    });

    await test('Student cannot create tasks in project they are not a member of', async () => {
      await expectStatus(axios.post(`${API_URL}/projects/tasks`, {
        title: 'Task by Outsider',
        project: projectId,
        status: 'TODO'
      }, { headers: { Authorization: `Bearer ${student2Token}` } }), 403);
    });
    
    await test('Student cannot upload files to project they are not a member of', async () => {
      await expectStatus(axios.post(`${API_URL}/projects/files`, {
        projectId: projectId,
        name: 'Malicious File',
        fileUrl: 'http://test.com/file'
      }, { headers: { Authorization: `Bearer ${student2Token}` } }), 403);
    });

    await test('Student gets 403 on another project task', async () => {
      await expectStatus(axios.put(`${API_URL}/projects/tasks/${task1Id}`, { status: 'IN PROGRESS' }, { headers: { Authorization: `Bearer ${student2Token}` } }), 403);
    });

    await test('Moving task between Kanban columns works', async () => {
      let res = await axios.put(`${API_URL}/projects/tasks/${task1Id}`, { status: 'IN PROGRESS' }, { headers: { Authorization: `Bearer ${student1Token}` } });
      if (res.data.data.status !== 'IN PROGRESS') throw new Error('Status not IN PROGRESS');
      
      res = await axios.put(`${API_URL}/projects/tasks/${task1Id}`, { status: 'REVIEW' }, { headers: { Authorization: `Bearer ${student1Token}` } });
      if (res.data.data.status !== 'REVIEW') throw new Error('Status not REVIEW');
    });

    await test('Student cannot mark attendance for another student', async () => {
      await expectStatus(axios.post(`${API_URL}/attendance`, {
        studentId: student2Id,
        status: 'Present',
        checkInTime: '09:00 AM'
      }, { headers: { Authorization: `Bearer ${student1Token}` } }), 403);
    });

    await test('Student self check-in uses today date (ignores date input)', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      const res = await axios.post(`${API_URL}/attendance`, {
        date: pastDate.toISOString(),
        status: 'Present'
      }, { headers: { Authorization: `Bearer ${student1Token}` } });
      
      const savedDate = new Date(res.data.data.date);
      const today = new Date();
      if (savedDate.getDate() !== today.getDate() || savedDate.getMonth() !== today.getMonth()) {
        throw new Error(`Self check-in date was not today, got ${savedDate}`);
      }
    });

    await test('Non-participant cannot read conversation', async () => {
      await expectStatus(axios.get(`${API_URL}/communication/messages/${conversationId}`, { headers: { Authorization: `Bearer ${student2Token}` } }), 403);
    });

    await test('/admin/settings returns 403 for students and mentors', async () => {
      await expectStatus(axios.get(`${API_URL}/admin/settings`, { headers: { Authorization: `Bearer ${student1Token}` } }), 403);
      await expectStatus(axios.get(`${API_URL}/admin/settings`, { headers: { Authorization: `Bearer ${mentorToken}` } }), 403);
      await expectStatus(axios.put(`${API_URL}/admin/settings`, {}, { headers: { Authorization: `Bearer ${student1Token}` } }), 403);
    });
    
    await test('Settings PUT validates fields correctly', async () => {
      // stipendBase as string should fail if strict requires number
      await expectStatus(axios.put(`${API_URL}/admin/settings`, {
        stipendBase: "invalid_string"
      }, { headers: { Authorization: `Bearer ${adminToken}` } }), 400);

      // Save correctly
      const res = await axios.put(`${API_URL}/admin/settings`, {
        stipendBase: 16500,
        passingScore: 70
      }, { headers: { Authorization: `Bearer ${adminToken}` } });
      if (res.data.data.stipendBase !== 16500) throw new Error('stipendBase not saved');
    });

    // Generate table
    console.log('\n--- TEST RESULTS ---');
    console.table(results);

    const failures = results.filter(r => r.status === 'FAIL');
    if (failures.length > 0) process.exitCode = 1;

  } catch (err: any) {
    console.error('E2E Crash:', err);
    process.exitCode = 1;
  } finally {
    // Teardown the memory server and express
    server.close();
    await mongoose.disconnect();
    await mongoServer.stop();
    
    if (process.exitCode === 1) process.exit(1);
  }
}

runE2E();
