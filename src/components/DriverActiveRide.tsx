import React, { useState, useEffect } from 'react';
import { AccessibleButton } from "@/components/AccessibleButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LiveTracking } from "@/components/LiveTracking";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface DriverActiveRideProps {
  onBack: () => void;
  onComplete: () => void;
  ride?: any;
  onStatusChange?: (status: string) => void;
}

interface PassengerInfo {
  id: string;
  name: string;
  rating: number;
  phone: string;
  accessibilityNeeds: string[];
}

interface RideInfo {
  id: string;
  origin: string;
  destination: string;
  distance: string;
  duration: string;
  price: number;
  status: 'picking-up' | 'in-progress' | 'arriving';
  passenger: PassengerInfo;
}

export const DriverActiveRide: React.FC<DriverActiveRideProps> = ({ 
  onBack, 
  onComplete,
  ride,
  onStatusChange
}) => {
  const { speak, vibrate } = useAccessibility();
  const [showTracking, setShowTracking] = useState(false);
  
  const [rideInfo, setRideInfo] = useState<RideInfo>(ride || {
    id: 'ride-123',
    origin: 'Av. Paulista, 1000, São Paulo',
    destination: 'Shopping Ibirapuera, São Paulo',
    distance: '5,2 km',
    duration: '18 min',
    price: 24.50,
    status: 'picking-up',
    passenger: {
      id: 'user-456',
      name: 'Maria Silva',
      rating: 4.9,
      phone: '(11) 98765-4321',
      accessibilityNeeds: ['wheelchair', 'hearing-impaired']
    }
  });

  const [progress, setProgress] = useState(0);
  const [estimatedArrival, setEstimatedArrival] = useState('8 min');

  // Simula o progresso da corrida
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prevProgress => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prevProgress + 1;
      });

      // Atualiza o status da corrida com base no progresso
      if (progress === 33) {
        setRideInfo(prev => ({ ...prev, status: 'in-progress' }));
        if (onStatusChange) onStatusChange('em_andamento');
        speak('Passageiro embarcado. Iniciando viagem.');
        vibrate([200, 100, 200]);
      } else if (progress === 90) {
        setRideInfo(prev => ({ ...prev, status: 'arriving' }));
        if (onStatusChange) onStatusChange('chegando');
        speak('Chegando ao destino em breve.');
        vibrate([200, 100, 200]);
      }

      // Atualiza o tempo estimado de chegada
      if (progress < 33) {
        const remainingMinutes = Math.max(1, Math.floor((33 - progress) / 33 * 8));
        setEstimatedArrival(`${remainingMinutes} min`);
      } else if (progress < 90) {
        const remainingMinutes = Math.max(1, Math.floor((90 - progress) / 57 * 18));
        setEstimatedArrival(`${remainingMinutes} min`);
      } else {
        setEstimatedArrival('1 min');
      }
    }, 500);

    return () => clearInterval(timer);
  }, [progress, speak, vibrate]);

  const handleCallPassenger = () => {
    speak(`Ligando para ${rideInfo.passenger.name}`);
    vibrate([100, 50, 100]);
    // Simulação de chamada telefônica
    alert(`Simulando ligação para ${rideInfo.passenger.name}: ${rideInfo.passenger.phone}`);
  };

  const handleMessagePassenger = () => {
    speak(`Enviando mensagem para ${rideInfo.passenger.name}`);
    vibrate([100, 50, 100]);
    // Simulação de envio de mensagem
    alert(`Simulando envio de mensagem para ${rideInfo.passenger.name}`);
  };

  const handleNavigate = () => {
    speak(`Iniciando navegação para ${rideInfo.status === 'picking-up' ? 'local de embarque' : 'destino'}`);
    vibrate([100, 50, 100]);
    // Simulação de navegação
    alert(`Simulando navegação para ${rideInfo.status === 'picking-up' ? rideInfo.origin : rideInfo.destination}`);
  };

  const handleCompleteRide = () => {
    speak('Corrida finalizada com sucesso');
    vibrate([300, 100, 300, 100, 300]);
    onComplete();
  };

  const getStatusText = () => {
    switch (rideInfo.status) {
      case 'picking-up':
        return 'A caminho do passageiro';
      case 'in-progress':
        return 'Em viagem';
      case 'arriving':
        return 'Chegando ao destino';
      default:
        return '';
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const getAccessibilityNeedsLabel = (need: string) => {
    const needsMap: Record<string, string> = {
      'wheelchair': 'Cadeira de rodas',
      'hearing-impaired': 'Deficiência auditiva',
      'vision-impaired': 'Deficiência visual',
      'elderly': 'Idoso',
      'pregnant': 'Gestante',
      'cognitive': 'Deficiência cognitiva',
      'mobility-aid': 'Auxílio de mobilidade'
    };
    
    return needsMap[need] || need;
  };

  const toggleTracking = () => {
    setShowTracking(!showTracking);
    speak(showTracking ? 'Ocultando rastreamento' : 'Exibindo rastreamento em tempo real');
  };

  if (showTracking) {
    return (
      <LiveTracking
        rideId={rideInfo.id}
        origin={{
          address: rideInfo.origin,
          lat: -23.5505,
          lng: -46.6333
        }}
        destination={{
          address: rideInfo.destination,
          lat: -23.5489,
          lng: -46.6388
        }}
        driverInfo={{
          name: 'Você (Motorista)',
          vehicle: 'Seu veículo',
          plate: 'ABC-1234',
          rating: 4.8
        }}
        onClose={() => setShowTracking(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Corrida Ativa</h2>
          <p className="text-muted-foreground">{getStatusText()}</p>
        </div>
        <AccessibleButton
          onClick={onBack}
          variant="ghost"
          size="sm"
          ariaLabel="Voltar ao menu principal"
        >
          Minimizar
        </AccessibleButton>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Tempo estimado</p>
            <p className="text-xl font-bold">{estimatedArrival}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Valor</p>
            <p className="text-xl font-bold">{formatCurrency(rideInfo.price)}</p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Progresso</p>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-2 pt-2">
          <div className="flex items-start space-x-3">
            <div className="mt-1 min-w-4">
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">A</span>
              </div>
            </div>
            <div>
              <p className="font-medium">Origem</p>
              <p className="text-sm">{rideInfo.origin}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="mt-1 min-w-4">
              <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-xs">B</span>
              </div>
            </div>
            <div>
              <p className="font-medium">Destino</p>
              <p className="text-sm">{rideInfo.destination}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl">
            👤
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold">{rideInfo.passenger.name}</h3>
              <div className="flex items-center">
                <span className="text-sm mr-1">⭐</span>
                <span className="text-sm">{rideInfo.passenger.rating}</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{rideInfo.passenger.phone}</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Necessidades de acessibilidade:</p>
          <div className="flex flex-wrap gap-2">
            {rideInfo.passenger.accessibilityNeeds.map((need) => (
              <Badge key={need} variant="outline" className="bg-primary/10">
                {getAccessibilityNeedsLabel(need)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <AccessibleButton
            onClick={handleCallPassenger}
            variant="outline"
            className="flex flex-col items-center justify-center py-2"
            ariaLabel="Ligar para o passageiro"
          >
            <span className="text-xl mb-1">📞</span>
            <span className="text-sm">Ligar</span>
          </AccessibleButton>
          <AccessibleButton
            onClick={handleMessagePassenger}
            variant="outline"
            className="flex flex-col items-center justify-center py-2"
            ariaLabel="Enviar mensagem para o passageiro"
          >
            <span className="text-xl mb-1">💬</span>
            <span className="text-sm">Mensagem</span>
          </AccessibleButton>
          <AccessibleButton
            onClick={handleNavigate}
            variant="outline"
            className="flex flex-col items-center justify-center py-2"
            ariaLabel="Iniciar navegação"
          >
            <span className="text-xl mb-1">🧭</span>
            <span className="text-sm">Navegar</span>
          </AccessibleButton>
          <AccessibleButton
            onClick={toggleTracking}
            variant="outline"
            className="flex flex-col items-center justify-center py-2"
            ariaLabel="Ver rastreamento em tempo real"
          >
            <span className="text-xl mb-1">🛰️</span>
            <span className="text-sm">Tracking</span>
          </AccessibleButton>
        </div>
      </Card>

      {rideInfo.status === 'arriving' && (
        <AccessibleButton
          onClick={handleCompleteRide}
          variant="primary"
          className="w-full py-4 text-lg"
          ariaLabel="Finalizar corrida"
        >
          Finalizar Corrida
        </AccessibleButton>
      )}
    </div>
  );
};
