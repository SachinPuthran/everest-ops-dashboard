import React, {useMemo, useState} from 'react';
import {useQuery} from 'react-query';
import {fetchPutwallData} from '../../api/api';
import {CubbyStatus, PutwallItem} from '../../types';
import '../../styles/Details.css';

interface FilterProps {
    statuses: string[];
    zones: string[];
    cubbyStatuses: CubbyStatus[];
    filters: {
        status: string;
        zone: string;
        cubbyStatus: string;
    };
    onChange: (name: string, value: string) => void;
    onClear: () => void;
    onExportToExcel: () => void;
}

const FilterBar: React.FC<FilterProps> = ({ statuses, zones, cubbyStatuses, filters, onChange, onClear, onExportToExcel }) => (
    <div className="filters-container">
        <div className="filter-group">
            <label htmlFor="status">Status:</label>
            <select
                id="status"
                name="status"
                value={filters.status}
                onChange={(e) => onChange('status', e.target.value)}
            >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                ))}
            </select>
        </div>
        <div className="filter-group">
            <label htmlFor="zone">Zone:</label>
            <select
                id="zone"
                name="zone"
                value={filters.zone}
                onChange={(e) => onChange('zone', e.target.value)}
            >
                <option value="">All Zones</option>
                {zones.map(zone => (
                    <option key={zone} value={zone}>{zone}</option>
                ))}
            </select>
        </div>
        <div className="filter-group">
            <label htmlFor="cubbyStatus">Cubby Status:</label>
            <select
                id="cubbyStatus"
                name="cubbyStatus"
                value={filters.cubbyStatus}
                onChange={(e) => onChange('cubbyStatus', e.target.value)}
            >
                <option value="">All Cubby Statuses</option>
                {cubbyStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
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

const DetailsModal: React.FC<{ item: PutwallItem; onClose: () => void }> = ({ item, onClose }) => (
    <div className="modal-backdrop">
        <div className="modal-content">
            <div className="modal-header">
                <h3>Details for Item ID: {item.id}</h3>
                <button className="close-btn" onClick={onClose}>×</button>
            </div>
            <div className="modal-body">
                <table className="details-table">
                    <tbody>
                        {Object.entries(item).map(([key, value]) => (
                            <tr key={key}>
                                <td>{key}</td>
                                <td>{value}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="modal-footer">
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    </div>
);

const PutwallDetails: React.FC = () => {
    const [filters, setFilters] = useState({
        status: '',
        zone: '',
        cubbyStatus: 'WAITINGFORREPLENS'
    });

    const { data, isLoading, error } = useQuery<PutwallItem[]>(
        ['putwallData', filters],
        () => fetchPutwallData(filters),
        {
            refetchOnWindowFocus: false,
            keepPreviousData: true
        }
    );

    const [selectedItem, setSelectedItem] = useState<PutwallItem | null>(null);

    const statuses = useMemo(() => {
        if (!data) return [];
        return [...new Set(data.map(item => item.status))].sort();
    }, [data]);

    const zones = useMemo(() => {
        if (!data) return [];
        return [...new Set(data.map(item => item.zone.substring(0, 3)))].sort();
    }, [data]);

    const cubbyStatuses: CubbyStatus[] = [
        'PACKREADY', 'ONCONVEYOR', 'PARTIALLYPICKED', 'WAITINGFORREPLENS', 'NOREPLENS', 'EMPTYCUBBY'
    ];

    const handleFilterChange = (name: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            status: '',
            zone: '',
            cubbyStatus: ''
        });
    };

    const handleExportToExcel = () => {
        if (!data) return;

        const headers = Object.keys(data[0]);
        const rows = data.map(item => Object.values(item));
        const worksheet = [headers, ...rows]
            .map(row => row.join("\t"))
            .join("\n");

        const blob = new Blob([worksheet], { type: 'text/tab-separated-values;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'PutwallData.xls');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data</div>;

    return (
        <div className="details-container">
            <h2>Putwall Details</h2>
            <FilterBar
                statuses={statuses}
                zones={zones}
                cubbyStatuses={cubbyStatuses}
                filters={filters}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
                onExportToExcel={handleExportToExcel}
            />
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Zone</th>
                        <th>Cubby</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? (
                        data.map(item => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.zone}</td>
                                <td>{item.cubby}</td>
                                <td>{item.status}</td>
                                <td>{item.priority}</td>
                                <td>
                                    <button className="view-details-btn" onClick={() => setSelectedItem(item)}>View Details</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6}>No data available</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {selectedItem && (
                <DetailsModal item={selectedItem} onClose={() => setSelectedItem(null)} />
            )}
        </div>
    );
};

export default PutwallDetails;