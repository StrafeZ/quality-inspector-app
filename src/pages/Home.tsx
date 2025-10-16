import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const { isAuthenticated, loading, user } = useAuth()
  const navigate = useNavigate()

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Mac Inspections
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
              {isAuthenticated
                ? 'Welcome back! Continue to your dashboard.'
                : 'Foundation ready with Mac Leather design system'
              }
            </p>

            {isAuthenticated && user?.email && (
              <p className="text-sm text-muted-foreground text-center">
                Signed in as <span className="font-medium text-foreground">{user.email}</span>
              </p>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={handleGetStarted}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : isAuthenticated ? (
                'Go to Dashboard'
              ) : (
                'Sign In to Get Started'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
