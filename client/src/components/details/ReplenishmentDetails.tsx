import React, { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { fetchReplenishmentData } from '../../api/api';
import {
    ReplenishmentItem,
    ReplenishmentFilterOptions,
    ReplenishmentSortConfig
} from '../../types';
import '../../styles/Details.css';

const ReplenishmentDetails: React.FC = () => {
    const { data, isLoading, error } = useQuery<ReplenishmentItem[]>(
        'replenishmentData',
        fetchReplenishmentData
    );

    const [filters, setFilters] = useState<ReplenishmentFilterOptions>({
        pack_lane: '',
        work_type: '',
        work_status: 'UNKNOWN',
        priority: undefined,
        zone: '',
    });

    const [sortConfig, setSortConfig] = useState<ReplenishmentSortConfig>({
        key: null,
        direction: 'ascending',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFilters(prev => ({
            ...prev,
            [name]: value === '' ? '' :
                name === 'priority' && value !== '' ? parseInt(value, 10) : value,
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            pack_lane: '',
            work_type: '',
            work_status: 'UNKNOWN',
            priority: undefined,
            zone: '',
        });
    };

    const handleSort = (key: keyof ReplenishmentItem) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Filter and sort data
    const filteredAndSortedData = useMemo(() => {
        if (!data) return [];

        // Filter data
        let filtered = data.filter(item => {
            return (
                (filters.pack_lane === '' || item.pack_lane === filters.pack_lane) &&
                (filters.work_type === '' || item.work_type === filters.work_type) &&
                (filters.work_status === 'UNKNOWN' || item.work_status === filters.work_status) &&
                (filters.priority === undefined || item.priority === filters.priority) &&
                (filters.zone === '' || item.zone === filters.zone)
            );
        });

        // Sort data
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key!];
                const bValue = b[sortConfig.key!];

                // @ts-ignore
                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                // @ts-ignore
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [data, filters, sortConfig]);

    // Get unique values for filter dropdowns
    const uniqueValues = useMemo(() => {
        if (!data) return {
            packLanes: [],
            workTypes: [],
            workStatuses: [],
            priorities: [],
            zones: [],
        };

        return {
            packLanes: [...new Set(data.map(item => item.pack_lane))].sort(),
            workTypes: [...new Set(data.map(item => item.work_type))].sort(),
            workStatuses: [...new Set(data.map(item => item.work_status))].sort(),
            priorities: [...new Set(data.map(item => item.priority))].sort((a, b) => a - b),
            zones: [...new Set(data.map(item => item.zone))].sort(),
        };
    }, [data]);

    // Get the sort indicator for table headers
    const getSortIndicator = (key: keyof ReplenishmentItem) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    };

    return (
        <div className="details-container">
            <h2>Replenishment Data</h2>
            {isLoading && <div className="loading">Loading data...</div>}
            {/*{error && <div className="error">Error loading data</div>}*/}
            {data && (
                <>
                    <div className="filters-container">
                        <div className="filter-group">
                            <label htmlFor="pack_lane">Pack Lane:</label>
                            <select
                                id="pack_lane"
                                name="pack_lane"
                                value={filters.pack_lane}
                                onChange={handleFilterChange}
                            >
                                <option value="">All</option>
                                {uniqueValues.packLanes.map(lane => (
                                    <option key={lane} value={lane}>
                                        {lane}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label htmlFor="work_type">Work Type:</label>
                            <select
                                id="work_type"
                                name="work_type"
                                value={filters.work_type}
                                onChange={handleFilterChange}
                            >
                                <option value="">All</option>
                                {uniqueValues.workTypes.map(type => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label htmlFor="work_status">Work Status:</label>
                            <select
                                id="work_status"
                                name="work_status"
                                value={filters.work_status}
                                onChange={handleFilterChange}
                            >
                                <option value="">All</option>
                                {uniqueValues.workStatuses.map(status => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label htmlFor="priority">Priority:</label>
                            <select
                                id="priority"
                                name="priority"
                                value={filters.priority !== undefined ? filters.priority.toString() : ''}
                                onChange={handleFilterChange}
                            >
                                <option value="">All</option>
                                {uniqueValues.priorities.map(priority => (
                                    <option key={priority} value={priority.toString()}>
                                        {priority}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label htmlFor="zone">Zone:</label>
                            <select
                                id="zone"
                                name="zone"
                                value={filters.zone}
                                onChange={handleFilterChange}
                            >
                                <option value="">All</option>
                                {uniqueValues.zones.map(zone => (
                                    <option key={zone} value={zone}>
                                        {zone}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button className="clear-filters-btn" onClick={handleClearFilters}>
                            Clear Filters
                        </button>
                    </div>
                    <div className="data-summary">
                        <span>Showing {filteredAndSortedData.length} of {data.length} items</span>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th onClick={() => handleSort('pack_lane')}>
                                    Pack Lane{getSortIndicator('pack_lane')}
                                </th>
                                <th onClick={() => handleSort('replen_qty')}>
                                    Replen Qty{getSortIndicator('replen_qty')}
                                </th>
                                <th onClick={() => handleSort('demand_qty')}>
                                    Demand Qty{getSortIndicator('demand_qty')}
                                </th>
                                <th onClick={() => handleSort('work_type')}>
                                    Work Type{getSortIndicator('work_type')}
                                </th>
                                <th onClick={() => handleSort('work_status')}>
                                    Work Status{getSortIndicator('work_status')}
                                </th>
                                <th onClick={() => handleSort('priority')}>
                                    Priority{getSortIndicator('priority')}
                                </th>
                                <th onClick={() => handleSort('date_due')}>
                                    Date Due{getSortIndicator('date_due')}
                                </th>
                                <th onClick={() => handleSort('workers_assigned')}>
                                    Workers{getSortIndicator('workers_assigned')}
                                </th>
                                <th onClick={() => handleSort('zone')}>
                                    Zone{getSortIndicator('zone')}
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredAndSortedData.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="no-data">No data matching the current filters</td>
                                </tr>
                            ) : (
                                filteredAndSortedData.map(item => {
                                    const isPriority = item.priority <= 2;
                                    const workerShortage = item.workers_assigned < item.workers_required;

                                    return (
                                        <tr
                                            key={item.id}
                                            className={isPriority ? 'high-priority' : ''}
                                        >
                                            <td>{item.pack_lane}</td>
                                            <td>{item.replen_qty}</td>
                                            <td>{item.demand_qty}</td>
                                            <td>{item.work_type}</td>
                                            <td>
                                                <span className={`status-indicator status-${item.work_status.toLowerCase()}`}></span>
                                                {item.work_status}
                                            </td>
                                            <td className={`priority-${item.priority <= 2 ? 'high' : item.priority <= 3 ? 'medium' : 'low'}`}>
                                                {item.priority}
                                            </td>
                                            <td>{item.date_due}</td>
                                            <td className={workerShortage ? 'text-danger' : ''}>
                                                {item.workers_assigned} / {item.workers_required}
                                            </td>
                                            <td>{item.zone}</td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default ReplenishmentDetails;