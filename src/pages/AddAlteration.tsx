import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useJobCard } from '@/hooks/useOrders'
import { useInspectionById } from '@/hooks/useInspections'
import { useAlterationTemplates, useCreateAlteration } from '@/hooks/useAlterations'
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
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'react-hot-toast'
import {
  ArrowLeft,
  AlertTriangle,
  Save,
  Loader2,
  Package,
} from 'lucide-react'

export default function AddAlteration() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Get URL params
  const jobCardId = searchParams.get('jobCardId') || ''
  const inspectionId = searchParams.get('inspectionId') || ''

  // Fetch data
  const { data: jobCardData, isLoading: jobCardLoading } = useJobCard(jobCardId)
  const { data: inspectionData, isLoading: inspectionLoading } = useInspectionById(inspectionId)
  const { data: templates = [], isLoading: templatesLoading, isError: templatesError } = useAlterationTemplates()
  const createMutation = useCreateAlteration()

  // Form state
  const [alterationCategory, setAlterationCategory] = useState('')
  const [alterationType, setAlterationType] = useState('')
  const [severity, setSeverity] = useState<'minor' | 'major' | 'critical'>('minor')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')

  const jobCard = jobCardData?.jobCard
  const order = jobCardData?.order

  // Group templates by category
  const categories = [...new Set(templates.map(t => t.alteration_category))]
  const filteredTypes = templates.filter(t => t.alteration_category === alterationCategory)

  // Handler for type change - pre-fill description and severity from template
  const handleTypeChange = (value: string) => {
    setAlterationType(value)
    const template = templates.find(t => t.alteration_type === value)
    if (template) {
      setDescription(template.description_template || '')
      setSeverity(template.severity_default)
    }
  }

  // Submit handler
  const handleSubmit = async () => {
    if (!alterationType || !description) {
      toast.error('Please fill in all required fields')
      return
    }

    if (!jobCardId || !inspectionId) {
      toast.error('Missing job card or inspection ID')
      return
    }

    const result = await createMutation.mutateAsync({
      inspection_report_id: inspectionId,
      job_card_id: jobCardId,
      stitcher_id: null,
      stitcher_name: jobCard?.stitcher_name || null,
      alteration_type: alterationType,
      alteration_category: alterationCategory,
      severity: severity,
      description: description,
      location: location || null,
    })

    if (result) {
      toast.success('Alteration added successfully')
      navigate(`/job-cards/${jobCardId}`)
    } else {
      toast.error('Failed to add alteration')
    }
  }

  // Loading state
  const isLoading = jobCardLoading || inspectionLoading || templatesLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
          <p className="text-lg font-medium text-gray-900">Loading...</p>
        </div>
      </div>
    )
  }

  // Error loading templates
  if (templatesError) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load alteration templates. Please refresh the page.
          </AlertDescription>
        </Alert>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  // Missing data
  if (!jobCard || !order) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900">Job card not found</p>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/job-cards/${jobCardId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Job Card
        </Button>

        <PageHeader
          title="Add Alteration"
          description="Record quality issue"
        />
      </div>

      {/* Job Card Info Card */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Serial No</p>
              <p className="font-medium">{jobCard.serial_no}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Style</p>
              <p className="font-medium">{order.style_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Size</p>
              <p className="font-medium">{jobCard.size || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Stitcher</p>
              <p className="font-medium">{jobCard.stitcher_name || 'Not assigned'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Alteration Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Category Select */}
          <div className="space-y-2">
            <Label htmlFor="category">Alteration Category *</Label>
            <Select value={alterationCategory} onValueChange={setAlterationCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type Select (only show if category selected) */}
          {alterationCategory && (
            <div className="space-y-2">
              <Label htmlFor="type">Alteration Type *</Label>
              <Select value={alterationType} onValueChange={handleTypeChange}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select an alteration type" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTypes.map(template => (
                    <SelectItem key={template.id} value={template.alteration_type}>
                      {template.alteration_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Severity Select */}
          <div className="space-y-2">
            <Label htmlFor="severity">Severity *</Label>
            <Select value={severity} onValueChange={(val) => setSeverity(val as any)}>
              <SelectTrigger id="severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              rows={4}
            />
            <p className="text-sm text-gray-500">
              Provide specific details about the alteration needed
            </p>
          </div>

          {/* Location Input */}
          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Left sleeve, Right pocket, Front panel"
            />
            <p className="text-sm text-gray-500">
              Specify where on the garment the issue is located
            </p>
          </div>

        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end mt-6">
        <Button
          variant="outline"
          onClick={() => navigate(`/job-cards/${jobCardId}`)}
          disabled={createMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!alterationType || !description || createMutation.isPending}
        >
          {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          Save Alteration
        </Button>
      </div>
    </div>
  )
}
