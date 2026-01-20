declare global {
    var __turboModuleProxy: unknown | undefined;
}
/**
 * Call type enum representing the type of call
 */
export declare enum CallType {
    OUTGOING = "OUTGOING",
    INCOMING = "INCOMING",
    MISSED = "MISSED",
    VOICEMAIL = "VOICEMAIL",
    REJECTED = "REJECTED",
    BLOCKED = "BLOCKED",
    ANSWERED_EXTERNALLY = "ANSWERED_EXTERNALLY",
    WIFI_INCOMING = "WIFI_INCOMING",
    WIFI_OUTGOING = "WIFI_OUTGOING",
    UNKNOWN = "UNKNOWN"
}
/**
 * Filter options for querying call logs
 */
export interface CallFilter {
    /** Minimum timestamp in milliseconds since UNIX epoch */
    minTimestamp?: number | string;
    /** Maximum timestamp in milliseconds since UNIX epoch */
    maxTimestamp?: number | string;
    /** Filter by call type(s) */
    types?: CallType | CallType[] | string | string[];
    /** Filter by phone number(s) */
    phoneNumbers?: string | string[];
    /** Minimum call duration in seconds */
    minDuration?: number;
    /** Maximum call duration in seconds */
    maxDuration?: number;
    /** Filter by contact name (partial match, case-insensitive) */
    name?: string;
    /** Filter by cached matched number */
    cachedMatchedNumber?: string;
    /** Filter by phone account ID (for multi-SIM) */
    phoneAccountId?: string;
}
/**
 * Query options for the query method
 */
export interface QueryOptions {
    /** Start timestamp in milliseconds */
    dateFrom?: number;
    /** End timestamp in milliseconds */
    dateTo?: number;
    /** Start date (alternative to dateFrom) */
    dateTimeFrom?: Date;
    /** End date (alternative to dateTo) */
    dateTimeTo?: Date;
    /** Minimum call duration in seconds */
    durationFrom?: number;
    /** Maximum call duration in seconds */
    durationTo?: number;
    /** Contact name filter (partial match) */
    name?: string;
    /** Phone number filter */
    number?: string;
    /** Call type filter */
    type?: CallType | string;
    /** Cached matched number filter */
    cachedMatchedNumber?: string;
    /** Phone account ID filter (for multi-SIM) */
    phoneAccountId?: string;
}
/**
 * Call log entry object
 */
export interface CallLog {
    /** Unique identifier for the call log entry */
    id: string;
    /** Phone number */
    phoneNumber: string;
    /** Formatted phone number based on locale */
    formattedNumber: string;
    /** Call duration in seconds */
    duration: number;
    /** Contact name (if available) */
    name: string | null;
    /** Unix timestamp in milliseconds as string */
    timestamp: string;
    /** Formatted date/time string */
    dateTime: string;
    /** Call type as string (matches CallType enum values) */
    type: string;
    /** Raw Android call type code */
    rawType: number;
    /** Cached number type */
    cachedNumberType: number;
    /** Cached number label */
    cachedNumberLabel: string | null;
    /** Cached matched number */
    cachedMatchedNumber: string | null;
    /** Phone account ID for multi-SIM devices */
    phoneAccountId: string | null;
    /** SIM display name for multi-SIM devices */
    simDisplayName: string | null;
}
/**
 * Export result object
 */
export interface ExportResult {
    /** Number of entries exported */
    count: number;
    /** Absolute path to the exported file */
    path: string;
}
/**
 * CallLogs - React Native module to access and query call history log
 */
declare class CallLogs {
    /**
     * Load call logs with optional limit and filter
     * @param limit - Maximum number of call logs to return. Use -1 for no limit.
     * @param filter - Optional filter object
     * @returns Promise resolving to array of call logs
     */
    static load(limit: number, filter?: CallFilter): Promise<CallLog[]>;
    /**
     * Load all call logs
     * @returns Promise resolving to array of all call logs
     */
    static loadAll(): Promise<CallLog[]>;
    /**
     * Get all call logs (alias for loadAll)
     * @returns Promise resolving to array of all call logs
     */
    static get(): Promise<CallLog[]>;
    /**
     * Query call logs with filter options
     * @param options - Query options
     * @returns Promise resolving to array of call logs
     */
    static query(options?: QueryOptions): Promise<CallLog[]>;
    /**
     * Delete a specific call log entry by ID
     * @param id - The call log entry ID
     * @returns Promise resolving to number of entries deleted (1 if successful)
     */
    static deleteCallLog(id: string): Promise<number>;
    /**
     * Delete all call logs
     * @returns Promise resolving to number of entries deleted
     */
    static deleteAllCallLogs(): Promise<number>;
    /**
     * Export all call logs to a JSON file in the Downloads directory
     * @param filename - Optional filename. Defaults to call_log_YYYYMMDD_HHMMSS.json
     * @returns Promise resolving to object with count and file path
     */
    static exportCallLogs(filename?: string): Promise<ExportResult>;
    static CallType: typeof CallType;
}
export default CallLogs;
//# sourceMappingURL=index.d.ts.map