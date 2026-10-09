import { ENV } from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { StudentProfile, MentorProfile } from '../models/Profiles.js';
import { Program, Track, Batch, Module, Lesson } from '../models/Curriculum.js';
import { LessonProgress } from '../models/LearningProgress.js';
import { Assessment, AssessmentAttempt } from '../models/Assessment.js';
import { Attendance } from '../models/Attendance.js';
import { MentorshipSession, SWOTReview, MockInterview } from '../models/Mentorship.js';
import { Project, Task, ProjectFile } from '../models/Project.js';
import { Company, JobOpportunity, Interview, Offer } from '../models/Placement.js';
import { Certificate } from '../models/Certificate.js';
import { StipendRecord } from '../models/Stipend.js';
import { Notification, CalendarEvent, Conversation, Message } from '../models/Communication.js';
import { AuditLog } from '../models/AuditLog.js';
import { Payment } from '../models/Payment.js';
import { CourseFee } from '../models/CourseFee.js';

export const seedPaymentsIfEmpty = async () => {
  const existingPayments = await Payment.countDocuments();
  if (existingPayments > 0) return;

  console.log('💳 Seeding Initial Course Fee Configuration & Payments...');

  let fee = await CourseFee.findOne({ isActive: true });
  if (!fee) {
    fee = await CourseFee.create({
      programTitle: '6-Month Job-Ready Training Program',
      baseFee: 100000,
      gstRate: 18,
      gstAmount: 18000,
      totalFee: 118000,
      currency: 'INR',
      description: '6-Month Job-Ready Training Program Standard Tuition Fee',
      isActive: true,
    });
  }

  const student = await User.findOne({ email: 'student@careerexpertglobal.com' });
  const priya = await User.findOne({ email: 'priya.sharma@example.com' });
  const rahul = await User.findOne({ email: 'rahul.verma@example.com' });

  if (student) {
    const studentProfile = await StudentProfile.findOne({ user: student._id });

    // Payment 1: Installment 1 of 2 (Paid)
    await Payment.create({
      paymentId: 'PAY-2026-001',
      receiptNumber: 'CEGS-REC-2026-000001',
      studentId: student._id,
      studentProfile: studentProfile?._id,
      trackId: studentProfile?.track,
      batchId: studentProfile?.batch,
      description: 'Course Fee - Installment 1 of 2 (Tuition & Architecture Lab)',
      installmentNumber: 1,
      baseAmount: 50000,
      gstRate: 18,
      gstAmount: 9000,
      totalAmount: 59000,
      amountPaid: 59000,
      balanceAmount: 0,
      paymentMethod: 'Online',
      transactionId: 'TXN-HDFC-918237461',
      paymentDate: new Date('2025-10-16T10:30:00Z'),
      status: 'Paid',
      notes: 'Installment 1 paid via Net Banking. Verified by CEGS Finance Department.',
    });

    // Payment 2: Installment 2 of 2 (Paid)
    await Payment.create({
      paymentId: 'PAY-2026-002',
      receiptNumber: 'CEGS-REC-2026-000002',
      studentId: student._id,
      studentProfile: studentProfile?._id,
      trackId: studentProfile?.track,
      batchId: studentProfile?.batch,
      description: 'Course Fee - Installment 2 of 2 (Placement & Mentorship)',
      installmentNumber: 2,
      baseAmount: 50000,
      gstRate: 18,
      gstAmount: 9000,
      totalAmount: 59000,
      amountPaid: 59000,
      balanceAmount: 0,
      paymentMethod: 'UPI',
      transactionId: 'UPI-CEGS-839201948',
      paymentDate: new Date('2026-01-15T14:45:00Z'),
      status: 'Paid',
      notes: 'Installment 2 paid via UPI. Course fee fully settled.',
    });
  }

  if (priya) {
    const priyaProfile = await StudentProfile.findOne({ user: priya._id });

    // Priya Payment 1: Paid
    await Payment.create({
      paymentId: 'PAY-2026-003',
      receiptNumber: 'CEGS-REC-2026-000003',
      studentId: priya._id,
      studentProfile: priyaProfile?._id,
      trackId: priyaProfile?.track,
      batchId: priyaProfile?.batch,
      description: 'Course Fee - Installment 1 of 2',
      installmentNumber: 1,
      baseAmount: 50000,
      gstRate: 18,
      gstAmount: 9000,
      totalAmount: 59000,
      amountPaid: 59000,
      balanceAmount: 0,
      paymentMethod: 'Bank Transfer',
      transactionId: 'NEFT-ICICI-4920192',
      paymentDate: new Date('2025-10-18T11:00:00Z'),
      status: 'Paid',
      notes: 'First installment settled.',
    });

    // Priya Payment 2: Pending
    await Payment.create({
      paymentId: 'PAY-2026-004',
      receiptNumber: 'CEGS-REC-2026-000004',
      studentId: priya._id,
      studentProfile: priyaProfile?._id,
      trackId: priyaProfile?.track,
      batchId: priyaProfile?.batch,
      description: 'Course Fee - Installment 2 of 2',
      installmentNumber: 2,
      baseAmount: 50000,
      gstRate: 18,
      gstAmount: 9000,
      totalAmount: 59000,
      amountPaid: 0,
      balanceAmount: 59000,
      paymentMethod: 'Bank Transfer',
      paymentDate: new Date('2026-01-18T12:00:00Z'),
      status: 'Pending',
      notes: 'Awaiting candidate second installment transfer.',
    });
  }

  if (rahul) {
    const rahulProfile = await StudentProfile.findOne({ user: rahul._id });

    // Rahul: One-time payment (Paid)
    await Payment.create({
      paymentId: 'PAY-2026-005',
      receiptNumber: 'CEGS-REC-2026-000005',
      studentId: rahul._id,
      studentProfile: rahulProfile?._id,
      trackId: rahulProfile?.track,
      batchId: rahulProfile?.batch,
      description: 'Comprehensive Program Fee - Full Payment',
      installmentNumber: 1,
      baseAmount: 100000,
      gstRate: 18,
      gstAmount: 18000,
      totalAmount: 118000,
      amountPaid: 118000,
      balanceAmount: 0,
      paymentMethod: 'Card',
      transactionId: 'CC-VISA-88219034',
      paymentDate: new Date('2025-10-17T09:15:00Z'),
      status: 'Paid',
      notes: 'Full tuition fee paid upfront via Credit Card.',
    });
  }

  console.log('✅ Initial Course Fee & Payments successfully seeded.');
};

export const seedDatabase = async () => {
  console.log('🌱 Checking and seeding initial CEGS LMS database...');

  const existingStudents = await StudentProfile.countDocuments();
  if (existingStudents >= 10) {
    console.log('ℹ️ Database already contains full student cohort. Verifying payment records...');
    await seedPaymentsIfEmpty();
    return;
  }

  // Clear existing partial data if upgrading
  if (existingStudents > 0 && existingStudents < 10) {
    if (!ENV.USE_MEMORY_DB) {
      console.warn('⚠️ Real database detected. Skipping deletion of existing data to prevent data loss. Please clear collections manually if you want to re-seed.');
      return;
    }
    console.log('🔄 Upgrading database to full 14-student multi-track cohort...');
    await Promise.all([
      User.deleteMany({}),
      StudentProfile.deleteMany({}),
      MentorProfile.deleteMany({}),
      Batch.deleteMany({}),
      Attendance.deleteMany({}),
      AssessmentAttempt.deleteMany({}),
      LessonProgress.deleteMany({}),
      MentorshipSession.deleteMany({}),
      SWOTReview.deleteMany({}),
      MockInterview.deleteMany({}),
      Task.deleteMany({}),
      Project.deleteMany({}),
      Interview.deleteMany({}),
      Offer.deleteMany({}),
      Certificate.deleteMany({}),
      Notification.deleteMany({}),
    ]);
  }

  console.log('✨ Creating Core Users (1 Admin, 2 Mentors, 14 Students across 5 Tracks)...');
  const adminUser = await User.create({
    name: 'CEGS Administrator',
    email: 'admin@careerexpertglobal.com',
    password: 'Password123!',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    isActive: true,
  });

  const mentorUser = await User.create({
    name: 'Rajesh Ramanathan',
    email: 'mentor@careerexpertglobal.com',
    password: 'Password123!',
    role: 'mentor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    isActive: true,
  });

  const mentor2User = await User.create({
    name: 'Dr. Ananya Roy',
    email: 'ananya.roy@careerexpertglobal.com',
    password: 'Password123!',
    role: 'mentor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    isActive: true,
  });

  // Primary demo student
  const studentUser = await User.create({
    name: 'Saif Khan',
    email: 'student@careerexpertglobal.com',
    password: 'Password123!',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    isActive: true,
    isFirstLogin: false,
  });

  const peerStudent1 = await User.create({
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    password: 'Password123!',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    isActive: true,
  });

  const peerStudent2 = await User.create({
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    password: 'Password123!',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    isActive: true,
  });

  // Additional 11 realistic students distributed across AI, Testing, Analytics, and Cloud tracks
  const candidateSeeds = [
    {
      name: 'Aditya Nambiar',
      email: 'aditya.nambiar@example.com',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      trackIdx: 1, // AI Engineer
      college: 'National Institute of Technology, Warangal',
      roll: 'CEGS-2025-0190',
      placementStatus: 'Interviewing',
      progress: 72,
    },
    {
      name: 'Sneha Reddy',
      email: 'sneha.reddy@example.com',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      trackIdx: 1, // AI Engineer
      college: 'IIIT Hyderabad',
      roll: 'CEGS-2025-0191',
      placementStatus: 'Offered',
      progress: 85,
    },
    {
      name: 'Kavita Krishnan',
      email: 'kavita.krishnan@example.com',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      trackIdx: 1, // AI Engineer
      college: 'Anna University, Chennai',
      roll: 'CEGS-2025-0192',
      placementStatus: 'Training',
      progress: 60,
    },
    {
      name: 'Vikram Joshi',
      email: 'vikram.joshi@example.com',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      trackIdx: 2, // Automation Testing
      college: 'VJTI, Mumbai',
      roll: 'CEGS-2025-0193',
      placementStatus: 'Interviewing',
      progress: 65,
    },
    {
      name: 'Pooja Nair',
      email: 'pooja.nair@example.com',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
      trackIdx: 2, // Automation Testing
      college: 'College of Engineering, Trivandrum',
      roll: 'CEGS-2025-0194',
      placementStatus: 'Offered',
      progress: 80,
    },
    {
      name: 'Manish Chawla',
      email: 'manish.chawla@example.com',
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150',
      trackIdx: 2, // Automation Testing
      college: 'Delhi Technological University',
      roll: 'CEGS-2025-0195',
      placementStatus: 'Training',
      progress: 58,
    },
    {
      name: 'Rohan Deshmukh',
      email: 'rohan.deshmukh@example.com',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
      trackIdx: 3, // Data Analytics
      college: 'Pune Institute of Computer Technology',
      roll: 'CEGS-2025-0196',
      placementStatus: 'Interviewing',
      progress: 70,
    },
    {
      name: 'Meera Sundaram',
      email: 'meera.sundaram@example.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      trackIdx: 3, // Data Analytics
      college: 'PSG College of Technology, Coimbatore',
      roll: 'CEGS-2025-0197',
      placementStatus: 'Placed',
      progress: 92,
    },
    {
      name: 'Arjun Singhania',
      email: 'arjun.singhania@example.com',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
      trackIdx: 4, // Cloud & DevOps
      college: 'RV College of Engineering, Bengaluru',
      roll: 'CEGS-2025-0198',
      placementStatus: 'Interviewing',
      progress: 75,
    },
    {
      name: 'Divya Sengupta',
      email: 'divya.sengupta@example.com',
      avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150',
      trackIdx: 4, // Cloud & DevOps
      college: 'Jadavpur University, Kolkata',
      roll: 'CEGS-2025-0199',
      placementStatus: 'Offered',
      progress: 88,
    },
    {
      name: 'Karthik Subramanian',
      email: 'karthik.subramanian@example.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      trackIdx: 4, // Cloud & DevOps
      college: 'BITS Pilani',
      roll: 'CEGS-2025-0200',
      placementStatus: 'Training',
      progress: 62,
    },
  ];

  const createdExtraUsers: any[] = [];
  for (const cs of candidateSeeds) {
    const u = await User.create({
      name: cs.name,
      email: cs.email,
      password: 'Password123!',
      role: 'student',
      avatar: cs.avatar,
      isActive: true,
      isFirstLogin: false,
    });
    createdExtraUsers.push({ user: u, seed: cs });
  }

  console.log('✨ Creating Program and Tracks...');
  const program = await Program.create({
    title: '6-Month Freshers Growth Training Program',
    slug: 'freshers-growth-training-program',
    description:
      'A structured 6-month journey: ASSESS → PERSONALIZE → LEARN → PRACTICE → ASSESS → BUILD → MENTOR → INTERVIEW → PLACEMENT → CERTIFY',
    durationMonths: 6,
    totalWeeks: 24,
    stipendRange: '₹15,000 - ₹18,000 / month',
    isActive: true,
  });

  const tracks = await Track.create([
    {
      name: 'Full Stack Development',
      slug: 'full-stack-development',
      description: 'Master React, Node.js, Express, MongoDB, TypeScript, and end-to-end cloud web architectures.',
      iconName: 'Code',
      technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'Docker'],
      learningObjectives: [
        'Build scalable RESTful and microservice APIs',
        'Master modern state management and React 18 patterns',
        'Database indexing, aggregation pipelines, and schema modeling',
        'Full software lifecycle with CI/CD and deployment',
      ],
      isActive: true,
    },
    {
      name: 'AI Engineer',
      slug: 'ai-engineer',
      description: 'Specialize in Python, ML algorithms, Deep Learning, NLP transformers, and GenAI LLM integration.',
      iconName: 'Cpu',
      technologies: ['Python', 'PyTorch', 'Scikit-Learn', 'Transformers', 'LangChain', 'FastAPI'],
      learningObjectives: [
        'Statistical machine learning and neural architectures',
        'Fine-tuning open weights models and LLM orchestration',
        'Model serving, evaluation, and latency optimization',
      ],
      isActive: true,
    },
    {
      name: 'Automation Testing',
      slug: 'automation-testing',
      description: 'Enterprise quality engineering with Selenium, Playwright, TestNG, and CI API test automation.',
      iconName: 'CheckCircle2',
      technologies: ['Java', 'Selenium WebDriver', 'Playwright', 'Postman', 'Cucumber', 'Jenkins'],
      learningObjectives: [
        'Design robust Page Object Model test frameworks',
        'Automated API and performance testing pipelines',
        'Defect reporting and quality metrics mastery',
      ],
      isActive: true,
    },
    {
      name: 'Data Analytics',
      slug: 'data-analytics',
      description: 'Harness SQL, Python data engineering, Power BI, Tableau, and business intelligence dashboards.',
      iconName: 'BarChart3',
      technologies: ['SQL', 'Python', 'Pandas', 'Power BI', 'Tableau', 'Excel Advanced'],
      learningObjectives: [
        'Advanced SQL queries and data warehousing paradigms',
        'Executive dashboard creation and story-driven analytics',
        'Predictive modeling for business KPIs',
      ],
      isActive: true,
    },
    {
      name: 'Cloud & DevOps',
      slug: 'cloud-devops',
      description: 'Design resilient cloud architectures on AWS & Azure, containerization with Docker & Kubernetes.',
      iconName: 'Cloud',
      technologies: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'Terraform', 'GitHub Actions'],
      learningObjectives: [
        'Infrastructure as Code (IaC) with Terraform',
        'Automated zero-downtime CI/CD deployment pipelines',
        'Cluster management, telemetry, and site reliability engineering',
      ],
      isActive: true,
    },
  ]);

  const fsdTrack = tracks[0];

  console.log('✨ Creating Batches and Profiles...');
  const allStudentIds = [
    studentUser._id,
    peerStudent1._id,
    peerStudent2._id,
    ...createdExtraUsers.map((c) => c.user._id),
  ];

  const batch = await Batch.create({
    name: 'Freshers Growth Cohort 2025-A',
    code: 'CEGS-FGT-OCT15',
    program: program._id,
    startDate: new Date('2025-10-15'),
    endDate: new Date('2026-04-15'),
    capacity: 35,
    students: allStudentIds,
    trainers: [mentorUser._id, mentor2User._id],
    mentors: [mentorUser._id, mentor2User._id],
    status: 'Active',
  });

  await MentorProfile.create({
    user: mentorUser._id,
    specialization: ['Full Stack Architecture', 'Microservices', 'Interview Preparation', 'Executive Mentoring'],
    bio: 'Senior Technical Lead & Principal Instructor with 12+ years of industry experience across fintech and enterprise SaaS.',
    experienceYears: 12,
    assignedStudents: [studentUser._id, peerStudent1._id, peerStudent2._id, createdExtraUsers[3].user._id, createdExtraUsers[4].user._id],
    meetingLink: 'https://meet.google.com/cegs-fgt-mentor',
    officeHours: 'Monday - Friday: 4:00 PM - 6:30 PM IST',
    designation: 'Principal Mentor & Career Coach',
  });

  await MentorProfile.create({
    user: mentor2User._id,
    specialization: ['Artificial Intelligence', 'Data Science & Analytics', 'Cloud Architecture', 'Research & GenAI'],
    bio: 'Former Research Scientist and Principal AI Architect with 10+ years driving ML systems and data engineering.',
    experienceYears: 10,
    assignedStudents: [
      createdExtraUsers[0].user._id,
      createdExtraUsers[1].user._id,
      createdExtraUsers[2].user._id,
      createdExtraUsers[5].user._id,
      createdExtraUsers[6].user._id,
      createdExtraUsers[7].user._id,
      createdExtraUsers[8].user._id,
      createdExtraUsers[9].user._id,
      createdExtraUsers[10].user._id,
    ],
    meetingLink: 'https://meet.google.com/cegs-ai-mentor',
    officeHours: 'Tuesday - Saturday: 3:00 PM - 5:30 PM IST',
    designation: 'Lead AI & Data Engineering Mentor',
  });

  const studentProfile = await StudentProfile.create({
    user: studentUser._id,
    batch: batch._id,
    track: fsdTrack._id,
    assignedMentor: mentorUser._id,
    rollNumber: 'CEGS-2025-0182',
    phone: '+91 98765 43210',
    dob: new Date('2002-06-18'),
    city: 'Hyderabad',
    state: 'Telangana',
    degree: 'B.Tech in Computer Science & Engineering',
    college: 'Jawaharlal Nehru Technological University',
    graduationYear: 2024,
    academicBackground: 'Computer Science with emphasis on Distributed Systems',
    preferredTrack: 'Full Stack Development',
    targetRole: 'Full Stack Software Engineer',
    careerGoals: 'To join a high-growth product company building resilient scalable cloud web platforms.',
    onboardingCompleted: true,
    onboardingStep: 5,
    strengths: ['JavaScript / TypeScript', 'React Ecosystem', 'Logical Problem Solving', 'Proactive Communication'],
    skillGaps: ['Advanced System Design', 'High-throughput Redis Caching', 'Kubernetes Helm Deployments'],
    currentMonth: 3,
    currentWeek: 10,
    currentStreak: 14,
    overallProgress: 68,
    jobReady: false,
    placementStatus: 'Interviewing',
    resumeUrl: 'https://careerexpertglobal.com/resumes/saif-khan.pdf',
  });

  // Create profiles for peer students 1 & 2
  await StudentProfile.create({
    user: peerStudent1._id,
    batch: batch._id,
    track: fsdTrack._id,
    assignedMentor: mentorUser._id,
    rollNumber: 'CEGS-2025-0183',
    phone: '+91 98765 43211',
    dob: new Date('2002-08-22'),
    city: 'Bengaluru',
    state: 'Karnataka',
    degree: 'B.E. in Information Science',
    college: 'BMS College of Engineering',
    graduationYear: 2024,
    academicBackground: 'Information Science',
    preferredTrack: 'Full Stack Development',
    targetRole: 'Frontend Software Engineer',
    onboardingCompleted: true,
    onboardingStep: 5,
    strengths: ['React Architecture', 'CSS/Tailwind Design Tokens', 'UI Performance'],
    skillGaps: ['Node.js Event Loop', 'Docker Compose'],
    currentMonth: 3,
    currentWeek: 10,
    currentStreak: 12,
    overallProgress: 70,
    placementStatus: 'Interviewing',
  });

  await StudentProfile.create({
    user: peerStudent2._id,
    batch: batch._id,
    track: fsdTrack._id,
    assignedMentor: mentorUser._id,
    rollNumber: 'CEGS-2025-0184',
    phone: '+91 98765 43212',
    dob: new Date('2001-11-10'),
    city: 'Pune',
    state: 'Maharashtra',
    degree: 'B.Tech in Computer Engineering',
    college: 'College of Engineering Pune (COEP)',
    graduationYear: 2024,
    academicBackground: 'Computer Engineering',
    preferredTrack: 'Full Stack Development',
    targetRole: 'Backend Engineer',
    onboardingCompleted: true,
    onboardingStep: 5,
    strengths: ['MongoDB Schema Design', 'Express REST API', 'Postman Testing'],
    skillGaps: ['React Concurrent Mode', 'GraphQL'],
    currentMonth: 3,
    currentWeek: 10,
    currentStreak: 9,
    overallProgress: 64,
    placementStatus: 'Training',
  });

  // Create profiles for the remaining 11 students across AI, QA, Data Analytics, and DevOps
  for (const cs of createdExtraUsers) {
    const assignedTrack = tracks[cs.seed.trackIdx];
    const assignedMentor = cs.seed.trackIdx === 2 ? mentorUser._id : mentor2User._id;

    await StudentProfile.create({
      user: cs.user._id,
      batch: batch._id,
      track: assignedTrack._id,
      assignedMentor,
      rollNumber: cs.seed.roll,
      phone: `+91 98765 ${Math.floor(10000 + Math.random() * 90000)}`,
      dob: new Date(2002, Math.floor(Math.random() * 12), Math.floor(1 + Math.random() * 28)),
      city: 'Bengaluru',
      state: 'Karnataka',
      degree: 'B.Tech / B.E.',
      college: cs.seed.college,
      graduationYear: 2024,
      academicBackground: assignedTrack.name,
      preferredTrack: assignedTrack.name,
      targetRole: `${assignedTrack.name} Specialist`,
      onboardingCompleted: true,
      onboardingStep: 5,
      strengths: assignedTrack.learningObjectives.slice(0, 2),
      skillGaps: assignedTrack.learningObjectives.slice(2, 3),
      currentMonth: 3,
      currentWeek: 10,
      currentStreak: Math.floor(7 + Math.random() * 14),
      overallProgress: cs.seed.progress,
      placementStatus: cs.seed.placementStatus,
    });
  }

  console.log('✨ Creating 6 Months of Curriculum, Modules, and Lessons...');
  // 6 Months of structured curriculum
  const curriculumPlan = [
    {
      month: 1,
      title: 'Foundations & Track Fundamentals',
      weeks: [
        {
          week: 1,
          title: 'Orientation & Skill Assessment',
          description: 'Program onboarding, environment tooling setup, diagnostic baseline testing.',
          lessons: [
            {
              title: 'CEGS Program Blueprint & Career Roadmap',
              type: 'video',
              url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
              duration: 35,
              text: 'Welcome to Career Expert Global Solutions. Understand the 6-month growth trajectory.',
            },
            {
              title: 'Modern Software Engineering Workflow & Git Essentials',
              type: 'document',
              duration: 45,
              text: 'Mastering branch strategies, pull request etiquette, semantic commits, and team collaboration.',
            },
          ],
        },
        {
          week: 2,
          title: 'Personalized Learning Path & Problem Solving',
          description: 'Algorithmic fundamentals, clean code principles, and personal milestone planning.',
          lessons: [
            {
              title: 'Data Structures & Algorithmic Complexity in TypeScript',
              type: 'video',
              duration: 50,
              text: 'Big-O notation, memory allocation, arrays, hash maps, and recursion.',
            },
          ],
        },
        {
          week: 3,
          title: 'Track Fundamentals: React & TypeScript Deep Dive',
          description: 'Component architecture, strict typing, hooks lifecycle, and state modeling.',
          lessons: [
            {
              title: 'Mastering React 18 Concurrent Features & Hooks',
              type: 'video',
              duration: 60,
              text: 'useEffect dependency traps, useMemo/useCallback optimization, and custom hook patterns.',
            },
            {
              title: 'Clean Architecture with React & Tailwind CSS',
              type: 'presentation',
              duration: 40,
              text: 'Atomic design tokens, responsive breakpoints, accessible UI patterns.',
            },
          ],
        },
        {
          week: 4,
          title: 'Month 1 Assessment & Baseline Review',
          description: 'Comprehensive foundational examination and individualized feedback review.',
          lessons: [
            {
              title: 'Foundations Assessment Preparation & Checklist',
              type: 'document',
              duration: 30,
              text: 'Guidelines and review checklist for the Month 1 Comprehensive Assessment.',
            },
          ],
        },
      ],
    },
    {
      month: 2,
      title: 'Communication & Personality Development',
      weeks: [
        {
          week: 5,
          title: 'Professional Communication & Workplace Vocabulary',
          description: 'Executive presence, verbal articulation, active listening, and technical storytelling.',
          lessons: [
            {
              title: 'Effective Technical Communication in Global Teams',
              type: 'video',
              duration: 45,
              text: 'Bridging technical jargon with business value when presenting to stakeholders.',
            },
            {
              title: 'Professional Email & Slack Etiquette',
              type: 'document',
              duration: 25,
              text: 'Templates for sprint updates, blocker escalation, and stakeholder communication.',
            },
          ],
        },
        {
          week: 6,
          title: 'Personality Development & Body Language',
          description: 'Virtual presentation skills, interview presence, and assertiveness.',
          lessons: [
            {
              title: 'Virtual Interview Poise and Non-Verbal Cues',
              type: 'video',
              duration: 40,
              text: 'Eye contact on camera, vocal pitch modulation, confidence under technical pressure.',
            },
          ],
        },
        {
          week: 7,
          title: 'SWOT Analysis & Mentorship Deep Dive',
          description: 'Evaluating individual strengths, identifying growth levers, 1-on-1 mentor guidance.',
          lessons: [
            {
              title: 'Constructing Your Professional SWOT Matrix',
              type: 'presentation',
              duration: 35,
              text: 'Framework to convert perceived threats into developmental milestones.',
            },
          ],
        },
        {
          week: 8,
          title: 'Behavioral & HR Mock Interview Cycle',
          description: 'First formal round of mock interviews with recorded critique and rubric scoring.',
          lessons: [
            {
              title: 'The STAR Method Masterclass for Behavioral Rounds',
              type: 'video',
              duration: 50,
              text: 'Situation, Task, Action, Result methodology with real software case studies.',
            },
          ],
        },
      ],
    },
    {
      month: 3,
      title: 'Core Technical Training (Current Month)',
      weeks: [
        {
          week: 9,
          title: 'Core Technical Concepts: Node.js & Express Internal Architecture',
          description: 'Event loop mechanics, async I/O, middleware patterns, error handling pipelines.',
          lessons: [
            {
              title: 'Node.js Event Loop, Libuv & Thread Pool Architecture',
              type: 'video',
              duration: 65,
              text: 'Microtasks vs Macrotasks, process.nextTick, non-blocking I/O execution.',
            },
            {
              title: 'Robust RESTful API Design with Express & Zod',
              type: 'document',
              duration: 45,
              text: 'Request sanitization, typed schemas, rate limiting, and centralized middleware.',
            },
          ],
        },
        {
          week: 10,
          title: 'Intermediate Skills: MongoDB Aggregations & Query Optimization',
          description: 'Schema modeling, multi-stage pipelines, indexing strategies, transaction ACIDity.',
          lessons: [
            {
              title: 'MongoDB Schema Design Patterns & Indexing Strategies',
              type: 'video',
              duration: 55,
              text: 'Covered queries, compound indexes, explain plans, and anti-patterns.',
            },
            {
              title: 'Advanced Aggregation Pipelines with Practical Data Sets',
              type: 'document',
              duration: 50,
              text: '$lookup, $unwind, $facet, $bucket, and analytical aggregations.',
            },
          ],
        },
        {
          week: 11,
          title: 'Advanced Skills: Full-Stack Integration & Auth Security',
          description: 'JWT rotation, HTTP-only cookies, RBAC authorization, and state management.',
          lessons: [
            {
              title: 'Production Authentication Architecture with JWT & Refresh Tokens',
              type: 'video',
              duration: 50,
              text: 'CSRF defenses, XSS-safe token storage, token blacklisting and expiry handling.',
            },
          ],
        },
        {
          week: 12,
          title: 'Technical Milestone Assessment',
          description: 'Mid-program technical assessment evaluating end-to-end full stack proficiency.',
          lessons: [
            {
              title: 'Full Stack Architecture Capstone Exam Guide',
              type: 'document',
              duration: 30,
              text: 'Instructions and evaluation rubric for the Week 12 Mid-Program Technical Assessment.',
            },
          ],
        },
      ],
    },
    {
      month: 4,
      title: 'Live Projects & Early Interviews',
      weeks: [
        {
          week: 13,
          title: 'Live Project Kickoff & System Architecture',
          description: 'Client problem statements, Jira-style task breakdown, team agile roles.',
          lessons: [
            {
              title: 'Enterprise Architecture & Domain-Driven Design (DDD)',
              type: 'presentation',
              duration: 45,
              text: 'Bounded contexts, microservice vs modular monolith, entity relationship modeling.',
            },
          ],
        },
        {
          week: 14,
          title: 'Development Sprint 1 & CI/CD Pipelines',
          description: 'Sprint planning, user story point estimation, automated GitHub Actions workflows.',
          lessons: [
            {
              title: 'CI/CD with GitHub Actions, Automated Testing & Docker',
              type: 'video',
              duration: 55,
              text: 'Containerizing Node/React services and automating lint/test checks.',
            },
          ],
        },
        {
          week: 15,
          title: 'Development Sprint 2 & Code Reviews',
          description: 'Feature implementation, peer pull request reviews, and security scanning.',
          lessons: [
            {
              title: 'Effective Code Reviews & Clean Architecture Patterns',
              type: 'document',
              duration: 40,
              text: 'Refactoring smells, SOLID principles in TypeScript, writing maintainable tests.',
            },
          ],
        },
        {
          week: 16,
          title: 'First Interview Cycle & Technical Round Practice',
          description: 'Early screening interviews, live coding sessions, and mentor debriefing.',
          lessons: [
            {
              title: 'Live Whiteboard Problem Solving & Coding Interview Patterns',
              type: 'video',
              duration: 60,
              text: 'Talking through your thought process, edge cases, time/space complexity analysis.',
            },
          ],
        },
      ],
    },
    {
      month: 5,
      title: 'Interview Preparation & Placement Drives',
      weeks: [
        {
          week: 17,
          title: 'Intensive Interview Preparation & System Design',
          description: 'High-level design, caching layers, load balancers, database sharding.',
          lessons: [
            {
              title: 'System Design 101: Scalability, Caching & Message Queues',
              type: 'video',
              duration: 65,
              text: 'Designing a URL shortener, notification system, and rate limiter.',
            },
          ],
        },
        {
          week: 18,
          title: 'Placement Drive Round 1: Enterprise Partner Hiring',
          description: 'Interviews with corporate hiring partners, online test platforms.',
          lessons: [
            {
              title: 'Corporate Placement Drive Protocol & Best Practices',
              type: 'document',
              duration: 30,
              text: 'Dress code, tech setup, resume presentation, and follow-up etiquette.',
            },
          ],
        },
        {
          week: 19,
          title: 'Advanced Capstone Polish & Live Demonstrations',
          description: 'Deploying to cloud production, stress testing, live demo walkthroughs.',
          lessons: [
            {
              title: 'Delivering a Winning Capstone Project Presentation',
              type: 'video',
              duration: 45,
              text: 'How to pitch your project, demonstrate business ROI, and explain technical trade-offs.',
            },
          ],
        },
        {
          week: 20,
          title: 'Placement Readiness & Salary Negotiation Guidance',
          description: 'Evaluating offer structures, compensation breakdown, and professional career paths.',
          lessons: [
            {
              title: 'Understanding Offer Letters, CTC Breakdowns & Equity',
              type: 'document',
              duration: 35,
              text: 'Fixed vs variable pay, provident fund, insurance benefits, joining bonus.',
            },
          ],
        },
      ],
    },
    {
      month: 6,
      title: 'Placement Drive & Job-Ready Certification',
      weeks: [
        {
          week: 21,
          title: 'Final Placement Drives & Executive Panels',
          description: 'Partner company final rounds, technical director conversations.',
          lessons: [
            {
              title: 'Acing Director & CTO Final Round Conversations',
              type: 'video',
              duration: 40,
              text: 'Cultural fit, vision alignment, and demonstrating long-term value.',
            },
          ],
        },
        {
          week: 22,
          title: 'Offers & Onboarding Transition Support',
          description: 'Document verification, background verification readiness, onboarding prep.',
          lessons: [
            {
              title: 'First 90 Days in Your New Software Engineering Role',
              type: 'video',
              duration: 45,
              text: 'Setting up local environments, understanding legacy codebases, shipping fast value.',
            },
          ],
        },
        {
          week: 23,
          title: 'Final Assessment & Portfolio Showcase',
          description: 'Comprehensive exit evaluation, published GitHub portfolio review.',
          lessons: [
            {
              title: 'Architecting an Outstanding Developer Portfolio',
              type: 'document',
              duration: 35,
              text: 'Live links, README badges, architecture diagrams, and social proof.',
            },
          ],
        },
        {
          week: 24,
          title: 'Certification Award & Alumni Network Induction',
          description: 'Verification of course completion, certificate generation, alumni mentorship access.',
          lessons: [
            {
              title: 'CEGS Certification Ceremony & Continuous Career Acceleration',
              type: 'video',
              duration: 30,
              text: 'Lifelong learning, staying current with AI paradigms, and joining the alumni circle.',
            },
          ],
        },
      ],
    },
  ];

  for (const mData of curriculumPlan) {
    for (const wData of mData.weeks) {
      const module = await Module.create({
        title: `Month ${mData.month} / Week ${wData.week}: ${wData.title}`,
        description: wData.description,
        track: fsdTrack._id,
        monthNumber: mData.month,
        weekNumber: wData.week,
        order: wData.week,
        durationHours: 12,
        learningOutcomes: ['Demonstrated mastery of week concepts', 'Practical code submission'],
      });

      for (let i = 0; i < wData.lessons.length; i++) {
        const l = wData.lessons[i];
        const createdLesson = await Lesson.create({
          module: module._id,
          title: l.title,
          description: l.text,
          contentType: l.type,
          contentUrl: l.url || '',
          bodyText: `${l.text}\n\nComprehensive technical documentation and reference material provided by Career Expert Global Solutions training team.\n\nKey Concepts:\n1. Architectural best practices\n2. Real-world enterprise implementation\n3. Common gotchas and debugging techniques.`,
          durationMinutes: l.duration,
          order: i + 1,
          codeSnippets: [
            {
              language: 'typescript',
              title: 'Enterprise Architecture Snippet',
              code: `// Sample implementation from Week ${wData.week}\nexport interface IServiceConfig {\n  endpoint: string;\n  timeoutMs: number;\n  retryCount: number;\n}\n\nexport const initializeService = (config: IServiceConfig) => {\n  console.log('Service initialized:', config.endpoint);\n};`,
            },
          ],
          resources: [
            { title: 'Official Documentation & Guides', url: 'https://react.dev' },
            { title: 'GitHub Starter Repository', url: 'https://github.com/cegs-training' },
          ],
        });

        // Seed LessonProgress for Saif Khan (Month 1, Month 2, and Week 9 completed = 68% progress)
        if (mData.month < 3 || (mData.month === 3 && wData.week === 9)) {
          await LessonProgress.create({
            student: studentUser._id,
            lesson: createdLesson._id,
            module: module._id,
            completed: true,
            completedAt: new Date(Date.now() - (10 - wData.week) * 7 * 24 * 60 * 60 * 1000),
            notes: `Key learning points from ${createdLesson.title}: Applied architectural best practices and completed code review.`,
          });
        }
      }
    }
  }

  console.log('✨ Creating Weekly Assessments with Realistic Questions...');
  const assessment1 = await Assessment.create({
    title: 'Week 1: Orientation & Technical Diagnostic Baseline',
    description: 'Initial diagnostic assessment covering programming logic, Git workflows, and web fundamentals.',
    track: fsdTrack._id,
    monthNumber: 1,
    weekNumber: 1,
    type: 'mcq',
    durationMinutes: 30,
    passingScore: 70,
    totalMarks: 25,
    instructions: [
      'Read each question carefully before submitting your answer.',
      'You have 30 minutes to complete all questions.',
      'Passing score is 70% (18/25 points).',
    ],
    questions: [
      {
        id: 'q1',
        questionText: 'Which Git command creates a new branch and immediately switches to it in modern Git?',
        type: 'mcq',
        options: ['git branch -new <name>', 'git switch -c <name>', 'git checkout --create <name>', 'git merge --branch <name>'],
        correctAnswer: 'git switch -c <name>',
        explanation: 'git switch -c <name> is the modern command introduced in Git 2.23 to create and switch branches.',
        marks: 5,
      },
      {
        id: 'q2',
        questionText: 'What is the time complexity of looking up a key in a standard Hash Table on average?',
        type: 'mcq',
        options: ['O(n)', 'O(log n)', 'O(1)', 'O(n^2)'],
        correctAnswer: 'O(1)',
        explanation: 'Average case time complexity for hash table lookups is constant time O(1).',
        marks: 5,
      },
      {
        id: 'q3',
        questionText: 'In TypeScript, what is the key difference between an interface and a type alias for object definitions?',
        type: 'mcq',
        options: [
          'Interfaces can be reopened for declaration merging, whereas types cannot.',
          'Type aliases cannot represent object shapes.',
          'Interfaces only support primitive types.',
          'There is zero difference under any circumstance.',
        ],
        correctAnswer: 'Interfaces can be reopened for declaration merging, whereas types cannot.',
        explanation: 'Interfaces allow declaration merging by defining the same name multiple times.',
        marks: 5,
      },
      {
        id: 'q4',
        questionText: 'Which HTTP method should be idempotent according to the RFC 7231 standard?',
        type: 'mcq',
        options: ['POST', 'PUT', 'PATCH (in all instances)', 'CONNECT'],
        correctAnswer: 'PUT',
        explanation: 'PUT, GET, HEAD, DELETE, OPTIONS are idempotent. Multiple identical requests produce the same side-effect.',
        marks: 5,
      },
      {
        id: 'q5',
        questionText: 'What is the purpose of the React virtual DOM?',
        type: 'mcq',
        options: [
          'To replace the browser DOM entirely',
          'To compute minimal DOM updates via diffing before touching the browser layout engine',
          'To speed up network requests',
          'To handle database mutations directly',
        ],
        correctAnswer: 'To compute minimal DOM updates via diffing before touching the browser layout engine',
        explanation: 'The virtual DOM allows React to batch and reconcile changes efficiently.',
        marks: 5,
      },
    ],
  });

  const assessment9 = await Assessment.create({
    title: 'Week 9: Node.js Runtime Architecture & Async I/O',
    description: 'Technical evaluation of Node event loop phases, microtask queue priority, and stream processing.',
    track: fsdTrack._id,
    monthNumber: 3,
    weekNumber: 9,
    type: 'technical',
    durationMinutes: 45,
    passingScore: 75,
    totalMarks: 25,
    instructions: [
      'Assess your comprehension of asynchronous Node.js architecture.',
      '45-minute countdown starts once initiated.',
      'Auto-evaluates upon submission.',
    ],
    questions: [
      {
        id: 'q9_1',
        questionText: 'In Node.js, which queue has the highest execution priority before moving to next event loop phase?',
        type: 'mcq',
        options: ['Timer queue', 'Check (setImmediate) queue', 'process.nextTick queue', 'I/O polling queue'],
        correctAnswer: 'process.nextTick queue',
        explanation: 'process.nextTick callbacks are drained immediately after the current operation finishes.',
        marks: 5,
      },
      {
        id: 'q9_2',
        questionText: 'What happens when you call res.send() multiple times inside an Express route handler without returning?',
        type: 'mcq',
        options: [
          'The second call overrides the first response',
          'Express automatically concatenates both payloads',
          'An "ERR_HTTP_HEADERS_SENT" exception is thrown',
          'Node server silently restarts',
        ],
        correctAnswer: 'An "ERR_HTTP_HEADERS_SENT" exception is thrown',
        explanation: 'Cannot set headers after they are sent to the client.',
        marks: 5,
      },
      {
        id: 'q9_3',
        questionText: 'Which security header should be set to protect Express apps against clickjacking?',
        type: 'mcq',
        options: ['X-Frame-Options: DENY / SAMEORIGIN', 'Content-Encoding: gzip', 'X-DNS-Prefetch-Control', 'Strict-Cookie-Jar'],
        correctAnswer: 'X-Frame-Options: DENY / SAMEORIGIN',
        explanation: 'X-Frame-Options or CSP frame-ancestors prevents unauthorized framing of the page.',
        marks: 5,
      },
      {
        id: 'q9_4',
        questionText: 'Which Node.js core module provides cryptographic hashing and HMAC generation without external libraries?',
        type: 'mcq',
        options: ['crypto', 'security', 'bcrypt-core', 'hashlib'],
        correctAnswer: 'crypto',
        explanation: 'Node.js has a built-in crypto module leveraging OpenSSL.',
        marks: 5,
      },
      {
        id: 'q9_5',
        questionText: 'What is the purpose of transform streams in Node.js?',
        type: 'mcq',
        options: [
          'To write data only to standard error',
          'To read and modify data on-the-fly between readable and writable streams',
          'To serialize JavaScript objects to SQL tables',
          'To monitor memory usage',
        ],
        correctAnswer: 'To read and modify data on-the-fly between readable and writable streams',
        explanation: 'Transform streams are duplex streams where output is computed from input (e.g. zlib compression).',
        marks: 5,
      },
    ],
  });

  console.log('✨ Creating Student Assessment Attempts for Analytics Charts...');
  // Seed attempts for weeks 1 through 9 to show an authentic performance journey:
  // Week 1 -> 72%, Week 2 -> 76%, Week 3 -> 80%, Week 4 -> 84%, Week 5 -> 88%, Week 6 -> 82%, Week 7 -> 88%, Week 8 -> 92%, Week 9 -> 96%
  const sampleScores = [
    { week: 1, score: 18, total: 25, pct: 72 },
    { week: 2, score: 19, total: 25, pct: 76 },
    { week: 3, score: 20, total: 25, pct: 80 },
    { week: 4, score: 21, total: 25, pct: 84 },
    { week: 5, score: 22, total: 25, pct: 88 },
    { week: 6, score: 21, total: 25, pct: 84 },
    { week: 7, score: 23, total: 25, pct: 92 },
    { week: 8, score: 23, total: 25, pct: 92 },
    { week: 9, score: 24, total: 25, pct: 96 },
  ];

  for (const s of sampleScores) {
    await AssessmentAttempt.create({
      assessment: s.week === 9 ? assessment9._id : assessment1._id,
      student: studentUser._id,
      answers: [
        { questionId: 'q1', submittedAnswer: 'git switch -c <name>', isCorrect: true, marksObtained: 5 },
        { questionId: 'q2', submittedAnswer: 'O(1)', isCorrect: true, marksObtained: 5 },
      ],
      score: s.score,
      percentage: s.pct,
      passed: s.pct >= 70,
      timeSpentSeconds: 1200,
      feedback: `Strong performance in Week ${s.week}. Demonstrated good grasp of core concepts.`,
      evaluatedBy: mentorUser._id,
      submittedAt: new Date(Date.now() - (10 - s.week) * 7 * 24 * 60 * 60 * 1000),
    });
  }

  console.log('✨ Creating Attendance History for Cohort...');
  // Seed past 20 days of attendance for all students
  for (const stId of allStudentIds) {
    for (let i = 20; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(9, 30, 0, 0);

      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      if (isWeekend) continue;

      const isLate = i === 12;
      const isAbsent = i === 18 && String(stId) === String(studentUser._id);

      await Attendance.create({
        student: stId,
        batch: batch._id,
        date: d,
        status: isAbsent ? 'Absent' : isLate ? 'Late' : 'Present',
        checkInTime: isAbsent ? '' : isLate ? '09:42 AM' : '09:15 AM',
        remarks: isLate ? 'Traffic congestion notified in advance' : isAbsent ? 'Medical leave requested' : 'Present on-time',
        markedBy: mentorUser._id,
      });
    }
  }

  // Seed baseline Week 1 assessment attempts for cohort students
  for (const stId of allStudentIds) {
    if (String(stId) !== String(studentUser._id)) {
      await AssessmentAttempt.create({
        assessment: assessment1._id,
        student: stId,
        answers: [
          { questionId: 'q1', submittedAnswer: 'git switch -c <name>', isCorrect: true, marksObtained: 5 },
          { questionId: 'q2', submittedAnswer: 'O(1)', isCorrect: true, marksObtained: 5 },
        ],
        score: Math.floor(18 + Math.random() * 7),
        percentage: Math.floor(75 + Math.random() * 22),
        passed: true,
        timeSpentSeconds: 1100,
        feedback: 'Good baseline performance. Demonstrated good logic.',
        evaluatedBy: mentorUser._id,
        submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      });
    }
  }

  console.log('✨ Creating Mentorship Sessions & SWOT Timeline...');
  // Past completed session
  await MentorshipSession.create({
    mentor: mentorUser._id,
    student: studentUser._id,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    durationMinutes: 45,
    agenda: 'SWOT Progress Review & Technical Architecture Milestone',
    meetingLink: 'https://meet.google.com/cegs-fgt-mentor',
    notes: 'Saif has shown great initiative with MongoDB aggregate queries and React state design.',
    actionItems: ['Implement Redis caching on project capstone', 'Refactor authorization middleware to use Zod schemas'],
    feedback: 'Excellent dedication and technical curiosity. Keep up the momentum for Month 4 projects.',
    status: 'Completed',
  });

  // Upcoming session
  await MentorshipSession.create({
    mentor: mentorUser._id,
    student: studentUser._id,
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    durationMinutes: 45,
    agenda: 'Month 4 Capstone Sprint Planning & Mock Technical Interview Debrief',
    meetingLink: 'https://meet.google.com/cegs-fgt-mentor',
    notes: 'Prepare sprint backlog and project milestone deliverable for live demo.',
    actionItems: ['Finalize repository README', 'Prepare 5-minute system walkthrough'],
    status: 'Scheduled',
  });

  // SWOT Timeline: Initial SWOT & Month 2 Review
  await SWOTReview.create({
    student: studentUser._id,
    mentor: mentorUser._id,
    reviewStage: 'Initial SWOT',
    strengths: ['Strong fundamentals in JavaScript', 'Quick learner with high persistence', 'Good verbal communication'],
    weaknesses: ['Hesitation during complex algorithmic whiteboard challenges', 'Needs more practice with TypeScript strict generics'],
    opportunities: ['High industry demand for Full Stack Engineers with cloud competence', 'Enterprise capstone project portfolio piece'],
    threats: ['Fast-evolving AI tools requiring adaptive engineering speed', 'Competitive fresher job market'],
    mentorAdvice: 'Focus on building complete end-to-end applications and mastering clean architectural patterns.',
    actionPlan: ['Daily 30-min data structure practice', 'Build one full stack feature weekly with unit tests'],
    reviewedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  });

  await SWOTReview.create({
    student: studentUser._id,
    mentor: mentorUser._id,
    reviewStage: 'Month 2 Review',
    strengths: ['Mastered React 18 hooks & Zustand state modeling', 'Significant confidence improvement in group discussions', 'Consistent 90%+ assessment scores'],
    weaknesses: ['Occasional over-engineering of database schemas', 'Needs deeper understanding of Redis caching strategies'],
    opportunities: ['Early placement drives with partner enterprise recruiters starting Month 5', 'Lead developer role in the capstone team'],
    threats: ['Time management across project sprints and interview preparation'],
    mentorAdvice: 'Your communication poise has drastically improved. You are ready for live project leadership in Month 4.',
    actionPlan: ['Lead Sprint 1 API design', 'Participate in technical mock interview cycle'],
    reviewedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  });

  console.log('✨ Creating Mock Interviews...');
  await MockInterview.create({
    student: studentUser._id,
    mentor: mentorUser._id,
    interviewType: 'Technical',
    scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    durationMinutes: 60,
    status: 'Completed',
    ratings: {
      communication: 8,
      technical: 9,
      confidence: 8,
      problemSolving: 9,
      professionalism: 9,
      roleAwareness: 8,
    },
    overallScore: 85,
    feedback: 'Excellent explanation of REST semantics and database indexing. Handled coding problem with clear modular functions.',
    recommendations: [
      'Practice explaining space complexity tradeoffs more explicitly before coding.',
      'Keep answers concise during initial architectural open-ended questions.',
    ],
  });

  await MockInterview.create({
    student: studentUser._id,
    mentor: mentorUser._id,
    interviewType: 'HR',
    scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    durationMinutes: 45,
    status: 'Scheduled',
    ratings: {
      communication: 0,
      technical: 0,
      confidence: 0,
      problemSolving: 0,
      professionalism: 0,
      roleAwareness: 0,
    },
    overallScore: 0,
    feedback: '',
    recommendations: [],
    preparationMaterials: [
      'STAR Method Behavioral Framework Guide',
      'Common HR Scenario Questions & Best Answer Structures',
    ],
  });

  console.log('✨ Creating Live Project, Sprints & Kanban Tasks...');
  const capstoneProject = await Project.create({
    title: 'Enterprise HR & Talent Cloud Platform',
    description:
      'A multi-tenant cloud HRMS and applicant tracking platform built with React, Node.js, Express, MongoDB, and Redis caching.',
    objective:
      'Solve candidate lifecycle tracking, automated resume parsing, interview scheduling, and team onboarding workflows.',
    clientOrCompany: 'Enterprise Talent Solutions Ltd',
    track: fsdTrack._id,
    teamMembers: [studentUser._id, peerStudent1._id, peerStudent2._id],
    technologies: ['React 18', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Docker', 'Tailwind CSS'],
    repositoryUrl: 'https://github.com/cegs-training/enterprise-talent-cloud',
    documentationUrl: 'https://notion.so/cegs-enterprise-talent-docs',
    startDate: new Date('2026-01-15'),
    endDate: new Date('2026-03-30'),
    status: 'In Progress',
    progressPercentage: 55,
    mentorNotes: 'Solid sprint velocity. Authentication and recruitment workflow modules are in review.',
    sprints: [
      {
        sprintNumber: 1,
        sprintGoal: 'Authentication, Organization Tenant Modeling & RBAC Security Layer',
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-01-30'),
        isCompleted: true,
      },
      {
        sprintNumber: 2,
        sprintGoal: 'Candidate Tracking Kanban, Assessment Pipeline & Email Alerts',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-02-15'),
        isCompleted: false,
      },
    ],
  });

  // Kanban Tasks
  await Task.create([
    {
      project: capstoneProject._id,
      title: 'Design JWT Refresh Token Rotation Middleware',
      description: 'Implement secure HTTP-only cookies and token invalidation on logout.',
      assignedTo: studentUser._id,
      status: 'COMPLETED',
      priority: 'High',
      sprintNumber: 1,
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      project: capstoneProject._id,
      title: 'Build Candidate Kanban Drag-and-Drop Board',
      description: 'React interface allowing recruitment managers to transition candidates across interview stages.',
      assignedTo: studentUser._id,
      status: 'IN PROGRESS',
      priority: 'High',
      sprintNumber: 2,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      project: capstoneProject._id,
      title: 'Write MongoDB Aggregation Pipeline for Candidate Funnel',
      description: 'Calculate time-to-hire and pass rates across technical assessment rounds.',
      assignedTo: peerStudent1._id,
      status: 'TODO',
      priority: 'Medium',
      sprintNumber: 2,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      project: capstoneProject._id,
      title: 'Dockerize Backend Services with Multi-Stage Build',
      description: 'Optimize image size using node:22-alpine and configure docker-compose for local dev.',
      assignedTo: studentUser._id,
      status: 'REVIEW',
      priority: 'Medium',
      sprintNumber: 2,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  ]);

  await ProjectFile.create({
    project: capstoneProject._id,
    name: 'Enterprise_Architecture_SRS_v2.pdf',
    fileUrl: 'https://careerexpertglobal.com/resources/Enterprise_Architecture_SRS.pdf',
    fileType: 'application/pdf',
    sizeBytes: 450200,
    uploadedBy: mentorUser._id,
  });

  console.log('✨ Creating Companies, Job Opportunities, Interviews & Offers...');
  const comp1 = await Company.create({
    name: 'Cognizant Technology Solutions',
    logo: 'https://logo.clearbit.com/cognizant.com',
    website: 'https://www.cognizant.com',
    industry: 'Digital Transformation & Cloud Consulting',
    location: 'Bengaluru / Hyderabad',
    description: 'Global leader in enterprise cloud engineering, digital modernization, and AI systems.',
  });

  const comp2 = await Company.create({
    name: 'Infosys Limited',
    logo: 'https://logo.clearbit.com/infosys.com',
    website: 'https://www.infosys.com',
    industry: 'Enterprise Software & Cloud Platforms',
    location: 'Bengaluru / Pune / Hyderabad',
    description: 'Next-generation digital services and consulting leader driving enterprise software excellence.',
  });

  const job1 = await JobOpportunity.create({
    company: comp1._id,
    role: 'Associate Software Engineer - Full Stack',
    location: 'Hyderabad, India (Hybrid)',
    experience: 'Freshers Growth Cohort Graduates',
    skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'REST APIs'],
    salaryRange: '₹5.5 - 7.0 LPA',
    description: 'Join our cloud modernization unit building high-velocity web services for Fortune 500 financial clients.',
    interviewProcess: ['Online Aptitude & Code Test', 'Technical Round 1', 'Technical Round 2', 'HR & Leadership Discussion'],
    status: 'Open',
  });

  // Scheduled interview for student
  await Interview.create({
    candidate: studentUser._id,
    jobOpportunity: job1._id,
    companyName: 'Cognizant Technology Solutions',
    role: 'Associate Software Engineer - Full Stack',
    roundName: 'Technical Round 2 - System Architecture',
    scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    mode: 'Online',
    interviewer: 'Sudhir Varma (Senior Architect, CTS)',
    meetingLink: 'https://meet.google.com/cts-hiring-round2',
    status: 'Scheduled',
    feedback: 'Candidate cleared Round 1 with 92% score on coding challenge.',
  });

  // Offer
  await Offer.create({
    student: studentUser._id,
    companyName: 'Cognizant Technology Solutions',
    role: 'Associate Software Engineer',
    location: 'Hyderabad, India',
    compensation: '₹6.5 LPA CTC',
    joiningDate: new Date('2026-05-01'),
    offerLetterUrl: 'https://careerexpertglobal.com/docs/offers/CTS-FGT-0182.pdf',
    status: 'Received',
    verifiedByAdmin: true,
    remarks: 'Official offer letter received. Candidate undergoing final program certification.',
  });

  console.log('✨ Creating Verified Certificate Sample...');
  await Certificate.create({
    certificateId: 'CEGS-2025-FGT-0182',
    student: studentUser._id,
    candidateName: 'Saif Khan',
    programTitle: '6-Month Freshers Growth Training Program',
    trackName: 'Full Stack Development',
    completionDate: new Date('2026-04-15'),
    issueDate: new Date(),
    grade: 'Distinction (Top 5%)',
    verificationUrl: '/verify-certificate/CEGS-2025-FGT-0182',
    status: 'Issued',
    issuedBy: adminUser._id,
    skillsCertified: [
      'React & TypeScript Advanced Architecture',
      'Node.js & Express RESTful Systems',
      'MongoDB Aggregations & Database Optimization',
      'Enterprise Live Project Capstone Delivery',
      'Professional Communication & Leadership Presence',
    ],
  });

  console.log('✨ Creating Stipend Records...');
  const stipendMonths = [
    { month: 1, name: 'Month 1 (November 2025)', amount: 16500, status: 'Disbursed', ref: 'NEFT-CEGS-98218' },
    { month: 2, name: 'Month 2 (December 2025)', amount: 16500, status: 'Disbursed', ref: 'NEFT-CEGS-99431' },
    { month: 3, name: 'Month 3 (January 2026)', amount: 16500, status: 'Processing', ref: 'PENDING_BANK_APPROVAL' },
    { month: 4, name: 'Month 4 (February 2026)', amount: 16500, status: 'Eligible', ref: '' },
    { month: 5, name: 'Month 5 (March 2026)', amount: 16500, status: 'Eligible', ref: '' },
    { month: 6, name: 'Month 6 (April 2026)', amount: 16500, status: 'Eligible', ref: '' },
  ];

  for (const st of stipendMonths) {
    await StipendRecord.create({
      student: studentUser._id,
      monthNumber: st.month,
      monthName: st.name,
      expectedAmount: st.amount,
      amountPaid: st.status === 'Disbursed' ? st.amount : 0,
      status: st.status as any,
      paymentReference: st.ref,
      paymentDate: st.status === 'Disbursed' ? new Date() : undefined,
      remarks: st.status === 'Disbursed' ? 'Direct bank deposit confirmed.' : 'Batch processing under way.',
      processedBy: adminUser._id,
    });
  }

  console.log('✨ Creating In-App Notifications & Calendar Events...');
  await Notification.create([
    {
      recipient: studentUser._id,
      title: 'Upcoming Technical Round 2 Interview',
      message: 'Your interview with Cognizant Technology Solutions is scheduled for Friday at 3:00 PM.',
      type: 'interview',
      link: '/interviews',
      isRead: false,
    },
    {
      recipient: studentUser._id,
      title: 'New Assessment Result Published',
      message: 'You scored 96% in Week 9 Node.js Runtime Architecture assessment. Feedback added by mentor.',
      type: 'assessment',
      link: '/assessments',
      isRead: false,
    },
    {
      recipient: studentUser._id,
      title: 'Mentor Session Scheduled',
      message: 'Rajesh Ramanathan scheduled a 1-on-1 sprint review session for tomorrow at 4:30 PM.',
      type: 'mentor',
      link: '/mentorship',
      isRead: true,
    },
  ]);

  await CalendarEvent.create([
    {
      title: 'Live Technical Masterclass: Microservice Design',
      description: 'Hands-on session with Senior Technical Mentor Rajesh Ramanathan.',
      eventType: 'Class',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 26 * 60 * 60 * 1000),
      meetingLink: 'https://meet.google.com/cegs-fgt-class',
      location: 'Virtual Classroom 1',
      createdBy: mentorUser._id,
    },
    {
      title: 'Week 10 Intermediate Assessment Deadline',
      description: 'MongoDB Aggregations and Query Performance testing window closes.',
      eventType: 'Assessment',
      startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3600000),
      createdBy: mentorUser._id,
    },
    {
      title: 'Cognizant Round 2 Technical Interview',
      description: 'Online technical evaluation with CTS Hiring Panel.',
      eventType: 'CompanyInterview',
      startDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 3600000),
      meetingLink: 'https://meet.google.com/cts-hiring-round2',
      createdBy: adminUser._id,
    },
  ]);

  // Messages / Conversation between Student and Mentor
  const conv = await Conversation.create({
    participants: [studentUser._id, mentorUser._id],
    lastMessage: 'Sir, I have updated the Kanban task with the Dockerfile multi-stage configuration.',
    lastMessageAt: new Date(),
  });

  await Message.create([
    {
      conversation: conv._id,
      sender: mentorUser._id,
      content: 'Hello Saif, your performance in the Week 9 Node.js test was exemplary. Let us review the project sprint during our meeting.',
    },
    {
      conversation: conv._id,
      sender: studentUser._id,
      content: 'Thank you Rajesh sir! I have updated the Kanban task with the Dockerfile multi-stage configuration.',
    },
  ]);

  // Initial audit log
  await AuditLog.create({
    user: adminUser._id,
    userName: 'CEGS Administrator',
    userRole: 'admin',
    action: 'SYSTEM_INITIALIZED',
    module: 'CORE',
    recordId: program._id.toString(),
    metadata: { note: 'Initial database seed completed successfully.' },
  });

  await seedPaymentsIfEmpty();

  console.log('✅ CEGS LMS database seeding completed with 100% comprehensive realistic data!');
};

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}
