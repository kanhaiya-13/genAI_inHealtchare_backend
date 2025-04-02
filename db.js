const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("dotenv").config();

try {
  mongoose.connect(process.env.MONGO_DB_URL);
  console.log("sucssesfully connected to db");
} catch (err) {
  console.log("can't connect to db");
}

// Resource Schema - defines the structure for each resource type
const ResourceSchema = new Schema({
  available: {
    type: Number,
    required: true,
    min: 0,
  },
  needed: {
    type: Number,
    required: true,
    min: 0,
  },
});

// Hospital Schema - main schema for hospital data
const HospitalSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    location: {
      address: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      zipCode: {
        type: String,
        trim: true,
      },
    },
    resources: {
      beds: ResourceSchema,
      doctors: ResourceSchema,
      nurses: ResourceSchema,
      icuBeds: ResourceSchema,
      ambulances: ResourceSchema,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    contact: {
      phone: String,
      email: String,
    },
  },
  { timestamps: true }
);

// Add indexes to optimize queries
HospitalSchema.index({ name: 1 });
HospitalSchema.index({ "location.city": 1, "location.state": 1 });

// Utility method to calculate resource gaps
HospitalSchema.methods.calculateDeficits = function () {
  const deficits = {};
  const resources = this.resources;

  Object.keys(resources).forEach((resource) => {
    if (resources[resource].needed && resources[resource].available) {
      deficits[resource] =
        resources[resource].needed - resources[resource].available;
    }
  });

  return deficits;
};

module.exports = mongoose.model("Hospital", HospitalSchema);
