import React, {useState} from 'react';
import {useQuery} from 'react-query';
import {fetchPutwallIssueDetails, fetchPutwallIssues} from '../../api/api';
import {PutwallIssue, PutwallItem} from '../../types';
import '../../styles/Details.css';

interface IssueModalProps {
    replenLocation: string;
    onClose: () => void;
}

const IssueModal: React.FC<IssueModalProps> = ({replenLocation, onClose}) => {
    const {data, isLoading, error} = useQuery(
        ['putwallIssueDetails', replenLocation],
        () => fetchPutwallIssueDetails(replenLocation)
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
                            </tr>
                            </thead>
                            <tbody>
                            {data.map((item: PutwallItem) => (
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
                                </tr>
                            ))}
                            </tbody>
                        </table>
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
    const { data, isLoading, error } = useQuery<PutwallIssue[]>(
        'putwallIssues',
        fetchPutwallIssues
    );

    const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

    const handleIssueClick = (replensPriority: number, replensWorkStatus: string) => {
        setSelectedIssue(`${replensPriority}-${replensWorkStatus}`);
    };

    const handleCloseModal = () => {
        setSelectedIssue(null);
    };

    // Calculate total issue count
    const totalIssueCount = data
        ? data.reduce((total, issue) => total + issue.count, 0)
        : 0;

    const replensData = data
        ? data.map(issue => {
            const matches = issue.repln_pick_locaion.match(/PRI:\s*(\d+)-(\w+)\s*Loc:\s*(.+)$/);
            return matches
                ? {
                    priority: parseInt(matches[1], 10),
                    work_status: matches[2],
                    location: matches[3],
                    count: issue.count
                }
                : null;
        }).filter(item => item !== null)
            .reduce((acc: { priority: number; work_status: string; count: number }[], curr) => {
                const existing = acc.find(item =>
                    item.priority === curr.priority &&
                    item.work_status === curr.work_status
                );
                if (existing) {
                    existing.count += curr.count;
                } else {
                    acc.push({...curr});
                }
                return acc;
            }, [] as { priority: number; work_status: string; count: number }[])
            .sort((a, b) => b.priority - a.priority)
        : [];

    return (
        <div className="details-container">
            <h2>Replenishment Location Issues</h2>
            {isLoading && <div className="loading">Loading issues...</div>}
            {data && data.length === 0 && (
                <div className="no-data">No issues found</div>
            )}
            {data && data.length > 0 && (
                <>
                    <div className="issues-list">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Priority</th>
                                <th>Work Status</th>
                                <th>Count</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {replensData.map((replens: { priority: number; work_status: string; count: number }) => (
                                <tr key={replens.priority}>
                                    <td>{replens.priority}</td>
                                    <td>{replens.work_status}</td>
                                    <td>{replens.count}</td>
                                    <td>
                                        <button
                                            className="view-btn"
                                            onClick={() => handleIssueClick(replens.priority, replens.work_status)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
            {selectedIssue && (
                <IssueModal
                    replenLocation={selectedIssue}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default PutwallDetails;