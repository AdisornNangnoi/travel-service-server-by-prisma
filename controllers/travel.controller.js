//นำเข้า moduule ต่างๆ
const multer = require("multer");
const path = require("path");
const fs = require("fs");

//ใช้ prisma ในการเชื่อมต่อฐานข้อมูล
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//Travel Image upload function================================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/travel");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      "travel_" +
        Math.floor(Math.random() * Date.now()) +
        path.extname(file.originalname)
    );
  },
});
exports.uploadTravel = multer({
  storage: storage,
  limits: {
    fileSize: 1000000,
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimetype = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb("Error: Images Only!");
  },
}).single("travelImage");

// get one Travel
exports.getTravel = async (req, res) => {
    try {
        //-------
        const result = await prisma.travel_tb.findFirst({
            where: {
                travelId: Number(req.params.travelId),
            },
            });
      if (result) {
        res.status(200).json({
          message: "Travel get successfully",
          data: result,
        });
      } else {
        res.status(404).json({
          message: "Travel get failed",
          data: null,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
//-------------------------------------------------------------

// get Travel
exports.getAllTravel = async (req, res) => {
  try {
    //-------
    const result = await prisma.travel_tb.findMany({
      where: {
        travellerId: Number(req.params.travellerId),
      },
    });
    //-------
    if (result) {
      res.status(200).json({
        message: "Travel get successfully",
        data: result,
      });
    } else {
      res.status(404).json({
        message: "Travel get failed",
        data: null,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
//-------------------------------------------------------------

// Create Travel
exports.createTravel = async (req, res) => {
  try {
    //-------
    const result = await prisma.travel_tb.create({
      data: {
        travelPlace: req.body.travelPlace,
        travelStartDate: req.body.travelStartDate,
        travelEndDate: req.body.travelEndDate,
        travelCostTotal: parseFloat(req.body.travelCostTotal),
        travelImage: req.file
          ? req.file.path.replace("images\\travel\\", "")
          : "",
        travellerId: Number(req.body.travellerId),
      },
    });
    res.status(201).json({
      message: "Travel created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
//-------------------------------------------------------------

// update Travel
exports.editTravel = async (req, res) => {
  try {
    let result = {};
    //---------------------------------------------
    if (req.file) {
      //ค้นดูว่ามีรูปไหม ถ้ามีให้ลบรูปเก่าออก
      const travel = await prisma.travel_tb.findFirst({
        where: {
          travelId: Number(req.params.travelId),
        },
      });
      if (travel.travelImage) {
        fs.unlinkSync("images/travel/" + travel.travelImage);
      }
      result = await prisma.travel_tb.update({
        where: {
          travelId: Number(req.params.travelId),
        },
        data: {
          travellerId: Number(req.body.travellerId),
          travelPlace: req.body.travelName,
          travelStartDate: req.body.travelStartDate,
          travelEndDate: req.body.travelEndDate,
          travelCostTotal: parseFloat(req.body.travelCostTotal),
          travelImage: req.file
            ? req.file.path.replace("images\\travel\\", "")
            : "",
        },
      });
    } else {
      result = await prisma.travel_tb.update({
        where: {
          travelId: Number(req.params.travelId),
        },
        data: {
          travellerId: Number(req.body.travellerId),
          travelPlace: req.body.travelName,
          travelStartDate: req.body.travelStartDate,
          travelEndDate: req.body.travelEndDate,
          travelCostTotal: parseFloat(req.body.travelCostTotal),
        },
      });
    }
    res.status(200).json({
      message: "Travel updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
//-------------------------------------------------------------

// delete Travel
exports.deleteTravel = async (req, res) => {
  try {
    //-------
    const result = await prisma.travel_tb.delete({
      where: {
        travelId: Number(req.params.travelId),
      },
    });
    if (result.travelImage) {
      fs.unlinkSync("images/travel/" + result.travelImage);
    }
    //-------
    res.status(200).json({
      message: "Travel deeleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
//-------------------------------------------------------------
