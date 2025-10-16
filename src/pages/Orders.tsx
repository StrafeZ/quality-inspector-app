import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Orders() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Orders</h1>
            <p className="text-sm text-muted-foreground">
              View and manage production orders
            </p>
          </div>
        </div>

        {/* Placeholder Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Package className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Orders List</CardTitle>
                <CardDescription>
                  Browse all production orders
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Package className="h-24 w-24 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                Orders functionality coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
