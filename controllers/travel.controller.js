//นำเข้า moduule ต่างๆ
const multer = require("multer");
const path = require("path");
const fs = require("fs");

//ใช้ prisma ในการเชื่อมต่อฐานข้อมูล
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//ใช้ cloudinary ในการอัพโหลดรูปภาพ
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configuration
cloudinary.config({
  cloud_name: "dr1f4f8mr",
  api_key: "495799165433341",
  api_secret: "yKnkM6OpT_oQhdvj5PYaob0hnpw", // Click 'View API Keys' above to copy your API secret
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const newFile = "travel_" + Math.floor(Math.random() * Date.now()); // The name of the folder in Cloudinary

    return {
      folder: "images/travel", // The name of the folder in Cloudinary
      allowed_formats: ["jpg", "png", "jpeg", "gif"], // Allowed formats
      public_id: newFile, // The name of the file in Cloudinary
    };
  },
}); // Correct folder path,

//Travel Image upload function================================================
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "images/travel");
//   },
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       "travel_" +
//         Math.floor(Math.random() * Date.now()) +
//         path.extname(file.originalname)
//     );
//   },
// });

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
    const result = await prisma.travel_tb.create({
      data: {
        travelPlace: req.body.travelPlace,
        travelStartDate: req.body.travelStartDate,
        travelEndDate: req.body.travelEndDate,
        travelCostTotal: parseFloat(req.body.travelCostTotal),
        travelImage: req.file ? req.file.secure_url : "", // ใช้ secure_url หรือ url
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
    if (req.file) {
      const travel = await prisma.travel_tb.findFirst({
        where: {
          travelId: Number(req.params.travelId),
        },
      });
      // ลบรูปภาพเก่าออกจาก Cloudinary (ถ้ามี)
      if (travel.travelImage) {
        // แยก public_id ออกจาก URL (อาจต้องปรับตามรูปแบบ URL ของ Cloudinary)
        const publicId = travel.travelImage.split('/').pop().split('.')[0];
        cloudinary.uploader.destroy(`images/travel/${publicId}`);
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
          travelImage: req.file ? req.file.secure_url : "",
        },
      });
    } else {
      // โค้ดส่วนที่ไม่มีการอัปโหลดรูปภาพ
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
