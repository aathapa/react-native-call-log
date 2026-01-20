import { NativeModules, Platform } from "react-native";
import type { Spec } from "./NativeCallLogs";

// Extend global type for TurboModule proxy
declare global {
	var __turboModuleProxy: unknown | undefined;
}

// Interface for the native module (compatible with both old and new architecture)
type NativeCallLogsModuleType = Spec;

// Try to use TurboModule if available, fallback to legacy NativeModules
const isTurboModuleEnabled = global.__turboModuleProxy != null;

let NativeCallLogsModule: NativeCallLogsModuleType;

if (isTurboModuleEnabled) {
	// New Architecture - TurboModules
	NativeCallLogsModule = require("./NativeCallLogs").default;
} else {
	// Old Architecture - Legacy NativeModules
	NativeCallLogsModule = NativeModules.CallLogs;
}

if (!NativeCallLogsModule) {
	throw new Error(
		"The package 'react-native-call-log' doesn't seem to be linked. Make sure: \n\n" +
			Platform.select({
				ios: "- You have run 'pod install'\n",
				default: "",
			}) +
			"- You rebuilt the app after installing the package\n" +
			"- You are not using Expo Go\n",
	);
}

/**
 * Call type enum representing the type of call
 */
export enum CallType {
	OUTGOING = "OUTGOING",
	INCOMING = "INCOMING",
	MISSED = "MISSED",
	VOICEMAIL = "VOICEMAIL",
	REJECTED = "REJECTED",
	BLOCKED = "BLOCKED",
	ANSWERED_EXTERNALLY = "ANSWERED_EXTERNALLY",
	WIFI_INCOMING = "WIFI_INCOMING",
	WIFI_OUTGOING = "WIFI_OUTGOING",
	UNKNOWN = "UNKNOWN",
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
 * Internal filter format sent to native module
 */
interface NativeFilter {
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
 * Native CallLogs module interface
 */
interface NativeCallLogsModule {
	load(limit: number): Promise<CallLog[]>;
	loadAll(): Promise<CallLog[]>;
	loadWithFilter(limit: number, filter: NativeFilter): Promise<CallLog[]>;
	deleteCallLog(id: string): Promise<number>;
	deleteAllCallLogs(): Promise<number>;
	exportCallLogs(filename: string): Promise<ExportResult>;
}

/**
 * CallLogs - React Native module to access and query call history log
 */
class CallLogs {
	/**
	 * Load call logs with optional limit and filter
	 * @param limit - Maximum number of call logs to return. Use -1 for no limit.
	 * @param filter - Optional filter object
	 * @returns Promise resolving to array of call logs
	 */
	static async load(limit: number, filter?: CallFilter): Promise<CallLog[]> {
		if (!filter) {
			return NativeCallLogsModule.load(limit);
		}

		const {
			minTimestamp,
			maxTimestamp,
			types,
			phoneNumbers,
			minDuration,
			maxDuration,
			name,
			cachedMatchedNumber,
			phoneAccountId,
		} = filter;

		const phoneNumbersArray: string[] = Array.isArray(phoneNumbers)
			? phoneNumbers
			: typeof phoneNumbers === "string"
				? [phoneNumbers]
				: [];

		const typesArray: string[] = Array.isArray(types)
			? types.map((x) => x.toString())
			: typeof types === "string" || typeof types === "object"
				? [types.toString()]
				: [];

		const nativeFilter: NativeFilter = {
			minTimestamp: minTimestamp ? minTimestamp.toString() : undefined,
			maxTimestamp: maxTimestamp ? maxTimestamp.toString() : undefined,
			minDuration:
				minDuration !== undefined ? minDuration.toString() : undefined,
			maxDuration:
				maxDuration !== undefined ? maxDuration.toString() : undefined,
			name: name || undefined,
			cachedMatchedNumber: cachedMatchedNumber || undefined,
			phoneAccountId: phoneAccountId || undefined,
			types: JSON.stringify(typesArray),
			phoneNumbers: JSON.stringify(phoneNumbersArray),
		};

		return NativeCallLogsModule.loadWithFilter(limit, nativeFilter);
	}

	/**
	 * Load all call logs
	 * @returns Promise resolving to array of all call logs
	 */
	static async loadAll(): Promise<CallLog[]> {
		return NativeCallLogsModule.loadAll();
	}

	/**
	 * Get all call logs (alias for loadAll)
	 * @returns Promise resolving to array of all call logs
	 */
	static async get(): Promise<CallLog[]> {
		return NativeCallLogsModule.loadAll();
	}

	/**
	 * Query call logs with filter options
	 * @param options - Query options
	 * @returns Promise resolving to array of call logs
	 */
	static async query(options: QueryOptions = {}): Promise<CallLog[]> {
		const {
			dateFrom,
			dateTo,
			dateTimeFrom,
			dateTimeTo,
			durationFrom,
			durationTo,
			name,
			number,
			type,
			cachedMatchedNumber,
			phoneAccountId,
		} = options;

		const minTimestamp =
			dateFrom || (dateTimeFrom ? dateTimeFrom.getTime() : undefined);
		const maxTimestamp =
			dateTo || (dateTimeTo ? dateTimeTo.getTime() : undefined);

		return this.load(-1, {
			minTimestamp,
			maxTimestamp,
			minDuration: durationFrom,
			maxDuration: durationTo,
			name,
			phoneNumbers: number,
			types: type,
			cachedMatchedNumber,
			phoneAccountId,
		});
	}

	/**
	 * Delete a specific call log entry by ID
	 * @param id - The call log entry ID
	 * @returns Promise resolving to number of entries deleted (1 if successful)
	 */
	static async deleteCallLog(id: string): Promise<number> {
		if (!id) {
			throw new Error("Call log ID is required");
		}
		return NativeCallLogsModule.deleteCallLog(id);
	}

	/**
	 * Delete all call logs
	 * @returns Promise resolving to number of entries deleted
	 */
	static async deleteAllCallLogs(): Promise<number> {
		return NativeCallLogsModule.deleteAllCallLogs();
	}

	/**
	 * Export all call logs to a JSON file in the Downloads directory
	 * @param filename - Optional filename. Defaults to call_log_YYYYMMDD_HHMMSS.json
	 * @returns Promise resolving to object with count and file path
	 */
	static async exportCallLogs(filename?: string): Promise<ExportResult> {
		return NativeCallLogsModule.exportCallLogs(filename || "");
	}

	// Static enum for CommonJS compatibility
	static CallType = CallType;
}

// Attach all exports to the CallLogs class for CommonJS compatibility
// This ensures that `const CallLogs = require('react-native-call-log')`
// has access to CallLogs.CallType
Object.assign(CallLogs, { CallType });

export default CallLogs;
module.exports = CallLogs;
