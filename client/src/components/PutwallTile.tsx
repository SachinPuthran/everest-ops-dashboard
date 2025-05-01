import React, {useEffect, useRef, useState} from 'react';
import {useQuery} from 'react-query';
import {fetchPutwallCubbies, fetchPutwallSummary} from '../api/api';
import {TileProps} from '../types';
import '../styles/Tile.css';
import './PutwallTile.css'; // We'll create this file for custom styles

// Define the types based on usage in the component
interface PutwallSummaryItem {
    zone: string;
    PackReadyCount: number;
    OnConveyorCount: number;
    PartiallyPickedCount: number;
    WaitingForReplensCount: number;
    NoReplensCount: number;
    EmptyCubbyCount: number;
}

// Define the type for cubby data from API
interface PutwallCubbyItem {
    cubby: string;
    cubby_zone: string;
    cubby_wall: string;
    cubby_column: string;
    cubby_number: string;
}

// Define the cubby type for our matrix view
interface Cubby {
    id: string;
    cubby: string;
    zone: string;
    wall: string;
    column: string;
    number: string;
    status: 'green' | 'red' | 'purple' | 'white';
    lastStatusChange: Date;
    containerCount: number;
    averageTimeInStatus: {
        packReady: number;
        onConveyor: number;
        partiallyPicked: number;
        waitingForReplens: number;
        noReplens: number;
        empty: number;
    };
}

const PutwallTile: React.FC<TileProps> = ({ isActive, onClick }) => {
    // Fetch summary data
    const { data: summaryData, isLoading: isSummaryLoading, error: summaryError } = useQuery<PutwallSummaryItem[]>(
        'putwallSummary',
        fetchPutwallSummary
    );

    // Fetch cubby data
    const { data: cubbiesData, isLoading: isCubbiesLoading, error: cubbiesError } = useQuery<PutwallCubbyItem[]>(
        'putwallCubbies',
        fetchPutwallCubbies
    );

    // State for cubbies
    const [cubbies, setCubbies] = useState<Cubby[]>([]);

    // State for cubby tooltip
    const [cubbyTooltipInfo, setCubbyTooltipInfo] = useState<{ 
        visible: boolean, 
        cubby: Cubby | null, 
        x: number, 
        y: number 
    }>({
        visible: false,
        cubby: null,
        x: 0,
        y: 0
    });

    // State for zone tooltip
    const [zoneTooltipInfo, setZoneTooltipInfo] = useState<{ 
        visible: boolean, 
        zone: string, 
        summary: PutwallSummaryItem | null, 
        x: number, 
        y: number 
    }>({
        visible: false,
        zone: '',
        summary: null,
        x: 0,
        y: 0
    });

    // State for chute tooltip
    const [chuteTooltipInfo, setChuteTooltipInfo] = useState<{ 
        visible: boolean, 
        chute: string, 
        zone: string,
        chuteSummary: PutwallSummaryItem | null,
        x: number, 
        y: number 
    }>({
        visible: false,
        chute: '',
        zone: '',
        chuteSummary: null,
        x: 0,
        y: 0
    });

    // Reference to track if a component is mounted
    const isMounted = useRef(true);

    // Process API data to create cubbies
    useEffect(() => {
        if (cubbiesData && summaryData) {
            const processedCubbies: Cubby[] = [];
            const statuses: ('green' | 'red' | 'white' | 'purple')[] = ['green', 'red', 'white', 'purple'];

            // Process each cubby from the API data
            cubbiesData.forEach((cubbyItem, index) => {
                // Find the corresponding zone summary
                const zoneSummary = summaryData.find(summary => 
                    summary.zone === cubbyItem.cubby_zone
                ) || summaryData[0]; // Fallback to the first summary if not found

                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

                processedCubbies.push({
                    id: `cubby-${index}`,
                    cubby: cubbyItem.cubby,
                    zone: cubbyItem.cubby_zone,
                    wall: cubbyItem.cubby_wall,
                    column: cubbyItem.cubby_column,
                    number: cubbyItem.cubby_number,
                    status: randomStatus,
                    lastStatusChange: new Date(),
                    containerCount: Math.floor(Math.random() * 100) + 1,
                    averageTimeInStatus: {
                        packReady: Math.floor(Math.random() * 60) + 1,
                        onConveyor: Math.floor(Math.random() * 60) + 1,
                        partiallyPicked: Math.floor(Math.random() * 60) + 1,
                        waitingForReplens: Math.floor(Math.random() * 60) + 1,
                        noReplens: Math.floor(Math.random() * 60) + 1,
                        empty: Math.floor(Math.random() * 60) + 1
                    }
                });
            });

            setCubbies(processedCubbies);
        }
    }, [cubbiesData, summaryData]);

    // Randomly change cubby statuses every 10-15 seconds
    useEffect(() => {
        // Random interval between 10-15 seconds
        const randomInterval = Math.floor(Math.random() * 5000) + 10000;

        const interval = setInterval(() => {
            if (cubbies.length > 0) {
                setCubbies(prevCubbies => {
                    const newCubbies = [...prevCubbies];
                    const statuses: ('green' | 'red' | 'white' | 'purple')[] = ['green', 'red', 'white', 'purple'];

                    // Group cubbies by zone and column (rows)
                    const rowGroups: Record<string, Cubby[]> = {};

                    prevCubbies.forEach(cubby => {
                        const rowKey = `${cubby.zone}-${cubby.column}`;
                        if (!rowGroups[rowKey]) {
                            rowGroups[rowKey] = [];
                        }
                        rowGroups[rowKey].push(cubby);
                    });

                    // For each row, change 1-5 cubbies
                    Object.values(rowGroups).forEach(row => {
                        if (row.length > 0) {
                            // Random number between 1 and 5, or the row length if less than 5
                            const numToChange = Math.min(Math.floor(Math.random() * 5) + 1, row.length);

                            // Get random indices to change
                            const indicesToChange = new Set<number>();
                            while (indicesToChange.size < numToChange) {
                                indicesToChange.add(Math.floor(Math.random() * row.length));
                            }

                            // Change the status of selected cubbies
                            indicesToChange.forEach(index => {
                                const cubby = row[index];
                                const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

                                // Find the cubby in the newCubbies array and update it
                                const cubbyIndex = newCubbies.findIndex(c => c.id === cubby.id);
                                if (cubbyIndex !== -1) {
                                    newCubbies[cubbyIndex] = {
                                        ...newCubbies[cubbyIndex],
                                        status: randomStatus,
                                        lastStatusChange: new Date()
                                    };
                                }
                            });
                        }
                    });

                    return newCubbies;
                });
            }
        }, randomInterval);

        return () => {
            clearInterval(interval);
        };
    }, [cubbies]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Handle mouse enter on cubby
    const handleCubbyMouseEnter = (e: React.MouseEvent, cubby: Cubby) => {
        setCubbyTooltipInfo({
            visible: true,
            cubby,
            x: e.clientX,
            y: e.clientY
        });
    };

    // Handle mouse leave on cubby
    const handleCubbyMouseLeave = () => {
        setCubbyTooltipInfo({
            ...cubbyTooltipInfo,
            visible: false
        });
    };

    // Handle mouse enter on zone label
    const handleZoneMouseEnter = (e: React.MouseEvent, zone: string) => {
        const zoneSummary = summaryData?.find(summary => summary.zone.endsWith(zone));
        if (zoneSummary) {
            setZoneTooltipInfo({
                visible: true,
                zone,
                summary: zoneSummary,
                x: e.clientX,
                y: e.clientY
            });
        }
    };

    // Handle mouse leave on zone label
    const handleZoneMouseLeave = () => {
        setZoneTooltipInfo({
            ...zoneTooltipInfo,
            visible: false
        });
    };

    // Handle mouse enter on chute label
    const handleChuteMouseEnter = (e: React.MouseEvent, chute: string, zone: string) => {
        const chuteSummary = summaryData?.find(summary => summary.zone.endsWith(zone));
        if (chuteSummary) {
            setChuteTooltipInfo({
                visible: true,
                chute,
                zone,
                chuteSummary,
                x: e.clientX,
                y: e.clientY
            });
        }
    };

    // Handle mouse leave on chute label
    const handleChuteMouseLeave = () => {
        setChuteTooltipInfo({
            ...chuteTooltipInfo,
            visible: false
        });
    };

    // Check if either API call is loading
    const isLoading = isSummaryLoading || isCubbiesLoading;

    // Check if either API call has an error
    const hasError = summaryError || cubbiesError;

    if (isLoading) {
        return (
            <div className={`tile ${isActive ? 'active' : ''}`} onClick={onClick}>
                <h2>Putwall</h2>
                <div className="loading">Loading...</div>
            </div>
        );
    }

    if (hasError || !summaryData || !cubbiesData) {
        return (
            <div className={`tile ${isActive ? 'active' : ''}`} onClick={onClick}>
                <h2>Putwall</h2>
                <div className="error">Error loading data</div>
            </div>
        );
    }

    // Group cubbies by zone for display
    const cubbyZones = Array.from(new Set(cubbies.map(cubby => cubby.zone))).sort();

    return (
        <div className={`tile ${isActive ? 'active' : ''}`} onClick={onClick}>
            <h2>Putwall</h2>
            <div className="tile-content">
                <div className="tile-footer">
                    <div className="status-legend">
                        <div className="legend-item">
                            <div className="legend-color green"></div>
                            <span>Ready to pack</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color purple"></div>
                            <span>Waiting</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color white"></div>
                            <span>Empty</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color red"></div>
                            <span>Priority order pack ready</span>
                        </div>
                    </div>
                </div>
                <div className="putwall-zones-container">
                    {cubbyZones.map(zone => {
                        // Get all cubbies for this zone
                        const zoneCubbies = cubbies.filter(cubby => cubby.zone === zone);

                        // Get unique chutes for this zone
                        const chutes = Array.from(new Set(zoneCubbies.map(cubby => cubby.wall))).sort();

                        // Get unique columns for this zone
                        const columns = Array.from(new Set(zoneCubbies.map(cubby => cubby.column))).sort().reverse();

                        // Get unique cubbyNumbers for this zone
                        const cubbyNumbers = Array.from(new Set(zoneCubbies.map(cubby => cubby.number))).sort();

                        return (
                            <div key={zone} className="putwall-zone">
                                <div 
                                    className="zone-label"
                                    onMouseEnter={(e) => handleZoneMouseEnter(e, zone)}
                                    onMouseLeave={handleZoneMouseLeave}
                                >
                                    Zone {zone}
                                </div>
                                <div className="zone-matrix">
                                    <div className="chutes-container">
                                        {chutes.map(chute => (
                                            <div key={`${zone}-${chute}`} className="chute">
                                                <div 
                                                    className="chute-label"
                                                    onMouseEnter={(e) => handleChuteMouseEnter(e, chute, zone)}
                                                    onMouseLeave={handleChuteMouseLeave}
                                                >
                                                    Chute {chute}
                                                </div>
                                                <div className="chute-columns">
                                                    {columns.map(column => (
                                                        <div key={`${zone}-${chute}-${column}`} className="zone-row">
                                                            {cubbyNumbers.map(cubbyNumber => {
                                                                // Find the cubby for this zone, chute, column, and cubbyNumber
                                                                const cubby = zoneCubbies.find(c => 
                                                                    c.wall === chute && c.column === column && c.number === cubbyNumber
                                                                );

                                                                // If no cubby exists for this position, render an empty cell
                                                                if (!cubby) {
                                                                    return <div key={`${zone}-${chute}-${column}-${cubbyNumber}`} className="cubby-placeholder"></div>;
                                                                }

                                                                return (
                                                                    <div 
                                                                        key={cubby.id}
                                                                        className={`cubby ${cubby.status}`}
                                                                        onMouseEnter={(e) => handleCubbyMouseEnter(e, cubby)}
                                                                        onMouseLeave={handleCubbyMouseLeave}
                                                                    >
                                                                        <span className="cubby-id">{cubby.column + cubby.number}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Cubby tooltip */}
                {cubbyTooltipInfo.visible && cubbyTooltipInfo.cubby && (
                    <div 
                        className="cubby-tooltip"
                        style={{
                            top: cubbyTooltipInfo.y + 10,
                            left: cubbyTooltipInfo.x + 10
                        }}
                    >
                        <h4>Cubby {cubbyTooltipInfo.cubby.cubby}</h4>
                        <p>Current Status: {
                            cubbyTooltipInfo.cubby.status === 'green' ? 'Ready to Pack' :
                            cubbyTooltipInfo.cubby.status === 'purple' ? 'Waiting' :
                            cubbyTooltipInfo.cubby.status === 'white' ? 'Empty' :
                            cubbyTooltipInfo.cubby.status === 'red' ? 'Priority order Pack Ready' :
                            cubbyTooltipInfo.cubby.status
                        }</p>
                        <p>Containers Processed: {cubbyTooltipInfo.cubby.containerCount}</p>
                        <h5>Average Time in Status (minutes):</h5>
                        <ul>
                            <li>Pack Ready: {cubbyTooltipInfo.cubby.averageTimeInStatus.packReady}</li>
                            <li>On Conveyor: {cubbyTooltipInfo.cubby.averageTimeInStatus.onConveyor}</li>
                            <li>Partially Picked: {cubbyTooltipInfo.cubby.averageTimeInStatus.partiallyPicked}</li>
                            <li>Waiting for Replenishment: {cubbyTooltipInfo.cubby.averageTimeInStatus.waitingForReplens}</li>
                            <li>No Replenishments: {cubbyTooltipInfo.cubby.averageTimeInStatus.noReplens}</li>
                            <li>Empty: {cubbyTooltipInfo.cubby.averageTimeInStatus.empty}</li>
                        </ul>
                    </div>
                )}

                {/* Zone tooltip */}
                {zoneTooltipInfo.visible && zoneTooltipInfo.summary && (
                    <div 
                        className="zone-tooltip"
                        style={{
                            top: zoneTooltipInfo.y + 10,
                            left: zoneTooltipInfo.x + 10
                        }}
                    >
                        <h4>Zone {zoneTooltipInfo.zone} Summary</h4>
                        <ul>
                            <li>Pack Ready: {zoneTooltipInfo.summary.PackReadyCount}</li>
                            <li>On Conveyor: {zoneTooltipInfo.summary.OnConveyorCount}</li>
                            <li>Partially Picked: {zoneTooltipInfo.summary.PartiallyPickedCount}</li>
                            <li>Waiting for Replenishment: {zoneTooltipInfo.summary.WaitingForReplensCount}</li>
                            <li>No Replenishments: {zoneTooltipInfo.summary.NoReplensCount}</li>
                            <li>Empty Cubbies: {zoneTooltipInfo.summary.EmptyCubbyCount}</li>
                        </ul>
                    </div>
                )}

                {/* Chute tooltip */}
                {chuteTooltipInfo.visible && chuteTooltipInfo.chuteSummary && (
                    <div 
                        className="chute-tooltip"
                        style={{
                            top: chuteTooltipInfo.y + 10,
                            left: chuteTooltipInfo.x + 10
                        }}
                    >
                        <h4>Chute {chuteTooltipInfo.chute}</h4>
                        <p>Zone: {chuteTooltipInfo.zone}</p>
                        <ul>
                            <li>Pack Ready: {chuteTooltipInfo.chuteSummary.PackReadyCount}</li>
                            <li>On Conveyor: {chuteTooltipInfo.chuteSummary.OnConveyorCount}</li>
                            <li>Partially Picked: {chuteTooltipInfo.chuteSummary.PartiallyPickedCount}</li>
                            <li>Waiting for Replenishment: {chuteTooltipInfo.chuteSummary.WaitingForReplensCount}</li>
                            <li>No Replenishments: {chuteTooltipInfo.chuteSummary.NoReplensCount}</li>
                            <li>Empty Cubbies: {chuteTooltipInfo.chuteSummary.EmptyCubbyCount}</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PutwallTile;
