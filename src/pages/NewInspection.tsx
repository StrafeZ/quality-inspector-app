import { useState, FormEvent } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useOrder, useJobCardsByStyle } from '@/hooks/useOrders'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'
import { generateInspectionNumber } from '@/lib/inspectionUtils'
import { toast } from 'react-hot-toast'
import {
  ArrowLeft,
  ClipboardCheck,
  Package,
  Loader2,
  AlertTriangle,
  User,
  Calendar,
  Palette,
} from 'lucide-react'

export default function NewInspection() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()

  // Extract query parameters
  const style = searchParams.get('style') || ''
  const color = searchParams.get('color') || ''
  const orderId = searchParams.get('orderId') || ''

  // Form state
  const [overallStatus, setOverallStatus] = useState<string>('pass')
  const [generalNotes, setGeneralNotes] = useState('')
  const [inspectorComments, setInspectorComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch data
  const { data: orderData, isLoading: orderLoading } = useOrder(orderId)
  const { data: jobCards = [], isLoading: jobCardsLoading } = useJobCardsByStyle(
    style,
    color
  )

  const order = orderData?.order
  const inspectionNumber = generateInspectionNumber(order?.production_po)

  // Loading state
  if (orderLoading || jobCardsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
          <p className="text-lg font-medium text-gray-900">
            Loading inspection data...
          </p>
        </div>
      </div>
    )
  }

  // Order not found
  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900">Order not found</p>
          <p className="text-sm text-gray-600 mt-2">
            The order you're trying to inspect could not be found.
          </p>
          <Button className="mt-4" onClick={() => navigate('/orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  const hasJobCards = jobCards.length > 0
  const canSubmit = isAuthenticated && hasJobCards && !isSubmitting

  // Form submission handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validation
    if (!user || !isAuthenticated) {
      toast.error('You must be logged in to create an inspection')
      return
    }

    if (!hasJobCards) {
      toast.error('No job cards available for this style/color combination')
      return
    }

    setIsSubmitting(true)

    try {
      // Insert inspection report
      const { data: newInspection, error } = await supabase
        .from('inspection_reports')
        .insert({
          job_card_id: jobCards[0].id,
          inspector_id: user.id,
          inspection_number: inspectionNumber,
          inspection_date: new Date().toISOString(),
          overall_status: overallStatus,
          general_notes: generalNotes || null,
          inspector_comments: inspectorComments || null,
          email_sent: false,
          customer: order.customer_name,
          style: style,
          color: color,
          size: jobCards[0].size,
          serial_no: jobCards[0].serial_no,
          inspector_name: user.email || 'Unknown Inspector',
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Inspection started successfully')
      navigate(`/inspections/report/${newInspection.id}`)
    } catch (error: any) {
      console.error('Error creating inspection:', error)
      toast.error(error.message || 'Failed to create inspection')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            navigate(`/orders/${order.production_po || order.order_id}`)
          }
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Order
        </Button>

        <PageHeader
          title="Start Inspection"
          description={`Inspection ${inspectionNumber}`}
        />
      </div>

      {/* Alert Messages */}
      {!isAuthenticated && (
        <Alert className="mb-8 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-900">
            You must be logged in to create an inspection.
          </AlertDescription>
        </Alert>
      )}

      {!hasJobCards && (
        <Alert className="mb-8 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900">
            No job cards found for this style/color combination: {style} - {color}
          </AlertDescription>
        </Alert>
      )}

      {/* Inspection Info Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Inspection Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Inspection Number</p>
              <p className="font-medium">{inspectionNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Style
              </p>
              <p className="font-medium">{style}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color
              </p>
              <p className="font-medium">{color}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </p>
              <p className="font-medium">{order.customer_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Total Job Cards
              </p>
              <p className="font-medium">{jobCards.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Inspector
              </p>
              <p className="font-medium">{user?.email || 'Not logged in'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspection Form */}
      <form onSubmit={handleSubmit}>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Inspection Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Status */}
            <div className="space-y-2">
              <Label htmlFor="overall-status">
                Overall Status <span className="text-red-500">*</span>
              </Label>
              <Select value={overallStatus} onValueChange={setOverallStatus}>
                <SelectTrigger id="overall-status">
                  <SelectValue placeholder="Select inspection status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">Pass</SelectItem>
                  <SelectItem value="pass_with_notes">Pass with Notes</SelectItem>
                  <SelectItem value="minor_alterations">
                    Minor Alterations
                  </SelectItem>
                  <SelectItem value="major_alterations">
                    Major Alterations
                  </SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600">
                Select the overall inspection result for this batch
              </p>
            </div>

            {/* General Notes */}
            <div className="space-y-2">
              <Label htmlFor="general-notes">General Notes</Label>
              <Textarea
                id="general-notes"
                placeholder="General observations about this batch..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                rows={4}
              />
              <p className="text-sm text-gray-600">
                Optional notes about the overall inspection
              </p>
            </div>

            {/* Inspector Comments */}
            <div className="space-y-2">
              <Label htmlFor="inspector-comments">Inspector Comments</Label>
              <Textarea
                id="inspector-comments"
                placeholder="Additional comments..."
                value={inspectorComments}
                onChange={(e) => setInspectorComments(e.target.value)}
                rows={4}
              />
              <p className="text-sm text-gray-600">
                Optional additional comments from the inspector
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={!canSubmit}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Inspection...
            </>
          ) : (
            <>
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Start Inspection
            </>
          )}
        </Button>

        {!canSubmit && !isSubmitting && (
          <p className="text-sm text-center text-gray-600 mt-3">
            {!isAuthenticated &&
              'Please log in to create an inspection. '}
            {!hasJobCards && 'No job cards available for this style/color. '}
          </p>
        )}
      </form>
    </div>
  )
}
