"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallType = void 0;
const react_native_1 = require("react-native");
// Try to use TurboModule if available, fallback to legacy NativeModules
const isTurboModuleEnabled = global.__turboModuleProxy != null;
let NativeCallLogsModule;
if (isTurboModuleEnabled) {
    // New Architecture - TurboModules
    NativeCallLogsModule = require("./NativeCallLogs").default;
}
else {
    // Old Architecture - Legacy NativeModules
    NativeCallLogsModule = react_native_1.NativeModules.CallLogs;
}
if (!NativeCallLogsModule) {
    throw new Error("The package 'react-native-call-log' doesn't seem to be linked. Make sure: \n\n" +
        react_native_1.Platform.select({
            ios: "- You have run 'pod install'\n",
            default: "",
        }) +
        "- You rebuilt the app after installing the package\n" +
        "- You are not using Expo Go\n");
}
/**
 * Call type enum representing the type of call
 */
var CallType;
(function (CallType) {
    CallType["OUTGOING"] = "OUTGOING";
    CallType["INCOMING"] = "INCOMING";
    CallType["MISSED"] = "MISSED";
    CallType["VOICEMAIL"] = "VOICEMAIL";
    CallType["REJECTED"] = "REJECTED";
    CallType["BLOCKED"] = "BLOCKED";
    CallType["ANSWERED_EXTERNALLY"] = "ANSWERED_EXTERNALLY";
    CallType["WIFI_INCOMING"] = "WIFI_INCOMING";
    CallType["WIFI_OUTGOING"] = "WIFI_OUTGOING";
    CallType["UNKNOWN"] = "UNKNOWN";
})(CallType || (exports.CallType = CallType = {}));
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
    static async load(limit, filter) {
        if (!filter) {
            return NativeCallLogsModule.load(limit);
        }
        const { minTimestamp, maxTimestamp, types, phoneNumbers, minDuration, maxDuration, name, cachedMatchedNumber, phoneAccountId, } = filter;
        const phoneNumbersArray = Array.isArray(phoneNumbers)
            ? phoneNumbers
            : typeof phoneNumbers === "string"
                ? [phoneNumbers]
                : [];
        const typesArray = Array.isArray(types)
            ? types.map((x) => x.toString())
            : typeof types === "string" || typeof types === "object"
                ? [types.toString()]
                : [];
        const nativeFilter = {
            minTimestamp: minTimestamp ? minTimestamp.toString() : undefined,
            maxTimestamp: maxTimestamp ? maxTimestamp.toString() : undefined,
            minDuration: minDuration !== undefined ? minDuration.toString() : undefined,
            maxDuration: maxDuration !== undefined ? maxDuration.toString() : undefined,
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
    static async loadAll() {
        return NativeCallLogsModule.loadAll();
    }
    /**
     * Get all call logs (alias for loadAll)
     * @returns Promise resolving to array of all call logs
     */
    static async get() {
        return NativeCallLogsModule.loadAll();
    }
    /**
     * Query call logs with filter options
     * @param options - Query options
     * @returns Promise resolving to array of call logs
     */
    static async query(options = {}) {
        const { dateFrom, dateTo, dateTimeFrom, dateTimeTo, durationFrom, durationTo, name, number, type, cachedMatchedNumber, phoneAccountId, } = options;
        const minTimestamp = dateFrom || (dateTimeFrom ? dateTimeFrom.getTime() : undefined);
        const maxTimestamp = dateTo || (dateTimeTo ? dateTimeTo.getTime() : undefined);
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
    static async deleteCallLog(id) {
        if (!id) {
            throw new Error("Call log ID is required");
        }
        return NativeCallLogsModule.deleteCallLog(id);
    }
    /**
     * Delete all call logs
     * @returns Promise resolving to number of entries deleted
     */
    static async deleteAllCallLogs() {
        return NativeCallLogsModule.deleteAllCallLogs();
    }
    /**
     * Export all call logs to a JSON file in the Downloads directory
     * @param filename - Optional filename. Defaults to call_log_YYYYMMDD_HHMMSS.json
     * @returns Promise resolving to object with count and file path
     */
    static async exportCallLogs(filename) {
        return NativeCallLogsModule.exportCallLogs(filename || "");
    }
}
// Static enum for CommonJS compatibility
CallLogs.CallType = CallType;
// Attach all exports to the CallLogs class for CommonJS compatibility
// This ensures that `const CallLogs = require('react-native-call-log')`
// has access to CallLogs.CallType
Object.assign(CallLogs, { CallType });
exports.default = CallLogs;
module.exports = CallLogs;
//# sourceMappingURL=index.js.map