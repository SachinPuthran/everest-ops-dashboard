// Common types
export type Status = 'PICKED' | 'UNKNOWN' | 'RELEASED';
export type CubbyStatus = 'ALL' | 'PACKREADY' | 'ONCONVEYOR' | 'PARTIALLYPICKED' | 'WAITINGFORREPLENS' | 'NOREPLENS' | 'EMPTYCUBBY';

// Putwall types
export interface PutwallSummaryItem {
    zone: string;
    PackReadyCount: number;
    OnConveyorCount: number;
    PartiallyPickedCount: number;
    WaitingForReplensCount: number;
    NoReplensCount: number;
    EmptyCubbyCount: number;
}

export interface PutwallItem {
    id: number;
    zone: string;
    cubby: string;
    pack_side_color: string;
    location_id: string;
    item_number: string;
    container_id: string;
    hu_id: string;
    sto_location: string;
    status: Status;
    order_number: string;
    priority: string;
    repln_pick_locaion: string;
    pick_location: string;
    work_type: string;
    pick_id: string;
    type: string;
    location_group: string;
}

// Replenishment types
export interface ReplenishmentSummaryItem {
    pack_lane: string;
    count: number;
}

export interface ReplenishmentItem {
    id: number;
    pack_lane: string;
    replen_qty: number;
    demand_qty: number;
    work_q_id: string;
    work_type: string;
    description: string;
    pick_ref_number: string;
    priority: string;
    date_due: string;
    time_due: string;
    item_number: string;
    wh_id: string;
    location_id: string;
    from_location_id: string;
    work_status: Status;
    qty: number;
    workers_required: number;
    workers_assigned: number;
    zone: string;
    employee_id: string | null;
    priority_overridden: boolean;
    datetime_stamp: string;
    sub_type: string;
    wave_id: string;
    replen_area: string;
    TotalReplenUnits: string;
    TotalDemand: string;
}

export interface ReplenishmentFilterOptions {
    pack_lane?: string;
    priority?: string;
    zone?: string;
}

export interface ReplenishmentSortConfig {
    key: keyof ReplenishmentItem | null;
    direction: 'ascending' | 'descending';
}

// UnitSort types
export interface UnitSortSummary {
    PackageCount: number;
    UnitCount: number;
    ReleasedUnits: number;
    AllocatedUnits: number;
    UnallocatedUnits: number;
    ReplenSKUCount: number;
}

export interface UnitSortItem {
    container_id: string;
    ItemCount: number;
    ReleasedUnits: number;
    AllocatedUnits: number;
    UnallocatedUnits: number;
}

export interface ContainerDetail {
    container_id: string;
    order_number: string;
    status: string;
    item_number: string;
    pick_area: string;
}

// UI component prop types
export interface TileProps {
    isActive: boolean;
    onClick: () => void;
}
