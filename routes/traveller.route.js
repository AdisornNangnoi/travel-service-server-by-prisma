//This file is used to manage routing for service/API calls
//This file works with traveller_tb
const travellerCtrl = require("./../controllers/traveller.controller.js");

//call express to use router module
const express = require("express");
const router = express.Router();

//Routing is based on RESTful API principles
//GET = ค้นหา ตรวจสอบ ดึง ดู, POST = เพิ่ม, PUT = แก้ไข, DELETE = ลบ
router.post("/",travellerCtrl.uploadTraveller,  travellerCtrl.createTraveller);
router.get("/:travellerEmail/:travellerPassword", travellerCtrl.checkLoginTraveller);
router.put("/:travellerId", travellerCtrl.uploadTraveller,travellerCtrl.editTraveller);


//export router for call to use
module.exports = router;