import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useOrderWithAlterations } from '@/hooks/useOrders'
import PageHeader from '@/components/layout/PageHeader'
import StatsCard from '@/components/dashboard/StatsCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Package,
  Clock,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { data: orderData, isLoading } = useOrderWithAlterations(orderId!)
  const [detailsExpanded, setDetailsExpanded] = useState(true)

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
          <p className="text-lg font-medium text-gray-900">Loading order...</p>
        </div>
      </div>
    )
  }

  // Order not found
  if (!orderData || !orderData.order) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900">Order not found</p>
          <Button className="mt-4" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  const { order, alterationsCount, jobCardsCount } = orderData

  return (
    <div>
      {/* Page Header with Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/orders')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>

        <PageHeader
          title={order.production_po || order.order_id || 'Order Details'}
          description={`${order.customer_name || 'Unknown Customer'} | ${order.order_name || order.order_id || 'N/A'}`}
        />
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Pieces"
          value={jobCardsCount.toString()}
          subtitle="Job cards count"
          icon={Package}
        />
        <StatsCard
          title="Alterations"
          value={alterationsCount.toString()}
          subtitle="Total alterations"
          icon={AlertTriangle}
        />
        <StatsCard
          title="Delivery"
          value={
            order.delivery_date
              ? format(new Date(order.delivery_date), 'MMM dd')
              : 'Not set'
          }
          subtitle="Ex-factory date"
          icon={Clock}
        />
        <StatsCard
          title="Status"
          value={order.status || 'Unknown'}
          subtitle="Current status"
          icon={Package}
        />
      </div>

      {/* Order Details Section (Collapsible) */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Details</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDetailsExpanded(!detailsExpanded)}
            >
              {detailsExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        {detailsExpanded && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Customer</p>
                <p className="font-medium">{order.customer_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Style</p>
                <p className="font-medium">{order.style_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Quantity</p>
                <p className="font-medium">{jobCardsCount} pieces</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Type</p>
                <p className={`font-medium ${
                  order.order_type?.toLowerCase() === 'sample'
                    ? 'text-red-600'
                    : order.order_type?.toLowerCase() === 'production'
                    ? 'text-green-600'
                    : ''
                }`}>
                  {order.order_type
                    ? order.order_type.charAt(0).toUpperCase() + order.order_type.slice(1).toLowerCase()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Color</p>
                <p className="font-medium">{order.color || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <Badge className="bg-gray-100 text-gray-800">normal</Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">
                  {order.created_at ? format(new Date(order.created_at), 'MMM dd, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Job Cards Section (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Job Cards (0)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No job cards yet</p>
            <p className="mt-2">Job cards will appear here once created</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
