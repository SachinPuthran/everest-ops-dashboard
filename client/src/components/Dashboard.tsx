import React, { useState } from 'react';
import PutwallTile from './PutwallTile';
import ReplenishmentTile from './ReplenishmentTile';
import UnitSortTile from './UnitSortTile';
import PutwallDetails from './details/PutwallDetails';
import ReplenishmentDetails from './details/ReplenishmentDetails';
import UnitSortDetails from './details/UnitSortDetails';
import '../styles/Dashboard.css';

export type DetailSection = 'putwall' | 'replenishment' | 'unitsort' | null;

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<DetailSection>('putwall');
    const [activeDetail, setActiveDetail] = useState<DetailSection>(null);

    const handleTabClick = (section: DetailSection) => {
        setActiveTab(section);
        setActiveDetail(null); // Close details when switching tabs
    };

    const handleTileClick = (section: DetailSection) => {
        setActiveDetail(section === activeDetail ? null : section);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-tabs">
                <div 
                    className={`tab ${activeTab === 'putwall' ? 'active' : ''}`}
                    onClick={() => handleTabClick('putwall')}
                >
                    Putwall
                </div>
                <div 
                    className={`tab ${activeTab === 'replenishment' ? 'active' : ''}`}
                    onClick={() => handleTabClick('replenishment')}
                >
                    Replenishment
                </div>
                <div 
                    className={`tab ${activeTab === 'unitsort' ? 'active' : ''}`}
                    onClick={() => handleTabClick('unitsort')}
                >
                    Unit Sort
                </div>
            </div>

            <div className="dashboard-content">
                {activeTab === 'putwall' && (
                    <PutwallTile 
                        isActive={activeDetail === 'putwall'}
                        onClick={() => {}}
                    />
                )}
                {activeTab === 'replenishment' && (
                    <ReplenishmentTile 
                        isActive={activeDetail === 'replenishment'} 
                        onClick={() => handleTileClick('replenishment')} 
                    />
                )}
                {activeTab === 'unitsort' && (
                    <UnitSortTile 
                        isActive={activeDetail === 'unitsort'} 
                        onClick={() => handleTileClick('unitsort')} 
                    />
                )}
            </div>

            <div className={`details-section ${activeDetail ? 'active' : ''}`}>
                {/*{activeDetail === 'putwall' && <PutwallDetails />}*/}
                {activeDetail === 'replenishment' && <ReplenishmentDetails />}
                {activeDetail === 'unitsort' && <UnitSortDetails />}
            </div>
        </div>
    );
};

export default Dashboard;
