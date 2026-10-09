import { Router } from 'express';
import {
  getCompanies,
  createCompany,
  getJobOpportunities,
  createJobOpportunity,
  getInterviews,
  createInterview,
  updateInterview,
  getOffers,
  createOffer,
  updateOffer,
  getPlacementStats,
} from '../controllers/placementController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validate.js';
import { updateOfferSchema } from '../utils/schemas.js';

const router = Router();

router.use(authenticate);

// Companies & Jobs
router.get('/companies', getCompanies);
router.post('/companies', authorize('admin'), createCompany);
router.get('/jobs', getJobOpportunities);
router.post('/jobs', authorize('admin'), createJobOpportunity);

// Interviews
router.get('/interviews', getInterviews);
router.post('/interviews', authorize('admin', 'mentor'), createInterview);
router.put('/interviews/:id', authorize('admin', 'mentor'), updateInterview);

// Offers
router.get('/offers', getOffers);
router.post('/offers', authorize('admin'), createOffer);
router.put('/offers/:id', validateRequest(updateOfferSchema), updateOffer);

// Stats & Funnel
router.get('/stats', getPlacementStats);

export default router;
