package com.txbody.callLogs

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap

/**
 * New Architecture (TurboModule) implementation of CallLogsModule.
 * This class extends the generated NativeCallLogsSpec from Codegen.
 */
class CallLogsModule(reactContext: ReactApplicationContext) : NativeCallLogsSpec(reactContext) {

    private val implementation = CallLogsModuleImpl(reactContext)

    override fun getName(): String = NAME

    override fun loadAll(promise: Promise) {
        implementation.loadAll(promise)
    }

    override fun load(limit: Double, promise: Promise) {
        implementation.load(limit.toInt(), promise)
    }

    override fun loadWithFilter(limit: Double, filter: ReadableMap?, promise: Promise) {
        implementation.loadWithFilter(limit.toInt(), filter, promise)
    }

    override fun deleteCallLog(id: String, promise: Promise) {
        implementation.deleteCallLog(id, promise)
    }

    override fun deleteAllCallLogs(promise: Promise) {
        implementation.deleteAllCallLogs(promise)
    }

    override fun exportCallLogs(filename: String, promise: Promise) {
        implementation.exportCallLogs(filename, promise)
    }

    companion object {
        const val NAME = "CallLogs"
    }
}
