import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Plus, Search, Filter, Edit, Trash2, AlertTriangle, Eye, Settings, X, Check, ChevronUp, ChevronDown } from 'lucide-react'
// API base URL for the deployed backend
const API_BASE_URL = "http://localhost:8000"

// API helper function
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const options = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  }
  
  if (data) {
    options.body = JSON.stringify(data)
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export default function MaterialReplenish() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  // State management
  const [replenishments, setReplenishments] = useState([])
  const [filteredReplenishments, setFilteredReplenishments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchColumn, setSearchColumn] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [editingReplenishment, setEditingReplenishment] = useState(null)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewDetails, setViewDetails] = useState(null)
  const [showHeaderModal, setShowHeaderModal] = useState(false)
  const [showAddHeaderModal, setShowAddHeaderModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Table headers management
  const [tableHeaders, setTableHeaders] = useState([
    { id: "orderNumber", label: "Order Number", visible: true, altKey: "OrderNumber" },
    { id: "materialCategory", label: "Material Category", visible: true, altKey: "MaterialCategory" },
    { id: "vendor", label: "Vendor", visible: true, altKey: "Vendor" },
    { id: "invitee", label: "Invitee", visible: true, altKey: "Invitee" },
    { id: "hostInviterContactInfo", label: "Host/Inviter Contact Info", visible: true, altKey: "Host" },
    { id: "sender", label: "Sender", visible: true, altKey: "Sender" },
    { id: "status", label: "Status", visible: true, altKey: "Status" },
    { id: "supplementTemplate", label: "Supplement Template", visible: true, altKey: "SupplementTemplate" },
    { id: "createTime", label: "Create Time", visible: true, altKey: "Created" },
    { id: "updateTime", label: "Update Time", visible: true, altKey: "updated" },
  ])
  
  const [tempHeaders, setTempHeaders] = useState([])
  const [editingHeader, setEditingHeader] = useState(null)
  const [newHeaderName, setNewHeaderName] = useState('')
  const [newHeaderInfo, setNewHeaderInfo] = useState({
    id: '',
    label: '',
    visible: true,
    altKey: ''
  })

  // Form state
  const [formData, setFormData] = useState({
    orderNumber: '',
    materialCategory: '',
    vendor: '',
    invitee: '',
    hostInviterContactInfo: '',
    sender: '',
    status: '',
    supplementTemplate: '',
    createTime: '',
    updateTime: ''
  })

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await apiCall(
          '/api/material-replenishment/get-data',
          'POST',
          { email: user.email }
        )

        setReplenishments(response)
        setFilteredReplenishments(response)

        // Fetch table headers
        try {
          const headerResponse = await apiCall(
            `/api/table-headers/get-material?email=${user.email}`,
            'GET'
          )
          
          if (headerResponse.headers) {
            setTableHeaders(headerResponse.headers)
          }
        } catch (headerError) {
          console.error("Error fetching table headers:", headerError)
          // Use default headers if fetch fails
        }

      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data")
        showToast("Error fetching data", "error")
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.email) {
      fetchData()
    }
  }, [user])

  // Toast notification helper
  const showToast = (message, type = "success") => {
    // Simple toast implementation - you might want to use a proper toast library
    const toast = document.createElement('div')
    toast.className = `fixed top-4 right-4 p-4 rounded-md z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 3000)
  }

  // Search functionality
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredReplenishments(replenishments)
      return
    }

    const lowercaseSearch = searchTerm.toLowerCase()
    
    if (searchColumn === 'All') {
      const filtered = replenishments.filter(rep =>
        Object.values(rep).some(value =>
          value && typeof value === 'string' && 
          value.toLowerCase().includes(lowercaseSearch)
        )
      )
      setFilteredReplenishments(filtered)
    } else {
      const columnKey = tableHeaders.find(h => h.label === searchColumn)?.id
      if (columnKey) {
        const filtered = replenishments.filter(rep => {
          const value = rep[columnKey] || rep[tableHeaders.find(h => h.id === columnKey)?.altKey]
          return value && value.toLowerCase().includes(lowercaseSearch)
        })
        setFilteredReplenishments(filtered)
      }
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    setSearchColumn('All')
    setFilteredReplenishments(replenishments)
  }

  // CRUD operations
  const handleAdd = () => {
    setEditingReplenishment(null)
    setFormData({
      orderNumber: '',
      materialCategory: '',
      vendor: '',
      invitee: '',
      hostInviterContactInfo: '',
      sender: '',
      status: '',
      supplementTemplate: '',
      createTime: '',
      updateTime: ''
    })
    setShowModal(true)
  }

  const handleEdit = (replenishment) => {
    setEditingReplenishment(replenishment)
    setFormData({
      orderNumber: replenishment.orderNumber || replenishment.OrderNumber || '',
      materialCategory: replenishment.materialCategory || replenishment.MaterialCategory || '',
      vendor: replenishment.vendor || replenishment.Vendor || '',
      invitee: replenishment.invitee || replenishment.Invitee || '',
      hostInviterContactInfo: replenishment.hostInviterContactInfo || replenishment.Host || '',
      sender: replenishment.sender || replenishment.Sender || '',
      status: replenishment.status || replenishment.Status || '',
      supplementTemplate: replenishment.supplementTemplate || replenishment.SupplementTemplate || '',
      createTime: replenishment.createTime || replenishment.Created || '',
      updateTime: replenishment.updateTime || replenishment.updated || ''
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      const currentDateTime = new Date().toISOString().slice(0, -8)
      
      if (editingReplenishment) {
        // Update existing
        const updatedData = {
          ...formData,
          updateTime: currentDateTime,
          updatedBy: user.email
        }

        await apiCall(
          '/api/material-replenishment/update-data',
          'POST',
          {
            id: editingReplenishment._id || editingReplenishment.id,
            data: updatedData,
            email: user.email
          }
        )

        const updatedReplenishments = replenishments.map(rep =>
          (rep._id === editingReplenishment._id || rep.id === editingReplenishment.id)
            ? { ...rep, ...updatedData }
            : rep
        )
        setReplenishments(updatedReplenishments)
        setFilteredReplenishments(updatedReplenishments)
        showToast("Record updated successfully")
      } else {
        // Add new
        const newData = {
          ...formData,
          createTime: currentDateTime,
          updateTime: currentDateTime,
          createdBy: user.email,
          updatedBy: user.email
        }

        const response = await apiCall(
          '/api/material-replenishment/add-data',
          'POST',
          [newData, { user: user.email }]
        )

        const newRecord = response.data || { ...newData, _id: Date.now().toString() }
        const updatedReplenishments = [...replenishments, newRecord]
        setReplenishments(updatedReplenishments)
        setFilteredReplenishments(updatedReplenishments)
        showToast("Record added successfully")
      }

      setShowModal(false)
      setEditingReplenishment(null)
    } catch (error) {
      console.error("Error saving data:", error)
      showToast("Error saving data", "error")
    }
  }

  const handleDelete = async () => {
    try {
      await apiCall(
        '/api/material-replenishment/delete-data',
        'POST',
        {
          id: deleteId,
          email: user.email
        }
      )

      const updatedReplenishments = replenishments.filter(
        rep => rep._id !== deleteId && rep.id !== deleteId
      )
      setReplenishments(updatedReplenishments)
      setFilteredReplenishments(updatedReplenishments)
      showToast("Record deleted successfully")
    } catch (error) {
      console.error("Error deleting data:", error)
      showToast("Error deleting data", "error")
    } finally {
      setShowDeleteAlert(false)
      setDeleteId(null)
    }
  }

  const handleView = (replenishment) => {
    setViewDetails(replenishment)
    setShowViewModal(true)
  }

  // Header management functions
  const openHeaderModal = () => {
    setTempHeaders([...tableHeaders])
    setShowHeaderModal(true)
    setEditingHeader(null)
  }

  const toggleHeaderVisibility = (index) => {
    const updated = [...tempHeaders]
    updated[index].visible = !updated[index].visible
    setTempHeaders(updated)
  }

  const handleEditHeaderLabel = (index) => {
    setEditingHeader(index)
    setNewHeaderName(tempHeaders[index].label)
  }

  const saveHeaderLabel = () => {
    if (editingHeader !== null && newHeaderName.trim()) {
      const updated = [...tempHeaders]
      updated[editingHeader].label = newHeaderName.trim()
      setTempHeaders(updated)
      setEditingHeader(null)
      setNewHeaderName('')
    }
  }

  const cancelHeaderEdit = () => {
    setEditingHeader(null)
    setNewHeaderName('')
  }

  const deleteHeader = (index) => {
    if (!isAdmin) return
    
    const updated = [...tempHeaders]
    updated.splice(index, 1)
    setTempHeaders(updated)
  }

  const handleAddHeader = () => {
    if (!isAdmin) return
    setNewHeaderInfo({
      id: '',
      label: '',
      visible: true,
      altKey: ''
    })
    setShowAddHeaderModal(true)
  }

  const saveNewHeader = () => {
    if (!newHeaderInfo.id || !newHeaderInfo.label) {
      showToast("Header ID and Label are required", "error")
      return
    }
    
    // Check if ID already exists
    if (tempHeaders.some(h => h.id === newHeaderInfo.id)) {
      showToast("Header ID already exists", "error")
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
      id: '',
      label: '',
      visible: true,
      altKey: ''
    })
    showToast("New column added successfully")
  }

  const resetHeadersToDefault = () => {
    const defaultHeaders = [
      { id: "orderNumber", label: "Order Number", visible: true, altKey: "OrderNumber" },
      { id: "materialCategory", label: "Material Category", visible: true, altKey: "MaterialCategory" },
      { id: "vendor", label: "Vendor", visible: true, altKey: "Vendor" },
      { id: "invitee", label: "Invitee", visible: true, altKey: "Invitee" },
      { id: "hostInviterContactInfo", label: "Host/Inviter Contact Info", visible: true, altKey: "Host" },
      { id: "sender", label: "Sender", visible: true, altKey: "Sender" },
      { id: "status", label: "Status", visible: true, altKey: "Status" },
      { id: "supplementTemplate", label: "Supplement Template", visible: true, altKey: "SupplementTemplate" },
      { id: "createTime", label: "Create Time", visible: true, altKey: "Created" },
      { id: "updateTime", label: "Update Time", visible: true, altKey: "updated" },
    ]
    setTempHeaders(defaultHeaders)
    showToast("Headers reset to default")
  }

  const moveHeader = (index, direction) => {
    if ((direction < 0 && index === 0) || (direction > 0 && index === tempHeaders.length - 1)) {
      return
    }
    
    const updated = [...tempHeaders]
    const temp = updated[index]
    updated[index] = updated[index + direction]
    updated[index + direction] = temp
    setTempHeaders(updated)
  }

  const saveHeaderChanges = async () => {
    try {
      if (isAdmin) {
        await apiCall(
          '/api/table-headers/update-material',
          'POST',
          { headers: tempHeaders, email: user.email }
        )
        showToast("Table headers updated globally")
      }
      
      setTableHeaders(tempHeaders)
      setShowHeaderModal(false)
      localStorage.setItem('materialTableHeaders', JSON.stringify(tempHeaders))
    } catch (error) {
      console.error("Error saving header changes:", error)
      showToast("Error saving header changes", "error")
    }
  }

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFieldValue = (item, header) => {
    return header.altKey 
      ? (item[header.id] || item[header.altKey] || "") 
      : (item[header.id] || "")
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return "-"
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Access Denied</div>
        <p className="text-gray-400 mt-2">You don't have permission to view material replenishments.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Material Replenishment</h1>
          <p className="text-gray-500 mt-1">Manage Material Replenishment</p>
        </div>
        <div className="flex space-x-2">
          {isAdmin && (
            <button
              onClick={openHeaderModal}
              className="bg-gray-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Manage Columns</span>
            </button>
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <div className="text-sm text-red-800">{error}</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={searchColumn}
                onChange={(e) => setSearchColumn(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Columns</option>
                {tableHeaders.filter(h => h.visible).map(header => (
                  <option key={header.id} value={header.label}>{header.label}</option>
                ))}
              </select>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search here..."
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

        <div className="overflow-x-auto">
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
              {filteredReplenishments.map((rep) => (
                <tr key={rep._id || rep.id} className="hover:bg-gray-50">
                  {tableHeaders
                    .filter(header => header.visible)
                    .map(header => (
                      <td key={header.id} className="px-6 py-4 whitespace-nowrap">
                        {header.id === 'status' ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(getFieldValue(rep, header))}`}>
                            {getFieldValue(rep, header) || '-'}
                          </span>
                        ) : header.id === 'createTime' || header.id === 'updateTime' ? (
                          <div className="text-sm text-gray-900">
                            {formatDateTime(getFieldValue(rep, header))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-900">
                            {getFieldValue(rep, header) || '-'}
                          </div>
                        )}
                      </td>
                    ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleView(rep)}
                        className="text-green-600 hover:text-green-800"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(rep)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteId(rep._id || rep.id)
                          setShowDeleteAlert(true)
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReplenishments.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500">No data found</div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {editingReplenishment ? 'Edit Record' : 'Add New Record'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {tableHeaders.map(header => (
                <div key={header.id} className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {header.label}
                  </label>
                  {header.id === 'status' ? (
                    <select
                      value={formData[header.id] || ''}
                      onChange={(e) => setFormData({...formData, [header.id]: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select status</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending">Pending</option>
                    </select>
                  ) : (
                    <input
                      type={header.id === 'createTime' || header.id === 'updateTime' ? 'datetime-local' : 'text'}
                      value={formData[header.id] || ''}
                      onChange={(e) => setFormData({...formData, [header.id]: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Enter ${header.label}`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex space-x-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingReplenishment ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && viewDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Record Details</h3>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-2">Entry Information</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Created by:</span> {viewDetails.createdBy || viewDetails.user || "Unknown"}</div>
                  <div><span className="font-medium">Created on:</span> {formatDateTime(viewDetails.createTime || viewDetails.Created)}</div>
                </div>
              </div>
              
              {(viewDetails.updateTime || viewDetails.updated) && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-medium mb-2">Last Update</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Updated by:</span> {viewDetails.updatedBy || viewDetails.user || "Unknown"}</div>
                    <div><span className="font-medium">Updated on:</span> {formatDateTime(viewDetails.updateTime || viewDetails.updated)}</div>
                  </div>
                </div>
              )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteAlert && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Delete Record</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
            <div className="flex space-x-2 justify-end">
              <button
                onClick={() => setShowDeleteAlert(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Management Modal */}
      {showHeaderModal && isAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium">Manage Table Columns</h3>
                <p className="text-sm text-gray-600 mt-1">Configure which columns are visible and their order</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddHeader}
                  className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  Add New Column
                </button>
                <button
                  onClick={resetHeadersToDefault}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  Reset to Default
                </button>
              </div>
            </div>
            
            <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
              {tempHeaders.map((header, index) => (
                <div key={header.id} className={`flex items-center justify-between p-4 border rounded-md ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Drag handle */}
                    <div className="cursor-grab text-gray-400">
                      ⋮⋮
                    </div>
                    
                    {/* Header label - editable */}
                    {editingHeader === index ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          type="text"
                          value={newHeaderName}
                          onChange={(e) => setNewHeaderName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveHeaderLabel()}
                          className="flex-1 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Column name"
                        />
                        <button
                          onClick={saveHeaderLabel}
                          className="text-green-600 hover:text-green-800"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelHeaderEdit}
                          className="text-red-600 hover:text-red-800"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <span className="font-medium">{header.label}</span>
                        <div className="text-xs text-gray-500">ID: {header.id}</div>
                        {header.altKey && (
                          <div className="text-xs text-gray-400">Alt Key: {header.altKey}</div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Edit button */}
                    <button
                      onClick={() => handleEditHeaderLabel(index)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Edit column name"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    {/* Delete button */}
                    <button
                      onClick={() => deleteHeader(index)}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Delete column"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Move up/down */}
                    <div className="flex flex-col">
                      <button
                        onClick={() => moveHeader(index, -1)}
                        disabled={index === 0}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveHeader(index, 1)}
                        disabled={index === tempHeaders.length - 1}
                        className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Visibility toggle */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={header.visible}
                        onChange={() => toggleHeaderVisibility(index)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        title="Toggle visibility"
                      />
                      <span className="ml-2 text-sm text-gray-600">Visible</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-2 justify-end border-t pt-4">
              <button
                onClick={() => setShowHeaderModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveHeaderChanges}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Header Modal */}
      {showAddHeaderModal && isAdmin && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add New Column</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Column ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newHeaderInfo.id}
                  onChange={(e) => setNewHeaderInfo({...newHeaderInfo, id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. contactPerson (camelCase)"
                />
                <p className="text-xs text-gray-500 mt-1">Use camelCase, no spaces or special characters</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Column Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newHeaderInfo.label}
                  onChange={(e) => setNewHeaderInfo({...newHeaderInfo, label: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Contact Person"
                />
                <p className="text-xs text-gray-500 mt-1">Display name for the column header</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alternative Key (Optional)
                </label>
                <input
                  type="text"
                  value={newHeaderInfo.altKey}
                  onChange={(e) => setNewHeaderInfo({...newHeaderInfo, altKey: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="For backwards compatibility"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use this if data might be stored under a different key name
                </p>
              </div>
            </div>

            <div className="flex space-x-2 justify-end">
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