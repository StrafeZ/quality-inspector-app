import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useInspectionById } from '@/hooks/useInspections'
import { useOrderWithJobCardsData } from '@/hooks/useOrders'
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
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Loader2,
} from 'lucide-react'

export default function InspectionReport() {
  const { inspectionId } = useParams<{ inspectionId: string }>()
  const navigate = useNavigate()

  // Fetch inspection with alterations
  const { data: inspectionData, isLoading: inspectionLoading } = useInspectionById(inspectionId!)

  const inspection = inspectionData?.inspection
  const alterations = inspectionData?.alterations || []

  // Fetch order data with job cards
  const { data: orderData, isLoading: orderLoading } = useOrderWithJobCardsData(
    inspection?.order_id || ''
  )

  const order = orderData?.order
  const jobCards = orderData?.jobCards || []
  const jobCardsCount = orderData?.jobCardsCount || 0

  // Calculate stats from fetched data
  const scannedCount = new Set(alterations.map((a) => a.job_card_id)).size
  const pendingCount = alterations.filter((a) => !a.is_corrected).length

  // Helper functions
  const getJobCardAlterations = (jobCardId: string) => {
    return alterations.filter((a) => a.job_card_id === jobCardId)
  }

  const getInspectionStatusBadge = (jobCardId: string) => {
    const count = getJobCardAlterations(jobCardId).length
    if (count === 0) {
      return <Badge className="bg-gray-100 text-gray-800">Not Scanned</Badge>
    } else if (count <= 2) {
      return <Badge className="bg-yellow-100 text-yellow-800">Minor Issues</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800">Major Issues</Badge>
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'pass':
        return 'bg-green-100 text-green-800'
      case 'pass_with_notes':
        return 'bg-blue-100 text-blue-800'
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

  // Loading state
  if (inspectionLoading || orderLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
          <p className="text-lg font-medium text-gray-900">Loading inspection report...</p>
        </div>
      </div>
    )
  }

  // Not found state
  if (!inspectionData || !inspection) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900">Inspection report not found</p>
          <Button className="mt-4" onClick={() => navigate('/inspections')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inspections
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header with Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/orders/${order?.production_order_id || order?.order_id}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Order
        </Button>

        <PageHeader
          title={`Inspection Report: ${inspection.inspection_number}`}
          description={`${order?.customer_name} | Order: ${order?.production_order_id || order?.order_id}`}
        />
      </div>

      {/* In Progress Alert */}
      {inspection.overall_status === 'in_progress' && (
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <ClipboardCheck className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900 flex items-center justify-between">
            <span>This inspection is in progress. Complete it when you're done reviewing all garments.</span>
            <Button onClick={() => navigate(`/inspections/complete/${inspectionId}`)}>
              Complete Inspection
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Job Cards"
          value={jobCardsCount.toString()}
          subtitle="In this order"
          icon={Package}
        />
        <StatsCard
          title="Scanned"
          value={scannedCount.toString()}
          subtitle="Job cards inspected"
          icon={ClipboardCheck}
        />
        <StatsCard
          title="Total Alterations"
          value={alterations.length.toString()}
          subtitle="Found in inspection"
          icon={AlertTriangle}
        />
        <StatsCard
          title="Pending Corrections"
          value={pendingCount.toString()}
          subtitle="Awaiting correction"
          icon={CheckCircle2}
        />
      </div>

      {/* Inspection Details Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Inspection Details</CardTitle>
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
              <Badge className={getStatusBadgeClass(inspection.overall_status)}>
                {inspection.overall_status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order</p>
              <p className="font-medium">{order?.production_order_id || order?.order_id}</p>
            </div>
            {inspection.completed_at && (
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="font-medium">
                  {format(new Date(inspection.completed_at), 'MMM dd, yyyy')}
                </p>
              </div>
            )}
            {inspection.general_notes && (
              <div className="col-span-2 md:col-span-3">
                <p className="text-sm text-gray-600">General Notes</p>
                <p className="font-medium">{inspection.general_notes}</p>
              </div>
            )}
            {inspection.inspector_comments && (
              <div className="col-span-2 md:col-span-3">
                <p className="text-sm text-gray-600">Inspector Comments</p>
                <p className="font-medium">{inspection.inspector_comments}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Job Cards Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Job Cards ({jobCardsCount})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {jobCards.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No job cards found for this order</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial No</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Alterations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobCards.map((jobCard) => {
                  const alterationsCount = getJobCardAlterations(jobCard.id).length
                  return (
                    <TableRow
                      key={jobCard.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/job-cards/${jobCard.id}`)}
                    >
                      <TableCell className="font-medium">{jobCard.serial_no}</TableCell>
                      <TableCell>{jobCard.size || '—'}</TableCell>
                      <TableCell>{jobCard.color || '—'}</TableCell>
                      <TableCell>{getInspectionStatusBadge(jobCard.id)}</TableCell>
                      <TableCell>
                        {alterationsCount > 0 ? (
                          <span className="font-medium text-orange-600">
                            {alterationsCount}
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
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
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
