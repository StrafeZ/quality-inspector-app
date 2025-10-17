import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Search, Download, Package, Loader2 } from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'

export default function Orders() {
  const navigate = useNavigate()
  const { data: orders, isLoading, error } = useOrders()

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const handleRowClick = (orderId: string) => {
    navigate(`/orders/${orderId}`)
  }

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Orders"
        description="View and manage active production orders"
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
          </>
        }
      />

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
            <p className="text-lg font-medium text-gray-900">Loading orders...</p>
            <p className="mt-2 text-gray-600">Please wait while we fetch your orders</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <p className="text-lg font-medium text-gray-900">Error loading orders</p>
            <p className="mt-2 text-gray-600">Please try again later</p>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && orders && orders.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium text-gray-900">No active orders found</p>
            <p className="mt-2 text-gray-600">
              Active orders will appear here when they are created
            </p>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      {!isLoading && !error && orders && orders.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Style</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delivery Date</TableHead>
                  <TableHead>PO Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order.order_id}
                    onClick={() => handleRowClick(order.order_id)}
                    className="cursor-pointer hover:bg-gray-50"
                  >
                    <TableCell className="font-medium">{order.order_name || order.order_id || '—'}</TableCell>
                    <TableCell>{order.customer_name || '—'}</TableCell>
                    <TableCell>{order.style_number || '—'}</TableCell>
                    <TableCell>{order.total_quantity || 0}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status || 'pending')} variant="secondary">
                        {formatStatus(order.status || 'pending')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {order.delivery_date
                        ? format(new Date(order.delivery_date), 'MMM dd, yyyy')
                        : '—'}
                    </TableCell>
                    <TableCell>{order.production_po || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
