
import React, { useState, useEffect } from 'react';
import { AccessibleButton } from "@/components/AccessibleButton";
import { Card } from "@/components/ui/card";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface RideHistoryProps {
  onBack: () => void;
}

interface Ride {
  id: string;
  date: string;
  origin: string;
  destination: string;
  price: number;
  status: 'completed' | 'cancelled';
  accessibilityFeatures: string[];
}

export const RideHistory: React.FC<RideHistoryProps> = ({ onBack }) => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { speak } = useAccessibility();

  useEffect(() => {
    // Simulate loading ride history
    setTimeout(() => {
      const mockRides: Ride[] = [
        {
          id: '1',
          date: '2024-06-28',
          origin: 'Shopping Center Norte',
          destination: 'Hospital das Clínicas',
          price: 18.50,
          status: 'completed',
          accessibilityFeatures: ['Cadeira de rodas']
        },
        {
          id: '2',
          date: '2024-06-25',
          origin: 'Estação Sé',
          destination: 'Aeroporto de Congonhas',
          price: 35.00,
          status: 'completed',
          accessibilityFeatures: ['Cão guia']
        },
        {
          id: '3',
          date: '2024-06-20',
          origin: 'Rua Augusta, 1000',
          destination: 'Parque Ibirapuera',
          price: 22.75,
          status: 'cancelled',
          accessibilityFeatures: []
        }
      ];
      setRides(mockRides);
      setIsLoading(false);
      speak(`${mockRides.length} corridas encontradas no histórico`);
    }, 1000);
  }, [speak]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    return status === 'completed' ? '✅' : '❌';
  };

  const getStatusText = (status: string) => {
    return status === 'completed' ? 'Concluída' : 'Cancelada';
  };

  const announceRide = (ride: Ride) => {
    const features = ride.accessibilityFeatures.length > 0 
      ? ` com ${ride.accessibilityFeatures.join(', ')}`
      : '';
    
    speak(
      `Corrida de ${ride.origin} para ${ride.destination} em ${formatDate(ride.date)}. ` +
      `Status: ${getStatusText(ride.status)}. ` +
      `Valor: ${ride.price.toFixed(2)} reais${features}`
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <AccessibleButton
            onClick={onBack}
            variant="outline"
            ariaLabel="Voltar ao menu principal"
            className="h-12 w-12"
          >
            ←
          </AccessibleButton>
          <h2 className="text-2xl font-bold">Histórico de Corridas</h2>
        </div>
        
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg" aria-live="polite">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <AccessibleButton
          onClick={onBack}
          variant="outline"
          ariaLabel="Voltar ao menu principal"
          className="h-12 w-12"
        >
          ←
        </AccessibleButton>
        <h2 className="text-2xl font-bold">Histórico de Corridas</h2>
      </div>

      {rides.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-4xl mb-4">📱</div>
          <h3 className="text-xl font-semibold mb-2">Nenhuma corrida encontrada</h3>
          <p className="text-muted-foreground">
            Suas corridas aparecerão aqui após serem realizadas.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-lg text-muted-foreground text-center">
            {rides.length} corrida{rides.length !== 1 ? 's' : ''} encontrada{rides.length !== 1 ? 's' : ''}
          </p>
          
          {rides.map((ride) => (
            <Card key={ride.id} className="p-6">
              <AccessibleButton
                onClick={() => announceRide(ride)}
                variant="ghost"
                ariaLabel={`Detalhes da corrida de ${ride.origin} para ${ride.destination}`}
                className="w-full text-left p-0 h-auto"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">
                      {formatDate(ride.date)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span>{getStatusIcon(ride.status)}</span>
                      <span className={`text-sm font-medium ${
                        ride.status === 'completed' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {getStatusText(ride.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <span className="text-green-600 mt-1">📍</span>
                      <div>
                        <p className="text-sm text-muted-foreground">Origem</p>
                        <p className="font-medium">{ride.origin}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <span className="text-red-600 mt-1">🎯</span>
                      <div>
                        <p className="text-sm text-muted-foreground">Destino</p>
                        <p className="font-medium">{ride.destination}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-2xl font-bold text-primary">
                      R$ {ride.price.toFixed(2)}
                    </div>
                    
                    {ride.accessibilityFeatures.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <span>♿</span>
                        <span className="text-sm text-muted-foreground">
                          {ride.accessibilityFeatures.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </AccessibleButton>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
