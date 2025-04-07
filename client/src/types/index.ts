// Common types
export type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR' | 'CANCELLED' | 'UNKNOWN';
export type Priority = 1 | 2 | 3 | 4 | 5;
export type Zone = 'A' | 'B' | 'C' | 'D' | string;
export type WorkType = 'NORMAL' | 'EXPEDITED' | 'REPLEN' | 'MOVE' | 'PICK' | string;

// Dashboard types
export interface DetailSection {
    name: 'putwall' | 'replenishment' | 'unitsort' | null;
    title: string;
}

// Putwall types
export interface PutwallSummaryItem {
    zone: Zone;
    status: Status;
    count: number;
}

export interface PutwallIssue {
    repln_pick_locaion: string;
    count: number;
}

export interface PutwallItem {
    id: number;
    zone: Zone;
    cubby: string;
    pack_side_color: string;
    location_id: string;
    item_number: string;
    container_id: string;
    hu_id: string;
    sto_location: string;
    status: Status;
    order_number: string;
    priority: Priority;
    repln_pick_locaion: string;
    pick_location: string;
    work_type: WorkType;
    pick_id: string;
    type: string;
    location_group: string;
}

export interface PutwallFilterOptions {
    zone?: Zone;
    status?: Status;
    repln_pick_locaion?: string;
    work_type?: WorkType;
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
    work_type: WorkType;
    description: string;
    pick_ref_number: string;
    priority: Priority;
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
    zone: Zone;
    employee_id: string | null;
    priority_overridden: boolean;
    datetime_stamp: string;
    sub_type: string;
    wave_id: string;
    replen_area: string;
}

export interface ReplenishmentFilterOptions {
    pack_lane?: string;
    work_type?: WorkType;
    work_status?: Status;
    priority?: Priority;
    zone?: Zone;
    date_from?: string;
    date_to?: string;
}

export interface ReplenishmentSortConfig {
    key: keyof ReplenishmentItem | null;
    direction: 'ascending' | 'descending';
}

// UnitSort types
export interface UnitSortSummary {
    container_count: number;
    total_allocated: number;
    total_unallocated: number;
    total_replen: number;
}

export interface UnitSortItem {
    id: number;
    container_id: string;
    packlane: string;
    item_count: number;
    order_date: string;
    RELEASED: number;
    PICKED: number;
    allocated_picks: number;
    unallocated_picks: number;
    replen_item_numbers_count: number;
    pick_items: string;
}

export interface UnitSortFilterOptions {
    packlane?: string;
    min_unallocated_picks?: number;
    min_replen_item_numbers_count?: number;
    order_date_from?: string;
    order_date_to?: string;
}

// API response types
export interface APIErrorResponse {
    error: string;
    message?: string;
    status?: number;
}

export interface APISuccessResponse<T> {
    data: T;
    status: number;
    message?: string;
}

// UI component prop types
export interface TileProps {
    isActive: boolean;
    onClick: () => void;
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export interface TableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    sortable?: boolean;
    filterable?: boolean;
    onRowClick?: (item: T) => void;
    loading?: boolean;
    emptyMessage?: string;
}

export interface TableColumn<T> {
    key: keyof T | string;
    header: string;
    renderCell?: (item: T) => React.ReactNode;
    sortable?: boolean;
    width?: string;
}

// App state types
export interface DashboardState {
    autoRefresh: boolean;
    refreshInterval: number;
    lastRefreshed: Date | null;
    activeDetailSection: DetailSection | null;
}

export interface FilterState {
    putwall: PutwallFilterOptions;
    replenishment: ReplenishmentFilterOptions;
    unitsort: UnitSortFilterOptions;
}