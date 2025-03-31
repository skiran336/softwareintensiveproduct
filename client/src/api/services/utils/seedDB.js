require('dotenv').config();
const mongoose = require('mongoose');
const SIP = require('../models/sip');

const sampleProducts = [
  {
    name: 'Tesla Model S',
    category: 'Cars',
    manufacturer: 'Tesla',
    operatingSystems: ['Linux', 'QNX'],
    components: [
      {
        name: 'Autopilot ECU',
        type: 'hardware',
        specifications: {
          chip: 'Tesla FSD',
          memory: '8GB LPDDR4'
        }
      },
      {
        name: 'Infotainment System',
        type: 'software',
        dependencies: ['React', 'Node.js']
      }
    ],
    versions: [
      { version: '2023.12', cost: 79999, releaseDate: new Date('2023-03-15') }
    ],
    supplier: 'Tesla Inc'
  },
  {
    name: 'Nest Learning Thermostat',
    category: 'Home Appliances',
    manufacturer: 'Google',
    operatingSystems: ['FreeRTOS'],
    components: [
      {
        name: 'Zigbee Radio',
        type: 'hardware',
        specifications: {
          protocol: 'IEEE 802.15.4'
        }
      }
    ],
    versions: [
      { version: 'v3.0', cost: 249, releaseDate: new Date('2022-09-01') }
    ],
    supplier: 'Google Nest'
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await SIP.deleteMany();
  await SIP.insertMany(sampleProducts);
  console.log('Database seeded with 2 products!');
  process.exit();
}

seed();