import React, { useEffect, useState } from "react";
import './SideBar.css';

const SideBar = ({ selectedNetwork, onSelectType, onRouteSelect, setSelectedRouteNames }) => {
    const [nodes, setNodes] = useState([]);
    const [searchNodeA, setSearchNodeA] = useState("");
    const [searchNodeB, setSearchNodeB] = useState("");
    const [filteredNodesA, setFilteredNodesA] = useState([]);
    const [filteredNodesB, setFilteredNodesB] = useState([]);
    const [selectedPopNameA, setSelectedPopNameA] = useState(null);
    const [selectedPopNameB, setSelectedPopNameB] = useState(null);
    const [selectedPopAID, setSelectedPopAID] = useState("");
    const [selectedPopBID, setSelectedPopBID] = useState("");

    const [routeData, setRouteData] = useState(null);
    useEffect(() => {
        console.log("Fetching POP data for:", selectedNetwork);
        setNodes([]);
        const fetchNodes = async () => {
            try {
                let popType = "POP_LOCATION";
                if (selectedNetwork === "mdwdm") {
                    popType = "MDWDM_POP_LOCATION";
                }
                console.log("Fetched Data:", popType);
                const response = await fetch(`http://localhost:3001/pop?type=${popType}`);
                const data = await response.json();

                setNodes(data.map(item => ({
                    STN_CODE: item.STN_CODE,
                    STN_NAME: item.STN_NAME,
                    POP_ID: item.POP_ID
                })));
            } catch (err) {
                console.error("Error fetching stn_code data:", err);
                setNodes([]);
            }
        };
        fetchNodes();
    }, [selectedNetwork]);

    const handleSearchA = (event) => {
        const query = event.target.value.toUpperCase();
        setSearchNodeA(query);
        setFilteredNodesA(nodes.filter(
            node => node.STN_NAME.toLowerCase().includes(query.toLowerCase()) ||
                node.STN_CODE.toLowerCase().includes(query.toLowerCase())));
    };


    const handleSearchB = (event) => {
        const query = event.target.value.toUpperCase();
        setSearchNodeB(query);
        setFilteredNodesB(nodes.filter(
            node => node.STN_NAME.toLowerCase().includes(query.toLowerCase()) ||
                node.STN_CODE.toLowerCase().includes(query.toLowerCase())));
    };


    const handleSelectA = (station) => {
        setSearchNodeA(station.STN_CODE);
        setSelectedPopAID(station.POP_ID);
        setSelectedPopNameA(station.STN_NAME);
        setFilteredNodesA([]);
    };


    const handleSelectB = (station) => {
        setSearchNodeB(station.STN_CODE);
        setSelectedPopBID(station.POP_ID);
        setSelectedPopNameB(station.STN_NAME);
        setFilteredNodesB([]);
    };

    const fetchRoute = async () => {
        try {
            if (!selectedPopAID || !selectedPopBID) {
                alert("Please select both POP A and POP B.");
                return;
            }
            const response = await fetch(`http://localhost:3001/route/${selectedNetwork}`, {

                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ popA: selectedPopAID, popB: selectedPopBID }),
            });

            if (response.ok) {
                const data = await response.json();
                setRouteData(data);
                setSelectedRouteNames(data.routeNames);
            } else {
                setRouteData(null);
                setSelectedRouteNames([]);
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
                                {station.STN_CODE} - {station.STN_NAME}
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
                                {station.STN_CODE} - {station.STN_NAME}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <h4>Selected routes by minimum distance/by minimum interval:</h4>
            <button onClick={fetchRoute}>Find Route</button>


            {routeData && (
                <div className="route-section">
                    <h2>Selected Route:</h2>

                    <h3>Route Details:</h3>
                    <table id="route-table">
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
                            <tr>
                                <td><strong>Total Distance:</strong></td>
                                <td><strong>{routeData.totalDistance} KM</strong></td>
                            </tr>
                        </tbody>

                    </table>

                </div>
            )}
        </div>
    );
};

export default SideBar;
