const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors({ origin: "*" })); // Allow all origins

app.use(express.json()); // Parse JSON request body

// Connect to MongoDB
mongoose.connect("mongodb+srv://rahul:rahul@cluster0.l5ugu.mongodb.net/espdata", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// Store the latest status and location
let status = 'OFF';
let latitude = null;
let longitude = null;

// Endpoint to update status and location
app.post('/UpdateStatus', (req, res) => {
    const { status: newStatus, latitude: newLat, longitude: newLong } = req.body;

    // Update the status and location
    status = newStatus;
    latitude = newLat;
    longitude = newLong;

    console.log(`Status updated to: ${status}, Location: ${latitude}, ${longitude}`);
    res.status(200).json({ message: 'Status updated successfully' });
});

// Endpoint for ESP8266 to fetch the latest status and location
app.get('/fetch', (req, res) => {
    res.status(200).json({ status, latitude, longitude });
});


// User Schema
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    mobile: String,
    password: String
});

const UserModel = mongoose.model("User", UserSchema);

// Register API
app.post("/register", async (req, res) => {
    try {
        const { name, email, mobile, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ name, email, mobile, password: hashedPassword });
        await newUser.save();
        res.json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login API
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login successful", token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 10000; // Use Render's assigned port
app.listen(PORT, "0.0.0.0", () => console.log(`Server running on port ${PORT}`));
