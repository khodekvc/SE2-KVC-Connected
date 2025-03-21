"use client"

import { useState } from "react"
import { Download, ArrowRight, Plus, Filter } from "lucide-react"
import AddRecord from "./AddRecord"
import ViewRecord from "./ViewRecord"
import FilterModal from "../components/FilterPopup"
import "../css/VisitHistory.css"
import { useUserRole } from "../contexts/UserRoleContext"


const VisitHistory = () => {
  const { hasPermission } = useUserRole()
  const [showAddRecord, setShowAddRecord] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [originalRecords] = useState([
    { id: 1, date: "October 29, 2024", purposeOfVisit: "Treatment Plan" },
    { id: 2, date: "April 5, 2024", purposeOfVisit: "Vaccination" },
    { id: 3, date: "February 16, 2024", purposeOfVisit: "Check-up" },
    { id: 4, date: "December 30, 2023", purposeOfVisit: "Diagnosis" },
    { id: 5, date: "November 18, 2023", purposeOfVisit: "Deworming" },
    { id: 6, date: "October 2, 2023", purposeOfVisit: "Check-up" },
    { id: 7, date: "September 15, 2022", purposeOfVisit: "Check-up" },
    { id: 8, date: "March 15, 2022", purposeOfVisit: "Treatment Plan" },
  ])
  const [visitRecords, setVisitRecords] = useState(originalRecords)

  const handleUpdateRecord = (updatedRecord) => {
    setVisitRecords((prevRecords) =>
      prevRecords.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)),
    )
    setSelectedRecord(updatedRecord)
  }

  const handleAddRecord = (newRecord) => {
    const date = new Date(newRecord.date)
    const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const recordToAdd = {
      id: visitRecords.length + 1,
      date: formattedDate,
      ...newRecord,
    }

    setVisitRecords((prevRecords) => [recordToAdd, ...prevRecords])
    setShowAddRecord(false)
  }

  const handleViewRecord = (record) => {
    setSelectedRecord(record)
  }

  const applyFilters = (filters) => {
    let filteredRecords = [...visitRecords]

    // date range filter to
    if (filters.dateFrom || filters.dateTo) {
      filteredRecords = filteredRecords.filter((record) => {
        const recordDate = new Date(record.date)
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null
        const toDate = filters.dateTo ? new Date(filters.dateTo) : null

        if (fromDate && toDate) {
          return recordDate >= fromDate && recordDate <= toDate
        } else if (fromDate) {
          return recordDate >= fromDate
        } else if (toDate) {
          return recordDate <= toDate
        }
        return true
      })
    }

    // sort oldest newest
    filteredRecords.sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return filters.sortOrder === "oldest" ? dateA - dateB : dateB - dateA
    })

    setVisitRecords(filteredRecords)
  }

  const resetFilters = () => {
    setVisitRecords(visitRecords)
  }

  if (showAddRecord) {
    return <AddRecord onClose={() => setShowAddRecord(false)} onSubmit={handleAddRecord} />
  }

  if (selectedRecord) {
    return <ViewRecord record={selectedRecord} onBack={() => setSelectedRecord(null)} onUpdate={handleUpdateRecord} />
  }

  return (
    <div className="visit-history">
      <div className="visit-history-header">
        <h2>Visit History</h2>
        <div className="filter-container">
          <div className="date-filter" onClick={() => setIsFilterModalOpen(true)} style={{ cursor: "pointer" }}>
            <span>Select date to view record</span>
            <Filter size={20} />
          </div>
        </div>
      </div>

      <div className="visit-content">
      {hasPermission("canAddRecord") && (
        <button className="add-record-btn" onClick={() => setShowAddRecord(true)}>
          <Plus size={20} />
          Add New Record
        </button>
        )}

        <div className="visit-table-container">
          <table className="visit-table">
            <thead>
              <tr>
                <th className="number-column"></th>
                <th>Date</th>
                <th>Details</th>
                <th className="action-column"></th>
                <th className="action-column"></th>
              </tr>
            </thead>
            <tbody>
              {visitRecords.map((record, index) => (
                <tr key={record.id} className={index % 2 === 0 ? "row-even" : "row-odd"}>
                  <td className="number-column">{index + 1}</td>
                  <td>{new Date(record.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</td>
                  <td>{record.purposeOfVisit}</td>
                  <td className="action-column">
                    <button className="action-btn">
                      <Download size={20} />
                    </button>
                  </td>
                  <td className="action-column">
                    <button className="action-btn" onClick={() => handleViewRecord(record)}>
                      <ArrowRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FilterModal
        type="visit"
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={applyFilters}
        onReset={resetFilters}
      />
    </div>
  )
}

export default VisitHistory
