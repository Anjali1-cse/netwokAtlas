import React, { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

import './MapArea.css';

const MapArea = ({ selectedNetwork, selectedType, selectedRouteNames }) => {

  const [routes, setRoutes] = useState([]);
  const [popData, setPopData] = useState([]); 
  const [railwayRoute, setRailwayRoute] = useState([]);
  const mapRef = useRef(null);
 
  useEffect(() => {
    setRoutes([]); 
    if (!selectedNetwork) return;
    const routeType = selectedNetwork;
    fetch(`http://localhost:3001/routes?type=${routeType}`)
      .then((res) => res.json())
      .then((data) => setRoutes(data))
      .catch((err) => {
        console.error("Error fetching routes:", err);
        setRoutes([]); 
      });
  }, [selectedNetwork]);
 
  useEffect(() => {
    setPopData([]); 
    let popType = "POP_LOCATION"; 
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

  useEffect(() => {
    fetch("http://localhost:3001/railway")
      .then(res => res.json())
      .then(data => {
        console.log("Railway Data:", data);
        setRailwayRoute(data);
      })
      .catch(err => console.error("Error fetching railway data:", err));
  }, []);
  
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
    return { shape: "circle", color: "blue" }; 
  };

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
        return { color: "orange", weight: 3, opacity: 0.9 }
      default:
        return { color: "gray", weight: 3, opacity: 0.9 };
    }
  };

    const filteredRoutes = useMemo(() => {
      if (!routes) return [];
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
      let combinedBounds = null;
      filteredRoutes.forEach(route => {
        if (route.geometry && route.geometry.coordinates) {
          try {
            const geojsonLayer = L.geoJSON(route.geometry);
            const bounds = geojsonLayer.getBounds();
            if (bounds.isValid()) {
              combinedBounds ? combinedBounds.extend(bounds) : combinedBounds = bounds;
            }
          } catch (error) {
            console.error("Error processing route geometry:", error);
          }
        }
      });
      if (combinedBounds && combinedBounds.isValid()) {
        setTimeout(() => {
          map.invalidateSize();
          map.fitBounds(combinedBounds, { padding: [50, 50] });
        }, 200);
      }
    }
  }, [filteredRoutes]);

   // 🚀 Railway Route Clustering
   useEffect(() => {
    if (!railwayRoute || !railwayRoute.features || !mapRef.current) return;

    const map = mapRef.current;
    const markerClusterGroup = L.markerClusterGroup();

    railwayRoute.features.forEach((feature) => {
      if (feature.geometry.type === "Point") {
        const [lng, lat] = feature.geometry.coordinates;
        const marker = L.marker([lat, lng]).bindPopup(
          `<b>Railway Route:</b> ${feature.properties?.id || "Unknown"}`
        );
        markerClusterGroup.addLayer(marker);
      }
    });

    map.addLayer(markerClusterGroup);

    return () => {
      map.removeLayer(markerClusterGroup);
    };
  }, [railwayRoute]);

  


  return (
    <MapContainer
      center={[20.5937, 78.9629]} 
      zoom={5}
      style={{ height: "100%", width: "100%" }}
      whenCreated={(map) => (mapRef.current = map)} 
    >
  
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
      />
     
     
     {railwayRoute.features && (
  <GeoJSON
    data={railwayRoute}
    style={{ color: "grey", weight: 0.3, opacity: 0.7  }}
    onEachFeature={(feature, layer) => {
      layer.bindPopup(`<b>Railway Route:</b> ${feature.properties?.id || "Unknown"}`);
    }}
  />
)}


      
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
      {popData.length > 0 &&
        popData.map((pop, index) => {
          const { shape, color } = getShapeAndColor(pop.EQP_TYPE || "");
          if (!pop.geometry) return null;

          return (
            <GeoJSON
              key={`${pop.id}-${selectedNetwork}-${index}`} 
              data={pop.geometry}
              pointToLayer={(feature, latlng) => {
                if (shape === "triangle") {
                  
                  const triangleCoords = [
                    [latlng.lat, latlng.lng],
                    [latlng.lat - 0.05, latlng.lng - 0.05],
                    [latlng.lat - 0.05, latlng.lng + 0.05],
                  ];
                  return L.polygon(triangleCoords, {
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.8,
                  });
                } else if (shape === "rectangle") {
                  const size = 0.05; 
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
