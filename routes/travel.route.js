const travelCtrl = require("./../controllers/travel.controller.js");
const express = require("express");
const router = express.Router();

router.post("/", travelCtrl.uploadTravel, travelCtrl.createTravel);

router.get("/:travellerId", travelCtrl.getAllTravel);

router.get("/one/:travelId", travelCtrl.getTravel);

router.put("/:travelId", travelCtrl.uploadTravel, travelCtrl.editTravel);

router.delete("/:travelId", travelCtrl.deleteTravel);

module.exports = router;
