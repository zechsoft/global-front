import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Plus, Search, Filter, Edit, Trash2, Eye, Settings, Menu, ChevronUp, ChevronDown } from 'lucide-react'

// Default table headers configuration
const DEFAULT_HEADERS = [
  { id: "customerNumber", label: "Customer Number", visible: true },
  { id: "customer", label: "Customer", visible: true },
  { id: "buyer", label: "Buyer", visible: true },
  { id: "platformNo", label: "Platform No", visible: true },
  { id: "poNo", label: "PO No", visible: true },
  { id: "purchaseDate", label: "Purchase Date", visible: true },
  { id: "orderAmount", label: "Order Amount", visible: true },
  { id: "currency", label: "Currency", visible: true },
  { id: "purchasingDepartment", label: "Purchasing Department", visible: true },
  { id: "purchaser", label: "Purchaser", visible: true },
  { id: "requisitionBusinessGroup", label: "Requisition Business Group", visible: true },
  { id: "deliveryStatus", label: "Delivery Status", visible: true },
  { id: "orderStatus", label: "Order Status", visible: true },
  { id: "acceptanceStatus", label: "Acceptance Status", visible: true },
  { id: "statementStatus", label: "Statement Status", visible: true },
]

// Status badge styling helper
const getStatusBadge = (status) => {
  let colorClass
  switch (status) {
    case "Complete":
    case "Completed":
    case "Delivered":
    case "Accepted":
      colorClass = "bg-green-100 text-green-800"
      break
    case "Pending":
      colorClass = "bg-yellow-100 text-yellow-800"
      break
    case "Cancelled":
    case "Rejected":
      colorClass = "bg-red-100 text-red-800"
      break
    case "In Transit":
    case "Processing":
      colorClass = "bg-blue-100 text-blue-800"
      break
    case "Delayed":
      colorClass = "bg-orange-100 text-orange-800"
      break
    case "New":
      colorClass = "bg-purple-100 text-purple-800"
      break
    default:
      colorClass = "bg-gray-100 text-gray-800"
  }
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
      {status}
    </span>
  )
}

export default function CustomerOrder() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [tableData, setTableData] = useState([])
  const [tableHeaders, setTableHeaders] = useState(DEFAULT_HEADERS)
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false)
  const [tempHeaders, setTempHeaders] = useState([])
  const [editingHeader, setEditingHeader] = useState(null)
  const [newHeaderName, setNewHeaderName] = useState("")
  const [newHeaderInfo, setNewHeaderInfo] = useState({
    id: "",
    label: "",
    visible: true,
  })
  const [isAddHeaderModalOpen, setIsAddHeaderModalOpen] = useState(false)
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [country, setCountry] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [rowToDelete, setRowToDelete] = useState(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedRowDetails, setSelectedRowDetails] = useState(null)
  const [newRow, setNewRow] = useState({
    customerNumber: "",
    customer: "",
    buyer: "",
    platformNo: "",
    poNo: "",
    purchaseDate: "",
    orderAmount: "",
    currency: "",
    purchasingDepartment: "",
    purchaser: "",
    requisitionBusinessGroup: "",
    deliveryStatus: "Pending",
    orderStatus: "Processing",
    acceptanceStatus: "Pending",
    statementStatus: "Pending",
  })
  const [selectedRowId, setSelectedRowId] = useState(null)
  const [showTableOptionsMenu, setShowTableOptionsMenu] = useState(false)
  const [notification, setNotification] = useState(null)

  const searchInputRef = useRef(null)
  const [isFocused, setIsFocused] = useState(false)

  // API base URL
  const API_BASE_URL = "http://localhost:8000"

  const showNotification = (title, description, status) => {
    setNotification({ title, description, status })
    setTimeout(() => setNotification(null), 3000)
  }

  // Helper function to handle API calls with proper error handling
  const makeApiCall = async (url, options) => {
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (parseError) {
          console.error('Error parsing error response:', parseError)
        }
        throw new Error(errorMessage)
      }

      return await response.json()
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Please check your internet connection.')
      }
      throw error
    }
  }


  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !user.email) {
          console.error("User data is missing")
          showNotification("Authentication required", "Please login to access this data", "error")
          return
        }

        const data = await makeApiCall(`${API_BASE_URL}/api/customer/get-data`, {
          method: 'POST',
          body: JSON.stringify({ email: user.email })
        })

        if (data && Array.isArray(data)) {
          const dataWithId = data.map(item => ({
            ...item,
            id: item._id
          }))
          setTableData(dataWithId)
          setFilteredData(dataWithId)
        } else {
          console.error("Invalid data format received from server")
          showNotification("Data error", "Received invalid data format from server", "error")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        showNotification("Error fetching data", error.message || "Failed to fetch data from server", "error")
      }
    }

    fetchData()
  }, [user])

useEffect(() => {
  fetchCustomerOrderHeaders()
}, [user])

  const handleViewDetails = (row) => {
    setSelectedRowDetails(row)
    setIsViewModalOpen(true)
  }

  const handleAddRow = () => {
    if (!user) {
      showNotification("Authentication required", "Please login to add data", "error")
      return
    }
    
    setIsModalOpen(true)
    setSelectedRowId(null)
    setNewRow({
      customerNumber: "",
      customer: "",
      buyer: "",
      platformNo: "",
      poNo: "",
      purchaseDate: "",
      orderAmount: "",
      currency: "",
      purchasingDepartment: "",
      purchaser: "",
      requisitionBusinessGroup: "",
      deliveryStatus: "Pending",
      orderStatus: "Processing",
      acceptanceStatus: "Pending",
      statementStatus: "Pending",
    })
  }

  const handleEditRow = (rowId) => {
    if (!user) {
      showNotification("Authentication required", "Please login to edit data", "error")
      return
    }
    
    const selectedRow = tableData.find((row) => row.id === rowId || row._id === rowId)
    if (selectedRow) {
      setNewRow({
        ...selectedRow,
        deliveryStatus: selectedRow.deliveryStatus || "Pending",
        orderStatus: selectedRow.orderStatus || "Processing",
        acceptanceStatus: selectedRow.acceptanceStatus || "Pending",
        statementStatus: selectedRow.statementStatus || "Pending"
      })
      setSelectedRowId(rowId)
      setIsModalOpen(true)
    }
  }
  const fetchCustomerOrderHeaders = async () => {
  try {
    if (!user?.email) {
      console.warn("No user email found, cannot fetch personalized headers")
      const savedHeaders = localStorage.getItem('customerOrderTableHeaders')
      if (savedHeaders) {
        setTableHeaders(JSON.parse(savedHeaders))
      } else {
        setTableHeaders(DEFAULT_HEADERS)
      }
      return
    }
    
    const headerResponse = await fetch(
      `${API_BASE_URL}/api/table-headers/get-customer-order?email=${user.email}`, 
      { credentials: 'include' }
    )
    
    if (headerResponse.ok) {
      const data = await headerResponse.json()
      if (data.headers) {
        setTableHeaders(data.headers)
        localStorage.setItem('customerOrderTableHeaders', JSON.stringify(data.headers))
      } else {
        const savedHeaders = localStorage.getItem('customerOrderTableHeaders')
        if (savedHeaders) {
          setTableHeaders(JSON.parse(savedHeaders))
        } else {
          setTableHeaders(DEFAULT_HEADERS)
        }
      }
    }
  } catch (error) {
    console.error("Error fetching customer order table headers:", error)
    const savedHeaders = localStorage.getItem('customerOrderTableHeaders')
    if (savedHeaders) {
      try {
        setTableHeaders(JSON.parse(savedHeaders))
      } catch (e) {
        console.error("Error loading saved headers:", e)
        setTableHeaders(DEFAULT_HEADERS)
      }
    } else {
      setTableHeaders(DEFAULT_HEADERS)
    }
  }
}


  const handleDeleteRow = (rowId) => {
    setRowToDelete(rowId)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveRow = async () => {
    try {
      if (!user || !user.email) {
        throw new Error("User authentication required")
      }

      const validatedNewRow = {
        ...newRow,
        deliveryStatus: newRow.deliveryStatus || "Pending",
        orderStatus: newRow.orderStatus || "Processing",
        acceptanceStatus: newRow.acceptanceStatus || "Pending",
        statementStatus: newRow.statementStatus || "Pending"
      }

      if (selectedRowId) {
        // Update existing row
        const updatedRow = { ...validatedNewRow, id: selectedRowId }
        
        await makeApiCall(`${API_BASE_URL}/api/customer/update-data`, {
          method: 'POST',
          body: JSON.stringify({ data: updatedRow, email: user.email })
        })
        
        showNotification("Row updated successfully", "", "success")
      } else {
        // Add new row
        const dataToSend = [
          {
            customerNumber: validatedNewRow.customerNumber,
            customer: validatedNewRow.customer,
            buyer: validatedNewRow.buyer,
            platformNo: validatedNewRow.platformNo,
            poNo: validatedNewRow.poNo,
            purchaseDate: validatedNewRow.purchaseDate,
            orderAmount: validatedNewRow.orderAmount,
            currency: validatedNewRow.currency,
            purchasingDepartment: validatedNewRow.purchasingDepartment,
            purchaser: validatedNewRow.purchaser,
            requisitionBusinessGroup: validatedNewRow.requisitionBusinessGroup,
            deliveryStatus: validatedNewRow.deliveryStatus,
            orderStatus: validatedNewRow.orderStatus,
            acceptanceStatus: validatedNewRow.acceptanceStatus,
            statementStatus: validatedNewRow.statementStatus,
          },
          { user: user.email }
        ]
        
        await makeApiCall(`${API_BASE_URL}/api/customer/add-data`, {
          method: 'POST',
          body: JSON.stringify(dataToSend)
        })
        
        showNotification("Row added successfully", "", "success")
      }

      // Refresh data after operation
      const data = await makeApiCall(`${API_BASE_URL}/api/customer/get-data`, {
        method: 'POST',
        body: JSON.stringify({ email: user.email })
      })
      
      const dataWithId = data.map(item => ({
        ...item,
        id: item._id
      }))
      
      setTableData(dataWithId)
      setFilteredData(dataWithId)

    } catch(err) {
      console.error("Error saving data:", err)
      showNotification("Error saving data", err.message || "Failed to save data", "error")
    } finally {
      setIsModalOpen(false)
      setNewRow({
        customerNumber: "",
        customer: "",
        buyer: "",
        platformNo: "",
        poNo: "",
        purchaseDate: "",
        orderAmount: "",
        currency: "",
        purchasingDepartment: "",
        purchaser: "",
        requisitionBusinessGroup: "",
        deliveryStatus: "Pending",
        orderStatus: "Processing",
        acceptanceStatus: "Pending",
        statementStatus: "Pending",
      })
      setSelectedRowId(null)
    }
  }

  const confirmDelete = async () => {
    try {
      const rowToDeleteItem = tableData.find(row => row.id === rowToDelete || row._id === rowToDelete)
      
      if (!rowToDeleteItem) {
        throw new Error("Row not found")
      }
      
      const mongoId = rowToDeleteItem._id || rowToDeleteItem.id
      
      await makeApiCall(`${API_BASE_URL}/api/customer/delete-data`, {
        method: 'POST',
        body: JSON.stringify({ id: mongoId, email: user.email })
      })
      
      // Refresh data after delete
      const data = await makeApiCall(`${API_BASE_URL}/api/customer/get-data`, {
        method: 'POST',
        body: JSON.stringify({ email: user.email })
      })
      
      if (data && Array.isArray(data)) {
        const dataWithId = data.map(item => ({
          ...item,
          id: item._id
        }))
        setTableData(dataWithId)
        setFilteredData(dataWithId)
      }
      
      showNotification("Row deleted successfully", "", "success")
    } catch (error) {
      console.error("Error deleting row:", error)
      showNotification("Error deleting row", error.message || "Failed to delete row", "error")
    } finally {
      setIsDeleteDialogOpen(false)
      setRowToDelete(null)
    }
  }

  const filterRow = (row) => {
    if (searchTerm === "") return true
    
    if (country === "All") {
      return tableHeaders.some(header => {
        if (!header.visible) return false
        const value = row[header.id] || ""
        
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase())
        } else {
          return value.toString().includes(searchTerm)
        }
      })
    } else {
      const header = tableHeaders.find(h => h.label === country)
      if (!header) return true
      
      const value = row[header.id] || ""
      
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase())
      } else {
        return value.toString().includes(searchTerm)
      }
    }
  }

  const handleSearch = () => {
    const filtered = tableData.filter(filterRow)
    setFilteredData(filtered)
  }

  const handleClear = () => {
    setSearchTerm("")
    setCountry("All")
    setFilteredData(tableData)
  }

  const openHeaderModal = () => {
    setTempHeaders([...tableHeaders])
    setIsHeaderModalOpen(true)
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
    if (!user?.email) {
      showNotification("User email not available", "", "error")
      return
    }
    
    const response = await fetch(`${API_BASE_URL}/api/table-headers/update-customer-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ 
        headers: tempHeaders,
        email: user.email,
        isGlobal: isAdmin
      })
    })
    
    if (response.ok) {
      setTableHeaders(tempHeaders)
      setIsHeaderModalOpen(false)
      localStorage.setItem('customerOrderTableHeaders', JSON.stringify(tempHeaders))
      showNotification(
        isAdmin ? "Customer Order headers updated globally" : "Your table headers have been updated", 
        isAdmin ? "All users will see your changes" : "", 
        "success"
      )
    } else {
      const errorData = await response.json()
      showNotification("Failed to update table headers", errorData.message || "Unknown error", "error")
    }
  } catch (error) {
    console.error("Error saving customer order header changes:", error)
    showNotification("Failed to update table headers", error.message || "Network error", "error")
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
    setIsAddHeaderModalOpen(true)
  }

  const saveNewHeader = () => {
    if (!newHeaderInfo.id || !newHeaderInfo.label) {
      showNotification("Missing information", "Header ID and Label are required", "error")
      return
    }
    
    const newHeader = {
      id: newHeaderInfo.id,
      label: newHeaderInfo.label,
      visible: true,
    }
    
    setTempHeaders([...tempHeaders, newHeader])
    setIsAddHeaderModalOpen(false)
    
    setNewHeaderInfo({
      id: "",
      label: "",
      visible: true,
    })
  }

  const resetHeadersToDefault = () => {
    setTempHeaders([...DEFAULT_HEADERS])
  }

  if (!user || (user?.role !== 'admin' && user?.role !== 'client')) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Access Denied</div>
        <p className="text-gray-400 mt-2">You don't have permission to view customer orders.</p>
      </div>
    )
  }

  return (
    <div className="mt-16">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          notification.status === 'success' ? 'bg-green-100 text-green-800' :
          notification.status === 'error' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          <div className="font-semibold">{notification.title}</div>
          {notification.description && <div className="text-sm">{notification.description}</div>}
        </div>
      )}

      <div className="bg-white p-6 shadow-md rounded-2xl w-full">
        <div className="flex justify-between mb-8">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold">Customer Orders</h1>
            <p className="text-gray-400">Manage Customer Orders</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
              View All
            </button>
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setShowTableOptionsMenu(!showTableOptionsMenu)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Table Options</span>
                </button>
                {showTableOptionsMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                    <button
                      onClick={() => {
                        openHeaderModal()
                        setShowTableOptionsMenu(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Manage Columns
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={handleAddRow}
              className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Row</span>
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 flex-col md:flex-row gap-4">
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm border-b-2 border-blue-500 text-blue-600">All</button>
            <button className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Monitored</button>
            <button className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Unmonitored</button>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All</option>
              {tableHeaders.filter(header => header.visible).map(header => (
                <option key={header.id} value={header.label}>{header.label}</option>
              ))}
            </select>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search here"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
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

        <div className="overflow-x-auto overflow-y-auto max-h-96">
          <table className="w-full border-collapse rounded-lg overflow-hidden">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {tableHeaders
                  .filter(header => header.visible)
                  .map(header => (
                    <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {header.label}
                    </th>
                  ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((row) => (
                <tr key={row._id || row.id}>
                  {tableHeaders
                    .filter(header => header.visible)
                    .map(header => {
                      const value = row[header.id] || ""

                      if (header.id === "deliveryStatus" || header.id === "orderStatus" || 
                          header.id === "acceptanceStatus" || header.id === "statementStatus") {
                        return (
                          <td key={header.id} className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(value)}
                          </td>
                        )
                      }
                      
                      if (header.id === "purchaseDate" && value) {
                        return (
                          <td key={header.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(value).toLocaleDateString()}
                          </td>
                        )
                      }
                      
                      if (header.id === "orderAmount" && value) {
                        return (
                          <td key={header.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                            {Number(value).toLocaleString(undefined, {
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2
                            })}
                          </td>
                        )
                      }
                      
                      return (
                        <td key={header.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {value || "-"}
                        </td>
                      )
                    })}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetails(row)}
                        className="text-gray-600 hover:text-gray-800"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditRow(row._id || row.id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteRow(row._id || row.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4">
          <p className="text-sm">Page {currentPage} of 1</p>
          <div className="flex">
            <button
              className="px-4 py-2 text-sm border border-gray-300 rounded-md mr-2 hover:bg-gray-50 disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            >
              Previous
            </button>
            <button
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              disabled
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">
              {selectedRowId ? 'Edit Customer Order' : 'Add New Customer Order'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Number</label>
                <input
                  type="text"
                  value={newRow.customerNumber || ""}
                  onChange={(e) => setNewRow({ ...newRow, customerNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <input
                  type="text"
                  value={newRow.customer || ""}
                  onChange={(e) => setNewRow({ ...newRow, customer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buyer</label>
                <input
                  type="text"
                  value={newRow.buyer || ""}
                  onChange={(e) => setNewRow({ ...newRow, buyer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform No</label>
                <input
                  type="text"
                  value={newRow.platformNo || ""}
                  onChange={(e) => setNewRow({ ...newRow, platformNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO No</label>
                <input
                  type="text"
                  value={newRow.poNo || ""}
                  onChange={(e) => setNewRow({ ...newRow, poNo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={newRow.purchaseDate || ""}
                  onChange={(e) => setNewRow({ ...newRow, purchaseDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Amount</label>
                <input
                  type="number"
                  value={newRow.orderAmount || ""}
                  onChange={(e) => setNewRow({ ...newRow, orderAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input
                  type="text"
                  value={newRow.currency || ""}
                  onChange={(e) => setNewRow({ ...newRow, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchasing Department</label>
                <input
                  type="text"
                  value={newRow.purchasingDepartment || ""}
                  onChange={(e) => setNewRow({ ...newRow, purchasingDepartment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purchaser</label>
                <input
                  type="text"
                  value={newRow.purchaser || ""}
                  onChange={(e) => setNewRow({ ...newRow, purchaser: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requisition Business Group</label>
                <input
                  type="text"
                  value={newRow.requisitionBusinessGroup || ""}
                  onChange={(e) => setNewRow({ ...newRow, requisitionBusinessGroup: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Status</label>
                <select
                  value={newRow.deliveryStatus || "Pending"}
                  onChange={(e) => setNewRow({ ...newRow, deliveryStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Complete">Complete</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                <select
                  value={newRow.orderStatus || "Processing"}
                  onChange={(e) => setNewRow({ ...newRow, orderStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Processing">Processing</option>
                  <option value="Fulfilled">Fulfilled</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="New">New</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acceptance Status</label>
                <select
                  value={newRow.acceptanceStatus || "Pending"}
                  onChange={(e) => setNewRow({ ...newRow, acceptanceStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statement Status</label>
                <input
                  type="text"
                  value={newRow.statementStatus || "Pending"}
                  onChange={(e) => setNewRow({ ...newRow, statementStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRow}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {selectedRowId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Customer Order Details</h3>
            
            {selectedRowDetails && (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-bold mb-2">Entry Information</h4>
                  <div className="flex">
                    <span className="font-semibold w-24">Created by:</span>
                    <span>{selectedRowDetails.user || "Unknown"}</span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-24">Created on:</span>
                    <span>
                      {selectedRowDetails.createdAt 
                        ? new Date(selectedRowDetails.createdAt).toLocaleString() 
                        : "Unknown date"}
                    </span>
                  </div>
                </div>
                
                {selectedRowDetails.updatedAt && selectedRowDetails.updatedBy && (
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h4 className="font-bold mb-2">Last Update</h4>
                    <div className="flex">
                      <span className="font-semibold w-24">Updated by:</span>
                      <span>{selectedRowDetails.updatedBy}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-24">Updated on:</span>
                      <span>{new Date(selectedRowDetails.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Delete Customer Order</h3>
            <p className="mb-6">Are you sure you want to delete this customer order? This action cannot be undone.</p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
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

      {/* Table Header Management Modal */}
      {isHeaderModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-96 overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Manage Table Columns</h3>
            
            <div className="flex justify-between mb-4">
              <p>Configure which columns are visible and their order</p>
              <div className="flex gap-2">
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
                  className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                >
                  Reset to Default
                </button>
              </div>
            </div>
            
            <div className="max-h-64 overflow-auto">
              {tempHeaders.map((header, index) => (
                <div 
                  key={header.id} 
                  className={`flex items-center p-3 border rounded-md mb-2 ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <div className="flex flex-1 items-center">
                    <Menu className="w-4 h-4 mr-2 cursor-grab" />
                    
                    {editingHeader === index ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <input 
                          value={newHeaderName} 
                          onChange={(e) => setNewHeaderName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && saveHeaderLabel()}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <button 
                          onClick={saveHeaderLabel}
                          className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <span className="flex-1">{header.label}</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditHeaderLabel(index)}
                      className="p-1 text-gray-600 hover:text-gray-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    {isAdmin ? (
                      <button
                        onClick={() => deleteHeader(index)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        disabled={true}
                        title="Only admins can delete columns"
                        className="p-1 text-gray-400 cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <div className="flex items-center justify-center w-20">
                      <button
                        onClick={() => moveHeader(index, -1)}
                        disabled={index === 0}
                        className="p-1 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveHeader(index, 1)}
                        disabled={index === tempHeaders.length - 1}
                        className="p-1 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={header.visible}
                        onChange={() => handleHeaderVisibilityChange(index)}
                        className="form-checkbox h-4 w-4 text-blue-600"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setIsHeaderModalOpen(false)}
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
      {isAddHeaderModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Add New Column</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Column ID <span className="text-red-500">*</span></label>
                <input 
                  value={newHeaderInfo.id}
                  onChange={(e) => setNewHeaderInfo({...newHeaderInfo, id: e.target.value})}
                  placeholder="e.g. contactPerson (camelCase)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Column Label <span className="text-red-500">*</span></label>
                <input 
                  value={newHeaderInfo.label}
                  onChange={(e) => setNewHeaderInfo({...newHeaderInfo, label: e.target.value})}
                  placeholder="e.g. Contact Person"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setIsAddHeaderModalOpen(false)}
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