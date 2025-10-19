import { useState } from 'react'
import {
  useAlterationTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from '@/hooks/useAlterations'
import type { AlterationTemplate } from '@/services/alterationService'
import PageHeader from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader2,
  Settings,
} from 'lucide-react'

export default function AlterationTemplates() {
  // State management
  const [editingTemplate, setEditingTemplate] = useState<AlterationTemplate | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Form fields
  const [category, setCategory] = useState('')
  const [type, setType] = useState('')
  const [descriptionTemplate, setDescriptionTemplate] = useState('')
  const [severity, setSeverity] = useState<'minor' | 'major' | 'critical'>('minor')
  const [isNewCategory, setIsNewCategory] = useState(false)

  // Fetch templates
  const { data: templates = [], isLoading, isError } = useAlterationTemplates()

  // Mutation hooks
  const createMutation = useCreateTemplate()
  const updateMutation = useUpdateTemplate()
  const deleteMutation = useDeleteTemplate()

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const cat = template.alteration_category
    if (!acc[cat]) {
      acc[cat] = []
    }
    acc[cat].push(template)
    return acc
  }, {} as Record<string, AlterationTemplate[]>)

  const categories = Object.keys(groupedTemplates).sort()

  // Handlers
  const openAddDialog = () => {
    setEditingTemplate(null)
    setCategory('')
    setType('')
    setDescriptionTemplate('')
    setSeverity('minor')
    setIsNewCategory(false)
    setIsDialogOpen(true)
  }

  const openEditDialog = (template: AlterationTemplate) => {
    setEditingTemplate(template)
    setCategory(template.alteration_category)
    setType(template.alteration_type)
    setDescriptionTemplate(template.description_template || '')
    setSeverity(template.severity_default)
    setIsNewCategory(false)
    setIsDialogOpen(true)
  }

  const handleCreate = async () => {
    if (!category || !type) {
      toast.error('Category and Type are required')
      return
    }

    const result = await createMutation.mutateAsync({
      alteration_category: category,
      alteration_type: type,
      description_template: descriptionTemplate || null,
      severity_default: severity,
    })

    if (result) {
      toast.success('Template created successfully')
      setIsDialogOpen(false)
    } else {
      toast.error('Failed to create template')
    }
  }

  const handleUpdate = async () => {
    if (!editingTemplate || !category || !type) {
      toast.error('Category and Type are required')
      return
    }

    console.log('handleUpdate starting with:', {
      templateId: editingTemplate.id,
      updates: {
        alteration_category: category,
        alteration_type: type,
        description_template: descriptionTemplate || null,
        severity_default: severity,
      },
    })

    const success = await updateMutation.mutateAsync({
      id: editingTemplate.id,
      updates: {
        alteration_category: category,
        alteration_type: type,
        description_template: descriptionTemplate || null,
        severity_default: severity,
      },
    })

    console.log('handleUpdate result:', success)

    if (success) {
      toast.success('Template updated successfully')
      setIsDialogOpen(false)
    } else {
      toast.error('Failed to update template')
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirmId) return

    const success = await deleteMutation.mutateAsync(deleteConfirmId)

    if (success) {
      toast.success('Template deleted successfully')
      setDeleteConfirmId(null)
    } else {
      toast.error('Failed to delete template')
    }
  }

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'major':
        return 'bg-orange-100 text-orange-800'
      case 'minor':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-gray-400 animate-spin" />
          <p className="text-lg font-medium text-gray-900">Loading templates...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900">Failed to load templates</p>
          <p className="text-sm text-gray-600 mt-2">Please refresh the page to try again</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Alteration Templates"
        description="Manage quality inspection categories and types"
        actions={
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Template
          </Button>
        }
      />

      {/* Empty state */}
      {templates.length === 0 && (
        <Card className="mb-8">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">No templates yet</p>
            <p className="text-sm text-gray-600 mb-4">
              Create your first alteration template to get started
            </p>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Category Cards */}
      <div className="space-y-6">
        {categories.map((cat) => (
          <Card key={cat}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{cat}</span>
                <Badge variant="outline">{groupedTemplates[cat].length} templates</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description Template</TableHead>
                    <TableHead>Default Severity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedTemplates[cat].map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">
                        {template.alteration_type}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {template.description_template || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityBadgeClass(template.severity_default)}>
                          {template.severity_default}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(template)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteConfirmId(template.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Add Template'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <div className="flex gap-2">
                {!isNewCategory && categories.length > 0 ? (
                  <>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsNewCategory(true)
                        setCategory('')
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Input
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Enter new category"
                      className="flex-1"
                    />
                    {categories.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsNewCategory(false)
                          setCategory('')
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Input
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="e.g., Loose stitch, Missing button"
              />
            </div>

            {/* Description Template */}
            <div className="space-y-2">
              <Label htmlFor="description">Description Template (Optional)</Label>
              <Textarea
                id="description"
                value={descriptionTemplate}
                onChange={(e) => setDescriptionTemplate(e.target.value)}
                placeholder="Default description that can be edited when adding alterations"
                rows={3}
              />
            </div>

            {/* Default Severity */}
            <div className="space-y-2">
              <Label htmlFor="severity">Default Severity *</Label>
              <Select
                value={severity}
                onValueChange={(val) => setSeverity(val as 'minor' | 'major' | 'critical')}
              >
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
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={editingTemplate ? handleUpdate : handleCreate}
              disabled={
                !category ||
                !type ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <Save className="h-4 w-4 mr-2" />
              {editingTemplate ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this alteration template. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
