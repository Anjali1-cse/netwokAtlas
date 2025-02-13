import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import SideBar from "./components/SideBar";
import MapArea from "./components/MapArea";
import MapComponent from "./components/MapComponent";
import FileUpload from "./components/FileUpload";

import "./App.css";

const App = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedRouteNames, setSelectedRouteNames] = useState([]);
  const [fileUploaded, setFileUploaded] = useState(false);
  // Handle route selection
  const handleRouteSelect = (routeName) => {
    console.log("Selected Route:", routeName);
    setSelectedRoute(routeName);
  };

  return (
    <div className="app">
      <Router>
        {/* Navbar: Pass state and handlers */}
        <Navbar
          onSelectType={setSelectedType}
          onSelectRegion={setSelectedRegion}
          onSelectTerritory={setSelectedTerritory}
          onRouteSelect={handleRouteSelect}
        />

        {/* Routes */}
        <Routes>
          <Route
            path="/"
            element={
              <Home
                selectedType={selectedType}
                selectedRegion={selectedRegion}
                selectedTerritory={selectedTerritory}
                selectedRoute={selectedRoute}
                selectedRouteNames={selectedRouteNames}
                setSelectedType={setSelectedType}
                setSelectedRegion={setSelectedRegion}
                setSelectedTerritory={setSelectedTerritory}
                setSelectedRoute={setSelectedRoute}
                handleRouteSelect={handleRouteSelect}
                setSelectedRouteNames={setSelectedRouteNames}
              />
            }
          />
          <Route path="/network/dwdm" element={<NetworkDWDM />} />
          <Route path="/network/mdwdm" element={<NetworkMDWDM />} />
          <Route path="/network/upload" element={<FileUpload />} /> {/* Render the FileUpload component */}
          <Route path="/upload" element={<FileUpload onFileUpload={() => setFileUploaded(true)} />} />
        <Route path="/map" element={<MapComponent key={fileUploaded} />} />
        <Route path="/type/:type" element={<DynamicPage title="Type" />} />
          <Route path="/region/:region" element={<DynamicPage title="Region" />} />
          <Route path="/territory/:territory" element={<DynamicPage title="Territory" />} />
       {/* Define Routes */}
         
          {/* Network Layout Route */}
          <Route
            path="/network/*"
            element={
              <NetworkLayout
                selectedType={selectedType}
                selectedRegion={selectedRegion}
                selectedTerritory={selectedTerritory}
                selectedRoute={selectedRoute}
                selectedRouteNames={selectedRouteNames}
                setSelectedType={setSelectedType}
                setSelectedRegion={setSelectedRegion}
                setSelectedTerritory={setSelectedTerritory}
                setSelectedRoute={setSelectedRoute}
                handleRouteSelect={handleRouteSelect}
                setSelectedRouteNames={setSelectedRouteNames}
              />
            }
          />
          <Route
            path="/type/*"
            element={
              <NetworkLayout
                selectedType={selectedType}
                selectedRegion={selectedRegion}
                selectedTerritory={selectedTerritory}
                selectedRoute={selectedRoute}
              />
            }
          />
          <Route
            path="/region/*"
            element={
              <NetworkLayout
                selectedType={selectedType}
                selectedRegion={selectedRegion}
                selectedTerritory={selectedTerritory}
                selectedRoute={selectedRoute}
              />
            }
          />
          <Route
            path="/territory/*"
            element={
              <NetworkLayout
                selectedType={selectedType}
                selectedRegion={selectedRegion}
                selectedTerritory={selectedTerritory}
                selectedRoute={selectedRoute}
              />
            }
          />
        </Routes>

        {/* Sidebar and MapArea outside Router */}

        <div>
          <MapArea
            selectedType={selectedType}
            selectedRegion={selectedRegion}
            selectedTerritory={selectedTerritory}
            selectedRoute={selectedRoute}
            selectedRouteNames={selectedRouteNames}
          />
        </div>
      </Router>
    </div>
  );
};

// Network layout component
const NetworkLayout = ({
  selectedType,
  selectedRegion,
  selectedTerritory,
  selectedRoute,
  selectedRouteNames,
  setSelectedType,
  setSelectedRegion,
  setSelectedTerritory,
  setSelectedRoute,
  handleRouteSelect,
  setSelectedRouteNames,
}) => (
  <div className="main-layout">
    <SideBar
      onSelectType={setSelectedType}
      onRouteSelect={handleRouteSelect}
      setSelectedRouteNames={setSelectedRouteNames}
    />
    <MapArea
      selectedType={selectedType}
      selectedRegion={selectedRegion}
      selectedTerritory={selectedTerritory}
      selectedRoute={selectedRoute}
      selectedRouteNames={selectedRouteNames}
    />
  </div>
);

// Home page component
const Home = ({
  selectedType,
  selectedRegion,
  selectedTerritory,
  selectedRoute,
  selectedRouteNames,
  setSelectedType,
  setSelectedRegion,
  setSelectedTerritory,
  setSelectedRoute,
  handleRouteSelect,
  setSelectedRouteNames,
}) => (
  <div className="home-layout">
    <SideBar
      onSelectType={setSelectedType}
      onRouteSelect={handleRouteSelect}
      setSelectedRouteNames={setSelectedRouteNames}
    />
    <MapArea
      selectedType={selectedType}
      selectedRegion={selectedRegion}
      selectedTerritory={selectedTerritory}
      selectedRoute={selectedRoute}
      selectedRouteNames={selectedRouteNames}
    />
  </div>
);

// Other components
const DynamicPage = ({ title }) => <h2>{`${title} Details`}</h2>;
const NetworkDWDM = () => <h2>DWDM Network Details</h2>;
const NetworkMDWDM = () => <h2>MDWDM Network Details</h2>;
//const NetworkUpload = () => <MapComponent />; // Render MapComponent

export default App;
