const mongoose = require("mongoose");
const Event = require("../models/Event");
const Participant = require("../models/AntyodayaParticipant");
const POC = require("../models/PointOfContact");

const addParticipants = async (req, res) => {
  try {
    const { name, class: studentClass, phone, school, address, poc, events } = req.body;

    // Validate photo
    if (!req.file || !req.file.filename) {
      return res.status(400).send("Photo is required");
    }

    if (!name || !studentClass || !phone || !school || !address) {
      return res.status(400).send("All required fields must be filled");
    }

    const eventList = events
      ? (Array.isArray(events) ? events : events.split(","))
        .map((id) => id.trim())
        .filter(Boolean)
      : [];

    // Check 1: Maximum 2 events allowed per participant
    if (eventList.length > 2) {
      return res.status(400).send("Maximum 2 events allowed per participant");
    }

    // Check 2: Maximum 1 event per event group & Check 3: Max 3 dance participants per POC / School for current year
    if (eventList.length > 0) {
      const selectedEvents = await Event.find({ _id: { $in: eventList } });

      if (selectedEvents.length !== eventList.length) {
        return res.status(400).send("One or more selected events are invalid");
      }

      // Check only 1 event per group
      const eventGroups = selectedEvents.map((e) => e.eventGroup);
      const uniqueGroups = new Set(eventGroups);
      if (uniqueGroups.size !== eventGroups.length) {
        return res.status(400).send("Only 1 event per group is allowed");
      }

      // Check maximum 3 participants for dance for each school / POC in the current year
      const danceEvents = selectedEvents.filter((e) => e.eventName && /dance/i.test(e.eventName));
      const currentYear = new Date().getFullYear();

      for (const dEvent of danceEvents) {
        const queryFilter = {
          events: { $in: [dEvent._id, dEvent._id.toString()] },
          $or: [{ year: currentYear }, { year: { $exists: false } }, { year: null }],
        };

        if (poc && mongoose.Types.ObjectId.isValid(poc)) {
          queryFilter.poc = poc;
        } else if (school) {
          queryFilter.school = school.trim();
        }

        const danceCount = await Participant.countDocuments(queryFilter);
        if (danceCount >= 3 && school!="Anokhi Pehel") {  //to treat dance events as normal events for Anokhi Pehel, and allow more than 3 participants for dance event
          return res.status(400).send(`Maximum limit (3) for "${dEvent.eventName}" reached for this POC.`);
        }
      }
    }

    const validPoc = poc && mongoose.Types.ObjectId.isValid(poc) ? poc : null;

    // Create a new participant
    const newParticipant = new Participant({
      name,
      class: studentClass,
      phone,
      school: school.trim(),
      address,
      photo: req.file.filename,
      poc: validPoc,
      events: eventList,
      year: new Date().getFullYear(),
    });

    // Save participant to the database
    const savedParticipant = await newParticipant.save();

    // Update the event documents to add this participant to the respective events
    if (eventList.length > 0) {
      await Event.updateMany(
        { _id: { $in: eventList } },
        { $push: { participants: savedParticipant._id } }
      );
    }

    return res.status(201).send("Participant Added");
  } catch (error) {
    console.error("Error adding participant:", error);
    return res.status(500).send("Internal Server Error");
  }
};

const getAntyodayaDashboardStats = async (req, res) => {
  try {
    const [participants, pocs, events] = await Promise.all([
      Participant.aggregate([
        {
          $group: {
            _id: "$year",
            count: { $sum: 1 },
          },
        },
      ]),
      POC.aggregate([
        {
          $group: {
            _id: "$year",
            count: { $sum: 1 },
          },
        },
      ]),
      Event.aggregate([
        {
          $group: {
            _id: "$year",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      participants,
      pocs,
      events,
    });
  } catch (error) {
    console.error("Error fetching Antyodaya dashboard stats:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching Antyodaya dashboard stats",
    });
  }
};

module.exports = {
  addParticipants,
  getAntyodayaDashboardStats,
};

