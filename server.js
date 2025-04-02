const express = require("express");
const cors = require("cors");
const travellerRoutes = require("./routes/traveller.route.js");
const travelRoutes = require("./routes/travel.route.js");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "https://travel-dti-app-by-axios-mu.vercel.app", // ระบุเฉพาะ Frontend ที่อนุญาต
    methods: ["GET", "POST", "PUT", "DELETE"], // กำหนด Method ที่อนุญาต
    credentials: true, // ถ้าต้องการให้ส่ง cookies ไปด้วย
  })
); //เรียกข้ามโดเมน
app.use(express.json()); //เรียกใช้ json
app.use("/traveller", travellerRoutes);
app.use("/travel", travelRoutes);
//กำหนดการเข้าถึงรูปภาพ
app.use("/images/travel", express.static("images/travel"));
app.use("/images/traveller", express.static("images/traveller"));

app.get("/", (req, res) => {
  res.json({
    message: "Hello from backend server!",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
