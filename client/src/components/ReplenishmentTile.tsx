import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { fetchReplenishmentSummary } from '../api/api';
import { TileProps } from '../types';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartData,
    ChartOptions
} from 'chart.js';
import '../styles/Tile.css';
import './ReplenishmentTile.css'; // We'll create this file for custom styles

// Define the types based on usage in the component
interface ReplenishmentSummaryItem {
    pack_lane: string;
    count: number;
}

// Extended data with priority
interface ExtendedReplenishmentItem extends ReplenishmentSummaryItem {
    priority: number;
}

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ReplenishmentTile: React.FC<TileProps> = ({ isActive }) => {
    const { data, isLoading, error } = useQuery<ReplenishmentSummaryItem[]>(
        'replenishmentSummary',
        fetchReplenishmentSummary
    );

    // No longer using priority range selection
    // Display all priorities at once

    if (isLoading) {
        return (
            <div className={`tile ${isActive ? 'active' : ''}`}>
                <h2>Replenishment</h2>
                <div className="loading">Loading...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className={`tile ${isActive ? 'active' : ''}`}>
                <h2>Replenishment</h2>
                <div className="error">Error loading data</div>
            </div>
        );
    }

    // Generate mock priority data
    const extendedData: ExtendedReplenishmentItem[] = data.map(item => ({
        ...item,
        priority: Math.floor(Math.random() * 50) + 1 // Random priority between 1-50
    }));

    // Group data by priority ranges (1-10, 11-20, etc.)
    const priorityRanges = ['1-10', '11-20', '21-30', '31-40', '41-50'];

    // No longer filtering data by priority range
    // Using all data

    // Group data by pack lane and priority range
    const groupedData: Record<string, Record<string, number>> = {};

    extendedData.forEach(item => {
        if (!groupedData[item.pack_lane]) {
            groupedData[item.pack_lane] = {};
            priorityRanges.forEach(range => {
                groupedData[item.pack_lane][range] = 0;
            });
        }

        const priorityRange = `${Math.floor((item.priority - 1) / 10) * 10 + 1}-${Math.floor((item.priority - 1) / 10) * 10 + 10}`;
        groupedData[item.pack_lane][priorityRange] += 1;
    });

    // Prepare data for stacked bar chart
    const packLanes = Object.keys(groupedData);

    const chartData: ChartData<'bar'> = {
        labels: packLanes,
        datasets: priorityRanges.map((range, index) => ({
            label: `Priority ${range}`,
            data: packLanes.map(lane => groupedData[lane][range]),
            backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(75, 192, 192, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(255, 99, 132, 0.6)',
                'rgba(153, 102, 255, 0.6)'
            ][index],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(153, 102, 255, 1)'
            ][index],
            borderWidth: 1,
        }))
    };

    const chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Count'
                }
            },
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        size: 10
                    },
                    padding: 4
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: ${context.raw}`;
                    }
                }
            }
        }
    };

    // Calculate total items per pack lane
    const totalItemsByLane: Record<string, number> = {};
    extendedData.forEach(item => {
        if (!totalItemsByLane[item.pack_lane]) {
            totalItemsByLane[item.pack_lane] = 0;
        }
        totalItemsByLane[item.pack_lane] += item.count;
    });

    const totalItems = extendedData.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className={`tile ${isActive ? 'active' : ''}`}>
            <h2>Replenishment</h2>
            {/* Priority controls removed - showing all priorities at once */}
            <div className="tile-content">
                <div className="chart-container">
                    <Bar data={chartData} options={chartOptions}/>
                </div>
                <div className="summary-container">
                    <h3>Pack Lane Counts by Priority</h3>
                    <ul>
                        <li className="divider"></li>
                        {packLanes.map(lane => (
                            <li key={lane} className="pack-lane-item">
                                <span className="lane">{lane}:</span>
                                <div className="priority-breakdown">
                                    {priorityRanges.map(range => (
                                        <div key={`${lane}-${range}`} className="priority-item">
                                            <span className="priority-label">{range}:</span>
                                            <span className="priority-count">{groupedData[lane][range]}</span>
                                        </div>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="pack-lane-totals">
                        <h4>Total Processed Counts by Pack Lane:</h4>
                        <ul>
                            {Object.entries(totalItemsByLane).map(([lane, count]) => (
                                <li key={`total-${lane}`}>
                                    <span className="lane">{lane}:</span> {count}
                                </li>
                            ))}
                        </ul>
                        <p className="total">Total Items: {totalItems}</p>
                    </div>
                </div>
            </div>
            <div className="tile-footer">
                <div className="priority-legend">
                    <span>Priority ranges shown in blocks of 10</span>
                </div>
            </div>
        </div>
    );
};

export default ReplenishmentTile;
