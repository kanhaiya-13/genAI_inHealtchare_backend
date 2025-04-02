// Import required packages
const express = require("express");
const mongoose = require("mongoose");
const Hospital = require("../db");
const router = express.Router();

// GET all hospitals with their resource data
router.get("/api/hospitals", async (req, res) => {
  try {
    const hospitals = await Hospital.find();

    // Transform data to match the format expected by the frontend
    const formattedData = hospitals.map((hospital) => ({
      name: hospital.name,
      bedsAvailable: hospital.resources.beds.available,
      bedsNeeded: hospital.resources.beds.needed,
      doctorsAvailable: hospital.resources.doctors.available,
      doctorsNeeded: hospital.resources.doctors.needed,
      nursesAvailable: hospital.resources.nurses.available,
      nursesNeeded: hospital.resources.nurses.needed,
      icuBedsAvailable: hospital.resources.icuBeds.available,
      icuBedsNeeded: hospital.resources.icuBeds.needed,
      ambulancesAvailable: hospital.resources.ambulances.available,
      ambulancesNeeded: hospital.resources.ambulances.needed,
    }));

    res.status(200).json(formattedData);
  } catch (err) {
    console.error("Error fetching hospitals:", err);
    res
      .status(500)
      .json({ message: "Error retrieving hospital data", error: err.message });
  }
});

// GET data for a specific hospital by ID
router.get("/api/hospitals/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const formattedData = {
      name: hospital.name,
      bedsAvailable: hospital.resources.beds.available,
      bedsNeeded: hospital.resources.beds.needed,
      doctorsAvailable: hospital.resources.doctors.available,
      doctorsNeeded: hospital.resources.doctors.needed,
      nursesAvailable: hospital.resources.nurses.available,
      nursesNeeded: hospital.resources.nurses.needed,
      icuBedsAvailable: hospital.resources.icuBeds.available,
      icuBedsNeeded: hospital.resources.icuBeds.needed,
      ambulancesAvailable: hospital.resources.ambulances.available,
      ambulancesNeeded: hospital.resources.ambulances.needed,
    };

    res.status(200).json(formattedData);
  } catch (err) {
    console.error("Error fetching hospital:", err);
    res
      .status(500)
      .json({ message: "Error retrieving hospital data", error: err.message });
  }
});

// GET resource deficits across all hospitals
router.get("/api/deficits", async (req, res) => {
  try {
    const hospitals = await Hospital.find();

    // Calculate total deficits across all hospitals
    const totalDeficits = {
      beds: 0,
      doctors: 0,
      nurses: 0,
      icuBeds: 0,
      ambulances: 0,
    };

    hospitals.forEach((hospital) => {
      const deficits = hospital.calculateDeficits();

      Object.keys(deficits).forEach((resource) => {
        totalDeficits[resource] += deficits[resource];
      });
    });

    res.status(200).json(totalDeficits);
  } catch (err) {
    console.error("Error calculating deficits:", err);
    res.status(500).json({
      message: "Error calculating resource deficits",
      error: err.message,
    });
  }
});

// GET hospitals filtered by city and/or state
router.get("/api/hospitals/location/:city/:state?", async (req, res) => {
  const { city, state } = req.params;
  const query = { "location.city": city };

  if (state) {
    query["location.state"] = state;
  }

  try {
    const hospitals = await Hospital.find(query);

    const formattedData = hospitals.map((hospital) => ({
      name: hospital.name,
      bedsAvailable: hospital.resources.beds.available,
      bedsNeeded: hospital.resources.beds.needed,
      doctorsAvailable: hospital.resources.doctors.available,
      doctorsNeeded: hospital.resources.doctors.needed,
      nursesAvailable: hospital.resources.nurses.available,
      nursesNeeded: hospital.resources.nurses.needed,
      icuBedsAvailable: hospital.resources.icuBeds.available,
      icuBedsNeeded: hospital.resources.icuBeds.needed,
      ambulancesAvailable: hospital.resources.ambulances.available,
      ambulancesNeeded: hospital.resources.ambulances.needed,
    }));

    res.status(200).json(formattedData);
  } catch (err) {
    console.error("Error filtering hospitals by location:", err);
    res.status(500).json({
      message: "Error retrieving filtered hospital data",
      error: err.message,
    });
  }
});

// POST endpoint to create a new hospital
router.post("/api/hospitals", async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    const savedHospital = await hospital.save();
    res.status(201).json(savedHospital);
  } catch (err) {
    console.error("Error creating hospital:", err);
    res
      .status(400)
      .json({ message: "Error creating hospital", error: err.message });
  }
});

module.exports = router;
