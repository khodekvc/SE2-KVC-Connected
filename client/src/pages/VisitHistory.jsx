"use client"


import { useState, useEffect } from "react"
import { Download, ArrowRight, Plus, Filter } from "lucide-react"
import AddRecord from "./AddRecord"
import ViewRecord from "./ViewRecord"
import FilterModal from "../components/FilterPopup"
import "../css/VisitHistory.css"
import { useUserRole } from "../contexts/UserRoleContext"
import { useParams } from "react-router-dom"; // Import useParams




const VisitHistory = () => {
 const { pet_id } = useParams(); // Extract pet_id from the URL
 const { hasPermission } = useUserRole()
 const [showAddRecord, setShowAddRecord] = useState(false)
 const [selectedRecord, setSelectedRecord] = useState(null)
 const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
 const [visitRecords, setVisitRecords] = useState([])


 useEffect(() => {
   const fetchVisitRecords = async () => {
     try {
       const response = await fetch(`http://localhost:5000/recs/visit-records?pet_id=${pet_id}`, {
         method: "GET",
         credentials: "include",
         headers: {
           "Content-Type": "application/json",
         },
       });


       if (!response.ok) {
         throw new Error("Failed to fetch visit records");
       }


       const data = await response.json();
       console.log("Fetched visit records:", data); // Log the data to verify its structure
       setVisitRecords(data);
     } catch (error) {
       console.error("Error fetching visit records:", error);
     }
   };


   fetchVisitRecords();
 }, [pet_id]); // Re-fetch records if pet_id changes


 const handleUpdateRecord = (updatedRecord) => {
   setVisitRecords((prevRecords) =>
     prevRecords.map((record) => (record.id === updatedRecord.id ? updatedRecord : record))
   );
   setSelectedRecord(updatedRecord); // Update the selected record
 };


 const handleAddRecord = (newRecord) => {
   // Use the backend response to add the new record
   console.log("Adding new record to state:", newRecord);
   setVisitRecords((prevRecords) => [newRecord, ...prevRecords]);
   setShowAddRecord(false);
 }


 const handleViewRecord = (record) => {
   if (!record || !record.id) {
     console.error("Record ID is missing:", record);
     return;
   }
   console.log("Selected Record:", record);
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


 const updateRecord = async (recordId, updatedData) => {
   console.log("Record ID in updateRecord:", recordId);
   try {
     const response = await fetch(`http://localhost:5000/recs/records/${recordId}`, {
       method: "PUT",
       credentials: "include",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify(updatedData),
     });


     if (!response.ok) {
       throw new Error("Failed to update the record");
     }


     const updatedRecord = await response.json();
     console.log("Record updated successfully:", updatedRecord);


     // Update the frontend state with the updated record
     setVisitRecords((prevRecords) =>
       prevRecords.map((record) => (record.id === updatedRecord.id ? updatedRecord : record))
     );
     setSelectedRecord(updatedRecord); // Update the selected record
   } catch (error) {
     console.error("Error updating record:", error);
   }
 };


 if (showAddRecord) {
   return <AddRecord onClose={() => setShowAddRecord(false)} onSubmit={handleAddRecord} />
 }


 if (selectedRecord) {
   return (
     <ViewRecord
     record={selectedRecord}
     onBack={() => setSelectedRecord(null)}
     onUpdate={(updatedRecord) => {
       console.log("Calling updateRecord with:", updatedRecord.id, updatedRecord); // Debugging
       updateRecord(updatedRecord.id, updatedRecord);
 }}
/>
   );
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
                 <td>
                   {record.date
                     ? new Date(record.date).toLocaleDateString("en-US", {
                         year: "numeric",
                         month: "long",
                         day: "numeric",
                       })
                     : "No Date Available"}
                 </td>
                 <td>{record.purposeOfVisit || "No Details Available"}</td>
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
