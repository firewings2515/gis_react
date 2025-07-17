import express from "express"
import cors from "cors"
import fs from 'fs';
import csv from 'csv-parser';

const PORT = 8080;

const app = express();

const corsOptions = {
    origin: "*"
}

app.use(cors(corsOptions))

app.get("/", (req, res) => {
    res.json({
        blogPost: [{title: "test  title", content: "test content"}]
    })
})

app.get("/yearlist", (req, res) => {
    res.json({
        years: [2020, 2021, 2022, 2023, 2024, 2025]
    })
})

const csvFilePath = './data/gps.csv';
app.get('/get_gps', (req, res) => {
    const results = [];
  
    fs.createReadStream(csvFilePath)
      .pipe(csv([
        'timestamp',
        'imageName',
        'lng',
        'lat',
        'x',
        'y',
        'height',
        'h2',
        'yaw',
        'pitch',
        'roll',
        'float_value'
      ]))
      .on('data', (data) => {
        // Convert numeric fields
        results.push({
          timestamp: data.timestamp,
          imageName: data.imageName,
          lng: parseFloat(data.lng),
          lat: parseFloat(data.lat),
          x: parseFloat(data.x),
          y: parseFloat(data.y),
          height: parseFloat(data.height),
          h2: parseFloat(data.h2),
          yaw: parseFloat(data.yaw),
          pitch: parseFloat(data.pitch),
          roll: parseFloat(data.roll),
          float_value: parseFloat(data.float_value),
        });
      })
      .on('end', () => {
        res.json({ gpsData: results });
      })
      .on('error', (err) => {
        res.status(500).json({ error: 'Failed to read CSV', details: err.message });
      });
  });

app.listen(PORT, () => {
    console.log("Server started on post 8080")
})