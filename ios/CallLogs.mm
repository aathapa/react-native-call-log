#import "CallLogs.h"
#import <RNCallLogsSpec/RNCallLogsSpec.h>

@implementation CallLogs

RCT_EXPORT_MODULE()

+ (BOOL)requiresMainQueueSetup
{
    return NO;
}

// iOS does not provide public APIs to access call logs due to privacy restrictions.
// All methods return empty results for graceful degradation on iOS.

RCT_EXPORT_METHOD(loadAll:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    // iOS does not provide access to call logs - return empty array
    resolve(@[]);
}

RCT_EXPORT_METHOD(load:(double)limit
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    // iOS does not provide access to call logs - return empty array
    resolve(@[]);
}

RCT_EXPORT_METHOD(loadWithFilter:(double)limit
                  filter:(NSDictionary *)filter
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    // iOS does not provide access to call logs - return empty array
    resolve(@[]);
}

RCT_EXPORT_METHOD(deleteCallLog:(NSString *)callLogId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    // iOS does not support call log deletion
    reject(@"UNSUPPORTED", @"Call log deletion is not supported on iOS", nil);
}

RCT_EXPORT_METHOD(deleteAllCallLogs:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    // iOS does not support call log deletion
    reject(@"UNSUPPORTED", @"Call log deletion is not supported on iOS", nil);
}

RCT_EXPORT_METHOD(exportCallLogs:(NSString *)filename
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    // iOS does not support call log export
    reject(@"UNSUPPORTED", @"Call log export is not supported on iOS", nil);
}

// MARK: - New Architecture Support

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeCallLogsSpecJSI>(params);
}

@end
