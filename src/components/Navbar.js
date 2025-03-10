import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ onSelectNetwork, onSelectType, onRouteSelect }) => {
  const [selectedNetwork, setSelectedNetwork] = useState("dwdm");
  const [territories, setTerritories] = useState([]);
  const [types, setTypes] = useState([]);
  const [regions, setRegions] = useState([]);
  const [route_name, setRoutes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchingRoutes, setMatchingRoutes] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedNetwork) return;
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
  }, [selectedNetwork, onSelectNetwork]);


  const handleNetworkSelection = (network) => {
    setSelectedNetwork(network);
    onSelectNetwork(network);

  };


  useEffect(() => {
    if (!selectedNetwork) return; 
    const fetchRoutes = async () => {
      try {
        const response = await fetch(`http://localhost:3001/routes?type=${selectedNetwork}`);
        const data = await response.json();
        setAllRoutes(data);
      } catch (error) {
        console.error("Error fetching routes:", error);
      }
    };

    fetchRoutes();
  }, [selectedNetwork]);

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
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

  const handleRegionSelect = (region) => {
    onSelectType(region);
    setSelectedRegion(region);
    setSearchQuery("");
    const filteredRoutes = allRoutes.filter(
      (route) =>
        region.toLowerCase() === route.REGION?.toLowerCase()
    );

    setMatchingRoutes(filteredRoutes);
  };

  const handleSuggestionClick = (routeName) => {
    setSearchQuery(routeName);
    setMatchingRoutes([]);
    setSelectedRoute(routeName);
    onRouteSelect(routeName);
    onSelectType(routeName);

  };

  return (
    <section className="header">
      <header className="navbar">
        <div className="nav-menu">
          <h1>Network Info Atlas</h1>
          <Link to="/" onClick={(e) => {
            e.preventDefault();
            navigate(0);
          }}>Home</Link>

          <SubNav title="Network">
            <button id="typeA"
              className={selectedNetwork === "dwdm" ? "active" : ""}
              onClick={() => handleNetworkSelection("dwdm")}
            >
              DWDM
            </button>
            <button id="typeB"
              className={selectedNetwork === "mdwdm" ? "active" : ""}
              onClick={() => handleNetworkSelection("mdwdm")}
            >
              MDWDM
            </button>
            <Link to="/upload">upload</Link>
          </SubNav>

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
          <SubNav title="Region">
            {regions.length > 0 ? (
              regions.map((region, index) => (
                <button
                  key={index}
                  onClick={() => handleRegionSelect(region)}
                  className="region-button"
                >
                  {region}
                </button>
              ))
            ) : (
              <span>Loading Regions...</span>
            )}
          </SubNav>

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
        </div>

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
