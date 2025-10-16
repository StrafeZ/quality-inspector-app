import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, ArrowLeft, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export default function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
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
            <h1 className="text-2xl font-bold text-foreground">Profile</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account settings
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Your profile and preferences
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Email Address
              </label>
              <p className="text-base text-foreground">{user?.email}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                User ID
              </label>
              <p className="text-sm font-mono text-muted-foreground">{user?.id}</p>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
