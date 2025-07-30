import React, { useState, useEffect, useRef } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye, Settings, ChevronUp, ChevronDown, Menu, X } from 'lucide-react'

// Get user data from localStorage or sessionStorage - replace with actual user context
const getUser = () => {
  return JSON.parse(localStorage.getItem("user")) || 
         JSON.parse(sessionStorage.getItem("user")) || 
         { email: "user@example.com", role: "admin" }
}

// Base URL for the backend API
const API_BASE_URL = "http://localhost:8000"

// Default table headers configuration
const DEFAULT_HEADERS = [
  { id: "id", label: "#", visible: true },
  { id: "supplierMaterial", label: "Supplier Material", visible: true, altKey: "Suppliermaterial" },
  { id: "supplementOrderNumber", label: "Supplement Order Number", visible: true, altKey: "OrderNumber" },
  { id: "status", label: "Status", visible: true },
  { id: "explanation", label: "Explanation", visible: true, altKey: "explaination" },
  { id: "createTime", label: "Create Time", visible: true, altKey: "createdTime" },
  { id: "updateTime", label: "Update Time", visible: true }
]

export default function MaterialInquiry() {
  const user = getUser() // Get actual user data
  const [inquiries, setInquiries] = useState([])
  const [filteredInquiries, setFilteredInquiries] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchColumn, setSearchColumn] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showHeaderModal, setShowHeaderModal] = useState(false)
  const [showAddHeaderModal, setShowAddHeaderModal] = useState(false)
  const [editingInquiry, setEditingInquiry] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [viewDetails, setViewDetails] = useState(null)
  const [tableHeaders, setTableHeaders] = useState(DEFAULT_HEADERS)
  const [tempHeaders, setTempHeaders] = useState([])
  const [editingHeader, setEditingHeader] = useState(null)
  const [newHeaderName, setNewHeaderName] = useState("")
  const [newHeaderInfo, setNewHeaderInfo] = useState({
    id: "",
    label: "",
    visible: true,
    altKey: ""
  })
  const [isAdmin, setIsAdmin] = useState(user.role === "admin")
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    supplierMaterial: '',
    supplementOrderNumber: '',
    status: '',
    explanation: '',
    createTime: '',
    updateTime: ''
  })

  // Toast notification function
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000)
  }

  // Fetch data from backend
  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/material-inquiry/get-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: user.email })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      setInquiries(result.data || [])
      setFilteredInquiries(result.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      showToast('Error fetching data from server', 'error')
      // Set empty arrays on error
      setInquiries([])
      setFilteredInquiries([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch table headers from backend
  const fetchTableHeaders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/table-headers/get-material-inquiry`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.headers && result.headers.length > 0) {
          setTableHeaders(result.headers)
        }
      } else {
        // If no custom headers found, use default
        console.log('No custom headers found, using defaults')
      }
    } catch (error) {
      console.error('Error fetching table headers:', error)
      // Continue with default headers on error
    }
  }

  useEffect(() => {
    fetchData()
    fetchTableHeaders()
  }, [])

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredInquiries(inquiries)
      return
    }
    
    const lowercasedSearchTerm = searchTerm.toLowerCase()
    
    const filtered = inquiries.filter((inquiry) => {
      if (searchColumn === 'All') {
        const searchableValues = [
          inquiry.Suppliermaterial || inquiry.supplierMaterial,
          inquiry.OrderNumber || inquiry.supplementOrderNumber,
          inquiry.status,
          inquiry.explaination || inquiry.explanation,
          inquiry.createdTime || inquiry.createTime,
          inquiry.updateTime
        ]
        
        return searchableValues.some(
          value => value && 
          typeof value === 'string' && 
          value.toLowerCase().includes(lowercasedSearchTerm)
        )
      } else {
        // Search in specific column
        let searchValue = ''
        switch (searchColumn) {
          case 'Supplier Material':
            searchValue = inquiry.Suppliermaterial || inquiry.supplierMaterial || ''
            break
          case 'Supplement Order Number':
            searchValue = inquiry.OrderNumber || inquiry.supplementOrderNumber || ''
            break
          case 'Status':
            searchValue = inquiry.status || ''
            break
          case 'Explanation':
            searchValue = inquiry.explaination || inquiry.explanation || ''
            break
          case 'Create Time':
            searchValue = inquiry.createdTime || inquiry.createTime || ''
            break
          case 'Update Time':
            searchValue = inquiry.updateTime || ''
            break
        }
        return searchValue.toLowerCase().includes(lowercasedSearchTerm)
      }
    })
    
    setFilteredInquiries(filtered)
  }

  const handleClear = () => {
    setSearchTerm('')
    setSearchColumn('All')
    setFilteredInquiries(inquiries)
  }

  // CRUD operations
  const handleAdd = () => {
    setEditingInquiry(null)
    setFormData({
      supplierMaterial: '',
      supplementOrderNumber: '',
      status: '',
      explanation: '',
      createTime: '',
      updateTime: ''
    })
    setShowModal(true)
  }

  const handleEdit = (inquiry) => {
    setEditingInquiry(inquiry)
    setFormData({
      supplierMaterial: inquiry.Suppliermaterial || inquiry.supplierMaterial || '',
      supplementOrderNumber: inquiry.OrderNumber || inquiry.supplementOrderNumber || '',
      status: inquiry.status || '',
      explanation: inquiry.explaination || inquiry.explanation || '',
      createTime: inquiry.createdTime || inquiry.createTime || '',
      updateTime: inquiry.updateTime || ''
    })
    setShowModal(true)
  }

  const handleDelete = (id) => {
    setDeleteId(id)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    setLoading(true)
    try {
      // Find the row to delete
      const rowToDelete = inquiries.find(inquiry => 
        (inquiry._id || inquiry.id) === deleteId
      )
      
      if (!rowToDelete) {
        throw new Error("Inquiry not found")
      }
      
      // Use MongoDB _id if available, otherwise use regular id
      const idToDelete = rowToDelete._id || deleteId
      
      const response = await fetch(`${API_BASE_URL}/api/material-inquiry/delete-material`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          id: idToDelete, 
          email: user.email 
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete inquiry')
      }
      
      // Refresh data from backend after successful deletion
      await fetchData()
      showToast('Inquiry deleted successfully')
    } catch (error) {
      console.error('Error deleting inquiry:', error)
      showToast(error.message || 'Error deleting inquiry', 'error')
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
      setDeleteId(null)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const currentDateTime = new Date().toISOString()
      
      // Find original row if editing
      let originalRow = null
      if (editingInquiry) {
        originalRow = inquiries.find(inquiry => 
          (inquiry._id || inquiry.id) === (editingInquiry._id || editingInquiry.id)
        )
        
        if (!originalRow) {
          throw new Error("Inquiry not found for update")
        }
      }
      
      // Create payload for backend
      const payload = {
        ...(originalRow && { id: originalRow._id || originalRow.id }),
        supplierMaterial: formData.supplierMaterial,
        supplementOrderNumber: formData.supplementOrderNumber,
        status: formData.status,
        explanation: formData.explanation,
        createTime: editingInquiry ? undefined : currentDateTime, // Only for new entries
        updateTime: currentDateTime,
        updatedBy: user.email
      }
      
      const response = await fetch(`${API_BASE_URL}/api/material-inquiry/add-material`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify([payload, { user: user.email }])
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save inquiry')
      }
      
      // Refresh data from backend after successful save
      await fetchData()
      showToast(editingInquiry ? 'Inquiry updated successfully' : 'Inquiry added successfully')
    } catch (error) {
      console.error('Error saving inquiry:', error)
      showToast(error.message || 'Error saving inquiry', 'error')
    } finally {
      setLoading(false)
      setShowModal(false)
      setEditingInquiry(null)
    }
  }

  const handleView = (inquiry) => {
    setViewDetails(inquiry)
    setShowViewModal(true)
  }

  // Header management functions
  const openHeaderModal = () => {
    setTempHeaders([...tableHeaders])
    setShowHeaderModal(true)
    setEditingHeader(null)
  }

  const handleHeaderVisibilityChange = (index) => {
    const updatedHeaders = [...tempHeaders]
    updatedHeaders[index].visible = !updatedHeaders[index].visible
    setTempHeaders(updatedHeaders)
  }

  const handleEditHeaderLabel = (index) => {
    setEditingHeader(index)
    setNewHeaderName(tempHeaders[index].label)
  }

  const saveHeaderLabel = () => {
    if (editingHeader !== null && newHeaderName.trim()) {
      const updatedHeaders = [...tempHeaders]
      updatedHeaders[editingHeader].label = newHeaderName.trim()
      setTempHeaders(updatedHeaders)
      setEditingHeader(null)
      setNewHeaderName("")
    }
  }

  const moveHeader = (index, direction) => {
    if ((direction < 0 && index === 0) || (direction > 0 && index === tempHeaders.length - 1)) {
      return
    }
    
    const updatedHeaders = [...tempHeaders]
    const temp = updatedHeaders[index]
    updatedHeaders[index] = updatedHeaders[index + direction]
    updatedHeaders[index + direction] = temp
    setTempHeaders(updatedHeaders)
  }

  const saveHeaderChanges = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/table-headers/update-material-inquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          headers: tempHeaders,
          isGlobal: isAdmin // Admins update global headers
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save header changes')
      }
      
      setTableHeaders(tempHeaders)
      setShowHeaderModal(false)
      showToast(isAdmin ? 'Table headers updated globally' : 'Table headers updated')
    } catch (error) {
      console.error('Error saving header changes:', error)
      showToast('Error saving header changes', 'error')
    } finally {
      setLoading(false)
    }
  }

  const deleteHeader = (index) => {
    if (!isAdmin) return
    const updatedHeaders = [...tempHeaders]
    updatedHeaders.splice(index, 1)
    setTempHeaders(updatedHeaders)
  }

  const handleAddHeader = () => {
    if (!isAdmin) return
    setShowAddHeaderModal(true)
  }

  const saveNewHeader = () => {
    if (!newHeaderInfo.id || !newHeaderInfo.label) {
      showToast('Header ID and Label are required', 'error')
      return
    }
    
    const newHeader = {
      id: newHeaderInfo.id,
      label: newHeaderInfo.label,
      visible: true,
      altKey: newHeaderInfo.altKey || null
    }
    
    setTempHeaders([...tempHeaders, newHeader])
    setShowAddHeaderModal(false)
    
    setNewHeaderInfo({
      id: "",
      label: "",
      visible: true,
      altKey: ""
    })
  }

  const resetHeadersToDefault = () => {
    setTempHeaders([...DEFAULT_HEADERS])
  }

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Inactive': return 'bg-red-100 text-red-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Processing': return 'bg-blue-100 text-blue-800'
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString()
  }

  const getFieldValue = (row, header) => {
    if (header.altKey) {
      return row[header.id] || row[header.altKey] || '-'
    }
    return row[header.id] || '-'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md shadow-lg ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Material Inquiry</h1>
          <p className="text-sm text-gray-500">Manage Material Inquiry</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
            View All
          </button>
          {isAdmin && (
            <div className="relative">
              <button
                onClick={openHeaderModal}
                className="flex items-center space-x-2 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" />
                <span>Table Options</span>
              </button>
            </div>
          )}
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Row</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        {/* Search and Filter */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={searchColumn}
                onChange={(e) => setSearchColumn(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All</option>
                <option value="Supplier Material">Supplier Material</option>
                <option value="Supplement Order Number">Supplement Order Number</option>
                <option value="Status">Status</option>
                <option value="Explanation">Explanation</option>
                <option value="Create Time">Create Time</option>
                <option value="Update Time">Update Time</option>
              </select>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search inquiries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Search
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {tableHeaders
                    .filter(header => header.visible)
                    .map(header => (
                      <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {header.label}
                      </th>
                    ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry._id || inquiry.id} className="hover:bg-gray-50">
                    {tableHeaders
                      .filter(header => header.visible)
                      .map(header => (
                        <td key={header.id} className="px-6 py-4 whitespace-nowrap">
                          {header.id === 'status' ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getFieldValue(inquiry, header))}`}>
                              {getFieldValue(inquiry, header)}
                            </span>
                          ) : header.id === 'createTime' || header.id === 'updateTime' ? (
                            <div className="text-sm text-gray-900">
                              {formatDate(getFieldValue(inquiry, header))}
                            </div>
                          ) : header.id === 'supplierMaterial' || header.id === 'explanation' ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {getFieldValue(inquiry, header)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-900">
                              {getFieldValue(inquiry, header)}
                            </div>
                          )}
                        </td>
                      ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(inquiry)}
                          className="text-gray-600 hover:text-gray-800"
                          title="View Details"
                          disabled={loading}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(inquiry)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                          disabled={loading}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inquiry._id || inquiry.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filteredInquiries.length === 0 && (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">No data found</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {editingInquiry ? 'Edit Inquiry' : 'Add New Inquiry'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier Material
                </label>
                <input
                  type="text"
                  value={formData.supplierMaterial}
                  onChange={(e) => setFormData({...formData, supplierMaterial: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplement Order Number
                </label>
                <input
                  type="text"
                  value={formData.supplementOrderNumber}
                  onChange={(e) => setFormData({...formData, supplementOrderNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Explanation
                </label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingInquiry ? 'Update' : 'Add')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && viewDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-medium mb-4">Material Inquiry Details</h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-2">Entry Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Created by:</span></div>
                  <div>{viewDetails.user || 'Unknown'}</div>
                  <div><span className="font-medium">Created on:</span></div>
                  <div>{formatDate(viewDetails.createdTime || viewDetails.createTime)}</div>
                </div>
              </div>
              
              {viewDetails.updateTime && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-semibold mb-2">Last Update</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Updated by:</span></div>
                    <div>{viewDetails.updatedBy || 'Unknown'}</div>
                    <div><span className="font-medium">Updated on:</span></div>
                    <div>{formatDate(viewDetails.updateTime)}</div>
                  </div>
                </div>
              )}

              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Material Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium">Supplier Material:</span>
                    <span>{viewDetails.Suppliermaterial || viewDetails.supplierMaterial || '-'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium">Order Number:</span>
                    <span>{viewDetails.OrderNumber || viewDetails.supplementOrderNumber || '-'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewDetails.status)}`}>
                      {viewDetails.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium">Explanation:</span>
                    <span>{viewDetails.explaination || viewDetails.explanation || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium mb-4">Delete Inquiry</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this inquiry? This action cannot be undone.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Header Management Modal */}
      {showHeaderModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Manage Table Columns</h3>
              <button
                onClick={() => setShowHeaderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex justify-between mb-4">
              <p className="text-sm text-gray-600">Configure which columns are visible and their order</p>
              <div className="flex space-x-2">
                {isAdmin && (
                  <button
                    onClick={handleAddHeader}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add New Column
                  </button>
                )}
                <button
                  onClick={resetHeadersToDefault}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Reset to Default
                </button>
              </div>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tempHeaders.map((header, index) => (
                <div 
                  key={header.id} 
                  className={`flex items-center p-3 border rounded-md ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <div className="flex items-center flex-1">
                    <Menu className="w-4 h-4 text-gray-400 mr-2 cursor-grab" />
                    
                    {editingHeader === index ? (
                      <div className="flex items-center flex-1 space-x-2">
                        <input
                          type="text"
                          value={newHeaderName}
                          onChange={(e) => setNewHeaderName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveHeaderLabel()}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <button
                          onClick={saveHeaderLabel}
                          className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="flex-1 text-sm">{header.label}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditHeaderLabel(index)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="Edit Label"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    
                    {isAdmin ? (
                      <button
                        onClick={() => deleteHeader(index)}
                        className="p-1 text-red-400 hover:text-red-600"
                        title="Delete Column"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        className="p-1 text-gray-300 cursor-not-allowed"
                        title="Only admins can delete columns"
                        disabled
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => moveHeader(index, -1)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-200"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveHeader(index, 1)}
                        disabled={index === tempHeaders.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-200"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={header.visible}
                        onChange={() => handleHeaderVisibilityChange(index)}
                        className="sr-only"
                      />
                      <div className={`relative inline-flex h-4 w-8 rounded-full transition-colors ${
                        header.visible ? 'bg-blue-600' : 'bg-gray-200'
                      }`}>
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform mt-0.5 ${
                          header.visible ? 'translate-x-4' : 'translate-x-0.5'
                        }`} />
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowHeaderModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveHeaderChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Header Modal */}
      {showAddHeaderModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Add New Column</h3>
              <button
                onClick={() => setShowAddHeaderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Column ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newHeaderInfo.id}
                  onChange={(e) => setNewHeaderInfo({...newHeaderInfo, id: e.target.value})}
                  placeholder="e.g. contactPerson (camelCase)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Column Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newHeaderInfo.label}
                  onChange={(e) => setNewHeaderInfo({...newHeaderInfo, label: e.target.value})}
                  placeholder="e.g. Contact Person"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternative Key (Optional)
                </label>
                <input
                  type="text"
                  value={newHeaderInfo.altKey || ""}
                  onChange={(e) => setNewHeaderInfo({...newHeaderInfo, altKey: e.target.value})}
                  placeholder="For backwards compatibility"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use this if data might be stored under a different key name
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowAddHeaderModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveNewHeader}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Column
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}