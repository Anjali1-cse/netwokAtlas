import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import SideBar from "./components/SideBar";
import MapArea from "./components/MapArea";
import MapComponent from "./components/MapComponent";
import FileUpload from "./components/FileUpload";

import "./App.css";

const App = () => {
  const [selectedNetwork, setSelectedNetwork] = useState("dwdm");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedTerritory, setSelectedTerritory] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedRouteNames, setSelectedRouteNames] = useState([]);
  const [fileUploaded, setFileUploaded] = useState(false);
  const handleRouteSelect = (routeName) => {
    console.log("Selected Route:", routeName);
    setSelectedRoute(routeName);
  };

  return (
    <div className="app">
      <Router>
        <Navbar
          onSelectType={setSelectedType}
          onSelectRegion={setSelectedRegion}
          onSelectTerritory={setSelectedTerritory}
          onRouteSelect={handleRouteSelect}
          onSelectNetwork={setSelectedNetwork}
          selectedNetwork={selectedNetwork}

        />
        <Routes>
          <Route
            path="/"
            element={
              <Home
                selectedNetwork={selectedNetwork}
                setSelectedNetwork={setSelectedNetwork}
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
          <Route path="/network/upload" element={<FileUpload />} />
          <Route path="/upload" element={<FileUpload onFileUpload={() => setFileUploaded(true)} />} />
          <Route path="/map" element={<MapComponent key={fileUploaded} />} />
          <Route path="/type/:type" element={<DynamicPage title="Type" />} />
          <Route path="/region/:region" element={<DynamicPage title="Region" />} />
          <Route path="/territory/:territory" element={<DynamicPage title="Territory" />} />

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

const NetworkLayout = ({
  selectedNetwork,
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
      selectedNetwork={selectedNetwork}
      onSelectType={setSelectedType}
      onRouteSelect={handleRouteSelect}
      setSelectedRouteNames={setSelectedRouteNames}
    />
    <MapArea
      selectedNetwork={selectedNetwork}
      selectedType={selectedType}
      selectedRegion={selectedRegion}
      selectedTerritory={selectedTerritory}
      selectedRoute={selectedRoute}
      selectedRouteNames={selectedRouteNames}
    />
  </div>
);

const Home = ({
  selectedNetwork,
  setSelectedNetwork,
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
      selectedNetwork={selectedNetwork}
      onSelectType={setSelectedType}
      onRouteSelect={handleRouteSelect}
      setSelectedRouteNames={setSelectedRouteNames}
    />
    <MapArea
      selectedNetwork={selectedNetwork}
      selectedType={selectedType}
      selectedRegion={selectedRegion}
      selectedTerritory={selectedTerritory}
      selectedRoute={selectedRoute}
      selectedRouteNames={selectedRouteNames}
    />
  </div>
);

const DynamicPage = ({ title }) => <h2>{`${title} Details`}</h2>;
const NetworkDWDM = () => <h2>DWDM Network Details</h2>;
const NetworkMDWDM = () => <h2>MDWDM Network Details</h2>;

export default App;
