import axios from 'axios';
import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/Profiles.js';
import { Project, Task } from '../models/Project.js';
import { Offer } from '../models/Placement.js';

const API_URL = `http://localhost:${ENV.PORT}/api`;
const results: { name: string; status: 'PASS' | 'FAIL'; error?: string }[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, status: 'PASS' });
    console.log(`✅ PASS: ${name}`);
  } catch (err: any) {
    results.push({ name, status: 'FAIL', error: err.response?.data?.message || err.message });
    console.error(`❌ FAIL: ${name} -`, err.response?.data?.message || err.message);
  }
}

async function runE2E() {
  let adminId: any, student1Id: any, student2Id: any, mentorId: any;
  let student1ProfileId: any, student2ProfileId: any;
  let adminToken: any, student1Token: any, student2Token: any, mentorToken: any;
  let projectId: any, task1Id: any, task2Id: any, offerId: any;

  try {
    console.log('--- STARTING E2E CHECKS ---');
    await mongoose.connect(ENV.MONGODB_URI);

    // 0. Clean up any leftover data from previous crashes
    await User.deleteMany({ email: { $in: ['admin_e2e@test.com', 's1_e2e@test.com', 's2_e2e@test.com', 'mentor_e2e@test.com'] } });
    await Project.deleteMany({ title: 'Proj 1' });
    await Offer.deleteMany({ companyName: 'E2E Corp' });

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

    // 2. Setup project & offer
    const project1 = await Project.create({ title: 'Proj 1', description: 'desc', objective: 'obj', startDate: new Date(), endDate: new Date(), teamMembers: [student1Id], status: 'Planning' });
    projectId = project1._id;

    const offer = await Offer.create({ student: student1Id, companyName: 'E2E Corp', role: 'Dev', compensation: '10 LPA', status: 'Received' });
    offerId = offer._id;
    
    // RUN TESTS

    await test('Unauthenticated request gets 401', async () => {
      await axios.get(`${API_URL}/projects`).catch(e => {
        if (e.response?.status !== 401) throw new Error('Expected 401');
      });
    });

    await test('Student gets 403 on admin routes', async () => {
      await axios.post(`${API_URL}/students`, {}, { headers: { Authorization: `Bearer ${student1Token}` } }).catch(e => {
        if (e.response?.status !== 403) throw new Error('Expected 403');
      });
    });

    await test('Student gets 403 on another student profile', async () => {
      await axios.put(`${API_URL}/students/${student2ProfileId}`, { city: 'NY' }, { headers: { Authorization: `Bearer ${student1Token}` } }).catch(e => {
        if (e.response?.status !== 403) throw new Error(`Expected 403, got ${e.response?.status}`);
      });
    });

    await test('Student gets 403 on another student offer', async () => {
      await axios.put(`${API_URL}/placement/offers/${offerId}`, { status: 'Accepted' }, { headers: { Authorization: `Bearer ${student2Token}` } }).catch(e => {
        if (e.response?.status !== 403) throw new Error('Expected 403');
      });
    });

    await test('Mentor gets 403 on editing student profile', async () => {
      await axios.put(`${API_URL}/students/${student1ProfileId}`, { city: 'NY' }, { headers: { Authorization: `Bearer ${mentorToken}` } }).catch(e => {
        if (e.response?.status !== 403) throw new Error(`Expected 403, got ${e.response?.status}`);
      });
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
    });

    await test('Student gets 403 on another project task', async () => {
      await axios.put(`${API_URL}/projects/tasks/${task1Id}`, { status: 'IN PROGRESS' }, { headers: { Authorization: `Bearer ${student2Token}` } }).catch(e => {
        if (e.response?.status !== 403) throw new Error(`Expected 403, got ${e.response?.status}`);
      });
    });

    await test('Moving task between Kanban columns works (IN PROGRESS, REVIEW)', async () => {
      await axios.put(`${API_URL}/projects/tasks/${task1Id}`, { status: 'IN PROGRESS' }, { headers: { Authorization: `Bearer ${student1Token}` } });
      await axios.put(`${API_URL}/projects/tasks/${task1Id}`, { status: 'REVIEW' }, { headers: { Authorization: `Bearer ${student1Token}` } });
      await axios.put(`${API_URL}/projects/tasks/${task1Id}`, { status: 'COMPLETED' }, { headers: { Authorization: `Bearer ${student1Token}` } });
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
    // Cleanup
    if (adminId) await User.findByIdAndDelete(adminId);
    if (student1Id) { await User.findByIdAndDelete(student1Id); await StudentProfile.findOneAndDelete({ user: student1Id }); }
    if (student2Id) { await User.findByIdAndDelete(student2Id); await StudentProfile.findOneAndDelete({ user: student2Id }); }
    if (mentorId) await User.findByIdAndDelete(mentorId);
    if (projectId) await Project.findByIdAndDelete(projectId);
    if (task1Id) await Task.findByIdAndDelete(task1Id);
    if (task2Id) await Task.findByIdAndDelete(task2Id);
    if (offerId) await Offer.findByIdAndDelete(offerId);
    
    // Fallback cleanup if variables weren't set
    await User.deleteMany({ email: { $in: ['admin_e2e@test.com', 's1_e2e@test.com', 's2_e2e@test.com', 'mentor_e2e@test.com'] } });
    await Project.deleteMany({ title: 'Proj 1' });
    
    await mongoose.disconnect();
    
    if (process.exitCode === 1) process.exit(1);
  }
}

runE2E();
