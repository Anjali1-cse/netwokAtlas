import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MapComponent.css";

const MapComponent = () => {
  const [stations, setStations] = useState([]);

  const fetchStations = async () => {
    try {
      const response = await fetch("http://localhost:3001/stations");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched Data:", data);
      setStations(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={5} className="map-container">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {stations.map((station, index) => {
        if (
          !station.latitude_a || !station.longitude_a || 
          !station.latitude_b || !station.longitude_b
        ) {
          console.warn("Skipping invalid station data:", station);
          return null;
        }

        return (
          <React.Fragment key={index}>
            <Marker position={[station.latitude_a, station.longitude_a]}>
              <Popup>{station.pop_id_a}</Popup>
            </Marker>
            <Marker position={[station.latitude_b, station.longitude_b]}>
              <Popup>{station.pop_id_b}</Popup>
            </Marker>
            <Polyline
              positions={[
                [station.latitude_a, station.longitude_a],
                [station.latitude_b, station.longitude_b],
              ]}
              color="blue"
            />
          </React.Fragment>
        );
      })}
    </MapContainer>
  );
};

export default MapComponent;
