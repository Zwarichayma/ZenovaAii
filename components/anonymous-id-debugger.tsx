"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from "react-native"
import { authService } from "../api/auth/auth-service"
import { storageDebug } from "../utils/storage-debug"

export const AnonymousIdDebugger = () => {
  const [anonymousId, setAnonymousId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [storageTest, setStorageTest] = useState<any>(null)
  const [storageKeys, setStorageKeys] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const id = await authService.getAnonymousId()
      setAnonymousId(id)

      // Get storage keys
      const keys = await storageDebug.listAllKeys()
      setStorageKeys(keys)
    } catch (error) {
      console.error("Error loading debug data:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshAnonymousId = async () => {
    setRefreshing(true)
    try {
      const newId = await authService.resetAnonymousId()
      setAnonymousId(newId)
    } catch (error) {
      console.error("Error refreshing anonymous ID:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const testStorage = async () => {
    setLoading(true)
    try {
      const result = await storageDebug.testStorage()
      setStorageTest(result)
    } catch (error) {
      console.error("Error testing storage:", error)
      setStorageTest({ success: false, error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Anonymous ID Debugger</Text>

        {loading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <>
            <View style={styles.idContainer}>
              <Text style={styles.label}>Current Anonymous ID:</Text>
              <Text style={styles.id}>{anonymousId || "None"}</Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={refreshAnonymousId} disabled={refreshing}>
              {refreshing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Refresh Anonymous ID</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={testStorage}>
              <Text style={styles.buttonText}>Test Storage</Text>
            </TouchableOpacity>

            {storageTest && (
              <View style={styles.resultContainer}>
                <Text style={styles.label}>Storage Test Result:</Text>
                <Text style={storageTest.success ? styles.success : styles.error}>
                  {storageTest.success ? "SUCCESS" : "FAILED"}
                </Text>
                {storageTest.error && <Text style={styles.error}>{storageTest.error.toString()}</Text>}
                {storageTest.details && (
                  <Text style={styles.details}>{JSON.stringify(storageTest.details, null, 2)}</Text>
                )}
              </View>
            )}

            <View style={styles.keysContainer}>
              <Text style={styles.label}>Storage Keys:</Text>
              {storageKeys.length > 0 ? (
                storageKeys.map((key, index) => (
                  <Text key={index} style={styles.key}>
                    {key}
                  </Text>
                ))
              ) : (
                <Text style={styles.noKeys}>No keys found</Text>
              )}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  idContainer: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  id: {
    fontSize: 12,
    fontFamily: "monospace",
    color: "#333",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  resultContainer: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 6,
    marginTop: 16,
  },
  success: {
    color: "green",
    fontWeight: "bold",
  },
  error: {
    color: "red",
    fontWeight: "bold",
  },
  details: {
    fontSize: 12,
    fontFamily: "monospace",
    marginTop: 8,
  },
  keysContainer: {
    marginTop: 16,
  },
  key: {
    fontSize: 12,
    fontFamily: "monospace",
    padding: 4,
    backgroundColor: "#eee",
    marginBottom: 4,
    borderRadius: 4,
  },
  noKeys: {
    fontStyle: "italic",
    color: "#999",
  },
})
