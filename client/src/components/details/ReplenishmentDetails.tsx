import React, {useState, useMemo} from 'react';
import {useQuery} from 'react-query';
import {fetchReplenishmentData} from '../../api/api';
import {
    ReplenishmentItem,
    ReplenishmentFilterOptions,
    ReplenishmentSortConfig, CubbyStatus, PutwallItem
} from '../../types';
import '../../styles/Details.css';

interface FilterProps {
    packLanes: string[];
    priorities: string[];
    zones: string[];
    filters: {
        pack_lane: string;
        priority: string;
        zone: string;
    };
    onChange: (name: string, value: string) => void;
    onClear: () => void;
    onExportToExcel: () => void;
}

const FilterBar: React.FC<FilterProps> = ({
                                              packLanes,
                                              priorities,
                                              zones,
                                              filters,
                                              onChange,
                                              onClear,
                                              onExportToExcel
                                          }) => (
    <div className="filters-container">
        <div className="filter-group">
            <label htmlFor="pack_lane">Pack Lane:</label>
            <select
                id="pack_lane"
                name="pack_lane"
                value={filters.pack_lane}
                onChange={(e) => onChange('pack_lane', e.target.value)}
            >
                <option value="">All Pack Lanes</option>
                {packLanes.map(pack_lane => (
                    <option key={pack_lane} value={pack_lane}>{pack_lane}</option>
                ))}
            </select>
        </div>
        <div className="filter-group">
            <label htmlFor="priority">Priority:</label>
            <select
                id="priority"
                name="priority"
                value={filters.priority}
                onChange={(e) => onChange('priority', e.target.value)}
            >
                <option value="">All Priorities</option>
                {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                ))}
            </select>
        </div>
        <div className="filter-group">
            <label htmlFor="zone">Pickarea:</label>
            <select
                id="zone"
                name="zone"
                value={filters.zone}
                onChange={(e) => onChange('zone', e.target.value)}
            >
                <option value="">All Pickarea</option>
                {zones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                ))}
            </select>
        </div>
        <button className="clear-filters-btn" onClick={onClear}>
            Clear Filters
        </button>
        <button className="export-excel-btn" onClick={onExportToExcel}>
            Export To Excel
        </button>
    </div>
);

const ReplenishmentDetails: React.FC = () => {
    const [filters, setFilters] = useState({
        pack_lane: '',
        priority: '',
        zone: '',
    });

    const {data, isLoading, error} = useQuery<ReplenishmentItem[]>(
        ['replenishmentData', filters],
        () => fetchReplenishmentData(filters),
        {
            refetchOnWindowFocus: false,
            keepPreviousData: true
        }
    );

    const [selectedItem, setSelectedItem] = useState<ReplenishmentItem | null>(null);

    const packLanes = useMemo(() => {
        if (!data) return [];
        return [...new Set(data.map(item => item.pack_lane))].sort();
    }, [data]);

    const priorities = useMemo(() => {
        if (!data) return [];
        return [...new Set(data.map(item => item.priority))].sort();
    }, [data]);

    const zones = useMemo(() => {
        if (!data) return [];
        return [...new Set(data.map(item => item.zone))].sort();
    }, [data]);

    const handleFilterChange = (name: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            pack_lane: '',
            priority: '',
            zone: '',
        });
    };

    const handleExportToExcel = () => {
        if (!data) return;

        const headers = Object.keys(data[0]);
        const rows = data.map(item => Object.values(item));
        const worksheet = [headers, ...rows]
            .map(row => row.join("\t"))
            .join("\n");

        const blob = new Blob([worksheet], {type: 'text/tab-separated-values;charset=utf-8;'});
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'ReplenishmentData.xls');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data</div>;

    return (
        <div className="details-container">
            <h2>Replenishment Details</h2>
            <FilterBar
                packLanes={packLanes}
                priorities={priorities}
                zones={zones}
                filters={filters}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
                onExportToExcel={handleExportToExcel}
            />
            <table className="data-table">
                <thead>
                <tr>
                    <th>Pack Lane</th>
                    <th>Work Type</th>
                    <th>Pickarea</th>
                    <th>Priority</th>
                    <th>Total Replen Units</th>
                    <th>Demand Qty</th>
                </tr>
                </thead>
                <tbody>
                {data && data.length > 0 ? (
                    data.map(item => (
                        <tr key={item.id}>
                            <td>{item.pack_lane}</td>
                            <td>{item.work_type}</td>
                            <td>{item.zone}</td>
                            <td>{item.priority}</td>
                            <td>{item.TotalReplenUnits}</td>
                            <td>{item.TotalDemand}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={6}>No data available</td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default ReplenishmentDetails;