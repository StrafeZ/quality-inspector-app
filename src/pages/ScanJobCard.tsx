import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QrCode, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ScanJobCard() {
  const navigate = useNavigate()

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
            <h1 className="text-2xl font-bold text-foreground">Scan Job Card</h1>
            <p className="text-sm text-muted-foreground">
              QR code scanning for quality inspection
            </p>
          </div>
        </div>

        {/* Placeholder Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <QrCode className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>QR Scanner</CardTitle>
                <CardDescription>
                  Scan job card QR codes to start inspection
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <QrCode className="h-24 w-24 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                QR scanner functionality coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
