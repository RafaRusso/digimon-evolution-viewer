import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Badge } from './ui/badge'
import { useApiHealth } from '../hooks/useDigimons'

export function ApiStatus() {
  const { data: healthData, isLoading, isError } = useApiHealth()

  if (isLoading) {
    return (
      <Badge variant="secondary" className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        Verificando...
      </Badge>
    )
  }

  if (isError || !healthData?.success) {
    return (
      <Badge variant="destructive" className="flex items-center gap-2">
        <XCircle className="w-4 h-4" />
        API Offline
      </Badge>
    )
  }

  return (
    <Badge variant="default" className="flex items-center gap-2 bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
      <CheckCircle className="w-4 h-4" />
      API Online
    </Badge>
  )
}

export default ApiStatus
