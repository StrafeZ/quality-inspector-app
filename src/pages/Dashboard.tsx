import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import StatsCard from '@/components/dashboard/StatsCard'
import TabNav from '@/components/ui/TabNav'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Download,
  Plus,
} from 'lucide-react'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const stats = [
    {
      title: 'Total Inspections',
      value: '0',
      subtitle: 'Completed this month',
      icon: Package,
      trend: { value: '+0%', positive: true },
    },
    {
      title: 'Pass Rate',
      value: '0%',
      subtitle: 'Quality standard',
      icon: CheckCircle,
      trend: { value: '0%', positive: true },
    },
    {
      title: 'Pending Review',
      value: '0',
      subtitle: 'Awaiting approval',
      icon: Clock,
      trend: { value: '0', positive: true },
    },
    {
      title: 'Alterations',
      value: '0',
      subtitle: 'Requiring correction',
      icon: AlertTriangle,
      trend: { value: '-0', positive: true },
    },
  ]

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Recent', value: 'recent' },
    { label: 'Analytics', value: 'analytics' },
  ]

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description="Quality inspection overview and statistics"
        actions={
          <>
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Inspection
            </Button>
          </>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Tab Navigation */}
      <TabNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Content Area */}
      <div className="mt-8">
        {activeTab === 'overview' && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900">No inspection data yet</p>
              <p className="mt-2 text-gray-600">
                Start by scanning a job card to create your first inspection report
              </p>
            </CardContent>
          </Card>
        )}
        {activeTab === 'recent' && (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900">No recent activity</p>
              <p className="mt-2 text-gray-600">Recent inspections will appear here</p>
            </CardContent>
          </Card>
        )}
        {activeTab === 'analytics' && (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium text-gray-900">Analytics coming soon</p>
              <p className="mt-2 text-gray-600">Quality metrics and trends will be displayed here</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
