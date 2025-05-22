import mongoose from "mongoose";

const linkSchema = new mongoose.Schema({
  title: String,
  url: String,
});

const fellowSchema = new mongoose.Schema({
  name: String,
  year: String,
  bio: String,
  topic: String,
  faculty: String,
  photoId: mongoose.Types.ObjectId,
  links: [linkSchema],
});

const Fellow = mongoose.model("Fellow", fellowSchema);
export default Fellow;
