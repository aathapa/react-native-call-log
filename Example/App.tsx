/**
 * Call Log Example App
 * Demonstrates react-native-call-log library usage
 */

import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Button,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';

import CallLogs, { CallLog, CallType } from 'react-native-call-log';

function App(): React.JSX.Element {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(false);

  const requestPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') {
      Alert.alert('Error', 'Call logs are only available on Android');
      return false;
    }

    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
        PermissionsAndroid.PERMISSIONS.WRITE_CALL_LOG,
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      ]);

      const allGranted = Object.values(granted).every(
        status => status === PermissionsAndroid.RESULTS.GRANTED,
      );

      return allGranted;
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  };

  const loadCallLogs = async () => {
    const permitted = await requestPermissions();
    if (!permitted) {
      Alert.alert(
        'Permission Denied',
        'Cannot access call logs without permission',
      );
      return;
    }

    setLoading(true);
    try {
      const logs = await CallLogs.load(20);
      setCallLogs(logs);
      console.log('Loaded call logs:', logs.length);
    } catch (error) {
      console.error('Error loading call logs:', error);
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  const loadIncomingLogs = async () => {
    const permitted = await requestPermissions();
    if (!permitted) return;

    setLoading(true);
    try {
      const logs = await CallLogs.load(10, {
        types: [CallType.INCOMING],
      });
      setCallLogs(logs);
      console.log('Loaded incoming logs:', logs.length);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  const loadOutgoingLogs = async () => {
    const permitted = await requestPermissions();
    if (!permitted) return;

    setLoading(true);
    try {
      const logs = await CallLogs.load(10, {
        types: [CallType.OUTGOING],
      });
      setCallLogs(logs);
      console.log('Loaded outgoing logs:', logs.length);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  const loadMissedLogs = async () => {
    const permitted = await requestPermissions();
    if (!permitted) return;

    setLoading(true);
    try {
      const logs = await CallLogs.load(10, {
        types: [CallType.MISSED],
      });
      setCallLogs(logs);
      console.log('Loaded missed logs:', logs.length);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  const getCallTypeColor = (type: string): string => {
    switch (type) {
      case 'INCOMING':
        return '#4CAF50';
      case 'OUTGOING':
        return '#2196F3';
      case 'MISSED':
        return '#F44336';
      case 'REJECTED':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.title}>📞 Call Log Demo</Text>
        <Text style={styles.subtitle}>react-native-call-log v3.0.0</Text>
      </View>

      <View style={styles.buttonRow}>
        <Button title="All (20)" onPress={loadCallLogs} disabled={loading} />
        <View style={styles.buttonSpacer} />
        <Button
          title="Incoming"
          onPress={loadIncomingLogs}
          disabled={loading}
          color="#4CAF50"
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="Outgoing"
          onPress={loadOutgoingLogs}
          disabled={loading}
          color="#2196F3"
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="Missed"
          onPress={loadMissedLogs}
          disabled={loading}
          color="#F44336"
        />
      </View>

      {loading && <Text style={styles.loading}>Loading...</Text>}

      <ScrollView style={styles.scrollView}>
        {callLogs.length === 0 && !loading && (
          <Text style={styles.emptyText}>
            Press a button above to load call logs
          </Text>
        )}
        {callLogs.map((log, index) => (
          <View key={log.id || index} style={styles.logItem}>
            <View style={styles.logHeader}>
              <Text style={styles.phoneNumber}>
                {log.name || log.phoneNumber || 'Unknown'}
              </Text>
              <Text
                style={[styles.callType, { color: getCallTypeColor(log.type) }]}
              >
                {log.type}
              </Text>
            </View>
            <Text style={styles.logDetails}>
              {log.phoneNumber} • {log.duration}s
            </Text>
            <Text style={styles.logDate}>{log.dateTime}</Text>
            {log.simDisplayName && (
              <Text style={styles.simInfo}>SIM: {log.simDisplayName}</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    backgroundColor: '#fff',
    gap: 8,
  },
  buttonSpacer: {
    width: 4,
  },
  loading: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    padding: 40,
    color: '#999',
    fontSize: 16,
  },
  logItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  callType: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  simInfo: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 4,
  },
});

export default App;
