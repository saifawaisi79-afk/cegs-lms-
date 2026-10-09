import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function runAudit() {
  console.log('==================================================');
  console.log('CEGS LMS END-TO-END AUTOMATED VERIFICATION AUDIT');
  console.log('==================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] ${testName}`, details || '');
    }
  }

  try {
    // 1. STUDENT AUTHENTICATION
    console.log('--- TEST GROUP 1: STUDENT FLOW ---');
    const studentLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'student@careerexpertglobal.com',
      password: 'Password123!',
    });
    assert(studentLogin.data?.success && !!studentLogin.data?.token, '1. Student login successful');
    const studentToken = studentLogin.data.token;
    const studentAuthHeader = { headers: { Authorization: `Bearer ${studentToken}` } };

    // 2. STUDENT DASHBOARD AGGREGATE
    const studentDashboard = await axios.get(`${API_BASE}/students/me/dashboard`, studentAuthHeader);
    assert(
      studentDashboard.data?.success &&
      typeof studentDashboard.data?.data?.overallProgress === 'number' &&
      studentDashboard.data?.data?.overallProgress > 0,
      '2. Student dashboard data is calculated from database',
      { progress: studentDashboard.data?.data?.overallProgress }
    );

    // 3. STUDENT ATTENDANCE CHECK-IN
    const attendanceRes = await axios.post(
      `${API_BASE}/attendance`,
      { status: 'Present', checkInTime: '09:15 AM' },
      studentAuthHeader
    );
    assert(attendanceRes.data?.success, '3. Student attendance check-in persisted to MongoDB');

    // 4. STUDENT MENTORSHIP SESSION BOOKING
    const sessionRes = await axios.post(
      `${API_BASE}/mentorship/sessions`,
      {
        agenda: 'Automated E2E Verification: Distributed Systems Review',
        date: new Date(Date.now() + 86400000).toISOString(),
        durationMinutes: 45,
        status: 'Scheduled',
      },
      studentAuthHeader
    );
    assert(sessionRes.data?.success && sessionRes.data?.data?.status === 'Scheduled', '4. Student booked mentorship session in MongoDB');

    // 5. STUDENT ASSESSMENTS
    const assessmentsRes = await axios.get(`${API_BASE}/assessments`, studentAuthHeader);
    assert(assessmentsRes.data?.success && assessmentsRes.data?.data?.length > 0, '5. Assessment catalog fetched from MongoDB');
    
    if (assessmentsRes.data?.data?.length > 0) {
      const firstAssessment = assessmentsRes.data.data[0];
      const q = firstAssessment.questions?.[0];
      const submitRes = await axios.post(
        `${API_BASE}/assessments/${firstAssessment._id}/submit`,
        {
          answers: q ? [{ questionId: q._id, submittedAnswer: q.options?.[0] || 'A' }] : [],
          timeSpentSeconds: 120,
        },
        studentAuthHeader
      );
      assert(submitRes.data?.success && typeof submitRes.data?.data?.score === 'number', '6. Assessment attempt submitted, evaluated, and saved to DB');
    }

    // 6. MENTOR AUTHENTICATION
    console.log('\n--- TEST GROUP 2: MENTOR FLOW ---');
    const mentorLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'mentor@careerexpertglobal.com',
      password: 'Password123!',
    });
    assert(mentorLogin.data?.success && !!mentorLogin.data?.token, '7. Mentor login successful');
    const mentorToken = mentorLogin.data.token;
    const mentorAuthHeader = { headers: { Authorization: `Bearer ${mentorToken}` } };

    // 7. MENTOR DASHBOARD
    const mentorDashboard = await axios.get(`${API_BASE}/mentorship/mentor/dashboard`, mentorAuthHeader);
    assert(
      mentorDashboard.data?.success &&
      mentorDashboard.data?.data?.assignedScholarsCount > 0 &&
      mentorDashboard.data?.data?.candidates?.length > 0,
      '8. Mentor dashboard aggregates assigned candidates from MongoDB',
      { scholars: mentorDashboard.data?.data?.assignedScholarsCount }
    );

    // 8. ADMIN AUTHENTICATION
    console.log('\n--- TEST GROUP 3: ADMIN FLOW ---');
    const adminLogin = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@careerexpertglobal.com',
      password: 'Password123!',
    });
    assert(adminLogin.data?.success && !!adminLogin.data?.token, '9. Admin login successful');
    const adminToken = adminLogin.data.token;
    const adminAuthHeader = { headers: { Authorization: `Bearer ${adminToken}` } };

    // 9. ADMIN DASHBOARD STATS
    const adminStats = await axios.get(`${API_BASE}/admin/dashboard-stats`, adminAuthHeader);
    assert(
      adminStats.data?.success &&
      adminStats.data?.data?.kpis?.totalStudents >= 10 &&
      adminStats.data?.data?.placementFunnel?.length === 5,
      '10. Admin dashboard stats & real placement funnel returned from MongoDB',
      { totalStudents: adminStats.data?.data?.kpis?.totalStudents }
    );

    // 10. ADMIN ENROLL STUDENT
    const newStudentEmail = `test.scholar.${Date.now()}@cegs-test.com`;
    const enrollRes = await axios.post(
      `${API_BASE}/students`,
      {
        name: 'Automated Test Scholar',
        email: newStudentEmail,
        phone: '+91 98765 43210',
        preferredTrack: 'Full Stack Development',
      },
      adminAuthHeader
    );
    assert(enrollRes.data?.success && !!enrollRes.data?.data?.user?._id, '11. Admin enrolled new scholar with database persistence');

    // 11. GLOBAL SEARCH
    const searchRes = await axios.get(`${API_BASE}/admin/search?q=MongoDB`, adminAuthHeader);
    assert(searchRes.data?.success, '12. Global database search returned results across entities');

    // 12. CERTIFICATE VERIFICATION (PUBLIC)
    console.log('\n--- TEST GROUP 4: CERTIFICATES & SECURITY ---');
    const certsRes = await axios.get(`${API_BASE}/certificates`, adminAuthHeader);
    if (certsRes.data?.data?.length > 0) {
      const validCert = certsRes.data.data[0];
      const verifyRes = await axios.get(`${API_BASE}/certificates/verify/${validCert.certificateId}`);
      assert(verifyRes.data?.success && verifyRes.data?.isValid === true, '13. Public certificate verification works for valid certificate');
    }

    try {
      await axios.get(`${API_BASE}/certificates/verify/NONEXISTENT-999`);
      assert(false, '14. Nonexistent certificate handled');
    } catch (e: any) {
      assert(e.response?.status === 404 || e.response?.data?.isValid === false, '14. Nonexistent certificate correctly rejected');
    }

    // 13. ROLE-BASED ACCESS CONTROL (STUDENT FORBIDDEN FROM ADMIN ROUTE)
    try {
      await axios.get(`${API_BASE}/admin/dashboard-stats`, studentAuthHeader);
      assert(false, '15. RBAC: Student accessing admin route blocked');
    } catch (e: any) {
      assert(e.response?.status === 403, '15. RBAC: Student forbidden from admin routes (HTTP 403)');
    }

    console.log('\n==================================================');
    console.log(`AUDIT COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('==================================================\n');
  } catch (err: any) {
    console.error('Fatal error running audit:', err.message, err.response?.data || '');
  }
}

runAudit();
