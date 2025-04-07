import React from 'react';
import { useQuery } from 'react-query';
import { fetchUnitSortSummary } from '../api/api';
import { UnitSortSummary, TileProps } from '../types';
import { Doughnut } from 'react-chartjs-2';
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

const UnitSortTile: React.FC<TileProps> = ({ isActive, onClick }) => {
    const { data, isLoading, error } = useQuery<UnitSortSummary>(
        'unitSortSummary',
        fetchUnitSortSummary
    );

    if (isLoading) {
        return (
            <div className={`tile ${isActive ? 'active' : ''}`} onClick={onClick}>
                <h2>Unit Sort</h2>
                <div className="loading">Loading...</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className={`tile ${isActive ? 'active' : ''}`} onClick={onClick}>
                <h2>Unit Sort</h2>
                <div className="error">Error loading data</div>
            </div>
        );
    }

    const chartData: ChartData<'doughnut'> = {
        labels: ['Allocated Picks', 'Unallocated Picks', 'Replen Items'],
        datasets: [
            {
                data: [
                    data.total_allocated,
                    data.total_unallocated,
                    data.total_replen
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 206, 86, 0.6)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions: ChartOptions<'doughnut'> = {
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
        },
        cutout: '60%'
    };

    // Calculate percentages
    const totalPicks = data.total_allocated + data.total_unallocated;
    let unallocatedPercentage = 0;
    let replenPercentage = 0;

    if (totalPicks > 0) {
        unallocatedPercentage = Math.round((data.total_unallocated / totalPicks) * 100);
    }

    if (data.container_count > 0) {
        replenPercentage = Math.round((data.total_replen / data.container_count));
    }

    // Determine alert status
    const hasHighUnallocated = unallocatedPercentage > 20;
    const hasHighReplen = replenPercentage > 5;
    const alertStatus = hasHighUnallocated || hasHighReplen;

    return (
        <div className={`tile ${isActive ? 'active' : ''} ${alertStatus ? 'alert' : ''}`} onClick={onClick}>
            <h2>Unit Sort</h2>
            <div className="tile-content">
                <div className="chart-container">
                    <Doughnut data={chartData} options={chartOptions} />
                </div>
                <div className="summary-container">
                    <h3>Container Summary</h3>
                    <ul>
                        <li>
                            <span className="label">Total Containers:</span> {data.container_count}
                        </li>
                        <li>
                            <span className="label">Allocated Picks:</span> {data.total_allocated}
                        </li>
                        <li className={hasHighUnallocated ? 'alert-item' : ''}>
                            <span className="label">Unallocated Picks:</span> {data.total_unallocated}
                            {hasHighUnallocated && <span className="alert-badge">!</span>}
                        </li>
                        <li className={hasHighReplen ? 'alert-item' : ''}>
                            <span className="label">Replen Items:</span> {data.total_replen}
                            {hasHighReplen && <span className="alert-badge">!</span>}
                        </li>
                    </ul>
                </div>
            </div>
            <div className="tile-footer">
                <span>Click to view details</span>
                {alertStatus && <span className="alert-indicator">Issues detected</span>}
            </div>
        </div>
    );
};

export default UnitSortTile;