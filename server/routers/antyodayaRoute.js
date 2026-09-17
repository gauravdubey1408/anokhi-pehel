const express = require("express");
const Event = require("../models/Event");
const Participant = require("../models/AntyodayaParticipant"); // Assuming the Event schema is located in models/Event.js
const router = express.Router();
const cors = require("cors");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const POC = require("../models/PointOfContact");
// Middleware setup
const app = express();
app.use(cors());
app.use(express.json()); // To parse incoming JSON data

// Route to add a new event
router.post("/addEvent", async (req, res) => {
//   const { eventName, eventDepartment, location, startTime,endTime, coordinator, phone, regNumber, festName } = req.body;
  try {
    
    const newEvent = new Event({...req.body});
     await newEvent.save();
    res.status(201).json({ success: true, message: "Event added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error. Event could not be added." });
  }
});

router.get("/getEvents", async (req, res) => {
    try {
      const events = await Event.find(); // Fetch all events from the database
      res.json(events); // Send the events as a JSON response
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events." }); // Send error response
    }
  });

  // Route to get an event by its ID
router.get("/getEventByEventId", async (req, res) => {
    const { eventId } = req.query; // Get eventId from query parameters
  
    try {
      const event = await Event.findById(eventId);
  
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.status(200).json(event);
    } catch (error) {
      console.error("Error fetching event by ID: ", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  router.delete("/deleteEvent", async (req, res) => {
    const { eventId } = req.query; // Get eventId from request parameters
//    console.log(eventId);
    try {
      // Check if the event exists
      const event = await Event.findById(eventId);
    //   console.log(event);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
  
      // Delete the event
      await Event.findByIdAndDelete(eventId);
      
      return res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error("Error deleting event:", error);
      return res.status(500).json({ message: "Server error, could not delete event" });
    }
  });


  router.post("/editEvent", async (req, res) => {
    const {
      eventId,
      eventName,
      eventGroup,
      location,
      startTime,
      endTime,
      coordinator,
      phone,
      regNumber,
      festName,
      subcategory,
      firstPlace,
      secondPlace,
      thirdPlace,
      fourthPlace,
    } = req.body;
   console.log(req.body);
    let updateFields = {
      eventName,
      eventGroup,
      location,
      startTime,
      endTime,
      coordinator,
      phone,
      regNumber,
      festName,
    };
  
    // Add winners based on subcategory
    switch (subcategory) {
      case "hindi6to8":
        // console.log("Setting h6to8 winners");
        updateFields.h6to8firstPlace = firstPlace;
        updateFields.h6to8secondPlace = secondPlace;
        updateFields.h6to8thirdPlace = thirdPlace;
        updateFields.h6to8fourthPlace = fourthPlace;
        break;
      case "hindi9to12":
        // console.log("Setting h9to12 winners");
        updateFields.h9to12firstPlace = firstPlace;
        updateFields.h9to12secondPlace = secondPlace;
        updateFields.h9to12thirdPlace = thirdPlace;
        updateFields.h9to12fourthPlace = fourthPlace;
        break;
      case "english6to8":
        // console.log("Setting e6to8 winners");
        updateFields.e6to8firstPlace = firstPlace;
        updateFields.e6to8secondPlace = secondPlace;
        updateFields.e6to8thirdPlace = thirdPlace;
        updateFields.e6to8fourthPlace = fourthPlace;
        break;
      case "english9to12":
        console.log("Setting e9to12 winners");
        updateFields.e9to12firstPlace = firstPlace;
        updateFields.e9to12secondPlace = secondPlace;
        updateFields.e9to12ThirdPlace = thirdPlace;
        updateFields.e9to12fourthPlace = fourthPlace;
        break;
      default:
        // console.log("Invalid subcategory:", subcategory);
        return res.status(400).json({ message: "Invalid subcategory" });
    }
    
  
    try {
      // Find the event by eventId and update it with the dynamic fields
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        updateFields,
        { new: true } // Return the updated document
      );
  
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
  
      res.status(201).json({
        message: "Event updated successfully",
        updatedEvent,
      });
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  



  router.post("/addPoc", async (req, res) => {
    try {
      const { nameOfPoc, contact, school } = req.body;
  
      // Validate input
      if (!nameOfPoc || !contact || !school) {
        return res.status(400).json({ message: "All fields are required." });
      }
  
      // Create new POC
      const newPoc = new POC({
        nameOfPoc,
        contact,
        school,
      });
  
      // Save to the database
      await newPoc.save();
  
      return res.status(201).json({ message: "Added", newPoc });
    } catch (error) {
      console.error("Error adding POC:", error);
      return res.status(500).json({ message: "Server error. Please try again." });
    }
  });


  router.get("/pocList", async (req, res) => {
    try {
      const pocList = await POC.find(); // Fetch all POCs from the database
      res.status(200).json(pocList);
    } catch (error) {
      console.error("Error fetching POC list:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.delete("/pocList/:id", async (req, res) => {
    try {
      const deletedPoc = await POC.findByIdAndDelete(req.params.id);
      if (!deletedPoc) {
        return res.status(404).send("POC not found");
      }
      res.status(200).send("POC deleted successfully");
    } catch (error) {
      res.status(500).send("Server error");
    }
  });

  router.get('/getPocById', async (req, res) => {
    const { pocId } = req.query;
//     const event = await Event.findById(eventId);
    // console.log(pocId);
    try {
      // Find the POC by ID
      const poc = await POC.findById(pocId);
  
      if (!poc) {
        return res.status(404).json({ message: 'POC not found' });
      }
  
      // Send back the POC details
      res.json(poc);
    //   console.log(poc);
    } catch (err) {
      console.error('Error fetching POC:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });


  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "antyodayaImages");
    },
    filename: function (req, file, cb) {
      cb(null, uuidv4() + "-" + Date.now() + path.extname(file.originalname));
    },
  });
  
  const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
  let upload = multer({ storage, fileFilter });
  app.use(express.urlencoded({ extended: true }));
  
  app.use("/uploads", express.static("uploads"));

  router.post("/addParticipants", upload.single("photo"), async (req, res) => {
    try {
      const { name, class: studentClass, phone, school, address, poc, events } = req.body;
      const eventList = events ? events.split(',') : [];
  
      // Create a new participant
      const newParticipant = new Participant({
        name,
        class: studentClass,
        phone,
        school,
        address,
        photo: req.file.filename,
        poc,
        events: eventList,
      });
  
      // Save participant to the database
      const savedParticipant = await newParticipant.save();
  
      // Update the event documents to add this participant to the respective events
      console.log("Event List:", eventList);

await Event.updateMany(
  { _id: { $in: eventList } }, // Match events by their IDs
  { $push: { participants: savedParticipant._id } } // Add the participant's ID to the participants array
);




      
  
      return res.status(201).send("Participant Added");
    } catch (error) {
      console.error("Error adding participant:", error);
      return res.status(500).send("Internal Server Error");
    }
  });
  
  
  router.post("/getParticipantsByIds", async (req, res) => {
    try {
      const { ids } = req.body;  // Expecting an array of participant IDs
      const participants = await Participant.find({ '_id': { $in: ids } });
      res.status(200).json(participants);  // Return the array of participants
    } catch (error) {
      console.error("Error fetching participants by IDs:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  
  router.get("/participantList", async (req, res) => {
    try {
      const students = await Participant.find();
    //   console.log(students);
      res.json(students);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.delete("/deleteParticipants/:studentId", async (req, res) => {
    const { studentId } = req.params;
  
    try {
      // Find and delete the participant by ID
      const deletedParticipant = await Participant.findByIdAndDelete(studentId);
  
      if (!deletedParticipant) {
        return res.status(404).json({ message: "Participant not found" });
      }
  
      // Successfully deleted participant
      res.status(200).json({ message: "Participant deleted successfully" });
    } catch (error) {
      console.error("Error deleting participant:", error);
      res.status(500).json({ message: "Server error" });
    }
  });


  
router.get("/getParticipantByUserId", async (req, res) => {
  // Extract the user ID from the request query parameters
  const student_id = req.query.studentid;

  try {
    // Query the database to retrieve the user based on the ID
    const student = await Participant.findById(student_id);
    // Check if the user exists
    if (!student) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(student);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Fetch all events with winners
router.get("/getEventsWithWinners", async (req, res) => {
  try {
    const events = await Event.find();
    // console.log(events);
    res.json(events);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});


module.exports = router;
