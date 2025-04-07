import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { fetchPutwallIssues, fetchPutwallIssueDetails } from '../../api/api';
import { PutwallIssue, PutwallItem } from '../../types';
import '../../styles/Details.css';

interface IssueModalProps {
    replenLocation: string;
    onClose: () => void;
}

const IssueModal: React.FC<IssueModalProps> = ({ replenLocation, onClose }) => {
    const { data, isLoading, error } = useQuery(
        ['putwallIssueDetails', replenLocation],
        () => fetchPutwallIssueDetails(replenLocation)
    );

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

    const handleIssueClick = (replenLocation: string) => {
        setSelectedIssue(replenLocation);
    };

    const handleCloseModal = () => {
        setSelectedIssue(null);
    };

    // Calculate total issue count
    const totalIssueCount = data
        ? data.reduce((total, issue) => total + issue.count, 0)
        : 0;

    return (
        <div className="details-container">
            <h2>Putwall Issues</h2>
            {isLoading && <div className="loading">Loading issues...</div>}
            {/*{error && <div className="error">Error loading issues</div>}*/}
            {data && data.length === 0 && (
                <div className="no-data">No issues found</div>
            )}
            {data && data.length > 0 && (
                <>
                    <div className="issues-summary">
                        <div className="issue-count">
                            <span className="label">Total Issues:</span>
                            <span className="value">{totalIssueCount}</span>
                        </div>
                        <div className="issue-types">
                            <span className="label">Issue Types:</span>
                            <span className="value">{data.length}</span>
                        </div>
                    </div>
                    <div className="issues-list">
                        <h3>Replenishment Location Issues</h3>
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Replenishment Location</th>
                                <th>Count</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {data.map(issue => (
                                <tr
                                    key={issue.repln_pick_locaion}
                                    className={issue.repln_pick_locaion === 'NO REPLENS' ? 'high-priority' : ''}
                                >
                                    <td>{issue.repln_pick_locaion}</td>
                                    <td>{issue.count}</td>
                                    <td>
                                        <button
                                            className="view-btn"
                                            onClick={() => handleIssueClick(issue.repln_pick_locaion)}
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