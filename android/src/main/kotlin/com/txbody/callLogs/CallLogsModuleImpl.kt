package com.txbody.callLogs

import android.annotation.SuppressLint
import android.content.Context
import android.os.Build
import android.os.Environment
import android.provider.CallLog
import android.provider.CallLog.Calls
import android.telecom.TelecomManager
import android.telephony.SubscriptionInfo
import android.telephony.SubscriptionManager
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.google.gson.Gson
import org.json.JSONArray
import org.json.JSONException
import java.io.File
import java.io.FileWriter
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Shared implementation for CallLogs module.
 * This class contains all the business logic, shared between old and new architecture.
 */
class CallLogsModuleImpl(private val reactContext: ReactApplicationContext) {

    private val accountIdToSimName = mutableMapOf<String, String>()

    companion object {
        private const val TAG = "CallLogsModuleImpl"
        private const val WIFI_INCOMING = 100
        private const val WIFI_OUTGOING = 101

        private val CURSOR_PROJECTION = arrayOf(
            Calls.CACHED_FORMATTED_NUMBER,  // 0
            Calls.NUMBER,                    // 1
            Calls.TYPE,                      // 2
            Calls.DATE,                      // 3
            Calls.DURATION,                  // 4
            Calls.CACHED_NAME,               // 5
            Calls.CACHED_NUMBER_TYPE,        // 6
            Calls.CACHED_NUMBER_LABEL,       // 7
            Calls.CACHED_MATCHED_NUMBER,     // 8
            Calls.PHONE_ACCOUNT_ID,          // 9
            Calls._ID                        // 10
        )

        fun toStringArray(array: JSONArray?): Array<String> {
            if (array == null) return emptyArray()
            return Array(array.length()) { i -> array.optString(i) }
        }
    }

    fun loadAll(promise: Promise) {
        load(-1, promise)
    }

    fun load(limit: Int, promise: Promise) {
        loadWithFilter(limit, null, promise)
    }

    fun loadWithFilter(limit: Int, filter: ReadableMap?, promise: Promise) {
        try {
            val subscriptions = getSubscriptions()

            val cursor = reactContext.contentResolver.query(
                CallLog.Calls.CONTENT_URI,
                CURSOR_PROJECTION,
                null,
                null,
                "${CallLog.Calls.DATE} DESC"
            )

            val result = Arguments.createArray()

            if (cursor == null) {
                promise.resolve(result)
                return
            }

            val nullFilter = filter == null
            val minTimestamp = if (!nullFilter && filter!!.hasKey("minTimestamp")) filter.getString("minTimestamp") else "0"
            val maxTimestamp = if (!nullFilter && filter!!.hasKey("maxTimestamp")) filter.getString("maxTimestamp") else "-1"
            val minDuration = if (!nullFilter && filter!!.hasKey("minDuration")) filter.getString("minDuration") else null
            val maxDuration = if (!nullFilter && filter!!.hasKey("maxDuration")) filter.getString("maxDuration") else null
            val nameFilter = if (!nullFilter && filter!!.hasKey("name")) filter.getString("name") else null
            val cachedMatchedNumberFilter = if (!nullFilter && filter!!.hasKey("cachedMatchedNumber")) filter.getString("cachedMatchedNumber") else null
            val phoneAccountIdFilter = if (!nullFilter && filter!!.hasKey("phoneAccountId")) filter.getString("phoneAccountId") else null

            val types = if (!nullFilter && filter!!.hasKey("types")) filter.getString("types") else "[]"
            val typesArray = JSONArray(types)
            val typeSet = toStringArray(typesArray).toSet()

            val phoneNumbers = if (!nullFilter && filter!!.hasKey("phoneNumbers")) filter.getString("phoneNumbers") else "[]"
            val phoneNumbersArray = JSONArray(phoneNumbers)
            val phoneNumberSet = toStringArray(phoneNumbersArray).toSet()

            var callLogCount = 0
            val minTimestampDefined = minTimestamp != null && minTimestamp != "0"
            var minTimestampReached = false

            while (cursor.moveToNext() && shouldContinue(limit, callLogCount) && !minTimestampReached) {
                val formattedNumber = cursor.getString(0)
                val phoneNumber = cursor.getString(1)
                val rawType = cursor.getInt(2)
                val timestamp = cursor.getLong(3)
                val duration = cursor.getInt(4)
                val name = cursor.getString(5)
                val cachedNumberType = cursor.getInt(6)
                val cachedNumberLabel = cursor.getString(7)
                val cachedMatchedNumber = cursor.getString(8)
                val phoneAccountId = cursor.getString(9)
                val id = cursor.getString(10)

                val timestampStr = timestamp.toString()
                minTimestampReached = minTimestampDefined && timestamp <= (minTimestamp?.toLongOrNull() ?: 0L)

                val df = SimpleDateFormat.getDateTimeInstance(SimpleDateFormat.MEDIUM, SimpleDateFormat.MEDIUM)
                val dateTime = df.format(Date(timestamp))

                val type = resolveCallType(rawType)

                // Apply filters
                val passesPhoneFilter = phoneNumberSet.isEmpty() ||
                        phoneNumberSet.contains(phoneNumber) ||
                        (cachedMatchedNumber != null && phoneNumberSet.contains(cachedMatchedNumber))
                val passesTypeFilter = typeSet.isEmpty() || typeSet.contains(type)
                val passesMinTimestampFilter = minTimestamp == null || minTimestamp == "0" ||
                        timestamp >= (minTimestamp.toLongOrNull() ?: 0L)
                val passesMaxTimestampFilter = maxTimestamp == null || maxTimestamp == "-1" ||
                        timestamp <= (maxTimestamp.toLongOrNull() ?: Long.MAX_VALUE)
                val passesMinDurationFilter = minDuration == null ||
                        duration >= (minDuration.toIntOrNull() ?: 0)
                val passesMaxDurationFilter = maxDuration == null ||
                        duration <= (maxDuration.toIntOrNull() ?: Int.MAX_VALUE)
                val passesNameFilter = nameFilter.isNullOrEmpty() ||
                        (name != null && name.lowercase().contains(nameFilter.lowercase()))
                val passesCachedMatchedNumberFilter = cachedMatchedNumberFilter.isNullOrEmpty() ||
                        (cachedMatchedNumber != null && cachedMatchedNumber.contains(cachedMatchedNumberFilter))
                val passesPhoneAccountIdFilter = phoneAccountIdFilter.isNullOrEmpty() ||
                        (phoneAccountId != null && phoneAccountId == phoneAccountIdFilter)

                val passesFilter = passesPhoneFilter && passesTypeFilter &&
                        passesMinTimestampFilter && passesMaxTimestampFilter &&
                        passesMinDurationFilter && passesMaxDurationFilter && passesNameFilter &&
                        passesCachedMatchedNumberFilter && passesPhoneAccountIdFilter

                if (passesFilter) {
                    val callLog = Arguments.createMap().apply {
                        putString("id", id)
                        putString("phoneNumber", phoneNumber)
                        putString("formattedNumber", formattedNumber)
                        putInt("duration", duration)
                        putString("name", name)
                        putString("timestamp", timestampStr)
                        putString("dateTime", dateTime)
                        putString("type", type)
                        putInt("rawType", rawType)
                        putInt("cachedNumberType", cachedNumberType)
                        putString("cachedNumberLabel", cachedNumberLabel)
                        putString("cachedMatchedNumber", cachedMatchedNumber)
                        putString("phoneAccountId", phoneAccountId)
                        putString("simDisplayName", getSimDisplayName(phoneAccountId, subscriptions))
                    }
                    result.pushMap(callLog)
                    callLogCount++
                }
            }

            cursor.close()
            promise.resolve(result)
        } catch (e: JSONException) {
            promise.reject("JSON_ERROR", e.message, e)
        } catch (e: Exception) {
            promise.reject("QUERY_ERROR", e.message, e)
        }
    }

    fun deleteCallLog(id: String?, promise: Promise) {
        try {
            if (id.isNullOrEmpty()) {
                promise.reject("INVALID_ID", "Call log ID is required")
                return
            }
            val rowsDeleted = reactContext.contentResolver.delete(
                CallLog.Calls.CONTENT_URI,
                "${CallLog.Calls._ID} = ?",
                arrayOf(id)
            )
            promise.resolve(rowsDeleted)
        } catch (e: Exception) {
            promise.reject("DELETE_ERROR", e.message, e)
        }
    }

    fun deleteAllCallLogs(promise: Promise) {
        try {
            val rowsDeleted = reactContext.contentResolver.delete(
                CallLog.Calls.CONTENT_URI,
                null,
                null
            )
            promise.resolve(rowsDeleted)
        } catch (e: Exception) {
            promise.reject("DELETE_ERROR", e.message, e)
        }
    }

    fun exportCallLogs(filename: String?, promise: Promise) {
        try {
            val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            val actualFilename = if (!filename.isNullOrEmpty()) {
                filename
            } else {
                "call_log_${SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())}.json"
            }
            val file = File(downloadsDir, actualFilename)

            val subscriptions = getSubscriptions()
            val entries = mutableListOf<Map<String, Any?>>()

            val cursor = reactContext.contentResolver.query(
                CallLog.Calls.CONTENT_URI,
                CURSOR_PROJECTION,
                null,
                null,
                "${CallLog.Calls.DATE} DESC"
            )

            cursor?.use {
                while (it.moveToNext()) {
                    val map = mapOf(
                        "formattedNumber" to it.getString(0),
                        "phoneNumber" to it.getString(1),
                        "rawType" to it.getInt(2),
                        "type" to resolveCallType(it.getInt(2)),
                        "timestamp" to it.getLong(3),
                        "duration" to it.getInt(4),
                        "name" to it.getString(5),
                        "cachedNumberType" to it.getInt(6),
                        "cachedNumberLabel" to it.getString(7),
                        "cachedMatchedNumber" to it.getString(8),
                        "phoneAccountId" to it.getString(9),
                        "simDisplayName" to getSimDisplayName(it.getString(9), subscriptions),
                        "id" to it.getString(10)
                    )
                    entries.add(map)
                }
            }

            FileWriter(file).use { writer ->
                val gson = Gson()
                writer.write(gson.toJson(entries))
            }

            val result = Arguments.createMap().apply {
                putInt("count", entries.size)
                putString("path", file.absolutePath)
            }
            promise.resolve(result)
        } catch (e: IOException) {
            promise.reject("EXPORT_ERROR", e.message, e)
        } catch (e: Exception) {
            promise.reject("EXPORT_ERROR", e.message, e)
        }
    }

    @SuppressLint("MissingPermission")
    private fun getSubscriptions(): List<SubscriptionInfo>? {
        return try {
            val subscriptionManager = ContextCompat.getSystemService(reactContext, SubscriptionManager::class.java)
            subscriptionManager?.activeSubscriptionInfoList
        } catch (e: Exception) {
            null
        }
    }

    @SuppressLint("MissingPermission")
    private fun getSimDisplayName(phoneAccountId: String?, subscriptions: List<SubscriptionInfo>?): String? {
        if (phoneAccountId == null || subscriptions == null) return null

        // Only works on Android 15+ (API 35+)
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) return null

        return try {
            accountIdToSimName[phoneAccountId]?.let { return it }

            val telecomManager = reactContext.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager
                ?: return null

            val accounts = telecomManager.callCapablePhoneAccounts
            for (i in accounts.indices) {
                if (i >= subscriptions.size) break
                val account = accounts[i]
                val phoneAccount = telecomManager.getPhoneAccount(account)
                if (phoneAccount != null) {
                    val accountId = phoneAccount.accountHandle.id
                    if (phoneAccountId == accountId) {
                        val simInfo = subscriptions[i]
                        val simDisplayName = simInfo.displayName.toString()
                        accountIdToSimName[phoneAccountId] = simDisplayName
                        return simDisplayName
                    }
                }
            }
            phoneAccountId
        } catch (e: Exception) {
            phoneAccountId
        }
    }

    private fun resolveCallType(callTypeCode: Int): String {
        return when (callTypeCode) {
            WIFI_OUTGOING -> "WIFI_OUTGOING"
            WIFI_INCOMING -> "WIFI_INCOMING"
            Calls.OUTGOING_TYPE -> "OUTGOING"
            Calls.INCOMING_TYPE -> "INCOMING"
            Calls.MISSED_TYPE -> "MISSED"
            Calls.VOICEMAIL_TYPE -> "VOICEMAIL"
            Calls.REJECTED_TYPE -> "REJECTED"
            Calls.BLOCKED_TYPE -> "BLOCKED"
            Calls.ANSWERED_EXTERNALLY_TYPE -> "ANSWERED_EXTERNALLY"
            else -> "UNKNOWN"
        }
    }

    private fun shouldContinue(limit: Int, count: Int): Boolean {
        return limit < 0 || count < limit
    }
}
