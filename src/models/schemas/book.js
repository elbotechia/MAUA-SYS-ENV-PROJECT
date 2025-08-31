        import mongoose from "mongoose";
import MongooseDelete from "mongoose-delete";

const BookSchema = new mongoose.Schema({
  title: {type: String, required: true},
  description: {type: String, required: true},
  author: {type: 'String', required: true},
  code: {type: String, unique: true},
  publishedYear: {type: Number},
  theme: {type: String},
  pages: {type: Number},
  language: {type: String, default: 'pt-BR'},
  status: {type: Boolean, default: true},
  coverImage: {type: String},
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
  isActive: {type: Boolean, default: true},
  cover: {type: mongoose.Schema.Types.ObjectId, ref: 'Storage', default: null},
  pdf: {type: mongoose.Schema.Types.ObjectId, ref: 'Storage', default: null},
  icon: {type: mongoose.Schema.Types.ObjectId, ref: 'Storage', default: null},
  sinopsis: {type: String, default: null},
  url: {type: String, default: null},
  repository: {type: String, default: null},
  documentations: [{type: String, default: null}],
  comments: [
    {
      user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
      comment: {type: String},
      date: {type: Date, default: Date.now}
    }
  ],
  ratings: [
    {
      user: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
      rating: {type: Number, min: 1, max: 5}
    }
  ]
  , 
  likes: {type: Number, default: 0},
  dislikes: {type: Number, default: 0},
  views: {type: Number, default: 0},
  downloads: {type: Number, default: 0},
  tags: [{type: String}]

}, {
  timestamps: true,
  versionKey: false
});

BookSchema.plugin(MongooseDelete, { overrideMethods: 'all', deletedAt: true});

export const Book = mongoose.model('book', BookSchema);
    

