import React from 'react';
import {useQuery} from 'react-query';
import {fetchUnitSortSummary} from '../api/api';
import {UnitSortSummary, TileProps} from '../types';
import {Doughnut} from 'react-chartjs-2';
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

const UnitSortTile: React.FC<TileProps> = ({isActive, onClick}) => {
    const {data, isLoading, error} = useQuery<UnitSortSummary>(
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
        labels: [
            //'Packages', 'Units',
            'Released', 'Allocated', 'Unallocated', 'Replen SKU'],
        datasets: [
            {
                data: [
                    // data.PackageCount,
                    // data.UnitCount,
                    data.ReleasedUnits,
                    data.AllocatedUnits,
                    data.UnallocatedUnits,
                    data.ReplenSKUCount,
                ],
                backgroundColor: [
                    // 'rgba(75, 192, 192, 0.6)',
                    // 'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 206, 86, 0.6)'
                ],
                borderColor: [
                    // 'rgba(75, 192, 192, 1)',
                    // 'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(153, 102, 255, 1)',
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
                        size: 14
                    },
                    padding: 4
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = context.raw as number;
                        const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${value} (${percentage}%)`;
                    }
                }
            }
        },
        cutout: '50%'
    };

    return (
        <div className={`unitsort tile ${isActive ? 'active' : ''}`} onClick={onClick}>
            <h2>Unit Sort</h2>
            <div className="tile-content">
                <div className="unitsort chart-container">
                    <Doughnut data={chartData} options={chartOptions}/>
                </div>
                <div className="unitsort summary-container">
                    <h3>Container Summary</h3>
                    <ul>
                        <li className="divider"></li>
                        <li><span className="label">Package Count:</span> {data.PackageCount}</li>
                        {/*<li><span className="label">Unit Count:</span> {data.UnitCount}</li>*/}
                        <li><span className="label">Released Units:</span> {data.ReleasedUnits}</li>
                        <li><span className="label">Allocated Units:</span> {data.AllocatedUnits}</li>
                        <li><span className="label">Unallocated Units:</span> {data.UnallocatedUnits}</li>
                        <li><span className="label">Replen SKU Count:</span> {data.ReplenSKUCount}</li>
                    </ul>
                </div>
            </div>
            <div className="tile-footer"></div>
        </div>
    );
};

export default UnitSortTile;