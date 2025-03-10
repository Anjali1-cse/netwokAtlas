const express = require("express");
const multer = require("multer");
const xlsx = require("xlsx");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config(); 
const fs = require("fs");

const app = express();
const port = xxxxx;


app.use(cors());
app.use(express.json());


const pool = new Pool({
  user: "xxxxxxx",
  host: "xxxxxx",
  database: "xxxxxxx",
  password: "xxxxxxxxx", 
  port: "xxxx",
});


const fetchDistinct = async (column, type) => {
  try {
    const table = type === "mdwdm" ? "NEW_MDWDM_ROUTES" : "DWDM_ROUTES";
    const result = await pool.query(
      `SELECT DISTINCT "${column}" FROM "${table}" ORDER BY "${column}";`
    );
    return result.rows;
  } catch (err) {
    throw new Error(err.message);
  }
};


const buildGraphFromDB = async (type) => {
  try {
    const table = type === "mdwdm" ? "NEW_MDWDM_ROUTES" : "DWDM_ROUTES";
    const result = await pool.query(`
      SELECT "POP_ID A", "POP_ID B", "STN_A ID", "STN_B ID", "ROUTE NAME", "ROUTE KM"
      FROM "${table}";
    `);
    if (!result.rows || result.rows.length === 0) {
      throw new Error("No data found in the table: " + table);
    }

    const graph = {};

    result.rows.forEach(({ "POP_ID A": stnA, "POP_ID B": stnB, "STN_A ID": stnNameA, "STN_B ID": stnNameB, "ROUTE NAME": routeName, "ROUTE KM": distance }) => {
      const keyA = stnA.trim().toUpperCase();
      const keyB = stnB.trim().toUpperCase();

      if (!graph[keyA]) graph[keyA] = [];
      if (!graph[keyB]) graph[keyB] = [];

      graph[keyA].push({ neighbor: keyB, stnName: stnNameB, routeName, distance });
      graph[keyB].push({ neighbor: keyA, stnName: stnNameA, routeName, distance });
    });

    return graph;
  } catch (err) {
    throw new Error("Error building graph from DB: " + err.message);
  }
};

const bfsFindRoute = (graph, start, end) => {
  const startKey = start.trim().toUpperCase();
  const endKey = end.trim().toUpperCase();
  
  if (!graph[startKey] || !graph[endKey]) {
    return { error: `No valid route found. POP ${start} or ${end} does not exist in the network.` };
  }

  const queue = [[startKey, [startKey], 0, []]];
  const pq = new Map();  
  pq.set(startKey, 0); 
  const visited = new Set();

  while (queue.length > 0) {
    const [current, path, totalDistance, routeNames] = queue.shift();

    if (current === endKey) return { path, totalDistance: Math.round(totalDistance), routeNames };

    if (!visited.has(current)) {
      visited.add(current);
      for (const { neighbor, routeName, distance } of graph[current]) {
        if (!visited.has(neighbor)) {
          queue.push([
            neighbor,
            [...path, neighbor],
            totalDistance + Math.round(distance), 
            [...routeNames, routeName]
          ]);
        }
      }
    }
  }
  return null;
};

app.post("/route/:type", async (req, res) => {
  const { popA, popB } = req.body;
  const { type } = req.params;

  if (!popA || !popB) {
    return res.status(400).json({ message: "Both popA and popB are required" });
  }

  try {
    const graph = await buildGraphFromDB(type);
    
    const result = bfsFindRoute(graph, popA, popB);
    if (!result) {
      return res.status(404).json({ message: `No route found from ${popA} to ${popB}` });
    }

    const selectedRoutes = result.path.map((station, index) => {
      if (index < result.path.length - 1 && graph[station]) {
        const segment = graph[station].find(s => s.neighbor === result.path[index + 1]) || {};
        return {
          from: station,
          to: result.path[index + 1],
          routeName: segment.routeName || "Unknown Route",
          distance: Math.round(segment.distance || 0)
        };
      }
      return null;
    }).filter(Boolean);

    res.json({
      route: result.path.join(" -> "),
      totalDistance: result.totalDistance,
      unit: "km",
      routeNames: result.routeNames.join(", "),
      selectedRoutes
    });
  } catch (err) {
    console.error("Error finding route:", err.message);
    res.status(500).send("Server Error");
  }
});



app.get("/routes", async (req, res) => {
  const { type } = req.query;
  console.log("Requested type:", type); 
  try {
    const table = type === "mdwdm" ? "NEW_MDWDM_ROUTES" : "DWDM_ROUTES";
    const result = await pool.query(`
      SELECT 
        id, 
        "TYPE", 
        "SECTION_ID",
        "ADITIONAL_",  
        "REGION", 
        "TERRITORY", 
        "ROUTE NAME" AS "ROUTE_NAME", 
        "o&m_sectio" AS "OM_SECTION",
        ST_AsGeoJSON(geom) AS geojson
      FROM 
        "${table}";
    `);

    const routes = result.rows.map((row) => ({
      id: row.id,
      type: row.TYPE,
      SECTION_ID: row.SECTION_ID,
      ADITIONAL: row.ADITIONAL_,
      REGION: row.REGION,
      TERRITORY: row.TERRITORY,
      ROUTE_NAME: row.ROUTE_NAME || "Not Available",
      OM_SECTION: row.OM_SECTION || "Not Available",
      geometry: JSON.parse(row.geojson),
    }));

    res.json(routes);
  } catch (err) {
    console.error("Error fetching routes:", err.message);
    res.status(500).send("Server Error");
  }
});


app.get("/pop", async (req, res) => {
  const { type } = req.query; 
  try {
   
    let table = "POP_LOCATION"; 
    if (type === "MDWDM_POP_LOCATION") {
      table = "MDWDM_POP_LOCATION";
    }
    const result = await pool.query(`
      SELECT 
        id, 
        "EQP_TYPE", 
        "POP_ID", 
        "STN_CODE", 
        "REGION", 
        "TERRITORY", 
        "STN_NAME", 
        ST_AsGeoJSON(geom) AS geojson
      FROM 
         "${table}";
    `);

    const pops = result.rows.map((row) => ({
      id: row.id,
      EQP_TYPE: row.EQP_TYPE,
      POP_ID: row.POP_ID,
      STN_CODE: row.STN_CODE,
      REGION: row.REGION,
      TERRITORY: row.TERRITORY,
      STN_NAME: row.STN_NAME,
      geometry: JSON.parse(row.geojson),
    }));

    res.json(pops);
  } catch (err) {
    console.error("Error fetching POPs:", err.message);
    res.status(500).send("Server Error");
  }
});


app.get("/api/:type/types", async (req, res) => {
  const { type } = req.params; 
  try {
    const types = await fetchDistinct("TYPE", type);
    res.json(types);
  } catch (err) {
    console.error("Error fetching types:", err.message);
    res.status(500).send("Server Error");
  }
});


app.get("/api/:type/regions", async (req, res) => {
  const { type } = req.params; 
  try {
    const regions = await fetchDistinct("REGION", type);
    res.json(regions);
  } catch (err) {
    console.error("Error fetching regions:", err.message);
    res.status(500).send("Server Error");
  }
});


app.get("/api/:type/territories", async (req, res) => {
  const { type } = req.params; 
  try {
    const territories = await fetchDistinct("TERRITORY", type);
    res.json(territories);
  } catch (err) {
    console.error("Error fetching territories:", err.message);
    res.status(500).send("Server Error");
  }
});

const upload = multer({ dest: "uploads/" });
app.post("/upload", upload.single("file"), async (req, res) => {
  console.log("Uploaded File:", req.file); 

  try {
    const filePath = req.file.path;

    const workbook = xlsx.readFile(filePath);
    console.log("Workbook Sheets:", workbook.SheetNames);

    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    for (const row of data) {
      console.log("Row Data:", row);
      const { "POP_ID A": popA, "POP_ID B": popB, longitudeA, latitudeA, longitudeB, latitudeB } = row;
      await pool.query(
        "INSERT INTO stations (pop_id_a, pop_id_b, longitude_a, latitude_a, longitude_b, latitude_b) VALUES ($1, $2, $3, $4, $5, $6)",
        [popA, popB, longitudeA, latitudeA, longitudeB, latitudeB]
      );
    }

    fs.unlinkSync(filePath);
    res.json({ message: "File uploaded and data saved!" });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/stations", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM stations");
    res.json(result.rows);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});


app.get("/railway", async (req, res) => { 
  try {
    const result = await pool.query(`
      SELECT  
        ST_AsGeoJSON(ST_Simplify(geom, 0.01)) AS geojson
      FROM 
        "OFC_ROUTES";
    `);

    res.json({
      type: "FeatureCollection",
      features: result.rows.map(row => JSON.parse(row.geojson))
  });
  } catch (err) {
    console.error("Error fetching routes:", err.message);
    res.status(500).send("Server Error");
  }
});




app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
