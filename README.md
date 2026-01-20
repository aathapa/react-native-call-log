# react-native-call-log

A React Native package to access and query call history log on Android.

> **Note:** iOS does not provide API for accessing call history. This package only supports Android.

## Features

- ✅ Load all call logs or with limit
- ✅ Filter by phone number, call type, timestamp, duration, and contact name
- ✅ Get detailed call information (formatted number, SIM info, etc.)
- ✅ Delete specific or all call logs
- ✅ Export call logs to JSON file
- ✅ Multi-SIM support
- ✅ WiFi calling support
- ✅ TypeScript support
- ✅ React Native 0.71+ support
- ✅ New Architecture (TurboModules) support

## Installation

```bash
yarn add react-native-call-log
# or
npm install react-native-call-log
```

### Android Setup

#### React Native 0.60+

Auto-linking will handle the setup automatically.

#### React Native <= 0.59

```bash
react-native link react-native-call-log
```

### New Architecture (TurboModules)

This package supports both the old and new React Native architectures. When building with the New Architecture enabled, it automatically uses TurboModules for improved performance.

To enable New Architecture in your app:

1. In `android/gradle.properties`:

```properties
newArchEnabled=true
```

2. Rebuild your app

The package will automatically detect the architecture and use the appropriate implementation.

### Permissions

Add the following permissions to your `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.READ_CALL_LOG" />
<uses-permission android:name="android.permission.WRITE_CALL_LOG" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
<uses-permission android:name="android.permission.READ_PHONE_NUMBERS" />
```

**Permission Requirements:**

- `READ_CALL_LOG` - Required to read call history
- `WRITE_CALL_LOG` - Required for delete operations
- `READ_PHONE_STATE` - Required for SIM information
- `READ_PHONE_NUMBERS` - Required for multi-SIM display name (Android 8.0+)

## Usage

### Basic Usage

```javascript
import { PermissionsAndroid } from "react-native";
import CallLogs from "react-native-call-log";

// Request permissions
const requestPermissions = async () => {
	try {
		const granted = await PermissionsAndroid.requestMultiple([
			PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
			PermissionsAndroid.PERMISSIONS.WRITE_CALL_LOG,
			PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
		]);

		return Object.values(granted).every(
			(status) => status === PermissionsAndroid.RESULTS.GRANTED,
		);
	} catch (err) {
		console.warn(err);
		return false;
	}
};

// Get all call logs
const getAllCallLogs = async () => {
	const hasPermission = await requestPermissions();
	if (hasPermission) {
		const logs = await CallLogs.loadAll();
		console.log(logs);
	}
};
```

## API Reference

### Methods

| Method                      | Description                                      |
| --------------------------- | ------------------------------------------------ |
| `load(limit)`               | Load up to `limit` call logs                     |
| `load(limit, filter)`       | Load call logs with filter (use -1 for no limit) |
| `loadAll()`                 | Load all call logs                               |
| `get()`                     | Alias for `loadAll()`                            |
| `query(options)`            | Query call logs with options                     |
| `deleteCallLog(id)`         | Delete a specific call log entry                 |
| `deleteAllCallLogs()`       | Delete all call logs                             |
| `exportCallLogs(filename?)` | Export call logs to JSON file                    |

### Filter Options

```javascript
const filter = {
	minTimestamp: 1571835032000, // Minimum timestamp in milliseconds
	maxTimestamp: 1583318721264, // Maximum timestamp in milliseconds
	phoneNumbers: "+11234567890", // String or Array of strings
	types: "MISSED", // String or Array: INCOMING, OUTGOING, MISSED, etc.
	minDuration: 30, // Minimum call duration in seconds
	maxDuration: 300, // Maximum call duration in seconds
	name: "John", // Filter by contact name (partial match)
};

const logs = await CallLogs.load(-1, filter);
```

### Query Method

```javascript
const now = new Date();
const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

const logs = await CallLogs.query({
	dateTimeFrom: sixtyDaysAgo,
	dateTimeTo: now,
	durationFrom: 0,
	durationTo: 60,
	name: "John Doe",
	number: "901700000",
	type: "INCOMING",
});
```

### Call Types

| Type                  | Description                |
| --------------------- | -------------------------- |
| `INCOMING`            | Incoming call              |
| `OUTGOING`            | Outgoing call              |
| `MISSED`              | Missed call                |
| `VOICEMAIL`           | Voicemail                  |
| `REJECTED`            | Rejected call              |
| `BLOCKED`             | Blocked call               |
| `ANSWERED_EXTERNALLY` | Answered on another device |
| `WIFI_INCOMING`       | WiFi incoming call         |
| `WIFI_OUTGOING`       | WiFi outgoing call         |
| `UNKNOWN`             | Unknown type               |

### CallLog Object

Each call log entry contains:

```typescript
interface CallLog {
	id: string; // Unique identifier
	phoneNumber: string; // Phone number
	formattedNumber: string; // Formatted phone number
	duration: number; // Duration in seconds
	name: string | null; // Contact name
	timestamp: string; // Unix timestamp in milliseconds
	dateTime: string; // Formatted date/time
	type: string; // Call type
	rawType: number; // Raw Android call type code
	cachedNumberType: number; // Cached number type
	cachedNumberLabel: string; // Cached number label
	cachedMatchedNumber: string; // Cached matched number
	phoneAccountId: string; // Phone account ID (for multi-SIM)
	simDisplayName: string; // SIM display name (Android 15+)
}
```

### Delete Call Logs

```javascript
// Delete a specific call log
const deletedCount = await CallLogs.deleteCallLog(callLog.id);

// Delete all call logs
const deletedCount = await CallLogs.deleteAllCallLogs();
```

### Export Call Logs

```javascript
// Export with auto-generated filename
const result = await CallLogs.exportCallLogs();
console.log(`Exported ${result.count} entries to ${result.path}`);

// Export with custom filename
const result = await CallLogs.exportCallLogs("my_call_logs.json");
```

## Migration from v2.x

### Breaking Changes

1. **Minimum SDK**: Now requires Android API 23 (Android 6.0) or higher
2. **React Native**: Requires React Native 0.71.0 or higher
3. **New Permissions**: Additional permissions required for full functionality

### New Features in v3.0

- Additional call log fields: `id`, `formattedNumber`, `cachedMatchedNumber`, `phoneAccountId`, `simDisplayName`
- New filter options: `minDuration`, `maxDuration`, `name`
- New methods: `get()`, `query()`, `deleteCallLog()`, `deleteAllCallLogs()`, `exportCallLogs()`
- WiFi calling support: `WIFI_INCOMING`, `WIFI_OUTGOING` types
- Multi-SIM support with SIM display name

## Example

See the [Example](./Example) folder for a complete working example.

```bash
cd Example
npm install
npx react-native run-android
```

## License

MIT License - see [LICENSE](./LICENSE) for details.
