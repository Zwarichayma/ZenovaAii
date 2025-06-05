"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from "react-native"
import { ChevronDown, Check } from "lucide-react-native"

interface CustomPickerProps {
  label: string
  value: string
  placeholder: string
  options: string[]
  onSelect: (value: string) => void
  style?: any
}

export default function CustomPicker({ label, value, placeholder, options, onSelect, style }: CustomPickerProps) {
  const [isVisible, setIsVisible] = useState(false)

  const handleSelect = (option: string) => {
    onSelect(option)
    setIsVisible(false)
  }

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity style={styles.selectButton} onPress={() => setIsVisible(true)} activeOpacity={0.7}>
        <Text style={[styles.selectButtonText, !value && styles.placeholderText]}>{value || placeholder}</Text>
        <ChevronDown size={20} color="#555555" />
      </TouchableOpacity>

      <Modal visible={isVisible} transparent={true} animationType="fade" onRequestClose={() => setIsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setIsVisible(false)}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsContainer}>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.option, value === option && styles.selectedOption]}
                  onPress={() => handleSelect(option)}
                >
                  <Text style={[styles.optionText, value === option && styles.selectedOptionText]}>{option}</Text>
                  {value === option && <Check size={18} color="#FFFFFF" />}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555555",
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    minHeight: 48,
  },
  selectButtonText: {
    fontSize: 16,
    color: "#333333",
  },
  placeholderText: {
    color: "#A0A0A0",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxHeight: "70%",
    elevation: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#777777",
    fontWeight: "600",
  },
  optionsContainer: {
    maxHeight: 300,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  selectedOption: {
    backgroundColor: "#10B981",
  },
  optionText: {
    fontSize: 16,
    color: "#333333",
  },
  selectedOptionText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  cancelButton: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#777777",
    fontWeight: "600",
  },
})
