import React, { useEffect, useState,useMemo, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import './MapArea.css';

const MapArea = ({ selectedNetwork,selectedType,selectedRouteNames }) => {
    // Default to DWDM
  const [routes, setRoutes] = useState([]);
  const [popData, setPopData] = useState([]);
  const mapRef = useRef(null);

  // Fetch routes data when selectedNetwork changes
  useEffect(() => {
    setRoutes([]); // Clear old data before fetching new
    if (!selectedNetwork) return;
    const routeType = selectedNetwork;
    fetch(`http://localhost:3001/routes?type=${routeType}`)
      .then((res) => res.json())
      .then((data) => setRoutes(data))
      .catch((err) => {
        console.error("Error fetching routes:", err);
        setRoutes([]); // Empty array in case of failure
      });
  }, [selectedNetwork]);
// Fetch pop data
  useEffect(() => {
    console.log("Fetching POP data for:", selectedNetwork); // Debug log
    setPopData([]); // Clear old data before fetching new
  
     // Determine table name based on type
     let popType = "POP_LOCATION"; // Default table
     if (selectedNetwork === "mdwdm") {
      popType = "MDWDM_POP_LOCATION";
     }
     console.log("Fetched Data:", popType);
    fetch(`http://localhost:3001/pop?type=${popType}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Data:", data);
        setPopData(data);
      })
      .catch((err) => {
        console.error("Error fetching POP data:", err);
        setPopData([]);
      });
  }, [selectedNetwork]);
  


  // Shape and color lookup map for POPs
  const shapeColorMap = {
    "TEJAS": {
      "ILA": { shape: "triangle", color: "teal" },
      "OADM": { shape: "rectangle", color: "green" },
    },
    "ADVA": {
      "ILA": { shape: "triangle", color: "brown" },
      "OADM": { shape: "rectangle", color: "grey" },
    },
    "CIENA": {
      "ILA": { shape: "triangle", color: "red" },
      "OADM": { shape: "rectangle", color: "black" },
    },
    "CORIANT": {
      "ILA": { shape: "triangle", color: "pink" },
      "OADM": { shape: "rectangle", color: "yellow" },
    },
  };

  const getShapeAndColor = (type) => {
    const key = Object.keys(shapeColorMap).find((key) => type.includes(key));
    if (key) {
      const eqpType = Object.keys(shapeColorMap[key]).find((t) => type.includes(t));
      return eqpType ? shapeColorMap[key][eqpType] : { shape: "circle", color: "blue" };
    }
    return { shape: "circle", color: "blue" }; // Default shape and color
  };

  // Style for routes based on type
  const getRouteStyle = (type) => {
    switch (type) {
      case "To Be Commission":
        return { color: "blue", weight: 3, opacity: 0.9 };
      case "CIENA To Be Commission":
        return { color: "yellow", weight: 3, opacity: 0.9 };
      case "CIENA":
        return { color: "purple", weight: 3, opacity: 0.9 };
      case "ADVA":
        return { color: "green", weight: 3, opacity: 0.9 };
      case "TEJAS":
        return { color: "red", weight: 3, opacity: 0.9 };
      case "CORIANT":
        return{color: "orange", weight: 3, opacity: 0.9 }
      default:
        return { color: "gray", weight: 3, opacity: 0.9 };
    }
  };

  // Filter routes based on selectedType (could be type, region, territory, or route name)
  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const matchesType = selectedType
        ? route.type === selectedType ||
          route.REGION === selectedType ||
          route.TERRITORY === selectedType ||
          route.ROUTE_NAME === selectedType
        : true;
  
      const matchesSelectedRoute = selectedRouteNames.length > 0
        ? selectedRouteNames.includes(route.ROUTE_NAME)
        : true;
  
      return matchesType && matchesSelectedRoute;
    });
  }, [selectedType, selectedRouteNames, routes]); 
  
  useEffect(() => {
    if (mapRef.current && filteredRoutes.length > 0) {
      const map = mapRef.current;
      
  
      // Collect all bounds
      let combinedBounds = null;
      filteredRoutes.forEach((route) => {
        if (route.geometry && route.geometry.coordinates) {
          try {
            const geojsonLayer = L.geoJSON(route.geometry);
            const bounds = geojsonLayer.getBounds();
  
            if (bounds.isValid()) {
              if (combinedBounds) {
                combinedBounds.extend(bounds);
              } else {
                combinedBounds = bounds;
              }
            }
          } catch (error) {
            console.error("Error processing route geometry:", error);
          }
        }
      });
  
      if (combinedBounds && combinedBounds.isValid()) {
        setTimeout(() => {
          map.invalidateSize(); // Ensure the map resizes properly
          if (combinedBounds && combinedBounds.isValid()) {
            map.fitBounds(combinedBounds, { padding: [50, 50] });
          }
        }, 200); // Increase delay slightly if needed
         // Slight delay to allow rendering
      }
    }
  }, [filteredRoutes]);
  

  return (
    <MapContainer
      center={[20.5937, 78.9629]} // Centered on India
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      whenCreated={(map) => (mapRef.current = map)} // Store map reference
    >
      {/* Tile Layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Render Routes */}
      {filteredRoutes.map((routes) =>
        routes.geometry ? (
          <GeoJSON
            key={routes.id}
            data={routes.geometry}
            style={getRouteStyle(routes.type)}
            onEachFeature={(feature, layer) => {
              layer.bindPopup(`
                <b>Route ID:</b> ${routes.id || "Not Available"}<br />
                <b>Section ID:</b> ${routes.SECTION_ID || "Not Available"}<br />
                <b>Route Name:</b> ${routes.ROUTE_NAME || "Not Available"}<br />
                <b>O&M SECTION:</b> ${routes.OM_SECTION || "Not Available"}<br />
                <b>Territory:</b> ${routes.TERRITORY || "Not Available"}<br />
                <b>Region:</b> ${routes.REGION || "Not Available"}<br />
                <b>Type:</b> ${routes.type || "Not Available"}
              `);
              
            }}
          />
        ) : null
      )}

      {/* Render POP Locations */}
      {popData.length > 0 &&
        popData.map((pop,index) => {
          const { shape, color } = getShapeAndColor(pop.EQP_TYPE || "");
          if (!pop.geometry) return null; // Skip if no geometry

          return (
            <GeoJSON
            key={`${pop.id}-${selectedNetwork}-${index}`} // Unique key forces re-render
              data={pop.geometry}
              pointToLayer={(feature, latlng) => {
                if (shape === "triangle") {
                  // Draw a triangle
                  const triangleCoords = [
                    [latlng.lat, latlng.lng],
                    [latlng.lat - 0.02, latlng.lng - 0.02],
                    [latlng.lat - 0.02, latlng.lng + 0.02],
                  ];
                  return L.polygon(triangleCoords, {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.8,
                  });
                } else if (shape === "rectangle") {
                  // Draw a rectangle
                  const size = 0.02; // Adjust size for scaling
                  const bounds = [
                    [latlng.lat - size / 2, latlng.lng - size / 2],
                    [latlng.lat + size / 2, latlng.lng + size / 2],
                  ];
                  return L.rectangle(bounds, {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.8,
                  });
                } else {
                  // Draw a circle (default)
                  return L.circleMarker(latlng, {
                    radius: 6,
                    fillColor: color,
                    color: "white",
                    weight: 1,
                    fillOpacity: 0.8,
                  });
                }
              }}
              onEachFeature={(feature, layer) => {
                layer.bindPopup(`
                  <b>POP ID:</b> ${pop.POP_ID}<br />
                  <b>Station Code:</b> ${pop.STN_CODE}<br />
                  <b>Station Name:</b> ${pop.STN_NAME}<br />
                  <b>Region:</b> ${pop.REGION}<br />
                  <b>Territory:</b> ${pop.TERRITORY}<br />
                  <b>EQP_TYPE:</b> ${pop.EQP_TYPE || "Not Specified"}
                `);
              }}
            />
          );
        })}
    </MapContainer>
  );
};

export default MapArea;
