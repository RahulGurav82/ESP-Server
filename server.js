const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON request body

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/espdata", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// Data Model
const DataSchema = new mongoose.Schema({
    mode: String,
    km: Number
});

const DataModel = mongoose.model("Data", DataSchema);

// 1️⃣ **API: Store Mode & KM (POST)**
app.post("/store", async (req, res) => {
    try {
        const { mode, km } = req.body;
        await DataModel.deleteMany(); // Keep only the latest entry
        const newData = new DataModel({ mode, km });
        await newData.save();
        res.json({ message: "Data stored successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2️⃣ **API: Delete Data (DELETE)**
app.delete("/delete", async (req, res) => {
    try {
        await DataModel.deleteMany(); 
        res.json({ message: "Data deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/fetch", async (req, res) => {
    console.log("data")
    try {
        const data = await DataModel.findOne();
        if (data) {
            res.json({ mode: data.mode });
        } else {
            res.json({ mode: "Off" }); // Return "Off" if no data is found
        }
    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Start Server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
