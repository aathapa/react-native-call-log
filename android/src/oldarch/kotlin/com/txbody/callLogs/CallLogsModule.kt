package com.txbody.callLogs

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap

/**
 * Old Architecture (Bridge) implementation of CallLogsModule.
 * This class extends ReactContextBaseJavaModule for backward compatibility.
 */
class CallLogsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val implementation = CallLogsModuleImpl(reactContext)

    override fun getName(): String = NAME

    @ReactMethod
    fun loadAll(promise: Promise) {
        implementation.loadAll(promise)
    }

    @ReactMethod
    fun load(limit: Double, promise: Promise) {
        implementation.load(limit.toInt(), promise)
    }

    @ReactMethod
    fun loadWithFilter(limit: Double, filter: ReadableMap?, promise: Promise) {
        implementation.loadWithFilter(limit.toInt(), filter, promise)
    }

    @ReactMethod
    fun deleteCallLog(id: String, promise: Promise) {
        implementation.deleteCallLog(id, promise)
    }

    @ReactMethod
    fun deleteAllCallLogs(promise: Promise) {
        implementation.deleteAllCallLogs(promise)
    }

    @ReactMethod
    fun exportCallLogs(filename: String, promise: Promise) {
        implementation.exportCallLogs(filename, promise)
    }

    companion object {
        const val NAME = "CallLogs"
    }
}
