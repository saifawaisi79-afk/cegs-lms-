import { Request, Response } from 'express';
import { Notification, Conversation, Message, CalendarEvent } from '../models/Communication.js';
import { AuthRequest } from '../middleware/auth.js';

// NOTIFICATIONS
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

    res.status(200).json({ success: true, count: notifications.length, unreadCount, data: notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.status(200).json({ success: true, data: notification });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    await Notification.updateMany({ recipient: req.user._id }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CONVERSATIONS & MESSAGES
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name email avatar role')
      .sort({ lastMessageAt: -1 });

    res.status(200).json({ success: true, count: conversations.length, data: conversations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const { conversationId } = req.params;
    
    // Check if user is participant
    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      res.status(404).json({ success: false, message: 'Conversation not found' });
      return;
    }
    if (req.user.role !== 'admin' && !conv.participants.includes(req.user._id)) {
      res.status(403).json({ success: false, message: 'Forbidden: You are not a participant' });
      return;
    }
    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    let { conversationId, recipientId, content } = req.body;

    if (!conversationId && recipientId) {
      // Find or create conversation
      let conv = await Conversation.findOne({
        participants: { $all: [req.user._id, recipientId] },
      });
      if (!conv) {
        conv = await Conversation.create({
          participants: [req.user._id, recipientId],
          lastMessage: content,
          lastMessageAt: new Date(),
        });
      }
      conversationId = conv._id;
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      content,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content,
      lastMessageAt: new Date(),
    });

    const populated = await Message.findById(message._id).populate('sender', 'name email avatar');
    res.status(201).json({ success: true, data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CALENDAR
export const getCalendarEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, eventType } = req.query;
    const query: any = {};

    if (eventType) query.eventType = eventType;
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate as string);
      if (endDate) query.startDate.$lte = new Date(endDate as string);
    }

    const events = await CalendarEvent.find(query).sort({ startDate: 1 });
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCalendarEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const event = await CalendarEvent.create({
      ...req.body,
      createdBy: req.user?._id,
    });
    res.status(201).json({ success: true, data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
