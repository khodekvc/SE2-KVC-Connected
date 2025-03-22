"use client"

import { Search, Archive, ArrowRight, Filter } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import "../css/PatientDirectory.css"
import { useConfirmDialog } from "../contexts/ConfirmDialogContext"
import FilterModal from "../components/FilterPopup"

export default function PatientDirectory() {
  const { showConfirmDialog } = useConfirmDialog()
  const navigate = useNavigate()
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState(null)
  const [originalPatients, setOriginalPatients] = useState([]);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    const fetchActivePets = async () => {
      try {
        const response = await fetch("http://localhost:5000/pets/active", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch active pets");
        }

        const data = await response.json();
        console.log("Fetched active pets:", data);

        // Update state with fetched data
        setOriginalPatients(data);
        setPatients(data);
      } catch (error) {
        console.error("Error fetching active pets:", error);
      }
    };

    fetchActivePets();
  }, []);

  const handleArchive = (petId) => {
  showConfirmDialog("Are you sure you want to archive this record?", async () => {
    try {
      const response = await fetch(`http://localhost:5000/pets/archive/${petId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to archive pet.");
      }

      const data = await response.json();
      console.log(data.message);

      // Update the patients list to remove the archived pet
      setPatients((prevPatients) => prevPatients.filter((patient) => patient.pet_id !== petId));
      setOriginalPatients((prevPatients) => prevPatients.filter((patient) => patient.pet_id !== petId));
    } catch (error) {
      console.error("Error archiving pet:", error);
    }
  });
};

  const handleViewProfile = (patientId) => {
    console.log("Navigating to PetProfile with patientId:", patientId);
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

    // species filter
    if (filters.species) {
      filteredPatients = filteredPatients.filter((patient) => patient.species === filters.species)
    }

    // sort by name or owner
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
                <tr key={patient.pet_id} className={index % 2 === 0 ? "row-even" : "row-odd"}>
                  <td>{patient.pet_id}</td>
                  <td>{patient.pet_name}</td>
                  <td>{patient.owner_name}</td>
                  <td>{patient.species}</td>
                  <td className="actions">
                    <Archive size={16} onClick={() => handleArchive(patient.pet_id)} style={{ cursor: "pointer" }} />
                    <ArrowRight size={16} className="view-profile" onClick={() => handleViewProfile(patient.pet_id)} />
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
