import { Schema, model, models } from 'mongoose';

export interface IChatbotTicketAttachment {
  kind: 'image' | 'audio';
  url: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface IChatbotTicket {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  issueType: string;
  urgency: string;
  preferredContact: string;
  orderOrProductRef?: string;
  description: string;
  answers: {
    roomOrProduct?: string;
    triedAlready?: string;
    bestTimeToCall?: string;
  };
  attachments: IChatbotTicketAttachment[];
  status: 'open' | 'in-review' | 'contacted' | 'resolved';
  source: string;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const ChatbotTicketAttachmentSchema = new Schema<IChatbotTicketAttachment>(
  {
    kind: { type: String, enum: ['image', 'audio'], required: true },
    url: { type: String, required: true, trim: true },
    filename: { type: String, default: '', trim: true },
    contentType: { type: String, default: '', trim: true },
    size: { type: Number, default: 0 },
  },
  { _id: false }
);

const ChatbotTicketSchema = new Schema<IChatbotTicket>(
  {
    customerName: { type: String, default: 'Chatbot Visitor', trim: true },
    customerEmail: { type: String, default: '', trim: true, lowercase: true },
    customerPhone: { type: String, required: true, trim: true },
    issueType: { type: String, required: true, trim: true },
    urgency: { type: String, default: 'Normal', trim: true },
    preferredContact: { type: String, default: 'Phone call', trim: true },
    orderOrProductRef: { type: String, default: '', trim: true },
    description: { type: String, required: true, trim: true },
    answers: {
      roomOrProduct: { type: String, default: '', trim: true },
      triedAlready: { type: String, default: '', trim: true },
      bestTimeToCall: { type: String, default: '', trim: true },
    },
    attachments: { type: [ChatbotTicketAttachmentSchema], default: [] },
    status: {
      type: String,
      enum: ['open', 'in-review', 'contacted', 'resolved'],
      default: 'open',
    },
    source: { type: String, default: 'chatbot', trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ChatbotTicketSchema.index({ createdAt: -1 });
ChatbotTicketSchema.index({ status: 1, createdAt: -1 });

export default models.ChatbotTicket || model<IChatbotTicket>('ChatbotTicket', ChatbotTicketSchema);
