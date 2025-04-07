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
    ChartData,
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

    // Prepare data for zone chart
    const zoneData: Record<string, number> = {};
    const statusData: Record<string, number> = {};

    data.forEach(item => {
        // Aggregate by zone
        if (!zoneData[item.zone]) {
            zoneData[item.zone] = 0;
        }
        zoneData[item.zone] += item.count;

        // Aggregate by status
        if (!statusData[item.status]) {
            statusData[item.status] = 0;
        }
        statusData[item.status] += item.count;
    });

    const chartData: ChartData<'pie'> = {
        labels: Object.keys(zoneData),
        datasets: [
            {
                data: Object.values(zoneData),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ],
                hoverBackgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ]
            }
        ]
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
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw as number;
                        const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    // Check if there are any errors in the data
    const hasErrors = data.some(item => item.status === 'ERROR');

    return (
        <div className={`tile ${isActive ? 'active' : ''} ${hasErrors ? 'alert' : ''}`} onClick={onClick}>
            <h2>Putwall</h2>
            <div className="tile-content">
                <div className="chart-container">
                    <Pie data={chartData} options={chartOptions} />
                </div>
                <div className="summary-container">
                    <h3>Zone Counts</h3>
                    <ul>
                        {Object.entries(zoneData).map(([zone, count]) => (
                            <li key={zone}>
                                <span className="zone">{zone}:</span> {count}
                            </li>
                        ))}
                    </ul>
                    <h3>Status Counts</h3>
                    <ul>
                        {Object.entries(statusData).map(([status, count]) => (
                            <li key={status} className={status === 'ERROR' ? 'alert-item' : ''}>
                <span className="status">
                  <span className={`status-indicator status-${status.toLowerCase()}`}></span>
                    {status}:
                </span>
                                {count}
                                {status === 'ERROR' && count > 0 && <span className="alert-badge">!</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="tile-footer">
                <span>Click to view details</span>
                {hasErrors && <span className="alert-indicator">Issues detected</span>}
            </div>
        </div>
    );
};

export default PutwallTile;