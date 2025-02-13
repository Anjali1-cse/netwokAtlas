import React, { useEffect, useState } from "react";
import './SideBar.css';

const SideBar = ({ onSelectType, onRouteSelect, setSelectedRouteNames }) => {
    const [nodes, setNodes] = useState([]); // Store all stations
    const [searchNodeA, setSearchNodeA] = useState(""); // Input for POP A
    const [searchNodeB, setSearchNodeB] = useState(""); // Input for POP B
    const [filteredNodesA, setFilteredNodesA] = useState([]); // Suggestions for POP A
    const [filteredNodesB, setFilteredNodesB] = useState([]); // Suggestions for POP B
    const [routeData, setRouteData] = useState(null); // Store selected route data

    useEffect(() => {
        const fetchNodes = async () => {
            try {
                const response = await fetch("http://localhost:3001/pop");
                const data = await response.json();
                setNodes(data.map(item => item.STN_CODE)); // Extract STN_CODE values
            } catch (err) {
                console.error("Error fetching stn_code data:", err);
                setNodes([]); // Set to empty array in case of failure
            }
        };
        fetchNodes();
    }, []);

    

    // Handle search input for POP A
    const handleSearchA = (event) => {
        const query = event.target.value.toUpperCase();
        setSearchNodeA(query);
        setFilteredNodesA(nodes.filter(node => node.startsWith(query)));
    };

    // Handle search input for POP B
    const handleSearchB = (event) => {
        const query = event.target.value.toUpperCase();
        setSearchNodeB(query);
        setFilteredNodesB(nodes.filter(node => node.startsWith(query)));
    };

    // Select a station from suggestions for POP A
    const handleSelectA = (station) => {
        setSearchNodeA(station);
        setFilteredNodesA([]);
    };

    // Select a station from suggestions for POP B
    const handleSelectB = (station) => {
        setSearchNodeB(station);
        setFilteredNodesB([]);
    };

    // Fetch and display route
    const fetchRoute = async () => {
        try {
            const response = await fetch("http://localhost:3001/route", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ popA: searchNodeA, popB: searchNodeB }),
            });

            if (response.ok) {
                const data = await response.json();
                setRouteData(data); // Store route data in state
                setSelectedRouteNames(data.routeNames); // Pass selected routes to App.js
            } else {
                setRouteData(null);
                setSelectedRouteNames([]); // Reset on error
            }
        } catch (error) {
            console.error("Error fetching route:", error);
            setRouteData(null);
            setSelectedRouteNames([]);
        }
    };

    return (
        <div className="sidebar">
            <h2>Select POPs for Route</h2>
            <div className="input-section">
                <label>From:</label>
                <input
                    type="text"
                    value={searchNodeA}
                    onChange={handleSearchA}
                    placeholder="Search POP A"
                />
                {filteredNodesA.length > 0 && (
                    <ul className="suggestions">
                        {filteredNodesA.map((station, index) => (
                            <li key={index} onClick={() => handleSelectA(station)}>
                                {station}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="input-section">
                <label>To:</label>
                <input
                    type="text"
                    value={searchNodeB}
                    onChange={handleSearchB}
                    placeholder="Search POP B"
                />
                {filteredNodesB.length > 0 && (
                    <ul className="suggestions">
                        {filteredNodesB.map((station, index) => (
                            <li key={index} onClick={() => handleSelectB(station)}>
                                {station}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <h4>Selected routes by minimum distance/by minimum interval:</h4>
            <button onClick={fetchRoute}>Find Route</button>

            {/* Display Selected Route */}
            {routeData && (
                <div className="route-section">
                    <h2>Selected Route:</h2>
                    <p><strong>Route Path:</strong> {routeData.route}</p>
                    <p><strong>Total Distance:</strong> {routeData.totalDistance}</p>
                    <p><strong>Route Names:</strong> {routeData.routeNames}</p>

                    <h3>Route Details:</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Route Name</th>
                                <th>Distance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {routeData.selectedRoutes.map((segment, index) => (
                                <tr key={index}>
                                    <td>{segment.routeName}</td>
                                    <td>{segment.distance} km</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SideBar;
