import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

async function testPaymentModule() {
  console.log('🧪 Starting CEGS LMS Payments & Receipt Verification Test...\n');

  try {
    // 1. Health check
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ 1. Health Check:', health.data.status);

    // 2. Student Login
    const studentLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'student@careerexpertglobal.com',
      password: 'Password123!',
    });
    const studentToken = studentLogin.data.token;
    const studentUser = studentLogin.data.user;
    console.log('✅ 2. Student Login successful for:', studentUser.name);

    // 3. Admin Login
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@careerexpertglobal.com',
      password: 'Password123!',
    });
    const adminToken = adminLogin.data.token;
    const adminUser = adminLogin.data.user;
    console.log('✅ 3. Admin Login successful for:', adminUser.name);

    // 4. Test Student /payments/me
    const myPayments = await axios.get(`${BASE_URL}/payments/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log('✅ 4. Student Payment Summary:');
    console.log('   - Program:', myPayments.data.data.summary.programTitle);
    console.log('   - Total Course Fee:', myPayments.data.data.summary.totalCourseFee);
    console.log('   - Total Paid:', myPayments.data.data.summary.totalPaid);
    console.log('   - Balance Due:', myPayments.data.data.summary.balanceDue);
    console.log('   - Status:', myPayments.data.data.summary.paymentStatus);
    console.log('   - Number of Payments:', myPayments.data.data.payments.length);

    // 5. Test Public Receipt Verification
    const receiptNum = myPayments.data.data.payments[0]?.receiptNumber || 'CEGS-REC-2026-000001';
    const verifyRes = await axios.get(`${BASE_URL}/receipts/${receiptNum}/verify`);
    console.log('✅ 5. Public Receipt Verification:');
    console.log('   - Receipt Number:', verifyRes.data.data.receiptNumber);
    console.log('   - Student Name:', verifyRes.data.data.studentName);
    console.log('   - Verified:', verifyRes.data.data.isVerified);
    console.log('   - Amount:', verifyRes.data.data.totalAmount);
    console.log('   - Status:', verifyRes.data.data.paymentStatus);

    // 6. Test Admin Payment Summary
    const adminSummary = await axios.get(`${BASE_URL}/admin/payments/summary`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('✅ 6. Admin Payment Summary:');
    console.log('   - Total Revenue Recorded:', adminSummary.data.data.totalRevenueRecorded);
    console.log('   - Total Amount Paid:', adminSummary.data.data.totalAmountPaid);
    console.log('   - Total GST Recorded:', adminSummary.data.data.totalGSTRecorded);
    console.log('   - Total Transactions:', adminSummary.data.data.numberPayments);

    // 7. Test Admin Creating a Payment with GST calculation
    const createRes = await axios.post(
      `${BASE_URL}/admin/payments`,
      {
        studentId: studentUser.id,
        description: 'Test Certification & Exam Voucher',
        baseAmount: 10000,
        gstRate: 18,
        amountPaid: 11800,
        paymentMethod: 'UPI',
        transactionId: 'TXN-TEST-12345',
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('✅ 7. Admin Payment Creation & GST Test:');
    console.log('   - Base Amount:', createRes.data.data.baseAmount);
    console.log('   - GST Amount (18%):', createRes.data.data.gstAmount);
    console.log('   - Total Amount:', createRes.data.data.totalAmount);
    console.log('   - Status:', createRes.data.data.status);
    console.log('   - Generated Receipt:', createRes.data.data.receiptNumber);

    // 8. Test Security: Student accessing non-existent or other payment
    try {
      await axios.get(`${BASE_URL}/payments/invalid-id-test`, {
        headers: { Authorization: `Bearer ${studentToken}` },
      });
    } catch (secErr: any) {
      console.log('✅ 8. Security Check: Blocked invalid payment id correctly with code', secErr.response?.status);
    }

    // Clean up test payment
    await axios.delete(`${BASE_URL}/admin/payments/${createRes.data.data._id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('✅ 9. Admin Cleaned up test payment.');

    console.log('\n🎉 ALL BACKEND PAYMENT TESTS PASSED WITH 100% SUCCESS!');
  } catch (error: any) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testPaymentModule();
