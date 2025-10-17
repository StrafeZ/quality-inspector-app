import { useState, type FormEvent } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useOrder } from '@/hooks/useOrders'
import { useQuery } from '@tanstack/react-query'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Info,
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch order data
  const { data: orderData, isLoading: orderLoading } = useOrder(orderId)

  // Check if inspection already exists for this order
  const { data: existingInspection, isLoading: inspectionLoading } = useQuery({
    queryKey: ['existing-inspection', orderId],
    queryFn: async () => {
      if (!orderId) return null

      const { data, error } = await supabase
        .from('inspection_reports')
        .select('id, inspection_number, overall_status')
        .eq('order_id', orderId)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!orderId,
  })

  const inspectionNumber = generateInspectionNumber(orderData?.production_po)

  // Loading state
  if (orderLoading || inspectionLoading) {
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
  if (!orderData) {
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

  const canSubmit = isAuthenticated && !existingInspection && !isSubmitting

  // Form submission handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Validation
    if (!user || !isAuthenticated) {
      toast.error('You must be logged in to create an inspection')
      return
    }

    if (existingInspection) {
      toast.error('An inspection already exists for this order')
      return
    }

    setIsSubmitting(true)

    try {
      // Insert inspection report
      const { data: newInspection, error } = await supabase
        .from('inspection_reports')
        .insert({
          order_id: orderId,
          inspector_id: user.id,
          inspection_number: inspectionNumber,
          inspection_date: new Date().toISOString(),
          overall_status: 'in_progress',
          general_notes: null,
          inspector_comments: null,
          email_sent: false,
          customer: orderData.customer_name,
          style: style,
          color: color,
          inspector_name: user.email || 'Unknown Inspector',
        })
        .select()
        .single()

      if (error) throw error

      toast.success('Inspection started. You can now scan job cards.')
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
            navigate(`/orders/${orderData.production_po || orderData.order_id}`)
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

      {existingInspection && (
        <Alert className="mb-8 border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900">
            An inspection is already in progress for this order (
            {existingInspection.inspection_number}).
            <Button
              variant="link"
              className="ml-2 p-0 h-auto text-yellow-900 underline"
              onClick={() => navigate(`/inspections/report/${existingInspection.id}`)}
            >
              View Inspection
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Info Alert */}
      {!existingInspection && (
        <Alert className="mb-8 border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            Starting this inspection will allow you to scan job cards and add alterations.
            You can complete the inspection summary after reviewing all garments.
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
                <Package className="h-4 w-4" />
                Order
              </p>
              <p className="font-medium">{orderData.production_po || orderData.order_id}</p>
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
              <p className="font-medium">{orderData.customer_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Total Job Cards
              </p>
              <p className="font-medium">{orderData.order_quantity || 0}</p>
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

      {/* Submit Button */}
      <form onSubmit={handleSubmit}>
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
            {!isAuthenticated && 'Please log in to create an inspection. '}
            {existingInspection && 'An inspection already exists for this order. '}
          </p>
        )}
      </form>
    </div>
  )
}
