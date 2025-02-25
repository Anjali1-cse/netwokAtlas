import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";  // Import useNavigate for routing
import "./Navbar.css";

const Navbar = ({onSelectNetwork, onSelectType, onRouteSelect }) => {
  const [selectedNetwork, setSelectedNetwork] = useState("dwdm"); // Default to DWDM
  const [territories, setTerritories] = useState([]);
  const [types, setTypes] = useState([]);
  const [regions, setRegions] = useState([]);
  const [route_name, setRoutes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchingRoutes, setMatchingRoutes] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(""); // Track selected region
  const navigate = useNavigate();  // Using useNavigate to programmatically navigate

  // Fetch data for territories, types, and regions
  useEffect(() => {
    if (!selectedNetwork) return; // Prevent unnecessary API calls
    const fetchData = async (endpoint, setter) => {
      try {
        const response = await fetch(`http://localhost:3001/api/${selectedNetwork}/${endpoint}`);
        const data = await response.json();
        const uniqueValues = data.map((item) => Object.values(item)[0]);
        setter(uniqueValues);
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
      }
    };

    fetchData("territories", setTerritories);
    fetchData("types", setTypes);
    fetchData("regions", setRegions);
    fetchData("route_name", setRoutes);
    if (selectedNetwork) {
      onSelectNetwork(selectedNetwork);
    }
  },  [selectedNetwork,onSelectNetwork]); // Runs when selectedNetwork changes

  // Handle Network Selection Click
const handleNetworkSelection = (network) => {
  setSelectedNetwork(network);
  onSelectNetwork(network); 
};

  // Fetch all routes data
  useEffect(() => {
    if (!selectedNetwork) return; // Avoid unnecessary API calls
    const fetchRoutes = async () => {
      try {
       // const routeType = selectedNetwork === "mdwdm" ? "mdwdm" : "dwdm";
        const response = await fetch(`http://localhost:3001/routes?type=${selectedNetwork}`);
        const data = await response.json();
        setAllRoutes(data);
      } catch (error) {
        console.error("Error fetching routes:", error);
      }
    };

    fetchRoutes();
  }, [selectedNetwork]); // Runs when selectedNetwork changes

  // Handle search query with region filtering
  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    // Apply both route name and region filtering
    const filteredRoutes = allRoutes.filter((route) => {
      const routeNameMatches = route.ROUTE_NAME?.toLowerCase().includes(query);
      const regionMatches =
        selectedRegion && selectedRegion !== "All"
          ? route.REGION?.toLowerCase() === selectedRegion.toLowerCase()
          : true;
  
      return routeNameMatches && regionMatches;
    });
  
    setMatchingRoutes(filteredRoutes);
  };

  // Handle region selection and update route filtering
  const handleRegionSelect = (region) => {
    onSelectType(region);
    setSelectedRegion(region); // Update selected region
    setSearchQuery(""); // Clear search query if region changes

    // Filter routes based on selected region only (if no search query is present)
    const filteredRoutes = allRoutes.filter(
      (route) =>
        region.toLowerCase() === route.REGION?.toLowerCase() // Match region
    );

    setMatchingRoutes(filteredRoutes); // Update the displayed routes
  };

  const handleSuggestionClick = (routeName) => {
    setSearchQuery(routeName); // Update input field with selected suggestion
    setMatchingRoutes([]); // Clear suggestions
    setSelectedRoute(routeName);  // Store selected route
    onRouteSelect(routeName);
    // Optionally pass to MapArea, e.g., by navigating
    onSelectType(routeName);  // Pass to the parent component
   
  };

  return (
    <section className="header">
      <header className="navbar">
        <h1>Network Info Atlas</h1>
        <Link to="/">Home</Link>
       

        {/* Sub-navigation for Networks */}
        <SubNav title="Network">
        <button 
      className={selectedNetwork === "dwdm" ? "active" : ""}
      onClick={() => handleNetworkSelection("dwdm")} // Correct state update
    >
      DWDM
    </button>
    <button 
      className={selectedNetwork === "mdwdm" ? "active" : ""}
      onClick={() => handleNetworkSelection("mdwdm")} // Correct state update
    >
      MDWDM
    </button>
          <Link to="/upload">upload</Link>
        </SubNav>

        {/* Sub-navigation for Types */}
        <SubNav title="Type">
          {types.length > 0 ? (
            types.map((type, index) => (
              <button
                key={index}
                onClick={() => onSelectType(type)}
                className="type-button"
              >
                {type}
              </button>
            ))
          ) : (
            <span>Loading Types...</span>
          )}
        </SubNav>

        {/* Sub-navigation for Regions */}
        <SubNav title="Region">
          {regions.length > 0 ? (
            regions.map((region, index) => (
              <button
                key={index}
                onClick={() => handleRegionSelect(region)} // Updated region selection logic
                className="region-button"
              >
                {region}
              </button>
            ))
          ) : (
            <span>Loading Regions...</span>
          )}
        </SubNav>

        {/* Sub-navigation for Territories */}
        <SubNav title="Territory">
          {territories.length > 0 ? (
            territories.map((territory, index) => (
              <button
                key={index}
                onClick={() => onSelectType(territory)}
                className="territory-button"
              >
                {territory}
              </button>
            ))
          ) : (
            <span>Loading Territories...</span>
          )}
        </SubNav>

        <Link to="/contact">Contact</Link>

        {/* Search Bar */}
        <div className="search-bar">
          <form style={{ position: "relative" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search routes..."
              className="search-input"
              id="searchInput"
            />

            {matchingRoutes.length > 0 && (
              <ul className="search-results">
                {matchingRoutes.map((route) => (
                  <li
                    key={route.id}
                    onClick={() => handleSuggestionClick(route.ROUTE_NAME)}
                    className="search-result-item"
                  >
                    {route.ROUTE_NAME}
                  </li>
                ))}
              </ul>
            )}
          </form>
        </div>
      </header>
    </section>
  );
};

const SubNav = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="subnav">
      <button className="subnavbtn" onClick={toggleDropdown}>
        {title} <i className="fa fa-caret-down"></i>
      </button>
      {isOpen && <div className="subnav-content">{children}</div>}
    </div>
  );
};

export default Navbar;
