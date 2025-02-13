import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  imageUrl: string;
  status: 'COMING_SOON' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  status: {
    type: String,
    enum: ['COMING_SOON', 'OPEN', 'IN_PROGRESS', 'COMPLETED'],
    default: 'COMING_SOON'
  }
}, {
  timestamps: true,
  versionKey: false
});

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema); 