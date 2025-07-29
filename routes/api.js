const express = require('express');
const router = express.Router();
const Encroachment = require('../models/Encroachment');

// Add a debug line to be 100% sure the model is loaded.
// When you restart the server, you should see the model details in the terminal.
console.log("Encroachment model loaded in API:", Encroachment);

// GET route: To fetch all encroachment reports (with filtering)
// URL: GET /api/encroachments
router.get('/encroachments', async (req, res) => {
    try {
        let filter = {};
        const { year, month, tankName } = req.query; // Add tankName here

        // Filter by specific tank name if provided
        if (tankName) {
            filter.tankName = tankName;
        }

        // Filter by date if provided
        if (year && month) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 1);
            filter.observationDate = { $gte: startDate, $lt: endDate };
        } else if (year) {
            const startDate = new Date(year, 0, 1);
            const endDate = new Date(Number(year) + 1, 0, 1);
            filter.observationDate = { $gte: startDate, $lt: endDate };
        }

        const items = await Encroachment.find(filter).sort({ observationDate: -1 });
        res.json(items);

    } catch (err) {
        console.error("Error fetching items:", err); // Log the real error on the server
        res.status(500).json({ msg: 'Server error while fetching reports' });
    }
});

// POST route: To submit a new encroachment report
router.post('/encroachments', async (req, res) => {
    try {
        const newEncroachment = new Encroachment({
            tankName: req.body.tankName,
            location: req.body.location,
            encroachmentType: req.body.encroachmentType,
            observationDate: req.body.observationDate,
            // --- ADD THIS LINE ---
            description: req.body.description // Get the description from the request body
        });

        const item = await newEncroachment.save();
        res.status(201).json(item);

    } catch (err) {
        console.error("Error saving item:", err);
        res.status(400).json({ msg: 'Error saving to database', error: err.message });
    }
});

module.exports = router;