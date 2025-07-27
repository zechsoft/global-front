import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  Package, 
  ShoppingCart, 
  HelpCircle, 
  RefreshCw, 
  Truck, 
  Calendar,
  Eye,
  BarChart3
} from 'lucide-react'

export default function ViewTables() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'

  const tables = [
    {
      name: 'Supplier Information',
      path: '/supplier-info',
      viewPath: '/supplier-info-view',
      icon: Package,
      description: 'Manage supplier details, contacts, and categories',
      recordCount: 25,
      lastUpdated: '2025-07-25',
      adminOnly: false
    },
    {
      name: 'Customer Orders',
      path: '/customer-order',
      viewPath: '/customer-order-view',
      icon: ShoppingCart,
      description: 'Track customer orders, deliveries, and payments',
      recordCount: 142,
      lastUpdated: '2025-07-25',
      adminOnly: true
    },
    {
      name: 'Material Inquiry',
      path: '/material-inquiry',
      viewPath: '/material-inquiry-view',
      icon: HelpCircle,
      description: 'Material requests, inquiries, and procurement',
      recordCount: 38,
      lastUpdated: '2025-07-24',
      adminOnly: false
    },
    {
      name: 'Material Replenishment',
      path: '/material-replenish',
      viewPath: '/material-replenish-view',
      icon: RefreshCw,
      description: 'Stock replenishment requests and approvals',
      recordCount: 15,
      lastUpdated: '2025-07-23',
      adminOnly: true
    },
    {
      name: 'Customer Delivery',
      path: '/customer-delivery',
      viewPath: '/customer-delivery-view',
      icon: Truck,
      description: 'Delivery schedules, tracking, and status updates',
      recordCount: 89,
      lastUpdated: '2025-07-25',
      adminOnly: false
    },
    {
      name: 'Daily Work Report',
      path: '/daily-work',
      viewPath: '/daily-work-view',
      icon: Calendar,
      description: 'Daily work entries, hours, and progress tracking',
      recordCount: 67,
      lastUpdated: '2025-07-25',
      adminOnly: false
    }
  ]

  const availableTables = tables.filter(table => !table.adminOnly || isAdmin)

  const getStatusColor = (lastUpdated) => {
    const today = new Date().toISOString().split('T')[0]
    const updateDate = lastUpdated
    
    if (updateDate === today) {
      return 'bg-green-100 text-green-800'
    } else {
      const daysDiff = Math.floor((new Date(today) - new Date(updateDate)) / (1000 * 60 * 60 * 24))
      if (daysDiff <= 1) {
        return 'bg-yellow-100 text-yellow-800'
      } else {
        return 'bg-red-100 text-red-800'
      }
    }
  }

  const getStatusText = (lastUpdated) => {
    const today = new Date().toISOString().split('T')[0]
    const updateDate = lastUpdated
    
    if (updateDate === today) {
      return 'Updated Today'
    } else {
      const daysDiff = Math.floor((new Date(today) - new Date(updateDate)) / (1000 * 60 * 60 * 24))
      if (daysDiff === 1) {
        return 'Updated Yesterday'
      } else {
        return `${daysDiff} days ago`
      }
    }
  }

  const handleTableClick = (table) => {
    // Navigate to the view page for the specific table
    // Add the appropriate prefix based on user role
    const basePath = user?.role === 'admin' ? '/admin' : '/client';
    const fullPath = `${basePath}${table.viewPath}`;
    console.log('Navigating to:', fullPath); // Debug log
    navigate(fullPath);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">View Tables</h1>
          <p className="text-gray-600 mt-1">Access and manage all system tables</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <BarChart3 className="w-4 h-4" />
          <span>{availableTables.length} tables available</span>
        </div>
      </div>

      {/* User Role Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.role === 'admin' ? 'A' : 'C'}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              {user?.role === 'admin' ? 'Administrator Access' : 'Client Access'}
            </h3>
            <p className="text-sm text-blue-700">
              {user?.role === 'admin' 
                ? 'You have full access to all tables and can perform all operations.'
                : 'You have limited access. Some tables may be restricted to administrators only.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableTables.map((table, index) => (
          <div
            key={index}
            onClick={() => handleTableClick(table)}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 hover:border-blue-300 cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <table.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">View</span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {table.name}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {table.description}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-gray-500">Records:</span>
                    <span className="font-medium text-gray-900 ml-1">{table.recordCount}</span>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(table.lastUpdated)}`}>
                    {getStatusText(table.lastUpdated)}
                  </span>
                </div>
              </div>
              
              {table.adminOnly && (
                <div className="mt-3 flex items-center">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                  <span className="text-xs text-orange-600 font-medium">Admin Only</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Restricted Tables Notice for Non-Admin Users */}
      {!isAdmin && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Restricted Access</h3>
          <p className="text-gray-600 mb-4">
            The following tables require administrator privileges to access:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tables.filter(table => table.adminOnly).map((table, index) => (
              <div key={index} className="flex items-center p-3 bg-white rounded-lg border border-gray-200 opacity-60">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <table.icon className="w-5 h-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-gray-700">{table.name}</h4>
                  <p className="text-xs text-gray-500">{table.recordCount} records</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Contact your administrator to request access to these tables.
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {availableTables.reduce((sum, table) => sum + table.recordCount, 0)}
            </div>
            <div className="text-sm text-gray-500">Total Records</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {availableTables.filter(table => getStatusText(table.lastUpdated) === 'Updated Today').length}
            </div>
            <div className="text-sm text-gray-500">Updated Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {availableTables.filter(table => getStatusText(table.lastUpdated) === 'Updated Yesterday').length}
            </div>
            <div className="text-sm text-gray-500">Updated Yesterday</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {availableTables.length}
            </div>
            <div className="text-sm text-gray-500">Available Tables</div>
          </div>
        </div>
      </div>
    </div>
  )
}