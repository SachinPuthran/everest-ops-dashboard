import React from 'react';
import { useQuery } from 'react-query';
import { fetchPutwallSummary } from '../api/api';
import { PutwallSummaryItem, TileProps } from '../types';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartOptions
} from 'chart.js';
import '../styles/Tile.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const PutwallTile: React.FC<TileProps> = ({ isActive, onClick }) => {
    const { data, isLoading, error } = useQuery<PutwallSummaryItem[]>(
        'putwallSummary',
        fetchPutwallSummary
    );

    if (isLoading) {
        return (
            <div className={`tile ${isActive ? 'active' : ''}`} onClick={onClick}>
                <h2>Putwall</h2>
                <div className="loading">Loading...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className={`tile ${isActive ? 'active' : ''}`} onClick={onClick}>
                <h2>Putwall</h2>
                <div className="error">Error loading data</div>
            </div>
        );
    }

    const aggregatedData = data.reduce<Record<string, Record<string, number>>>(
        (acc, item) => {
            if (!acc[item.zone]) {
                acc[item.zone] = {
                    PackReadyCount: 0,
                    OnConveyorCount: 0,
                    PartiallyPickedCount: 0,
                    WaitingForReplensCount: 0,
                    NoReplensCount: 0,
                    EmptyCubbyCount: 0,
                };
            }
            acc[item.zone].PackReadyCount += item.PackReadyCount;
            acc[item.zone].OnConveyorCount += item.OnConveyorCount;
            acc[item.zone].PartiallyPickedCount += item.PartiallyPickedCount;
            acc[item.zone].WaitingForReplensCount += item.WaitingForReplensCount;
            acc[item.zone].NoReplensCount += item.NoReplensCount;
            acc[item.zone].EmptyCubbyCount += item.EmptyCubbyCount;

            return acc;
        },
        {}
    );

    const zonesData = Object.values(aggregatedData);

    const chartLabels = [
        "PackReadyCount",
        "OnConveyorCount",
        "PartiallyPickedCount",
        "WaitingForReplensCount",
        "NoReplensCount",
        "EmptyCubbyCount",
    ];

    const pieData = chartLabels.map((label) =>
        zonesData.reduce((sum, zone) => sum + zone[label], 0)
    );

    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                label: "Putwall Summary",
                data: pieData,
                backgroundColor: [
                    "#007bff", // Blue for PackReady
                    "#28a745", // Green for OnConveyor
                    "#ffc107", // Yellow for PartiallyPicked
                    "#fd7e14", // Orange for WaitingForReplens
                    "#ff3838", // Red for NoReplens
                    "#6c757d", // Grey for EmptyCubby
                ],
                borderColor: [
                    "#0056b3",
                    "#19692c",
                    "#cc9a06",
                    "#b85306",
                    "#b01e1e",
                    "#52575c",
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions: ChartOptions<'pie'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        size: 12
                    },
                    padding: 10
                }
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem: any) => {
                        const label = tooltipItem.label || "";
                        const value = tooltipItem.raw || 0;
                        return `${label}: ${value}`;
                    },
                },
            },
        },
    };

    const hasErrors = data.some(item => item.WaitingForReplensCount !== 0);

    return (
        <div className={`tile ${isActive ? 'active' : ''} ${hasErrors ? 'alert' : ''}`} onClick={onClick}>
            <h2>Putwall</h2>
            <div className="tile-content">
                <div className="chart-container">
                    <Pie data={chartData} options={chartOptions}/>
                </div>
                <div className="summary-container">
                    <h3>Zone Counts</h3>
                    <ul>
                        {data.map((item) => {
                            const zone = item.zone;
                            let totalCount = item.PackReadyCount + item.OnConveyorCount + item.PartiallyPickedCount + item.WaitingForReplensCount + item.NoReplensCount + item.EmptyCubbyCount;
                            return (<>
                                <li className="divider"></li>
                                <li><span className="zone">{zone}</span></li>
                                <li><span className="label">Total Cubbies:</span> {totalCount}</li>
                                <li><span className="label">Pack Ready:</span> {item.PackReadyCount}</li>
                                <li><span className="label">On Conveyor:</span> {item.OnConveyorCount}</li>
                                <li><span className="label">Partially Picked:</span> {item.PartiallyPickedCount}</li>
                                <li><span className="label alert-item">Waiting for Replenishment:</span> {item.WaitingForReplensCount}</li>
                                <li><span className="label">No Replenishments:</span> {item.NoReplensCount}</li>
                                <li><span className="label">Empty Cubby:</span> {item.EmptyCubbyCount}</li>
                            </>);
                        })}
                    </ul>
                </div>
            </div>
            <div className="tile-footer">
                <span>Click to view details</span>
                {hasErrors && <span
                    className="alert-indicator">Waiting for replenishment - {data.reduce((sum, item) => sum + item.WaitingForReplensCount, 0)}</span>}
            </div>
        </div>
    );
};

export default PutwallTile;