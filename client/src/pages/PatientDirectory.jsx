"use client"

import { Search, Archive, ArrowRight, Filter } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import "../css/PatientDirectory.css"
import { useConfirmDialog } from "../contexts/ConfirmDialogContext"
import FilterModal from "../components/FilterPopup"

export default function PatientDirectory() {
  const { showConfirmDialog } = useConfirmDialog()
  const navigate = useNavigate()
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState(null)
  const [originalPatients] = useState([
    { id: "012345", name: "Oreo", owner: "Princess Tan", species: "Dog" },
    { id: "012346", name: "Pimpy", owner: "Princess Tan", species: "Snake" },
    { id: "012347", name: "Snow", owner: "Sabrina Mae", species: "Dog" },
    { id: "012348", name: "Daisy", owner: "Chris Parker", species: "Dog" },
    ...Array(15)
      .fill()
      .map((_, i) => ({
        id: `0123${54 + i}`,
        name: `Pet ${i + 1}`,
        owner: `Owner ${i + 1}`,
        species: ["Dog", "Cat", "Bird", "Rabbit", "Snake"][Math.floor(Math.random() * 5)],
      })),
  ])
  const [patients, setPatients] = useState(originalPatients)

  const handleArchive = () => {
    showConfirmDialog("Are you sure you want to archive this record?", () => {
      // Archive logic here
    })
  }

  const handleViewProfile = (patientId) => {
    navigate(`/PetProfile/${patientId}`)
  }

  const applyFilters = (filters) => {
    setActiveFilters(filters)
    let filteredPatients = [...originalPatients]

    // id filter
    if (filters.idFrom || filters.idTo) {
      filteredPatients = filteredPatients.filter((patient) => {
        const id = Number.parseInt(patient.id)
        const from = filters.idFrom ? Number.parseInt(filters.idFrom) : 0
        const to = filters.idTo ? Number.parseInt(filters.idTo) : Number.POSITIVE_INFINITY
        return id >= from && id <= to
      })
    }

    // dpecies filter
    if (filters.species) {
      filteredPatients = filteredPatients.filter((patient) => patient.species === filters.species)
    }

    // sort nm
    if (filters.sortBy) {
      const key = filters.sortBy === "petName" ? "name" : "owner"
      filteredPatients.sort((a, b) => {
        if (filters.sortOrder === "ascending") {
          return a[key].localeCompare(b[key])
        } else {
          return b[key].localeCompare(a[key])
        }
      })
    }

    setPatients(filteredPatients)
  }

  const resetFilters = () => {
    setActiveFilters(null)
    setPatients(originalPatients)
  }

  return (
    <div className="patient-directory">
      <div className="directory-header">
        <h2>Patient Directory</h2>
        <div className="search-container">
          <Search className="search-icon" />
          <input type="text" placeholder="Search..." className="search-input" />
          <button
            className={`filter-button ${activeFilters ? "active" : ""}`}
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Pet ID</th>
                <th>Pet Name</th>
                <th>Pet Owner</th>
                <th>Species</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient, index) => (
                <tr key={patient.id} className={index % 2 === 0 ? "row-even" : "row-odd"}>
                  <td>{patient.id}</td>
                  <td>{patient.name}</td>
                  <td>{patient.owner}</td>
                  <td>{patient.species}</td>
                  <td className="actions">
                    <Archive size={16} onClick={() => handleArchive(patient.id)} style={{ cursor: "pointer" }} />
                    <ArrowRight size={16} className="view-profile" onClick={() => handleViewProfile(patient.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FilterModal
       type="patient"
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={applyFilters}
        onReset={resetFilters}
      />
    </div>
  )
}
