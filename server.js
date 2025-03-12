const express = require('express');
const cors = require('cors');
const travellerRoutes = require('./routes/traveller.route.js');
const travelRoutes = require('./routes/travel.route.js');

require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors()); //เรียกข้ามโดเมน
app.use(express.json()); //เรียกใช้ json
app.use('/traveller', travellerRoutes);
app.use('/travel', travelRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Hello from backend server!' 
    });
});
   
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});