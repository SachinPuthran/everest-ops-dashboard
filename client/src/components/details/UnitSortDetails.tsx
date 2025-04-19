import React, {useState} from 'react';
import {useQuery} from 'react-query';
import {fetchUnitSortData, fetchUnitSortIssues} from '../../api/api';
import {CubbyStatus, UnitSortItem} from '../../types';
import '../../styles/Details.css';

interface ContainerModalProps {
    container: UnitSortItem;
    onClose: () => void;
}

interface FilterProps {
    filters: {
        containerId: string;
    };
    onChange: (name: string, value: string) => void;
    onClear: () => void;
    onExportToExcel: () => void;
}

const FilterBar: React.FC<FilterProps> = ({filters, onChange, onClear, onExportToExcel}) => (
    <div className="filters-container">
        <div className="filter-group">
            <input className="container-id-filter-box" type="text" id="containerId" name="containerId"
                   value={filters.containerId} onChange={(e) => onChange('containerId', e.target.value)}
                   placeholder="Container ID"/>
        </div>
        <button className="clear-filters-btn" onClick={onClear}>
            Clear Filters
        </button>
        <button className="export-excel-btn" onClick={onExportToExcel}>
            Export To Excel
        </button>
    </div>
);

const ContainerModal: React.FC<ContainerModalProps> = ({container, onClose}) => {
    // const pickItems = React.useMemo(() => {
    //     try {
    //         return typeof container.pick_items === 'string'
    //             ? JSON.parse(container.pick_items)
    //             : container.pick_items;
    //     } catch (error) {
    //         console.error('Error parsing pick items:', error);
    //         return [];
    //     }
    // }, [container.pick_items]);

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Container Details: {container.container_id}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <h4>Container Information</h4>
                    {/*<div className="container-details">*/}
                    {/*    <div className="detail-row">*/}
                    {/*        <span className="label">Pack Lane:</span>*/}
                    {/*        <span className="value">{container.packlane}</span>*/}
                    {/*    </div>*/}
                    {/*    <div className="detail-row">*/}
                    {/*        <span className="label">Item Count:</span>*/}
                    {/*        <span className="value">{container.item_count}</span>*/}
                    {/*    </div>*/}
                    {/*    <div className="detail-row">*/}
                    {/*        <span className="label">Order Date:</span>*/}
                    {/*        <span className="value">{container.order_date}</span>*/}
                    {/*    </div>*/}
                    {/*    <div className="detail-row">*/}
                    {/*        <span className="label">Released:</span>*/}
                    {/*        <span className="value">{container.RELEASED}</span>*/}
                    {/*    </div>*/}
                    {/*    <div className="detail-row">*/}
                    {/*        <span className="label">Picked:</span>*/}
                    {/*        <span className="value">{container.PICKED}</span>*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    <h4>Issue Details</h4>
                    {/*<div className="issue-details">*/}
                    {/*    <div className="detail-row critical">*/}
                    {/*        <span className="label">Unallocated Picks:</span>*/}
                    {/*        <span className="value">{container.unallocated_picks}</span>*/}
                    {/*    </div>*/}
                    {/*    <div className="detail-row critical">*/}
                    {/*        <span className="label">Replen Items Count:</span>*/}
                    {/*        <span className="value">{container.replen_item_numbers_count}</span>*/}
                    {/*    </div>*/}
                    {/*    <div className="detail-row">*/}
                    {/*        <span className="label">Allocated Picks:</span>*/}
                    {/*        <span className="value">{container.allocated_picks}</span>*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    <h4>Pick Items</h4>
                    {/*<div className="pick-items">*/}
                    {/*    {Array.isArray(pickItems) && pickItems.length > 0 ? (*/}
                    {/*        <ul>*/}
                    {/*            {pickItems.map((item, index) => (*/}
                    {/*                <li key={index}>{item}</li>*/}
                    {/*            ))}*/}
                    {/*        </ul>*/}
                    {/*    ) : (*/}
                    {/*        <p>No pick items data available</p>*/}
                    {/*    )}*/}
                    {/*</div>*/}
                </div>
                <div className="modal-footer">
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

const UnitSortDetails: React.FC = () => {
    const [filters, setFilters] = useState({
        containerId: ''
    });

    const {data, isLoading, error} = useQuery<UnitSortItem[]>(
        ['unitSortData', filters],
        () => fetchUnitSortData(filters),
        {
            refetchOnWindowFocus: false,
            keepPreviousData: true
        }
    );

    const [selectedContainer, setSelectedContainer] = useState<UnitSortItem | null>(null);

    const handleContainerClick = (container: UnitSortItem) => {
        setSelectedContainer(container);
    };

    const handleCloseModal = () => {
        setSelectedContainer(null);
    };

    const handleFilterChange = (name: string, value: string) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            containerId: ''
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
        link.setAttribute('download', 'UnitSortData.xls');
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
                filters={filters}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
                onExportToExcel={handleExportToExcel}
            />
            <table className="data-table">
                <thead>
                <tr>
                    <th>Container ID</th>
                    <th>Item Count</th>
                    <th>Released Count</th>
                    <th>Allocated Units</th>
                    <th>Unallocated Units</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {data && data.length > 0 ? (
                    data.map(item => (
                        <tr key={item.container_id}>
                            <td>{item.container_id}</td>
                            <td>{item.ItemCount}</td>
                            <td>{item.ReleasedUnits}</td>
                            <td>{item.AllocatedUnits}</td>
                            <td>{item.UnallocatedUnits}</td>
                            <td>
                                <button className="view-details-btn" onClick={() => handleContainerClick(item)}>View
                                    Details
                                </button>
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