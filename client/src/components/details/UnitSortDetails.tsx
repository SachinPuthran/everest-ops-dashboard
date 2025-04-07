import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { fetchUnitSortIssues } from '../../api/api';
import { UnitSortItem } from '../../types';
import '../../styles/Details.css';

interface ContainerModalProps {
    container: UnitSortItem;
    onClose: () => void;
}

const ContainerModal: React.FC<ContainerModalProps> = ({ container, onClose }) => {
    // Parse the pick_items string into an array if it's stored as JSON
    const pickItems = React.useMemo(() => {
        try {
            return typeof container.pick_items === 'string'
                ? JSON.parse(container.pick_items)
                : container.pick_items;
        } catch (error) {
            console.error('Error parsing pick items:', error);
            return [];
        }
    }, [container.pick_items]);

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Container Details: {container.container_id}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <h4>Container Information</h4>
                    <div className="container-details">
                        <div className="detail-row">
                            <span className="label">Pack Lane:</span>
                            <span className="value">{container.packlane}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Item Count:</span>
                            <span className="value">{container.item_count}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Order Date:</span>
                            <span className="value">{container.order_date}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Released:</span>
                            <span className="value">{container.RELEASED}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Picked:</span>
                            <span className="value">{container.PICKED}</span>
                        </div>
                    </div>

                    <h4>Issue Details</h4>
                    <div className="issue-details">
                        <div className="detail-row critical">
                            <span className="label">Unallocated Picks:</span>
                            <span className="value">{container.unallocated_picks}</span>
                        </div>
                        <div className="detail-row critical">
                            <span className="label">Replen Items Count:</span>
                            <span className="value">{container.replen_item_numbers_count}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Allocated Picks:</span>
                            <span className="value">{container.allocated_picks}</span>
                        </div>
                    </div>

                    <h4>Pick Items</h4>
                    <div className="pick-items">
                        {Array.isArray(pickItems) && pickItems.length > 0 ? (
                            <ul>
                                {pickItems.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No pick items data available</p>
                        )}
                    </div>
                </div>
                <div className="modal-footer">
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

const UnitSortDetails: React.FC = () => {
    const { data, isLoading, error } = useQuery<UnitSortItem[]>(
        'unitSortIssues',
        fetchUnitSortIssues
    );

    const [selectedContainer, setSelectedContainer] = useState<UnitSortItem | null>(null);
    const [filters, setFilters] = useState({
        packlane: '',
        minUnallocated: 0,
        minReplen: 0,
    });

    const handleContainerClick = (container: UnitSortItem) => {
        setSelectedContainer(container);
    };

    const handleCloseModal = () => {
        setSelectedContainer(null);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;

        setFilters(prev => ({
            ...prev,
            [name]: name === 'packlane' ? value : parseInt(value, 10) || 0,
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            packlane: '',
            minUnallocated: 0,
            minReplen: 0,
        });
    };

    // Filter data
    const filteredData = React.useMemo(() => {
        if (!data) return [];

        return data.filter(container => {
            return (
                (filters.packlane === '' || container.packlane === filters.packlane) &&
                container.unallocated_picks >= filters.minUnallocated &&
                container.replen_item_numbers_count >= filters.minReplen
            );
        });
    }, [data, filters]);

    // Get unique packlanes for filter dropdown
    const uniquePacklanes = React.useMemo(() => {
        if (!data) return [];
        return [...new Set(data.map(item => item.packlane))].sort();
    }, [data]);

    // Calculate average unallocated and replen values
    const averages = React.useMemo(() => {
        if (!data || data.length === 0) return { unallocated: 0, replen: 0 };

        const totalUnallocated = data.reduce((sum, item) => sum + item.unallocated_picks, 0);
        const totalReplen = data.reduce((sum, item) => sum + item.replen_item_numbers_count, 0);

        return {
            unallocated: Math.round(totalUnallocated / data.length),
            replen: Math.round(totalReplen / data.length),
        };
    }, [data]);

    return (
        <div className="details-container">
            <h2>Unit Sort Issues</h2>
            <p className="description">
                Containers with both unallocated picks and replenishment items:
            </p>

            {isLoading && <div className="loading">Loading issues...</div>}
            {/*{error && <div className="error">Error loading issues</div>}*/}

            {data && (
                <>
                    <div className="filters-container">
                        <div className="filter-group">
                            <label htmlFor="packlane">Pack Lane:</label>
                            <select
                                id="packlane"
                                name="packlane"
                                value={filters.packlane}
                                onChange={handleFilterChange}
                            >
                                <option value="">All</option>
                                {uniquePacklanes.map(lane => (
                                    <option key={lane} value={lane}>
                                        {lane}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label htmlFor="minUnallocated">Min Unallocated Picks:</label>
                            <input
                                type="number"
                                id="minUnallocated"
                                name="minUnallocated"
                                value={filters.minUnallocated}
                                onChange={handleFilterChange}
                                min="0"
                            />
                        </div>
                        <div className="filter-group">
                            <label htmlFor="minReplen">Min Replen Items:</label>
                            <input
                                type="number"
                                id="minReplen"
                                name="minReplen"
                                value={filters.minReplen}
                                onChange={handleFilterChange}
                                min="0"
                            />
                        </div>
                        <button className="clear-filters-btn" onClick={handleClearFilters}>
                            Clear Filters
                        </button>
                    </div>

                    <div className="issues-summary">
                        <div className="issue-count">
                            <span className="label">Total Issue Containers:</span>
                            <span className="value">{filteredData.length}</span>
                        </div>
                        <div className="issue-types">
                            <span className="label">Avg. Unallocated:</span>
                            <span className="value">{averages.unallocated}</span>
                        </div>
                        <div className="issue-types">
                            <span className="label">Avg. Replen Items:</span>
                            <span className="value">{averages.replen}</span>
                        </div>
                    </div>

                    {filteredData.length === 0 ? (
                        <div className="no-data">No containers matching the current filters</div>
                    ) : (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                <tr>
                                    <th>Container ID</th>
                                    <th>Pack Lane</th>
                                    <th>Item Count</th>
                                    <th>Unallocated Picks</th>
                                    <th>Replen Items</th>
                                    <th>Order Date</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredData.map(container => {
                                    const isHighPriority =
                                        container.unallocated_picks > 5 &&
                                        container.replen_item_numbers_count > 5;

                                    return (
                                        <tr
                                            key={container.id}
                                            className={isHighPriority ? 'high-priority' : ''}
                                        >
                                            <td>{container.container_id}</td>
                                            <td>{container.packlane}</td>
                                            <td>{container.item_count}</td>
                                            <td className={container.unallocated_picks > averages.unallocated ? 'text-danger' : ''}>
                                                {container.unallocated_picks}
                                            </td>
                                            <td className={container.replen_item_numbers_count > averages.replen ? 'text-danger' : ''}>
                                                {container.replen_item_numbers_count}
                                            </td>
                                            <td>{container.order_date}</td>
                                            <td>
                                                <button
                                                    className="view-btn"
                                                    onClick={() => handleContainerClick(container)}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {selectedContainer && (
                <ContainerModal
                    container={selectedContainer}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default UnitSortDetails;