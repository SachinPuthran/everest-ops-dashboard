import React, {useState} from 'react';
import {useQuery} from 'react-query';
import {fetchUnitSortData, fetchContainerDetails} from '../../api/api';
import {ContainerDetail, UnitSortItem} from '../../types';
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
    const {data, isLoading, error} = useQuery<ContainerDetail[]>(
        'containerDetails',
        () => fetchContainerDetails({container_id: container.container_id}),
        {
            refetchOnWindowFocus: false,
            keepPreviousData: true
        }
    );

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data</div>;

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>Container Details: {container.container_id}</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Order Number</th>
                            <th>Status</th>
                            <th>Item Number</th>
                            <th>Pick Area</th>
                        </tr>
                        </thead>
                        <tbody>
                        {data && data.length > 0 ? (
                            data.map(item => (
                                <tr key={item.order_number}>
                                    <td>{item.order_number}</td>
                                    <td>{item.status}</td>
                                    <td>{item.item_number}</td>
                                    <td>{item.pick_area}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5}>No data available</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
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