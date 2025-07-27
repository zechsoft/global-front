import { useState, useEffect, useRef } from 'react'
import { 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical,
  Search,
  Plus,
  UserPlus,
  Settings,
  Archive,
  MessageSquare,
  Users,
  Clock,
  CheckCheck,
  Image,
  File
} from 'lucide-react'

export default function ChatPage() {
  const [message, setMessage] = useState('')
  const [selectedChat, setSelectedChat] = useState(0)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [selectedChat])

  // Mock chat data
  const chats = [
    {
      id: 1,
      name: 'John Smith',
      avatar: 'JS',
      lastMessage: 'Hey, how is the project going?',
      time: '2 min ago',
      unread: 2,
      online: true,
      type: 'individual'
    },
    {
      id: 2,
      name: 'Project Team Alpha',
      avatar: 'PT',
      lastMessage: 'Meeting scheduled for tomorrow',
      time: '15 min ago',
      unread: 0,
      online: false,
      type: 'group',
      members: 5
    },
    {
      id: 3,
      name: 'Sarah Wilson',
      avatar: 'SW',
      lastMessage: 'Can you review the designs?',
      time: '1 hour ago',
      unread: 1,
      online: true,
      type: 'individual'
    },
    {
      id: 4,
      name: 'Development Team',
      avatar: 'DT',
      lastMessage: 'Code review completed',
      time: '3 hours ago',
      unread: 0,
      online: false,
      type: 'group',
      members: 8
    },
    {
      id: 5,
      name: 'Mike Johnson',
      avatar: 'MJ',
      lastMessage: 'Thanks for the update!',
      time: 'Yesterday',
      unread: 0,
      online: false,
      type: 'individual'
    }
  ]

  const messages = [
    {
      id: 1,
      sender: 'John Smith',
      content: 'Hey! How is the argon chakra project coming along?',
      time: '10:30 AM',
      sent: false,
      avatar: 'JS'
    },
    {
      id: 2,
      sender: 'You',
      content: 'It\'s going great! We\'ve completed most of the dashboard components.',
      time: '10:32 AM',
      sent: true,
      status: 'read'
    },
    {
      id: 3,
      sender: 'John Smith',
      content: 'That sounds awesome. Can you show me the latest designs?',
      time: '10:33 AM',
      sent: false,
      avatar: 'JS'
    },
    {
      id: 4,
      sender: 'You',
      content: 'Sure! I\'ll share the Figma link with you.',
      time: '10:35 AM',
      sent: true,
      status: 'delivered'
    },
    {
      id: 5,
      sender: 'You',
      content: 'Here\'s the link: https://figma.com/project-design',
      time: '10:35 AM',
      sent: true,
      status: 'delivered'
    },
    {
      id: 6,
      sender: 'John Smith',
      content: 'Perfect! The new sidebar design looks much better. Great work! 👍',
      time: '10:40 AM',
      sent: false,
      avatar: 'JS'
    }
  ]

  const handleSendMessage = () => {
    if (message.trim()) {
      // Add message logic here
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Chat Sidebar */}
      <div className="w-80 border-r bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <div className="flex space-x-2">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <UserPlus className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Plus className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat, index) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(index)}
              className={`p-4 border-b cursor-pointer transition-colors ${
                selectedChat === index ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                    chat.type === 'group' ? 'bg-purple-500' : 'bg-green-500'
                  }`}>
                    {chat.avatar}
                  </div>
                  {chat.online && chat.type === 'individual' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {chat.name}
                    </h3>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                    {chat.unread > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  {chat.type === 'group' && (
                    <div className="flex items-center mt-1">
                      <Users className="w-3 h-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">{chat.members} members</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b bg-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                {filteredChats[selectedChat]?.avatar}
              </div>
              {filteredChats[selectedChat]?.online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {filteredChats[selectedChat]?.name}
              </h3>
              <p className="text-xs text-gray-500">
                {filteredChats[selectedChat]?.online ? 'Active now' : 'Last seen recently'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Phone className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Video className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-2 max-w-xs lg:max-w-md ${msg.sent ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!msg.sent && (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {msg.avatar}
                  </div>
                )}
                
                <div>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      msg.sent
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900 shadow-sm border'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  
                  <div className={`flex items-center mt-1 space-x-1 ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-gray-500">{msg.time}</span>
                    {msg.sent && (
                      <div className="text-gray-500">
                        {msg.status === 'read' ? (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        ) : (
                          <CheckCheck className="w-3 h-3" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t bg-white">
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <Paperclip className="w-5 h-5" />
            </button>
            
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
              />
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
              >
                <Smile className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className={`p-2 rounded-full transition-colors ${
                message.trim()
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center justify-center mt-3 space-x-4">
            <button className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-800">
              <Image className="w-4 h-4" />
              <span>Photo</span>
            </button>
            <button className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-800">
              <File className="w-4 h-4" />
              <span>Document</span>
            </button>
            <button className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-800">
              <Video className="w-4 h-4" />
              <span>Video Call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}