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
    const [activeDetail, setActiveDetail] = useState<DetailSection>(null);

    const handleTileClick = (section: DetailSection) => {
        setActiveDetail(section === activeDetail ? null : section);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-tiles">
                <PutwallTile
                    isActive={activeDetail === 'putwall'}
                    onClick={() => handleTileClick('putwall')}
                />
                <ReplenishmentTile
                    isActive={activeDetail === 'replenishment'}
                    onClick={() => handleTileClick('replenishment')}
                />
                <UnitSortTile
                    isActive={activeDetail === 'unitsort'}
                    onClick={() => handleTileClick('unitsort')}
                />
            </div>

            <div className={`details-section ${activeDetail ? 'active' : ''}`}>
                {activeDetail === 'putwall' && <PutwallDetails />}
                {activeDetail === 'replenishment' && <ReplenishmentDetails />}
                {activeDetail === 'unitsort' && <UnitSortDetails />}
            </div>
        </div>
    );
};

export default Dashboard;