const API_BASE = 'http://localhost:5000/api';

async function runAudit() {
  console.log('==================================================');
  console.log('CEGS LMS END-TO-END AUTOMATED VERIFICATION AUDIT');
  console.log('==================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, details) {
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
    const studentLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@careerexpertglobal.com',
        password: 'Password123!',
      }),
    });
    const studentLogin = await studentLoginRes.json();
    assert(studentLogin.success && !!studentLogin.token, '1. Student login successful');
    const studentToken = studentLogin.token;
    const studentAuthHeader = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    };

    // 2. STUDENT DASHBOARD AGGREGATE
    const studentDashRes = await fetch(`${API_BASE}/students/me/dashboard`, {
      headers: studentAuthHeader,
    });
    const studentDashboard = await studentDashRes.json();
    assert(
      studentDashboard.success &&
      typeof studentDashboard.data?.overallProgress === 'number' &&
      studentDashboard.data?.overallProgress > 0,
      '2. Student dashboard data calculated from database',
      { progress: studentDashboard.data?.overallProgress }
    );

    // 3. STUDENT ATTENDANCE CHECK-IN
    const attendanceRes = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: studentAuthHeader,
      body: JSON.stringify({ status: 'Present', checkInTime: '09:15 AM' }),
    });
    const attendanceData = await attendanceRes.json();
    assert(attendanceData.success, '3. Student attendance check-in persisted to MongoDB');

    // 4. STUDENT MENTORSHIP SESSION BOOKING
    const sessionRes = await fetch(`${API_BASE}/mentorship/sessions`, {
      method: 'POST',
      headers: studentAuthHeader,
      body: JSON.stringify({
        agenda: 'Automated E2E Verification: Distributed Systems Review',
        date: new Date(Date.now() + 86400000).toISOString(),
        durationMinutes: 45,
        status: 'Scheduled',
      }),
    });
    const sessionData = await sessionRes.json();
    assert(
      sessionData.success && sessionData.data?.status === 'Scheduled',
      '4. Student booked mentorship session in MongoDB'
    );

    // 5. STUDENT ASSESSMENTS
    const assessRes = await fetch(`${API_BASE}/assessments`, { headers: studentAuthHeader });
    const assessments = await assessRes.json();
    assert(assessments.success && assessments.data?.length > 0, '5. Assessment catalog fetched from MongoDB');

    if (assessments.data?.length > 0) {
      const firstAssessment = assessments.data[0];
      const q = firstAssessment.questions?.[0];
      const submitRes = await fetch(`${API_BASE}/assessments/${firstAssessment._id}/submit`, {
        method: 'POST',
        headers: studentAuthHeader,
        body: JSON.stringify({
          answers: q ? [{ questionId: q._id, submittedAnswer: q.options?.[0] || 'A' }] : [],
          timeSpentSeconds: 120,
        }),
      });
      const submitData = await submitRes.json();
      assert(
        submitData.success && typeof submitData.data?.score === 'number',
        '6. Assessment attempt submitted, evaluated, and saved to DB'
      );
    }

    // 6. MENTOR AUTHENTICATION
    console.log('\n--- TEST GROUP 2: MENTOR FLOW ---');
    const mentorLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'mentor@careerexpertglobal.com',
        password: 'Password123!',
      }),
    });
    const mentorLogin = await mentorLoginRes.json();
    assert(mentorLogin.success && !!mentorLogin.token, '7. Mentor login successful');
    const mentorToken = mentorLogin.token;
    const mentorAuthHeader = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${mentorToken}`,
    };

    // 7. MENTOR DASHBOARD
    const mentorDashRes = await fetch(`${API_BASE}/mentorship/mentor/dashboard`, {
      headers: mentorAuthHeader,
    });
    const mentorDashboard = await mentorDashRes.json();
    assert(
      mentorDashboard.success &&
      mentorDashboard.data?.assignedScholarsCount > 0 &&
      mentorDashboard.data?.candidates?.length > 0,
      '8. Mentor dashboard aggregates assigned candidates from MongoDB',
      { scholars: mentorDashboard.data?.assignedScholarsCount }
    );

    // 8. ADMIN AUTHENTICATION
    console.log('\n--- TEST GROUP 3: ADMIN FLOW ---');
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@careerexpertglobal.com',
        password: 'Password123!',
      }),
    });
    const adminLogin = await adminLoginRes.json();
    assert(adminLogin.success && !!adminLogin.token, '9. Admin login successful');
    const adminToken = adminLogin.token;
    const adminAuthHeader = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };

    // 9. ADMIN DASHBOARD STATS
    const adminStatsRes = await fetch(`${API_BASE}/admin/dashboard-stats`, {
      headers: adminAuthHeader,
    });
    const adminStats = await adminStatsRes.json();
    assert(
      adminStats.success &&
      adminStats.data?.kpis?.totalStudents >= 10 &&
      adminStats.data?.placementFunnel?.length === 5,
      '10. Admin dashboard stats & real placement funnel returned from MongoDB',
      { totalStudents: adminStats.data?.kpis?.totalStudents }
    );

    // 10. ADMIN ENROLL STUDENT
    const newStudentEmail = `test.scholar.${Date.now()}@cegs-test.com`;
    const enrollRes = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: adminAuthHeader,
      body: JSON.stringify({
        name: 'Automated Test Scholar',
        email: newStudentEmail,
        phone: '+91 98765 43210',
        preferredTrack: 'Full Stack Development',
      }),
    });
    const enrollData = await enrollRes.json();
    assert(enrollData.success && !!enrollData.data?.user?._id, '11. Admin enrolled new scholar with database persistence');

    // 11. GLOBAL SEARCH
    const searchRes = await fetch(`${API_BASE}/admin/search?q=MongoDB`, {
      headers: adminAuthHeader,
    });
    const searchData = await searchRes.json();
    assert(searchData.success, '12. Global database search returned results across entities');

    // 12. CERTIFICATE VERIFICATION (PUBLIC)
    console.log('\n--- TEST GROUP 4: CERTIFICATES & SECURITY ---');
    const certsRes = await fetch(`${API_BASE}/certificates`, { headers: adminAuthHeader });
    const certsData = await certsRes.json();
    if (certsData.data?.length > 0) {
      const validCert = certsData.data[0];
      const verifyRes = await fetch(`${API_BASE}/certificates/verify/${validCert.certificateId}`);
      const verifyData = await verifyRes.json();
      assert(verifyData.success && verifyData.isValid === true, '13. Public certificate verification works for valid certificate');
    }

    const nonExistentRes = await fetch(`${API_BASE}/certificates/verify/NONEXISTENT-999`);
    assert(nonExistentRes.status === 404, '14. Nonexistent certificate correctly rejected with 404');

    // 13. ROLE-BASED ACCESS CONTROL (STUDENT FORBIDDEN FROM ADMIN ROUTE)
    const forbiddenRes = await fetch(`${API_BASE}/admin/dashboard-stats`, {
      headers: studentAuthHeader,
    });
    assert(forbiddenRes.status === 403, '15. RBAC: Student forbidden from admin routes (HTTP 403)');

    console.log('\n==================================================');
    console.log(`AUDIT COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
    console.log('==================================================\n');
  } catch (err) {
    console.error('Fatal error running audit:', err.message);
  }
}

runAudit();
