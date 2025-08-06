import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
  content: string;
  author: {
    userId: mongoose.Types.ObjectId;
    username: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>({
  content: {
    type: String,
    required: [true, '投稿内容は必須です'],
    trim: true,
    maxlength: [200, '投稿は200文字以内で入力してください']
  },
  author: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, '投稿者IDは必須です']
    },
    username: {
      type: String,
      required: [true, '投稿者名は必須です']
    }
  }
}, {
  timestamps: true
});

export default mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);