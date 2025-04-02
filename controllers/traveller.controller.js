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

// Traveller Image upload function
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "images/traveller"); // Correct folder path
//   },
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       "traveller_" +
//         Math.floor(Math.random() * Date.now()) +
//         path.extname(file.originalname)
//     );
//   },
// });

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const newFile = "traveller_"+Math.floor(Math.random() * Date.now()) // The name of the folder in Cloudinary

    return {
      folder : "images/traveller", // The name of the folder in Cloudinary
      allowed_formats: ["jpg", "png", "jpeg", "gif"], // Allowed formats
      public_id: newFile, // The name of the file in Cloudinary
    };
  },
}); // Correct folder path,

//---------------------------------------------
exports.uploadTraveller = multer({
  storage: storage,
  limits: {
    fileSize: 1000000, // 1 MB
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
}).single("travellerImage");
//---------------------------------------------
// Create Traveller

exports.createTraveller = async (req, res) => {
  try {
    //-----
    const result = await prisma.traveller_tb.create({
      data: {
        travellerFullname: req.body.travellerFullname,
        travellerEmail: req.body.travellerEmail,
        travellerPassword: req.body.travellerPassword,
        travellerImage: req.file
          ? req.file.path.replace("images\\traveller\\", "")
          : "",
      },
    });
    //-----
    res.status(201).json({
      message: "Traveller created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Check Login for Traveller
exports.checkLoginTraveller = async (req, res) => {
  try {
    //-----
    const result = await prisma.traveller_tb.findFirst({
      where: {
        travellerEmail: req.params.travellerEmail,
        travellerPassword: req.params.travellerPassword,
      },
    });
    //-----
    if (result) {
      res.status(200).json({
        message: "Traveller login succesfully",
        data: result,
      });
    } else {
      res.status(404).json({
        message: "Traveller login failed",
        data: result,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Edit Traveller
exports.editTraveller = async (req, res) => {
  try {
    let result = {};
    //---------------------------------------------
    if (req.file) {
      //ค้นดูว่ามีรูปไหม ถ้ามีให้ลบรูปเก่าออก
      const traveller = await prisma.traveller_tb.findFirst({
        where: {
          travellerId: Number(req.params.travellerId),
        },
      });
      //ตตรวจสอบว่ามีรูปไหม
      if (traveller.travellerImage) {
        //ลบรูปเก่าออก
        const oldImagePath = "images/traveller/" + traveller.travellerImage;
        fs.unlink(oldImagePath, (err) => {
          console.log(err);
        });
      }

      //แก้ไขข้อมูล
      result = await prisma.traveller_tb.update({
        where: {
          travellerId: Number(req.params.travellerId),
        },
        data: {
          travellerFullname: req.body.travellerFullname,
          travellerEmail: req.body.travellerEmail,
          travellerPassword: req.body.travellerPassword,
          travellerImage: req.file.path.replace("images\\traveller\\", ""),
        },
      });
    } else {
      //แก้ไขข้อมูล
      result = await prisma.traveller_tb.update({
        where: {
          travellerId: Number(req.params.travellerId),
        },
        data: {
          travellerFullname: req.body.travellerFullname,
          travellerEmail: req.body.travellerEmail,
          travellerPassword: req.body.travellerPassword,
        },
      });
    }

    //---------------------------------------------
    res.status(200).json({ message: "Edit successfully!", data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
