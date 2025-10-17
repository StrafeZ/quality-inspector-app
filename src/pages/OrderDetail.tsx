import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { useOrderWithJobCardsData } from '@/hooks/useOrders'
import { supabase } from '@/lib/supabase'
import PageHeader from '@/components/layout/PageHeader'
import StatsCard from '@/components/dashboard/StatsCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Package,
  Clock,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  ClipboardCheck,
  FileText,
  CheckCircle,
} from 'lucide-react'

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { data: orderData, isLoading } = useOrderWithJobCardsData(orderId!)
  const [detailsExpanded, setDetailsExpanded] = useState(true)

  // Fetch inspection data for this order
  const { data: inspection } = useQuery({
    queryKey: ['inspection-by-order', orderId],
    queryFn: async () => {
      if (!orderId) return null

      const { data, error } = await supabase
        .from('inspection_reports')
        .select('id, inspection_number, overall_status, completed_at')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!orderId,
  })

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

  const { order, alterationsCount, jobCardsCount, jobCards } = orderData

  // Helper function to get inspection status color
  const getInspectionStatusColor = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'pass':
        return 'bg-green-100 text-green-800'
      case 'pass_with_notes':
        return 'bg-emerald-100 text-emerald-800'
      case 'minor_alterations':
        return 'bg-yellow-100 text-yellow-800'
      case 'major_alterations':
        return 'bg-orange-100 text-orange-800'
      case 'reject':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Helper function to format inspection status
  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  }

  const inspectionStatus = inspection?.overall_status || 'not_started'

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
          title={order.order_id || 'Order Details'}
          description={`${order.customer_name || 'Unknown Customer'} | ${order.style_name || order.order_id || 'N/A'}`}
          actions={
            inspection ? (
              <Button
                onClick={() => navigate(`/inspections/report/${inspection.id}`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Inspection Report
              </Button>
            ) : (
              <Button
                onClick={() => navigate(`/inspections/new?style=${order.style_name}&color=${order.color}&orderId=${order.order_id}`)}
              >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Start Inspection
              </Button>
            )
          }
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
          title="Inspection"
          value={formatStatus(inspectionStatus)}
          subtitle={inspection ? `ID: ${inspection.inspection_number}` : 'Not started'}
          icon={ClipboardCheck}
        />
      </div>

      {/* Inspection Status Alert */}
      {inspection && (
        <Alert className={`mb-8 ${
          inspectionStatus === 'in_progress'
            ? 'border-blue-200 bg-blue-50'
            : inspectionStatus === 'pass' || inspectionStatus === 'pass_with_notes'
            ? 'border-green-200 bg-green-50'
            : inspectionStatus === 'reject'
            ? 'border-red-200 bg-red-50'
            : 'border-yellow-200 bg-yellow-50'
        }`}>
          {inspectionStatus === 'in_progress' ? (
            <ClipboardCheck className="h-4 w-4 text-blue-600" />
          ) : inspectionStatus === 'pass' || inspectionStatus === 'pass_with_notes' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          )}
          <AlertDescription className={
            inspectionStatus === 'in_progress'
              ? 'text-blue-900'
              : inspectionStatus === 'pass' || inspectionStatus === 'pass_with_notes'
              ? 'text-green-900'
              : inspectionStatus === 'reject'
              ? 'text-red-900'
              : 'text-yellow-900'
          }>
            <strong>Inspection Status:</strong>{' '}
            <Badge className={getInspectionStatusColor(inspectionStatus)} variant="secondary">
              {formatStatus(inspectionStatus)}
            </Badge>
            {' · '}
            Inspection #{inspection.inspection_number}
            {inspection.completed_at && (
              <> · Completed {format(new Date(inspection.completed_at), 'MMM dd, yyyy')}</>
            )}
            <Button
              variant="link"
              className={`ml-2 p-0 h-auto underline ${
                inspectionStatus === 'in_progress'
                  ? 'text-blue-900'
                  : inspectionStatus === 'pass' || inspectionStatus === 'pass_with_notes'
                  ? 'text-green-900'
                  : inspectionStatus === 'reject'
                  ? 'text-red-900'
                  : 'text-yellow-900'
              }`}
              onClick={() => navigate(`/inspections/report/${inspection.id}`)}
            >
              View Full Report
            </Button>
          </AlertDescription>
        </Alert>
      )}

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

      {/* Job Cards Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Job Cards ({jobCardsCount})</CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {jobCards.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No job cards yet</p>
              <p className="mt-2">Job cards will appear here once created</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial No</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Inspection</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobCards.map((jobCard) => (
                  <TableRow
                    key={jobCard.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => navigate(`/job-cards/${jobCard.id}`)}
                  >
                    <TableCell className="font-medium">{jobCard.serial_no}</TableCell>
                    <TableCell>{jobCard.size || '—'}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-100 text-blue-800">
                        {jobCard.status || 'created'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-400 text-sm">Not inspected</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/job-cards/${jobCard.id}`)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
