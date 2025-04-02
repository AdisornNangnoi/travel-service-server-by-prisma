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
    const { travelPlace, travelStartDate, travelEndDate, travelCostTotal, travellerId } = req.body;

    const travelImage = req.file ? req.file.path : ""; // ใช้ req.file.path เพื่อให้มั่นใจว่า Cloudinary จัดการให้แล้ว

    const result = await prisma.travel_tb.create({
      data: {
        travelPlace,
        travelStartDate,
        travelEndDate,
        travelCostTotal: parseFloat(travelCostTotal),
        travelImage,
        travellerId: Number(travellerId),
      },
    });

    res.status(201).json({
      message: "Travel created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "เกิดข้อผิดพลาด: " + error.message,
    });
  }
};

//-------------------------------------------------------------

// update Travel
exports.editTravel = async (req, res) => {
  try {
    const travel = await prisma.travel_tb.findFirst({
      where: { travelId: Number(req.params.travelId) },
    });

    if (!travel) {
      return res.status(404).json({ message: "ไม่พบข้อมูลที่ต้องการแก้ไข" });
    }

    let updatedData = {
      travellerId: Number(req.body.travellerId),
      travelPlace: req.body.travelPlace,
      travelStartDate: req.body.travelStartDate,
      travelEndDate: req.body.travelEndDate,
      travelCostTotal: parseFloat(req.body.travelCostTotal),
    };

    // ถ้ามีรูปใหม่ ให้ลบรูปเก่าออกจาก Cloudinary
    if (req.file) {
      if (travel.travelImage) {
        const publicId = travel.travelImage.split("/").pop().split(".")[0]; // ดึง public_id ออกจาก URL
        await cloudinary.uploader.destroy(`images/travel/${publicId}`);
      }
      updatedData.travelImage = req.file.path;
    }

    const result = await prisma.travel_tb.update({
      where: { travelId: Number(req.params.travelId) },
      data: updatedData,
    });

    res.status(200).json({
      message: "อัปเดตข้อมูลสำเร็จ",
      data: result,
    });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด: " + error.message });
  }
};

//-------------------------------------------------------------

// delete Travel
exports.deleteTravel = async (req, res) => {
  try {
    const result = await prisma.travel_tb.delete({
      where: {
        travelId: Number(req.params.travelId),
      },
    });

    // Delete the image from Cloudinary if it exists
    if (result.travelImage) {
      const publicId = result.travelImage.split("/").pop().split(".")[0]; // Extract public_id from URL
      await cloudinary.uploader.destroy(`images/travel/${publicId}`);
    }

    res.status(200).json({
      message: "Travel deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting travel: " + error.message,
    });
  }
};

//-------------------------------------------------------------
