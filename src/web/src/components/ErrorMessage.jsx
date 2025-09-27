import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './ui/button'

export function ErrorMessage({ 
  message, 
  onRetry = null, 
  showRetry = true,
  className = '' 
}) {
  return (
    <div className={`error-message ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium">Ops! Algo deu errado</p>
          <p className="text-sm mt-1 opacity-90">{message}</p>
          {showRetry && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar novamente
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ErrorMessage
