const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "user"], default: "user" }, // Default to "user"
});

// Ensure first registered user becomes admin automatically
UserSchema.pre("save", async function (next) {
  if (this.isNew) {
    const existingAdmin = await mongoose.model("User").findOne({ role: "admin" });
    if (!existingAdmin) {
      this.role = "admin"; // First user is an admin
    }
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
