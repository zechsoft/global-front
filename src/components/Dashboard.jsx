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
  Edit
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  // Get the correct base path based on user role
  const basePath = isAdmin ? '/admin' : '/client'

  const cardItems = [
    {
      title: 'Supplier Information',
      path: `${basePath}/supplier-info`,
      icon: Package,
      description: 'Tap here to view',
      adminOnly: false
    },
    {
      title: 'Material Inquiry',
      path: `${basePath}/material-inquiry`,
      icon: HelpCircle,
      description: 'Tap here to view',
      adminOnly: false
    },
    {
      title: 'Customer Delivery',
      path: `${basePath}/customer-delivery`,
      icon: Truck,
      description: 'Tap here to view',
      adminOnly: false
    },
    {
      title: 'Customer Order',
      path: `${basePath}/customer-order`,
      icon: ShoppingCart,
      description: 'Tap here to view',
      adminOnly: false
    },
    {
      title: 'Material Replenishment',
      path: `${basePath}/material-replenish`,
      icon: RefreshCw,
      description: 'Tap here to view',
      adminOnly: false
    },
    {
      title: 'Daily Work Report',
      path: `${basePath}/daily-work`,
      icon: Calendar,
      description: 'Tap here to view',
      adminOnly: false
    }
  ]

  // Show all cards for both admin and client users
  const filteredCards = cardItems

  const sampleWorkData = [
    {
      nature: 'Electronic Parts',
      progress: 'Processing',
      hours: '8',
      supervisor: 'John Smith',
      project: 'Project A',
      status: 'Active',
      date: '22/05/2025'
    },
    {
      nature: 'Aluminum Order',
      progress: 'In Progress',
      hours: '6',
      supervisor: 'Jane Doe',
      project: 'Project B',
      status: 'Pending',
      date: '22/05/2025'
    },
    {
      nature: 'Steel Processing',
      progress: 'Completed',
      hours: '4',
      supervisor: 'Mike Johnson',
      project: 'Project C',
      status: 'Completed',
      date: '21/05/2025'
    }
  ]

  const sampleInquiryData = [
    {
      project: 'Electronic Parts',
      status: 'Processing',
      date: '22/05/2025'
    },
    {
      project: 'Aluminum Order',
      status: 'In Progress',
      date: '22/05/2025'
    },
    {
      project: 'Steel',
      status: 'Completed',
      date: '21/05/2025'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
     

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6 group"
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
                  <button className="hover:text-gray-700">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm">Friday 25 July 2025</span>
                  <button className="hover:text-gray-700">
                    <ChevronRight className="w-4 h-4" />
                  </button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sampleWorkData.map((row, index) => (
                  <tr key={index} className={index === 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.nature}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.progress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.hours}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.supervisor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.project}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        row.status === 'Active' ? 'bg-green-100 text-green-800' :
                        row.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Material Inquiry Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Material Inquiry</h2>
              <div className="flex space-x-2">
                <button className="text-gray-400 hover:text-gray-600 transition-colors">Previous</button>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">Next</button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sampleInquiryData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.project}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        row.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        row.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-800 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}