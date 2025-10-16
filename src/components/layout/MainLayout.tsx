import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Fixed */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
