import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Quality Inspector App
          </h1>
          <p className="text-xl text-muted-foreground">
            Mobile/Tablet Quality Inspection System
          </p>
        </div>

        {/* Setup Complete Card */}
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="flex-1">
                <CardTitle className="text-2xl">Setup Complete!</CardTitle>
              </div>
              <Badge variant="secondary">v1.0.0</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Foundation ready with Mac Leather design system
            </p>
            <Button size="lg" className="w-full">
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
