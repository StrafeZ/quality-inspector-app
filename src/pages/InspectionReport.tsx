import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useInspectionById, useInspectionStats } from '@/hooks/useInspections'
import { useJobCardsByStyle } from '@/hooks/useOrders'
import PageHeader from '@/components/layout/PageHeader'
import StatsCard from '@/components/dashboard/StatsCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  TrendingUp,
  Loader2,
  Eye,
} from 'lucide-react'

export default function InspectionReport() {
  const { inspectionId } = useParams<{ inspectionId: string }>()
  const navigate = useNavigate()

  // Fetch inspection with alterations
  const { data: inspectionData, isLoading } = useInspectionById(inspectionId!)

  const inspection = inspectionData?.inspection
  const alterations = inspectionData?.alterations || []

  // Fetch stats and job cards for this style/color
  const { data: stats } = useInspectionStats(
    inspection?.style || '',
    inspection?.color || ''
  )

  const { data: jobCards = [] } = useJobCardsByStyle(
    inspection?.style || '',
    inspection?.color || ''
  )

  // Loading state
  if (isLoading) {
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

  // Helper function to get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
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

  // Helper function to count alterations for a job card
  const getAlterationsCount = (jobCardId: string) => {
    return alterations.filter((alt) => alt.job_card_id === jobCardId).length
  }

  return (
    <div>
      {/* Page Header with Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/inspections')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inspections
        </Button>

        <PageHeader
          title={`Inspection Report: ${inspection.inspection_number}`}
          description={`${inspection.customer} | ${inspection.style} - ${inspection.color}`}
          actions={
            inspection.overall_status === 'in_progress' ? (
              <Button onClick={() => navigate(`/inspections/complete/${inspectionId}`)}>
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Complete Inspection
              </Button>
            ) : undefined
          }
        />
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Job Cards"
          value={jobCards.length.toString()}
          subtitle="In this style/color"
          icon={Package}
        />
        <StatsCard
          title="Pass Rate"
          value={`${stats?.passRate || 0}%`}
          subtitle="Inspection pass rate"
          icon={TrendingUp}
        />
        <StatsCard
          title="Total Alterations"
          value={(stats?.totalAlterations || 0).toString()}
          subtitle="Across all job cards"
          icon={AlertTriangle}
        />
        <StatsCard
          title="Pending Corrections"
          value={(stats?.pendingCorrections || 0).toString()}
          subtitle="Awaiting correction"
          icon={ClipboardCheck}
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
            <CardTitle>Job Cards ({jobCards.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {jobCards.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium">No job cards found for this style</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serial No</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Inspection Status</TableHead>
                  <TableHead>Alterations</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobCards.map((jobCard) => {
                  const alterationsCount = getAlterationsCount(jobCard.id)
                  return (
                    <TableRow
                      key={jobCard.id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => navigate(`/job-cards/${jobCard.id}`)}
                    >
                      <TableCell className="font-medium">{jobCard.serial_no}</TableCell>
                      <TableCell>{jobCard.size || '—'}</TableCell>
                      <TableCell>{jobCard.color || '—'}</TableCell>
                      <TableCell>
                        {alterationsCount === 0 ? (
                          <Badge className="bg-green-100 text-green-800">Pass</Badge>
                        ) : alterationsCount <= 2 ? (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Minor Alterations
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-800">
                            Major Alterations
                          </Badge>
                        )}
                      </TableCell>
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
