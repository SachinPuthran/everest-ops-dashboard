import React from 'react';
import {useQuery} from 'react-query';
import {fetchReplenishmentSummary} from '../api/api';
import {ReplenishmentSummaryItem, TileProps} from '../types';
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
    const {data, isLoading, error} = useQuery<ReplenishmentSummaryItem[]>(
        'replenishmentSummary',
        fetchReplenishmentSummary
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

    const chartData: ChartData<'bar'> = {
        labels: data.map(item => item.pack_lane),
        datasets: [
            {
                label: 'Count by Lane',
                data: data.map(item => item.count),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
        ],
    };

    const chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Count'
                }
            },
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `Count: ${context.raw}`;
                    }
                }
            }
        }
    };

    const totalItems = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className={`tile ${isActive ? 'active' : ''}`} onClick={onClick}>
            <h2>Replenishment</h2>
            <div className="tile-content">
                <div className="chart-container">
                    <Bar data={chartData} options={chartOptions}/>
                </div>
                <div className="summary-container">
                    <h3>Pack Lane Counts</h3>
                    <ul>
                        <li className="divider"></li>
                        {data.map(item => (
                            <li key={item.pack_lane}>
                                <span className="lane">{item.pack_lane}:</span> {item.count}
                            </li>
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