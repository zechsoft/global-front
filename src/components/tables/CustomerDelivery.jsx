import React, { useState, useRef, useEffect } from 'react'
import { 
  Plus, Search, Filter, Edit, Trash2, MapPin, Clock, Eye, Settings, 
  ChevronUp, ChevronDown, Save, X, UserPlus, Menu as MenuIcon 
} from 'lucide-react'

// Backend API URL
const API_URL = "http://localhost:8000"

// API Configuration - Set this to true to use separate delivery endpoints
// Set to false to use the existing customer-delivery-notices endpoints
const USE_SEPARATE_DELIVERY_API = false

const API_ENDPOINTS = {
  getData: USE_SEPARATE_DELIVERY_API ? '/api/customer-deliveries/get-data' : '/api/customer-delivery-notices/get-data',
  add: USE_SEPARATE_DELIVERY_API ? '/api/customer-deliveries/add' : '/api/customer-delivery-notices/add',
  update: USE_SEPARATE_DELIVERY_API ? '/api/customer-deliveries' : '/api/customer-delivery-notices',
  delete: USE_SEPARATE_DELIVERY_API ? '/api/customer-deliveries' : '/api/customer-delivery-notices',
  headers: '/api/table-headers/get-customer-delivery'
}

// Default table headers configuration
const DEFAULT_HEADERS = [
  { id: "id", label: "Delivery ID", visible: true },
  { id: "orderId", label: "Order ID", visible: true },
  { id: "customer", label: "Customer", visible: true },
  { id: "product", label: "Product", visible: true },
  { id: "quantity", label: "Quantity", visible: true },
  { id: "deliveryAddress", label: "Delivery Address", visible: true },
  { id: "scheduledDate", label: "Scheduled Date", visible: true },
  { id: "actualDate", label: "Actual Date", visible: true },
  { id: "driver", label: "Driver", visible: true },
  { id: "vehicleNo", label: "Vehicle No", visible: true },
  { id: "trackingNumber", label: "Tracking Number", visible: true },
  { id: "priority", label: "Priority", visible: true },
  { id: "status", label: "Status", visible: true },
  { id: "actions", label: "Actions", visible: true }
]

const TABS = [
  { label: "All", value: "all" },
  { label: "Scheduled", value: "scheduled" },
  { label: "In Transit", value: "in-transit" },
  { label: "Delivered", value: "delivered" }
]

export default function CustomerDelivery() {
  // State management
  const [deliveries, setDeliveries] = useState([])
  const [filteredDeliveries, setFilteredDeliveries] = useState([])
  const [tableHeaders, setTableHeaders] = useState(DEFAULT_HEADERS)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentTab, setCurrentTab] = useState('all')
  const [filterColumn, setFilterColumn] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showTableOptionsDropdown, setShowTableOptionsDropdown] = useState(false)
  
  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showHeaderModal, setShowHeaderModal] = useState(false)
  const [showAddHeaderModal, setShowAddHeaderModal] = useState(false)
  
  // Edit states
  const [editingDelivery, setEditingDelivery] = useState(null)
  const [selectedDelivery, setSelectedDelivery] = useState(null)
  const [deliveryToDelete, setDeliveryToDelete] = useState(null)
  const [tempHeaders, setTempHeaders] = useState([])
  const [editingHeader, setEditingHeader] = useState(null)
  const [newHeaderName, setNewHeaderName] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    orderId: '',
    customer: '',
    product: '',
    quantity: '',
    deliveryAddress: '',
    scheduledDate: '',
    actualDate: '',
    driver: '',
    vehicleNo: '',
    trackingNumber: '',
    priority: 'Medium',
    status: 'Scheduled'
  })
  
  const [newHeaderInfo, setNewHeaderInfo] = useState({
    id: '',
    label: '',
    visible: true
  })

  // Refs
  const searchInputRef = useRef(null)
  const cancelRef = useRef()
  const [isFocused, setIsFocused] = useState(false)

  // Get user from storage (matching the pattern from your auth context)
  const user = JSON.parse(localStorage.getItem("user")) || JSON.parse(sessionStorage.getItem("user"))

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.table-options-dropdown')) {
        setShowTableOptionsDropdown(false)
      }
    }

    if (showTableOptionsDropdown) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showTableOptionsDropdown])

  // Initialize data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Check if user is admin
        setIsAdmin(user?.role === "admin")
        
        // Fetch deliveries data - using configurable endpoint
        const response = await fetch(`${API_URL}${API_ENDPOINTS.getData}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email: user?.email })
        })

        if (response.ok) {
          const result = await response.json()
          const processedData = result.data.map((item, index) => ({
            ...item,
            id: item.id || `DEL-${String(index + 1).padStart(3, '0')}`,
            quantity: Number(item.quantity) || 0
          }))
          setDeliveries(processedData)
          setFilteredDeliveries(processedData)
        } else {
          // Fallback to demo data if API fails
          const demoData = [
            {
              id: 'DEL-001',
              orderId: 'ORD-001',
              customer: 'Tech Industries Inc.',
              product: 'Electronic Components',
              quantity: 500,
              deliveryAddress: '123 Tech Street, Silicon Valley, CA',
              scheduledDate: '2025-08-01',
              actualDate: null,
              driver: 'Mike Johnson',
              vehicleNo: 'TRK-001',
              status: 'In Transit',
              trackingNumber: 'TRK123456789',
              priority: 'High',
              _id: 'demo-1'
            },
            {
              id: 'DEL-002',
              orderId: 'ORD-002',
              customer: 'Manufacturing Corp',
              product: 'Steel Sheets',
              quantity: 200,
              deliveryAddress: '456 Industrial Blvd, Detroit, MI',
              scheduledDate: '2025-07-30',
              actualDate: null,
              driver: 'Sarah Wilson',
              vehicleNo: 'TRK-002',
              status: 'Scheduled',
              trackingNumber: 'TRK123456790',
              priority: 'Medium',
              _id: 'demo-2'
            },
            {
              id: 'DEL-003',
              orderId: 'ORD-003',
              customer: 'Auto Parts Ltd',
              product: 'Aluminum Rods',
              quantity: 300,
              deliveryAddress: '789 Auto Lane, Houston, TX',
              scheduledDate: '2025-07-28',
              actualDate: '2025-07-28',
              driver: 'John Davis',
              vehicleNo: 'TRK-003',
              status: 'Delivered',
              trackingNumber: 'TRK123456791',
              priority: 'Low',
              _id: 'demo-3'
            }
          ]
          setDeliveries(demoData)
          setFilteredDeliveries(demoData)
        }

        // Fetch headers configuration - using configurable endpoint
        try {
          const headerResponse = await fetch(
            `${API_URL}${API_ENDPOINTS.headers}?email=${user?.email}`,
            { credentials: 'include' }
          )
          
          if (headerResponse.ok) {
            const headerResult = await headerResponse.json()
            if (headerResult.headers) {
              setTableHeaders(headerResult.headers)
            }
          } else {
            // Fallback to localStorage or default
            const savedHeaders = localStorage.getItem('customerDeliveryHeaders')
            if (savedHeaders) {
              setTableHeaders(JSON.parse(savedHeaders))
            }
          }
        } catch (headerError) {
          console.error("Error fetching table headers:", headerError)
        }

      } catch (error) {
        console.error("Error fetching data:", error)
        showToast("Error fetching data", "error")
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.email) {
      fetchData()
    } else {
      setIsLoading(false)
    }
  }, [])

  // Save header configuration
  useEffect(() => {
    localStorage.setItem('customerDeliveryHeaders', JSON.stringify(tableHeaders))
  }, [tableHeaders])

  // Filter deliveries based on search and tab
  useEffect(() => {
    let filtered = deliveries

    // Apply tab filter
    if (currentTab !== 'all') {
      const statusMap = {
        'scheduled': 'Scheduled',
        'in-transit': 'In Transit',
        'delivered': 'Delivered'
      }
      filtered = filtered.filter(delivery => 
        delivery.status?.toLowerCase() === statusMap[currentTab]?.toLowerCase()
      )
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(delivery => {
        if (filterColumn === 'All') {
          return tableHeaders.some(header => {
            if (!header.visible) return false
            const value = delivery[header.id] || ""
            return value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          })
        } else {
          const header = tableHeaders.find(h => h.label === filterColumn)
          if (header) {
            const value = delivery[header.id] || ""
            return value.toString().toLowerCase().includes(searchTerm.toLowerCase())
          }
        }
        return false
      })
    }

    setFilteredDeliveries(filtered)
  }, [searchTerm, currentTab, deliveries, filterColumn, tableHeaders])

  // Utility functions
  const showToast = (message, type = "info") => {
    // Simple toast implementation
    const toast = document.createElement('div')
    toast.className = `fixed top-4 right-4 p-4 rounded-md z-50 ${
      type === 'error' ? 'bg-red-500 text-white' : 
      type === 'success' ? 'bg-green-500 text-white' : 
      'bg-blue-500 text-white'
    }`
    toast.textContent = message
    document.body.appendChild(toast)
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 3000)
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in transit': return 'bg-yellow-100 text-yellow-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'delayed': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // CRUD operations
  const handleAdd = () => {
    setEditingDelivery(null)
    setFormData({
      orderId: '',
      customer: '',
      product: '',
      quantity: '',
      deliveryAddress: '',
      scheduledDate: '',
      actualDate: '',
      driver: '',
      vehicleNo: '',
      trackingNumber: '',
      priority: 'Medium',
      status: 'Scheduled'
    })
    setShowModal(true)
  }

  const handleEdit = (delivery) => {
    setEditingDelivery(delivery)
    setFormData({
      orderId: delivery.orderId || '',
      customer: delivery.customer || '',
      product: delivery.product || '',
      quantity: delivery.quantity || '',
      deliveryAddress: delivery.deliveryAddress || '',
      scheduledDate: delivery.scheduledDate || '',
      actualDate: delivery.actualDate || '',
      driver: delivery.driver || '',
      vehicleNo: delivery.vehicleNo || '',
      trackingNumber: delivery.trackingNumber || '',
      priority: delivery.priority || 'Medium',
      status: delivery.status || 'Scheduled'
    })
    setShowModal(true)
  }

  const handleView = (delivery) => {
    setSelectedDelivery(delivery)
    setShowViewModal(true)
  }

  const handleDelete = (delivery) => {
    setDeliveryToDelete(delivery)
    setShowDeleteDialog(true)
  }

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.orderId.trim() || !formData.customer.trim() || !formData.product.trim()) {
        showToast("Please fill in all required fields", "error")
        return
      }

      const deliveryData = {
        ...formData,
        quantity: Number(formData.quantity) || 0,
        user: user?.email
      }

      if (editingDelivery) {
        // Update existing delivery
        const mongoDbId = editingDelivery._id
        
        // Update UI immediately
        const updatedDeliveries = deliveries.map(d =>
          d.id === editingDelivery.id ? { ...d, ...deliveryData, updatedAt: new Date(), updatedBy: user?.email } : d
        )
        setDeliveries(updatedDeliveries)

        // Call backend API - using configurable endpoint
        try {
          const response = await fetch(`${API_URL}${API_ENDPOINTS.update}/${mongoDbId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              data: deliveryData,
              user: user?.email
            })
          })

          if (response.ok) {
            showToast("Delivery updated successfully", "success")
          } else {
            showToast("Warning: Local update only - couldn't save to database", "error")
          }
        } catch (updateError) {
          console.error("Backend update error:", updateError)
          showToast("Warning: Local update only", "error")
        }
      } else {
        // Add new delivery - using configurable endpoint
        try {
          const response = await fetch(`${API_URL}${API_ENDPOINTS.add}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify([deliveryData, { user: user?.email }])
          })

          if (response.ok) {
            const result = await response.json()
            const newDelivery = {
              ...deliveryData,
              id: `DEL-${String(deliveries.length + 1).padStart(3, '0')}`,
              _id: result.data._id,
              createdAt: new Date()
            }
            setDeliveries([...deliveries, newDelivery])
            showToast("Delivery added successfully", "success")
          } else {
            // Fallback to local only
            const newDelivery = {
              ...deliveryData,
              id: `DEL-${String(deliveries.length + 1).padStart(3, '0')}`,
              _id: `local-${Date.now()}`,
              createdAt: new Date()
            }
            setDeliveries([...deliveries, newDelivery])
            showToast("Delivery added locally (not saved to server)", "error")
          }
        } catch (addError) {
          console.error("Error adding delivery:", addError)
          showToast("Error adding delivery", "error")
          return
        }
      }

      setShowModal(false)
      setEditingDelivery(null)
    } catch (error) {
      console.error("Error saving delivery:", error)
      showToast("Error saving delivery", "error")
    }
  }

  const confirmDelete = async () => {
    try {
      const mongoDbId = deliveryToDelete._id

      // Update UI immediately
      const updatedDeliveries = deliveries.filter(d => d._id !== mongoDbId)
      setDeliveries(updatedDeliveries)

      // Call backend API - using configurable endpoint
      try {
        const response = await fetch(`${API_URL}${API_ENDPOINTS.delete}/${mongoDbId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ user: user?.email })
        })

        if (response.ok) {
          showToast("Delivery deleted successfully", "success")
        } else {
          showToast("Warning: Deleted locally only", "error")
        }
      } catch (deleteError) {
        console.error("Backend delete error:", deleteError)
        showToast("Warning: Deleted locally only", "error")
      }

    } catch (error) {
      console.error("Error deleting delivery:", error)
      showToast("Error deleting delivery", "error")
    } finally {
      setShowDeleteDialog(false)
      setDeliveryToDelete(null)
    }
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
    try {
      const response = await fetch(`${API_URL}/api/table-headers/update-customer-delivery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          headers: tempHeaders,
          email: user?.email,
          isGlobal: isAdmin
        })
      })

      if (response.ok) {
        setTableHeaders(tempHeaders)
        setShowHeaderModal(false)
        showToast(isAdmin ? "Global header settings saved!" : "Header settings saved!", "success")
      } else {
        showToast("Failed to save header settings", "error")
      }
    } catch (error) {
      console.error("Error saving header changes:", error)
      showToast("Error saving header settings", "error")
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
      showToast("Header ID and Label are required", "error")
      return
    }
    
    const newHeader = {
      id: newHeaderInfo.id,
      label: newHeaderInfo.label,
      visible: true
    }
    
    setTempHeaders([...tempHeaders, newHeader])
    setShowAddHeaderModal(false)
    setNewHeaderInfo({ id: "", label: "", visible: true })
  }

  const resetHeadersToDefault = () => {
    setTempHeaders([...DEFAULT_HEADERS])
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Delivery Management</h1>
          <p className="text-gray-600">Manage and track customer deliveries</p>
        </div>
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <div className="relative table-options-dropdown">
              <button 
                onClick={() => setShowTableOptionsDropdown(!showTableOptionsDropdown)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" />
                <span>Table Options</span>
              </button>
              {showTableOptionsDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                  <button
                    onClick={() => {
                      openHeaderModal()
                      setShowTableOptionsDropdown(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Manage Columns
                  </button>
                </div>
              )}
            </div>
          )}
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Delivery</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Controls */}
        <div className="p-6 border-b">
          {/* Tabs */}
          <div className="flex items-center space-x-6 mb-4">
            {TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setCurrentTab(tab.value)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentTab === tab.value
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search deliveries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={filterColumn}
                onChange={(e) => setFilterColumn(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Columns</option>
                {tableHeaders.filter(header => header.visible).map(header => (
                  <option key={header.id} value={header.label}>{header.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterColumn('All')
                  setCurrentTab('all')
                }}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  {tableHeaders
                    .filter(header => header.visible)
                    .map(header => (
                      <td key={header.id} className="px-6 py-4 whitespace-nowrap">
                        {header.id === 'actions' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleView(delivery)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(delivery)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(delivery)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : header.id === 'status' ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(delivery[header.id])}`}>
                            {delivery[header.id]}
                          </span>
                        ) : header.id === 'priority' ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(delivery[header.id])}`}>
                            {delivery[header.id]}
                          </span>
                        ) : header.id === 'deliveryAddress' ? (
                          <div className="flex items-center text-sm text-gray-900 max-w-xs">
                            <MapPin className="w-4 h-4 mr-1 text-gray-400 flex-shrink-0" />
                            <div className="truncate" title={delivery[header.id]}>
                              {delivery[header.id]}
                            </div>
                          </div>
                        ) : header.id === 'scheduledDate' || header.id === 'actualDate' ? (
                          <div className="flex items-center text-sm text-gray-900">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            <div>
                              {delivery[header.id] || 'N/A'}
                            </div>
                          </div>
                        ) : header.id === 'trackingNumber' ? (
                          <div className="text-sm font-mono text-gray-900">
                            {delivery[header.id]}
                          </div>
                        ) : header.id === 'customer' ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">{delivery.customer}</div>
                            {delivery.quantity && (
                              <div className="text-sm text-gray-500">Qty: {delivery.quantity}</div>
                            )}
                          </div>
                        ) : header.id === 'driver' && delivery.vehicleNo ? (
                          <div>
                            <div className="text-sm text-gray-900">{delivery.driver}</div>
                            <div className="text-sm text-gray-500">{delivery.vehicleNo}</div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-900">
                            {delivery[header.id] || ''}
                          </div>
                        )}
                      </td>
                    ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-3 border-t flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {filteredDeliveries.length} of {deliveries.length} deliveries
          </div>
          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">Page {currentPage}</span>
            <button
              disabled
              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">
                {editingDelivery ? 'Edit Delivery' : 'Add New Delivery'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ORD-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Customer Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Product Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address
                </label>
                <textarea
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Complete delivery address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Date
                </label>
                <input
                  type="date"
                  value={formData.actualDate}
                  onChange={(e) => setFormData({ ...formData, actualDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver
                </label>
                <input
                  type="text"
                  value={formData.driver}
                  onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Driver Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  value={formData.vehicleNo}
                  onChange={(e) => setFormData({ ...formData, vehicleNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="TRK-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={formData.trackingNumber}
                  onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="TRK123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
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
                {editingDelivery ? 'Update' : 'Add'} Delivery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedDelivery && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Delivery Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Delivery ID:</span>
                    <p className="text-sm text-gray-900">{selectedDelivery.id}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Order ID:</span>
                    <p className="text-sm text-blue-600 font-medium">{selectedDelivery.orderId}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Customer:</span>
                    <p className="text-sm text-gray-900">{selectedDelivery.customer}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Product:</span>
                    <p className="text-sm text-gray-900">{selectedDelivery.product}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Quantity:</span>
                    <p className="text-sm text-gray-900">{selectedDelivery.quantity}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Tracking Number:</span>
                    <p className="text-sm font-mono text-gray-900">{selectedDelivery.trackingNumber}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Delivery Information</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Delivery Address:</span>
                    <p className="text-sm text-gray-900">{selectedDelivery.deliveryAddress}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Scheduled Date:</span>
                      <p className="text-sm text-gray-900">{selectedDelivery.scheduledDate}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Actual Date:</span>
                      <p className="text-sm text-gray-900">{selectedDelivery.actualDate || 'Not delivered yet'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Driver:</span>
                      <p className="text-sm text-gray-900">{selectedDelivery.driver}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Vehicle:</span>
                      <p className="text-sm text-gray-900">{selectedDelivery.vehicleNo}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500">Priority:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedDelivery.priority)}`}>
                        {selectedDelivery.priority}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedDelivery.status)}`}>
                        {selectedDelivery.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              {(selectedDelivery.createdAt || selectedDelivery.updatedAt) && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Record Information</h4>
                  <div className="space-y-2">
                    {selectedDelivery.createdAt && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Created:</span>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedDelivery.createdAt).toLocaleString()}
                          {selectedDelivery.user && ` by ${selectedDelivery.user}`}
                        </p>
                      </div>
                    )}
                    {selectedDelivery.updatedAt && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                        <p className="text-sm text-gray-900">
                          {new Date(selectedDelivery.updatedAt).toLocaleString()}
                          {selectedDelivery.updatedBy && ` by ${selectedDelivery.updatedBy}`}
                        </p>
                      </div>
                    )}
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

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Delivery</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this delivery record? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                ref={cancelRef}
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Management Modal */}
      {showHeaderModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Manage Table Columns</h3>
              <button
                onClick={() => setShowHeaderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">Configure which columns are visible and their order</p>
              <div className="flex space-x-2">
                {isAdmin && (
                  <button
                    onClick={handleAddHeader}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Add Column
                  </button>
                )}
                <button
                  onClick={resetHeadersToDefault}
                  className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                >
                  Reset to Default
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tempHeaders.map((header, index) => (
                <div
                  key={header.id}
                  className={`flex items-center justify-between p-3 border rounded-md ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center flex-1">
                    <div className="w-6 h-6 mr-3 cursor-grab">
                      <MenuIcon className="w-4 h-4" />
                    </div>
                    
                    {editingHeader === index ? (
                      <div className="flex items-center space-x-2 flex-1">
                        <input
                          value={newHeaderName}
                          onChange={(e) => setNewHeaderName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveHeaderLabel()}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <button
                          onClick={saveHeaderLabel}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingHeader(null)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="flex-1 text-sm font-medium">{header.label}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditHeaderLabel(index)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Edit Label"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    {isAdmin && (
                      <button
                        onClick={() => deleteHeader(index)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete Column"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="flex">
                      <button
                        onClick={() => moveHeader(index, -1)}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-25"
                        title="Move Up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveHeader(index, 1)}
                        disabled={index === tempHeaders.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-25"
                        title="Move Down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={header.visible}
                        onChange={() => handleHeaderVisibilityChange(index)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${
                        header.visible ? 'bg-blue-600' : 'bg-gray-300'
                      }`}>
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                          header.visible ? 'translate-x-5' : 'translate-x-1'
                        }`} />
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
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
      {showAddHeaderModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
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
                  onChange={(e) => setNewHeaderInfo({ ...newHeaderInfo, id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. contactPerson (camelCase)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Column Label <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newHeaderInfo.label}
                  onChange={(e) => setNewHeaderInfo({ ...newHeaderInfo, label: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Contact Person"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
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