import type { TurboModule } from "react-native";
/**
 * Call log entry returned from native module
 */
export interface CallLogEntry {
    id: string;
    phoneNumber: string;
    formattedNumber: string;
    duration: number;
    name: string | null;
    timestamp: string;
    dateTime: string;
    type: string;
    rawType: number;
    cachedNumberType: number;
    cachedNumberLabel: string | null;
    cachedMatchedNumber: string | null;
    phoneAccountId: string | null;
    simDisplayName: string | null;
}
/**
 * Filter options passed to native module
 */
export interface NativeFilter {
    minTimestamp?: string;
    maxTimestamp?: string;
    minDuration?: string;
    maxDuration?: string;
    name?: string;
    cachedMatchedNumber?: string;
    phoneAccountId?: string;
    types: string;
    phoneNumbers: string;
}
/**
 * Export result from native module
 */
export interface ExportResult {
    count: number;
    path: string;
}
/**
 * TurboModule Spec for CallLogs native module
 */
export interface Spec extends TurboModule {
    load(limit: number): Promise<CallLogEntry[]>;
    loadAll(): Promise<CallLogEntry[]>;
    loadWithFilter(limit: number, filter: NativeFilter): Promise<CallLogEntry[]>;
    deleteCallLog(id: string): Promise<number>;
    deleteAllCallLogs(): Promise<number>;
    exportCallLogs(filename: string): Promise<ExportResult>;
}
declare const _default: Spec;
export default _default;
//# sourceMappingURL=NativeCallLogs.d.ts.map