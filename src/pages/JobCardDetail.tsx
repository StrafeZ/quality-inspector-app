import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useJobCard } from '@/hooks/useOrders'
import { useInspectionByStyle, useAlterationsByJobCard } from '@/hooks/useInspections'
import PageHeader from '@/components/layout/PageHeader'
import StatsCard from '@/components/dashboard/StatsCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
  AlertTriangle,
  Loader2,
  FileText,
  CheckCircle,
  XCircle,
  ClipboardCheck,
} from 'lucide-react'

export default function JobCardDetail() {
  const { jobCardId } = useParams<{ jobCardId: string }>()
  const navigate = useNavigate()
  const [showNoInspectionAlert, setShowNoInspectionAlert] = useState(false)
  const { data: jobCardData, isLoading: jobCardLoading } = useJobCard(jobCardId!)

  // Add debug logging
  console.log('JobCardDetail - jobCardId:', jobCardId)
  console.log('JobCardDetail - jobCardData:', jobCardData)

  // Extract order details for fetching inspection
  const order = jobCardData?.order
  const jobCard = jobCardData?.jobCard

  // Fetch inspection report if we have style and color
  const { data: inspection } = useInspectionByStyle(
    order?.style_name || '',
    order?.color || ''
  )

  // Add debug logging
  console.log('JobCardDetail - style:', order?.style_name)
  console.log('JobCardDetail - color:', order?.color)
  console.log('JobCardDetail - inspection:', inspection)

  // Fetch alterations for this job card
  const { data: alterations = [] } = useAlterationsByJobCard(jobCardId!)

  // Add debug logging
  console.log('JobCardDetail - alterations:', alterations)

  // Loading state
  if (jobCardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
          <p className="text-lg font-medium text-gray-900">Loading job card...</p>
        </div>
      </div>
    )
  }

  // Not found state
  if (!jobCardData || !jobCard || !order) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900">Job card not found</p>
          <Button className="mt-4" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  const isInspected = !!inspection
  const hasAlterations = alterations.length > 0
  const correctedAlterations = alterations.filter((a) => a.is_corrected).length
  const pendingAlterations = alterations.filter((a) => !a.is_corrected).length

  return (
    <div>
      {/* Page Header with Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/orders/${order.order_id}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Order
        </Button>

        <PageHeader
          title={`Job Card #${jobCard.serial_no}`}
          description={`${order.order_id} | ${order.customer_name || 'Unknown Customer'}`}
          actions={
            <div className="flex gap-3">
              {isInspected ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/inspections/report/${inspection.id}`)}
                  >
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                  <Button
                    onClick={() => navigate(`/alterations/new?jobCardId=${jobCardId}&inspectionId=${inspection.id}`)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Add Alteration
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setShowNoInspectionAlert(true)}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Add Alteration
                </Button>
              )}
            </div>
          }
        />
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Serial Number"
          value={jobCard.serial_no.toString()}
          subtitle="Job card serial"
          icon={Package}
        />
        <StatsCard
          title="Size"
          value={jobCard.size || 'N/A'}
          subtitle="Garment size"
          icon={Package}
        />
        <StatsCard
          title="Status"
          value={jobCard.status || 'Created'}
          subtitle="Current status"
          icon={FileText}
        />
        <StatsCard
          title="Alterations"
          value={alterations.length.toString()}
          subtitle={`${pendingAlterations} pending`}
          icon={AlertTriangle}
        />
      </div>

      {/* Inspection Status Alert */}
      {isInspected ? (
        <Alert className="mb-8 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            This job card has been inspected. Status:{' '}
            <strong className="capitalize">
              {inspection.overall_status.replace(/_/g, ' ')}
            </strong>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <ClipboardCheck className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            No inspection has been started for this style ({order.style_name || 'N/A'} - {jobCard.color || 'N/A'}).
            The pattern master must start an inspection from the order page before alterations can be added to individual garments.
          </AlertDescription>
        </Alert>
      )}

      {/* Order Details Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Production PO</p>
              <p className="font-medium">{order.order_id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-medium">{order.customer_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Style</p>
              <p className="font-medium">{order.style_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Color</p>
              <p className="font-medium">{order.color || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order Type</p>
              <p
                className={`font-medium ${
                  order.order_type?.toLowerCase() === 'sample'
                    ? 'text-red-600'
                    : order.order_type?.toLowerCase() === 'production'
                    ? 'text-green-600'
                    : ''
                }`}
              >
                {order.order_type
                  ? order.order_type.charAt(0).toUpperCase() +
                    order.order_type.slice(1).toLowerCase()
                  : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Delivery Date</p>
              <p className="font-medium">
                {order.delivery_date
                  ? format(new Date(order.delivery_date), 'MMM dd, yyyy')
                  : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Card Details Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Job Card Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Serial Number</p>
              <p className="font-medium">{jobCard.serial_no}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Size</p>
              <p className="font-medium">{jobCard.size || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Color</p>
              <p className="font-medium">{jobCard.color || order.color || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge className="bg-blue-100 text-blue-800">
                {jobCard.status || 'created'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Created</p>
              <p className="font-medium">
                {jobCard.created_at
                  ? format(new Date(jobCard.created_at), 'MMM dd, yyyy')
                  : 'N/A'}
              </p>
            </div>
            {jobCard.updated_at && (
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">
                  {format(new Date(jobCard.updated_at), 'MMM dd, yyyy')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inspection Information Section */}
      {isInspected && inspection && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Inspection Report</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/inspections/report/${inspection.id}`)}
              >
                <FileText className="h-4 w-4 mr-2" />
                View Full Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Inspection Number</p>
                <p className="font-medium">{inspection.inspection_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Inspector</p>
                <p className="font-medium">{inspection.inspector_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Inspection Date</p>
                <p className="font-medium">
                  {format(new Date(inspection.inspection_date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Overall Status</p>
                <Badge
                  className={
                    inspection.overall_status === 'pass'
                      ? 'bg-green-100 text-green-800'
                      : inspection.overall_status === 'reject'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }
                >
                  {inspection.overall_status.replace(/_/g, ' ')}
                </Badge>
              </div>
              {inspection.general_notes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">General Notes</p>
                  <p className="font-medium">{inspection.general_notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alterations Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alterations ({alterations.length})</CardTitle>
            {hasAlterations && (
              <div className="text-sm text-gray-600">
                <span className="text-green-600 font-medium">{correctedAlterations} corrected</span>
                {' · '}
                <span className="text-yellow-600 font-medium">{pendingAlterations} pending</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!hasAlterations ? (
            <div className="text-center py-12 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-400" />
              <p className="text-lg font-medium">No alterations recorded</p>
              <p className="mt-2">This job card has no alterations</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Stitcher</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alterations.map((alteration) => (
                  <TableRow key={alteration.id}>
                    <TableCell className="font-medium">
                      {alteration.alteration_type}
                    </TableCell>
                    <TableCell>{alteration.alteration_category}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          alteration.severity === 'critical'
                            ? 'bg-red-100 text-red-800'
                            : alteration.severity === 'major'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }
                      >
                        {alteration.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>{alteration.description}</TableCell>
                    <TableCell>{alteration.location || '—'}</TableCell>
                    <TableCell>{alteration.stitcher_name}</TableCell>
                    <TableCell>
                      {alteration.is_corrected ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Corrected
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Alert: No Inspection Started */}
      <AlertDialog open={showNoInspectionAlert} onOpenChange={setShowNoInspectionAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inspection Not Started</AlertDialogTitle>
            <AlertDialogDescription>
              An inspection has not been started for this style/color combination:
              <div className="mt-2 font-medium">
                Style: {order.style_name || 'N/A'}<br/>
                Color: {jobCard.color || 'N/A'}
              </div>
              <div className="mt-3">
                The pattern master must start an inspection from the order page before you can add alterations to individual garments.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate(`/orders/${order.order_id}`)}>
              Go to Order Page
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
