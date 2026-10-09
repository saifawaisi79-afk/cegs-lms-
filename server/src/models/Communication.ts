import mongoose, { Document, Schema, Model } from 'mongoose';

// NOTIFICATION MODEL
export type NotificationType =
  | 'lesson'
  | 'assessment'
  | 'mentor'
  | 'project'
  | 'interview'
  | 'placement'
  | 'certificate'
  | 'stipend'
  | 'announcement';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: [
        'lesson',
        'assessment',
        'mentor',
        'project',
        'interview',
        'placement',
        'certificate',
        'stipend',
        'announcement',
      ],
      default: 'announcement',
    },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// CONVERSATION MODEL
export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// MESSAGE MODEL
export interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    attachmentUrl: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// CALENDAR EVENT MODEL
export type CalendarEventType =
  | 'Class'
  | 'Assessment'
  | 'MentorSession'
  | 'MockInterview'
  | 'CompanyInterview'
  | 'ProjectDeadline'
  | 'Announcement';

export interface ICalendarEvent extends Document {
  title: string;
  description: string;
  eventType: CalendarEventType;
  startDate: Date;
  endDate: Date;
  track?: mongoose.Types.ObjectId;
  attendees?: mongoose.Types.ObjectId[]; // ref User
  meetingLink?: string;
  location?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    eventType: {
      type: String,
      enum: [
        'Class',
        'Assessment',
        'MentorSession',
        'MockInterview',
        'CompanyInterview',
        'ProjectDeadline',
        'Announcement',
      ],
      default: 'Class',
      index: true,
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true },
    track: { type: Schema.Types.ObjectId, ref: 'Track' },
    attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    meetingLink: { type: String, default: '' },
    location: { type: String, default: 'Virtual Classroom' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Notification: Model<INotification> =
  mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export const Conversation: Model<IConversation> =
  mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export const CalendarEvent: Model<ICalendarEvent> =
  mongoose.models.CalendarEvent ||
  mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
