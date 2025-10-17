import { useState, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useInspectionById } from '@/hooks/useInspections'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { supabase } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import {
  ArrowLeft,
  ClipboardCheck,
  Save,
  Loader2,
  AlertCircle,
  Package,
  User,
  Palette,
} from 'lucide-react'

export default function CompleteInspection() {
  const { inspectionId } = useParams<{ inspectionId: string }>()
  const navigate = useNavigate()

  // Fetch inspection data
  const { data: inspectionData, isLoading } = useInspectionById(inspectionId!)

  const inspection = inspectionData?.inspection

  // Form state
  const [overallStatus, setOverallStatus] = useState<string>('pass')
  const [generalNotes, setGeneralNotes] = useState('')
  const [inspectorComments, setInspectorComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
          <p className="text-lg font-medium text-gray-900">
            Loading inspection...
          </p>
        </div>
      </div>
    )
  }

  // Inspection not found
  if (!inspectionData || !inspection) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900">
            Inspection not found
          </p>
          <p className="text-sm text-gray-600 mt-2">
            The inspection you're trying to complete could not be found.
          </p>
          <Button className="mt-4" onClick={() => navigate('/inspections')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inspections
          </Button>
        </div>
      </div>
    )
  }

  // Check if inspection is already completed
  const isAlreadyCompleted = inspection.overall_status !== 'in_progress'

  // Form submission handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (isAlreadyCompleted) {
      toast.error('This inspection has already been completed')
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('inspection_reports')
        .update({
          overall_status: overallStatus,
          general_notes: generalNotes || null,
          inspector_comments: inspectorComments || null,
          completed_at: new Date().toISOString(),
        })
        .eq('id', inspectionId!)

      if (error) throw error

      toast.success('Inspection completed')
      navigate(`/inspections/report/${inspectionId}`)
    } catch (error: any) {
      console.error('Error completing inspection:', error)
      toast.error(error.message || 'Failed to complete inspection')
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
          onClick={() => navigate(`/inspections/report/${inspectionId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Report
        </Button>

        <PageHeader
          title="Complete Inspection"
          description={`Finalize inspection ${inspection.inspection_number}`}
        />
      </div>

      {/* Alert if already completed */}
      {isAlreadyCompleted && (
        <Alert className="mb-8 border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900">
            This inspection has already been completed and cannot be modified.
            <Button
              variant="link"
              className="ml-2 p-0 h-auto text-yellow-900 underline"
              onClick={() => navigate(`/inspections/report/${inspectionId}`)}
            >
              View Report
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Inspection Summary Card (Read-only) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Inspection Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Inspection Number</p>
              <p className="font-medium">{inspection.inspection_number}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer
              </p>
              <p className="font-medium">{inspection.customer || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Style
              </p>
              <p className="font-medium">{inspection.style}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Color
              </p>
              <p className="font-medium">{inspection.color}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Inspector
              </p>
              <p className="font-medium">{inspection.inspector_name}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Form */}
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
              <Select
                value={overallStatus}
                onValueChange={setOverallStatus}
                disabled={isAlreadyCompleted}
              >
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
                disabled={isAlreadyCompleted}
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
                disabled={isAlreadyCompleted}
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
          disabled={isAlreadyCompleted || isSubmitting}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Completing Inspection...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Complete Inspection
            </>
          )}
        </Button>

        {isAlreadyCompleted && (
          <p className="text-sm text-center text-gray-600 mt-3">
            This inspection has already been completed and cannot be modified.
          </p>
        )}
      </form>
    </div>
  )
}
