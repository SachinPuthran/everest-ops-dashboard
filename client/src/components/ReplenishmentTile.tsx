import React from 'react';
import {useQuery} from 'react-query';
import {fetchReplenishmentSummaryByPriority} from '../api/api';
import {ReplenishmentSummaryByPriorityItem, TileProps} from '../types';
import {Bar} from 'react-chartjs-2';
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ReplenishmentTile: React.FC<TileProps> = ({isActive, onClick}) => {
    const {data, isLoading, error} = useQuery<ReplenishmentSummaryByPriorityItem[]>(
        'replenishmentSummaryByPriority',
        fetchReplenishmentSummaryByPriority
    );

    if (isLoading) {
        return (
            <div className={`tile ${isActive ? 'active' : ''}`} onClick={onClick}>
                <h2>Replenishment</h2>
                <div className="loading">Loading...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className={`tile ${isActive ? 'active' : ''}`} onClick={onClick}>
                <h2>Replenishment</h2>
                <div className="error">Error loading data</div>
            </div>
        );
    }

    // Process data to create stacked chart
    const uniquePackLanes = [...new Set(data.map(item => item.pack_lane))];
    const uniquePriorityRanges = [...new Set(data.map(item => item.priority_range))];

    // Sort priority ranges in ascending order
    uniquePriorityRanges.sort((a, b) => {
        if (a === 'No Priority') return -1;
        if (b === 'No Priority') return 1;
        if (a === 'Other') return -1;
        if (b === 'Other') return 1;
        return a.localeCompare(b);
    });

    // Define colors for each priority range
    const colorMap: Record<string, { backgroundColor: string, borderColor: string }> = {
        'No Priority': { backgroundColor: 'rgba(200, 200, 200, 0.6)', borderColor: 'rgba(200, 200, 200, 1)' },
        'Other': { backgroundColor: 'rgba(150, 150, 150, 0.6)', borderColor: 'rgba(150, 150, 150, 1)' },
        '30-39': { backgroundColor: 'rgba(255, 99, 132, 0.6)', borderColor: 'rgba(255, 99, 132, 1)' },
        '40-49': { backgroundColor: 'rgba(255, 159, 64, 0.6)', borderColor: 'rgba(255, 159, 64, 1)' },
        '50-59': { backgroundColor: 'rgba(255, 205, 86, 0.6)', borderColor: 'rgba(255, 205, 86, 1)' },
        '60-69': { backgroundColor: 'rgba(75, 192, 192, 0.6)', borderColor: 'rgba(75, 192, 192, 1)' },
        '70-79': { backgroundColor: 'rgba(54, 162, 235, 0.6)', borderColor: 'rgba(54, 162, 235, 1)' },
        '80-89': { backgroundColor: 'rgba(153, 102, 255, 0.6)', borderColor: 'rgba(153, 102, 255, 1)' },
        '90-100': { backgroundColor: 'rgba(201, 203, 207, 0.6)', borderColor: 'rgba(201, 203, 207, 1)' }
    };

    // Create datasets for each priority range
    const datasets = uniquePriorityRanges.map(priorityRange => {
        return {
            label: priorityRange,
            data: uniquePackLanes.map(packLane => {
                const item = data.find(d => d.pack_lane === packLane && d.priority_range === priorityRange);
                return item ? item.count : 0;
            }),
            backgroundColor: colorMap[priorityRange]?.backgroundColor || 'rgba(54, 162, 235, 0.6)',
            borderColor: colorMap[priorityRange]?.borderColor || 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            // barThickness: 30, // Fixed bar thickness
            // maxBarThickness: 50, // Maximum bar thickness
            minBarLength: 10,
            maxBarLength: 50,
        };
    });

    const chartData: ChartData<'bar'> = {
        labels: uniquePackLanes,
        datasets: datasets,
    };

    const chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true,
                grid: {
                    offset: true
                },
                ticks: {
                    autoSkip: false
                }
            },
            y: {
                stacked: true,
                beginAtZero: true,
                title: {
                    display: false,
                    text: 'Count'
                },
                min: 0,
                suggestedMax: 20 // Adjust this value based on your data range
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            tooltip: {
                enabled: true,
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: ${context.raw}`;
                    }
                }
            }
        }
    };

    // Group data by pack lane
    const dataByPackLane = uniquePackLanes.map(packLane => {
        const packLaneData = data.filter(item => item.pack_lane === packLane);
        const total = packLaneData.reduce((sum, item) => sum + item.count, 0);
        return {
            packLane,
            priorityCounts: packLaneData,
            total
        };
    });

    const totalItems = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className={`replenishment tile ${isActive ? 'active' : ''}`} onClick={onClick}>
            <h2>Replenishment</h2>
            <div className="tile-content">
                <div className="replenishment chart-container">
                    <Bar data={chartData} options={chartOptions}/>
                </div>
                <div className="replenishment summary-container">
                    <h3>Pack Lane Priority Counts</h3>
                    <ul>
                        <li className="divider"></li>
                        {dataByPackLane.map(laneData => (
                            <React.Fragment key={laneData.packLane}>
                                <li className="lane-header">
                                    <span className="lane">{laneData.packLane}</span>
                                    <span className="total-count">Total: {laneData.total}</span>
                                </li>
                                {laneData.priorityCounts.map(item => (
                                    <li key={`${laneData.packLane}-${item.priority_range}`} className="priority-item">
                                        <span className="priority-range">{item.priority_range}:</span> {item.count}
                                    </li>
                                ))}
                                <li className="divider"></li>
                            </React.Fragment>
                        ))}
                    </ul>
                    <p className="total">
                        Total Items: {totalItems}
                    </p>
                </div>
            </div>
            <div className="tile-footer">
            </div>
        </div>
    );
};

export default ReplenishmentTile;
