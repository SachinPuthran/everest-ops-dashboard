import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { fetchPutwallIssues, fetchPutwallIssueDetails, fetchPutwallData } from '../../api/api';
import { PutwallIssue, PutwallItem } from '../../types';
import '../../styles/Details.css';

interface IssueModalProps {
    replenLocation: string;
    filters: {
        status: string;
        zone: string;
    };
    onClose: () => void;
}

interface FilterProps {
    statuses: string[];
    zones: string[];
    filters: {
        status: string;
        zone: string;
    };
    onChange: (name: string, value: string) => void;
    onClear: () => void;
}

const FilterBar: React.FC<FilterProps> = ({ statuses, zones, filters, onChange, onClear }) => (
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
        <button className="clear-filters-btn" onClick={onClear}>
            Clear Filters
        </button>
    </div>
);

const IssueModal: React.FC<IssueModalProps> = ({ replenLocation, filters, onClose }) => {
    const { data, isLoading, error } = useQuery(
        ['putwallIssueDetails', replenLocation, filters],
        () => fetchPutwallIssueDetails(replenLocation, filters)
    );

    const handleExportToExcel = () => {
        if (!data) return;

        const headers = ['Zone', 'Cubby', 'ItemNumber', 'ContainerID', 'Status', 'OrderNumber', 'Priority'];
        const rows = data.map((item: PutwallItem) => [
            item.zone,
            item.cubby,
            item.item_number,
            item.container_id,
            item.status,
            item.order_number,
            item.priority,
        ]);
        const worksheet = [headers, ...rows]
            .map(row => row.join("\t"))
            .join("\n");

        const blob = new Blob([worksheet], {type: 'text/tab-separated-values;charset=utf-8;'});
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `PutwallIssues_${replenLocation}.xls`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Get unique statuses and zones for filters
    const statuses: any = React.useMemo(() => {
        if (!data) return [];
        return [...new Set(data.map((item: PutwallItem) => item.status))];
    }, [data]);

    const zones: any = React.useMemo(() => {
        if (!data) return [];
        return [...new Set(data.map((item: PutwallItem) => item.zone))];
    }, [data]);

    const [modalFilters, setModalFilters] = useState(filters);

    const handleFilterChange = (name: string, value: string) => {
        setModalFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClearFilters = () => {
        setModalFilters({ status: '', zone: '' });
    };

    // Filter data locally (for immediate feedback)
    const filteredData = React.useMemo(() => {
        if (!data) return [];

        return data.filter((item: PutwallItem) => {
            return (
                (modalFilters.status === '' || item.status === modalFilters.status) &&
                (modalFilters.zone === '' || item.zone === modalFilters.zone)
            );
        });
    }, [data, modalFilters]);

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Issue Details: {replenLocation}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    {isLoading && <div className="loading">Loading...</div>}
                    {error && <div className="error">Error loading details</div>}
                    {data && (
                        <>
                            <FilterBar
                                statuses={statuses}
                                zones={zones}
                                filters={modalFilters}
                                onChange={handleFilterChange}
                                onClear={handleClearFilters}
                            />

                            <div className="data-summary">
                                <span>Showing {filteredData.length} of {data.length} items</span>
                            </div>

                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>Zone</th>
                                    <th>Cubby</th>
                                    <th>Item Number</th>
                                    <th>Container ID</th>
                                    <th>Status</th>
                                    <th>Order Number</th>
                                    <th>Priority</th>
                                    <th>Work Type</th>
                                    <th>Pick Location</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="no-data">No data matching current filters</td>
                                    </tr>
                                ) : (
                                    filteredData.map((item: PutwallItem) => (
                                        <tr key={item.id}>
                                            <td>{item.zone}</td>
                                            <td>{item.cubby}</td>
                                            <td>{item.item_number}</td>
                                            <td>{item.container_id}</td>
                                            <td>
                                                <span className={`status-indicator status-${item.status.toLowerCase()}`}></span>
                                                {item.status}
                                            </td>
                                            <td>{item.order_number}</td>
                                            <td className={`priority-${item.priority <= 2 ? 'high' : item.priority <= 3 ? 'medium' : 'low'}`}>
                                                {item.priority}
                                            </td>
                                            <td>{item.work_type}</td>
                                            <td>{item.pick_location}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>

                            {filteredData.length > 0 && (
                                <div className="item-details">
                                    <h4>Additional Item Details</h4>
                                    <p>Select an item to view all details</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
                <div className="modal-footer">
                    <button onClick={handleExportToExcel}>Export to Excel</button>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

const PutwallDetails: React.FC = () => {
    // Query for issues and all putwall data
    const { data: issuesData, isLoading: issuesLoading, error: issuesError } = useQuery<PutwallIssue[]>(
        'putwallIssues',
        fetchPutwallIssues
    );

    const [filters, setFilters] = useState({
        status: '',
        zone: ''
    });

    const { data: allPutwallData, isLoading: dataLoading, error: dataError } = useQuery<PutwallItem[]>(
        ['putwallData', filters],
        () => fetchPutwallData(filters),
        {
            // This ensures the data is refetched when filters change
            refetchOnWindowFocus: false,
            keepPreviousData: true
        }
    );

    const [activeTab, setActiveTab] = useState('issues');

    const handleTabClick = (tabName: string) => {
        setActiveTab(tabName);
    };

    const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

    // Extract unique statuses and zones from all data
    const statuses = React.useMemo(() => {
        if (!allPutwallData) return [];
        return [...new Set(allPutwallData.map(item => item.status))].sort();
    }, [allPutwallData]);

    const zones = React.useMemo(() => {
        if (!allPutwallData) return [];
        return [...new Set(allPutwallData.map(item => item.zone))].sort();
    }, [allPutwallData]);

    const handleIssueClick = (replenLocation: string) => {
        setSelectedIssue(replenLocation);
    };

    const handleCloseModal = () => {
        setSelectedIssue(null);
    };

    const handleFilterChange = (name: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            status: '',
            zone: ''
        });
    };

    // Calculate total issue count
    const totalIssueCount = issuesData
        ? issuesData.reduce((total, issue) => total + issue.count, 0)
        : 0;

    // Loading and error states
    const isLoading = issuesLoading || dataLoading;
    const hasError = issuesError || dataError;

    return (
        <div className="details-container">
            <h2>Putwall Details</h2>

            {isLoading && <div className="loading">Loading data...</div>}

            {allPutwallData && (
                <>
                    <FilterBar
                        statuses={statuses}
                        zones={zones}
                        filters={filters}
                        onChange={handleFilterChange}
                        onClear={handleClearFilters}
                    />

                    <div className="tabbed-view">
                        <div className="tab-headers">
                            <div
                                className={`tab-header ${activeTab === 'issues' ? 'active' : ''}`}
                                onClick={() => handleTabClick('issues')}
                            >
                                Issues
                            </div>
                            <div
                                className={`tab-header ${activeTab === 'all' ? 'active' : ''}`}
                                onClick={() => handleTabClick('all')}
                            >
                                All Items
                            </div>
                        </div>

                        <div className="tab-content">
                            {/* Issues Tab */}
                            <div className={`tab-panel ${activeTab === 'issues' ? 'active' : ''}`}>
                                {/* Issues content remains the same */}
                            </div>

                            {/* All Items Tab */}
                            <div className={`tab-panel ${activeTab === 'all' ? 'active' : ''}`}>
                                <h3>All Putwall Items</h3>

                                {/* Use the filtered data from the server */}
                                {allPutwallData && (
                                    <>
                                        <div className="data-summary">
                                            <span>Showing {allPutwallData.length} items</span>
                                        </div>

                                        <table className="data-table">
                                            <thead>
                                            <tr>
                                                <th>Zone</th>
                                                <th>Cubby</th>
                                                <th>Item Number</th>
                                                <th>Container ID</th>
                                                <th>Status</th>
                                                <th>Order Number</th>
                                                <th>Priority</th>
                                                <th>Replen Location</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {allPutwallData.length === 0 ? (
                                                <tr>
                                                    <td colSpan={8} className="no-data">No data matching current filters</td>
                                                </tr>
                                            ) : (
                                                allPutwallData.map(item => (
                                                    <tr key={item.id}>
                                                        <td>{item.zone}</td>
                                                        <td>{item.cubby}</td>
                                                        <td>{item.item_number}</td>
                                                        <td>{item.container_id}</td>
                                                        <td>
                                                            <span className={`status-indicator status-${item.status.toLowerCase()}`}></span>
                                                            {item.status}
                                                        </td>
                                                        <td>{item.order_number}</td>
                                                        <td className={`priority-${item.priority <= 2 ? 'high' : item.priority <= 3 ? 'medium' : 'low'}`}>
                                                            {item.priority}
                                                        </td>
                                                        <td>{item.repln_pick_locaion}</td>
                                                    </tr>
                                                ))
                                            )}
                                            </tbody>
                                        </table>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {selectedIssue && (
                <IssueModal
                    replenLocation={selectedIssue}
                    filters={filters}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default PutwallDetails;