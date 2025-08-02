import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Package, 
  ShoppingCart, 
  HelpCircle, 
  RefreshCw, 
  Truck, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Loader
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  // Backend API URL
  const API_URL = "http://localhost:8000/api"

  // State management
  const [currentDate, setCurrentDate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [dashboardTableData, setDashboardTableData] = useState({
    "Material Inquiry": [],
    "Supplier Information": [],
    "Customer Delivery": [],
    "Customer Order": [],
    "Material Replenishment": []
  })
  const [currentTable, setCurrentTable] = useState("Material Inquiry")
  const [allDailyWorkData, setAllDailyWorkData] = useState([])
  const [editModal, setEditModal] = useState({
    isOpen: false,
    data: null,
    tableName: ""
  })
  const [formData, setFormData] = useState({})

  // Get the correct base path based on user role
  const basePath = isAdmin ? '/admin' : '/client'

  // Memoized card items to prevent recreation on every render
  const cardItems = useMemo(() => [
    {
      title: 'Supplier Information',
      path: `${basePath}/supplier-info`,
      icon: Package,
      description: 'Tap here to view'
    },
    {
      title: 'Material Inquiry',
      path: `${basePath}/material-inquiry`,
      icon: HelpCircle,
      description: 'Tap here to view'
    },
    {
      title: 'Customer Delivery',
      path: `${basePath}/customer-delivery`,
      icon: Truck,
      description: 'Tap here to view'
    },
    {
      title: 'Customer Order',
      path: `${basePath}/customer-order`,
      icon: ShoppingCart,
      description: 'Tap here to view'
    },
    {
      title: 'Material Replenishment',
      path: `${basePath}/material-replenish`,
      icon: RefreshCw,
      description: 'Tap here to view'
    },
    {
      title: 'Daily Work Report',
      path: `${basePath}/daily-work`,
      icon: Calendar,
      description: 'Tap here to view'
    }
  ], [basePath])

  const tableNames = useMemo(() => [
    "Supplier Information",
    "Material Inquiry", 
    "Customer Delivery",
    "Customer Order",
    "Material Replenishment"
  ], [])

  // Sample fallback data - memoized to prevent recreation
  const sampleWorkData = useMemo(() => [
    {
      NatureofWork: 'Electronic Parts',
      Progress: 'Processing',
      HourofWork: '8',
      SupervisorName: 'John Smith',
      Date: '2025-05-22'
    },
    {
      NatureofWork: 'Aluminum Order',
      Progress: 'In Progress',
      HourofWork: '6',
      SupervisorName: 'Jane Doe',
      Date: '2025-05-22'
    }
  ], [])

  const sampleInquiryData = useMemo(() => [
    {
      project: 'Electronic Parts',
      status: 'Processing',
      date: '2025-05-22'
    },
    {
      project: 'Aluminum Order',
      status: 'In Progress',
      date: '2025-05-22'
    }
  ], [])

  // Memoized function to filter daily work data by date
  const filterDailyWorkByDate = useCallback((data, date) => {
    if (!data || !Array.isArray(data)) return []
    
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    
    return data.filter(item => {
      if (!item.Date && !item.date) return false
      const itemDate = new Date(item.Date || item.date)
      itemDate.setHours(0, 0, 0, 0)
      return itemDate.getTime() === targetDate.getTime()
    }).slice(0, 5)
  }, [])

  // Memoized filtered daily data
  const dailyData = useMemo(() => {
    return filterDailyWorkByDate(allDailyWorkData, currentDate)
  }, [allDailyWorkData, currentDate, filterDailyWorkByDate])

  // Memoized current table data
  const currentTableData = useMemo(() => {
    return dashboardTableData[currentTable] || []
  }, [dashboardTableData, currentTable])

  // Optimized data fetching with Promise.allSettled for parallel requests
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        
        // Use Promise.allSettled for parallel requests and better error handling
        const [dailyWorkResult, dashboardResult] = await Promise.allSettled([
          fetch(`${API_URL}/dailywork/get-all`).then(res => res.json()),
          fetch(`${API_URL}/dashboard-tables/get-all`).then(res => res.json())
        ])
        
        // Handle daily work data
        if (dailyWorkResult.status === 'fulfilled') {
          const dailyWorkData = dailyWorkResult.value
          if (dailyWorkData.success || dailyWorkData.data) {
            const workData = dailyWorkData.data || dailyWorkData
            setAllDailyWorkData(workData)
          } else {
            setAllDailyWorkData(sampleWorkData)
          }
        } else {
          console.warn("Daily work fetch failed:", dailyWorkResult.reason)
          setAllDailyWorkData(sampleWorkData)
        }
        
        // Handle dashboard table data
        if (dashboardResult.status === 'fulfilled') {
          const dashboardData = dashboardResult.value
          if (dashboardData.success) {
            setDashboardTableData(dashboardData.data)
          } else {
            setDashboardTableData(prev => ({
              ...prev,
              "Material Inquiry": sampleInquiryData
            }))
          }
        } else {
          console.warn("Dashboard tables fetch failed:", dashboardResult.reason)
          setDashboardTableData(prev => ({
            ...prev,
            "Material Inquiry": sampleInquiryData
          }))
        }
        
      } catch (error) {
        console.error("Error fetching data:", error)
        setAllDailyWorkData(sampleWorkData)
        setDashboardTableData(prev => ({
          ...prev,
          "Material Inquiry": sampleInquiryData
        }))
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [sampleWorkData, sampleInquiryData, API_URL])

  // Optimized date navigation functions
  const goToPreviousDate = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setDate(newDate.getDate() - 1) 
      return newDate
    })
  }, [])

  const goToNextDate = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate)
      newDate.setDate(newDate.getDate() + 1)
      return newDate
    })
  }, [])

  // Optimized table navigation functions
  const handlePrevTable = useCallback(() => {
    const currentIndex = tableNames.indexOf(currentTable)
    if (currentIndex > 0) {
      const newTable = tableNames[currentIndex - 1]
      setCurrentTable(newTable)
    }
  }, [currentTable, tableNames])

  const handleNextTable = useCallback(() => {
    const currentIndex = tableNames.indexOf(currentTable)
    if (currentIndex < tableNames.length - 1) {
      const newTable = tableNames[currentIndex + 1]
      setCurrentTable(newTable)
    }
  }, [currentTable, tableNames])

  // Optimized edit functionality
  const handleEdit = useCallback((item, tableName) => {
    setEditModal({
      isOpen: true,
      data: { ...item },
      tableName: tableName
    })
    setFormData({
      ...item,
      project: item.project || "",
      status: item.status || "Pending",
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : ""
    })
  }, [])

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSaveEdit = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard-tables/update/${formData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tableName: editModal.tableName,
          updatedBy: user?.username || user?.email || 'admin'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setDashboardTableData(prevData => {
          const updatedDashboardData = { ...prevData }
          const tableData = updatedDashboardData[editModal.tableName]
          const itemIndex = tableData.findIndex(item => item._id === formData._id)
          if (itemIndex !== -1) {
            tableData[itemIndex] = data.data
          }
          return updatedDashboardData
        })
        closeEditModal()
      }
    } catch (error) {
      console.error("Error updating data:", error)
      alert("Error updating data. Please try again.")
    }
  }, [formData, editModal.tableName, user, API_URL])

  const closeEditModal = useCallback(() => {
    setEditModal({ isOpen: false, data: null, tableName: "" })
    setFormData({})
  }, [])

  // Memoized helper values
  const isToday = useMemo(() => 
    currentDate.toLocaleDateString() === new Date().toLocaleDateString()
  , [currentDate])

  const formattedDate = useMemo(() => 
    currentDate.toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  , [currentDate])

  const getStatusBadgeColor = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'in progress':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }, [])

  // Loading state with better UX
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900">Loading dashboard...</p>
            <p className="text-sm text-gray-500">Please wait while we fetch your data</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-300 p-6 group hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  NEW ENTRY
                </p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <div className="bg-blue-600 text-white p-3 rounded-full group-hover:bg-blue-700 transition-colors">
                <item.icon className="w-6 h-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Work Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900">Daily Work</h2>
                <div className="flex items-center space-x-2 text-gray-500">
                  <button 
                    onClick={goToPreviousDate}
                    className="hover:text-gray-700 transition-colors"
                    aria-label="Previous day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm">{formattedDate}</span>
                  {!isToday && (
                    <button 
                      onClick={goToNextDate}
                      className="hover:text-gray-700 transition-colors"
                      aria-label="Next day"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <Link
                to={`${basePath}/daily-work`}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                SEE ALL
              </Link>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nature of Work
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hour of Work
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supervisor Name
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dailyData.length > 0 ? dailyData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.NatureofWork || row.natureOfWork || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.Progress || row.progress || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.HourofWork || row.hourOfWork || row.hours || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.SupervisorName || row.supervisorName || row.supervisor || 'N/A'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No work entries for this date
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{currentTable}</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={handlePrevTable}
                  disabled={tableNames.indexOf(currentTable) === 0}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button 
                  onClick={handleNextTable}
                  disabled={tableNames.indexOf(currentTable) === tableNames.length - 1}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentTableData.length > 0 ? currentTableData.map((row, index) => (
                  <tr key={row._id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.project || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(row.status)}`}>
                        {row.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          onClick={() => handleEdit(row, currentTable)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit entry"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={isAdmin ? "4" : "3"} className="px-6 py-4 text-center text-gray-500">
                      No data available for {currentTable}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal.isOpen && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Edit {editModal.tableName}
              </h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <input
                  type="text"
                  value={formData.project || ""}
                  onChange={(e) => handleInputChange("project", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter project name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status || "Pending"}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Active">Active</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date || ""}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={closeEditModal}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}