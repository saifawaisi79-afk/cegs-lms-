import { Router } from 'express';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getConversations,
  getMessages,
  sendMessage,
  getCalendarEvents,
  createCalendarEvent,
} from '../controllers/communicationController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);

// Messages
router.get('/conversations', getConversations);
router.get('/messages/:conversationId', getMessages);
router.post('/messages', sendMessage);

// Calendar
router.get('/calendar/events', getCalendarEvents);
router.post('/calendar/events', createCalendarEvent);

export default router;
