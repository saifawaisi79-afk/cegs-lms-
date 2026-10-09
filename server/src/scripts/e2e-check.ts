import axios from 'axios';
import mongoose from 'mongoose';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';
import { StudentProfile } from '../models/Profiles.js';

const API_URL = 'http://localhost:5000/api';

async function runE2E() {
  try {
    console.log('--- STARTING E2E CHECKS ---');
    
    // Connect DB
    await mongoose.connect(ENV.MONGODB_URI);
    console.log('Connected to DB');

    // Create Admin
    let admin = await User.findOne({ email: 'e2e_admin@example.com' });
    if (!admin) {
      admin = await User.create({
        name: 'E2E Admin',
        email: 'e2e_admin@example.com',
        password: 'admin_password_123',
        role: 'admin',
        isActive: true,
      });
    } else {
      admin.password = 'admin_password_123';
      await admin.save();
    }

    // Create Student
    let student = await User.findOne({ email: 'e2e_student@example.com' });
    if (!student) {
      student = await User.create({
        name: 'E2E Student',
        email: 'e2e_student@example.com',
        password: 'student_password_123',
        role: 'student',
        isActive: true,
      });
    } else {
      student.password = 'student_password_123';
      await student.save();
    }

    // 1. Login as Admin
    console.log('1. Logging in as Admin...');
    const adminRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'e2e_admin@example.com',
      password: 'admin_password_123',
    });
    const adminToken = adminRes.data.token;
    console.log('Admin login successful!');

    // 2. Login as Student
    console.log('2. Logging in as Student...');
    const studentRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'e2e_student@example.com',
      password: 'student_password_123',
    });
    const studentToken = studentRes.data.token;
    console.log('Student login successful!');

    // 3. Creating a project (as admin) to add a task to
    console.log('Creating a project as Admin...');
    const newProj = await axios.post(
      `${API_URL}/projects`,
      {
        title: 'E2E Test Project',
        description: 'E2E project desc',
        objective: 'Test objective',
        status: 'Planning',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
        clientOrCompany: 'Internal',
        technologies: ['Node.js'],
        teamMembers: [studentRes.data.user.id],
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    let projectId = newProj.data.data._id;
    console.log('Created new project:', projectId);

    // 4. Create a task (as student)
    console.log('4. Creating a task as Student...');
    const taskRes = await axios.post(
      `${API_URL}/projects/tasks`,
      {
        title: 'E2E Test Task',
        project: projectId,
        description: 'Test task description',
        status: 'TODO',
      },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    console.log('Task created successfully!', taskRes.data.data._id);

    // 5. Viewing attendance
    console.log('5. Viewing attendance as Student...');
    const attendanceRes = await axios.get(`${API_URL}/attendance/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log('Attendance viewed successfully! Records count:', attendanceRes.data.data.records.length);

    console.log('--- ALL E2E CHECKS PASSED ---');
  } catch (err: any) {
    console.error('--- E2E CHECK FAILED ---');
    if (err.response) {
      console.error('Response Error:', err.response.status, err.response.data);
    } else {
      console.error(err.message);
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runE2E();
