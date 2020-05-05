import { model, Schema, Model, Document } from "mongoose"
const postSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  type:{
    type: String,
    required:true
  }
})
export interface PostDocument extends Document {
  title: string
  text: string
  time: string
  username: string
  userId: string
  type: string
}
const Post: Model<PostDocument> = model("post", postSchema)
export default Post
