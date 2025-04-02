const express = require('express');
const cors = require('cors');
const travellerRoutes = require('./routes/traveller.route.js');
const travelRoutes = require('./routes/travel.route.js');

require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: 'https://travel-dti-app-by-axios-mu.vercel.app',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // ถ้า backend ของคุณต้องการจัดการ credentials (cookies, authorization headers)
  optionsSuccessStatus: 204, // สำหรับบางเบราว์เซอร์
};

app.use(cors(corsOptions)); // เรียกข้ามโดเมนโดยกำหนดค่า
app.use(express.json()); // เรียกใช้ json
app.use('/traveller', travellerRoutes);
app.use('/travel', travelRoutes);
//กำหนดการเข้าถึงรูปภาพ
app.use('/images/travel', express.static('images/travel'));
app.use('/images/traveller', express.static('images/traveller'));

app.get('/', (req, res) => {
  res.json({
    message: 'Hello from backend server!'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});