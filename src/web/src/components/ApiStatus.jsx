// ApiStatus.jsx

import { useEffect, useRef } from 'react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useApiHealth } from '../hooks/useDigimons';
import { toast } from 'sonner'; // 1. Importar a função toast

export function ApiStatus() {
  // 2. Usar refetchInterval para verificação contínua
  const { data: healthData, refetch, isFetching } = useApiHealth({
    refetchInterval: 30000, // Verifica a cada 30 segundos, mesmo com a janela em foco
    refetchIntervalInBackground: true, // Continua verificando mesmo com a aba em segundo plano
    retry: 1,
    // `enabled` não é mais necessário, pois o refetchInterval cuidará disso.
  });

  // 3. Usar useRef para rastrear o estado anterior da API
  const wasOffline = useRef(true);

  useEffect(() => {
    const isApiOnline = healthData?.success === true;

    // Se a API estava offline e AGORA está online, mostre a notificação.
    if (wasOffline.current && isApiOnline) {
      toast.success('Conexão com a API estabelecida com sucesso!');
    }

    // Atualiza o estado anterior para a próxima renderização.
    wasOffline.current = !isApiOnline;

  }, [healthData]); // Executa sempre que os dados de saúde mudam

  const handleManualRefetch = () => {
    if (!isFetching) {
      refetch();
    }
  };

  if (isFetching && wasOffline.current) { // Mostra "Conectando" apenas na primeira vez
    return (
      <div className="flex flex-col items-center gap-2">
        <Badge variant="secondary" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Conectando...
        </Badge>
        <p className="text-xs text-gray-400 italic mt-1">
          A API está iniciando, pode levar um minuto...
        </p>
      </div>
    );
  }

  if (healthData?.success) {
    return (
      <Badge variant="default" className="flex items-center gap-2 bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
        <CheckCircle className="w-4 h-4" />
        API Online
      </Badge>
    );
  }

  // Se chegou aqui, a API está offline (isError ou !healthData.success)
  return (
    <div className="flex flex-col items-center gap-2">
      <Badge variant="destructive" className="flex items-center gap-2">
        <XCircle className="w-4 h-4" />
        API Offline
      </Badge>
      <Button
        onClick={handleManualRefetch}
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white"
        disabled={isFetching}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Tentar Conectar
      </Button>
      <p className="text-xs text-gray-400 italic mt-1">
        A API está offline. Tentando reconectar...
      </p>
    </div>
  );
}

export default ApiStatus;
