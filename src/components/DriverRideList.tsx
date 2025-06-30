import React, { useState, useEffect } from 'react';
import { AccessibleButton } from "@/components/AccessibleButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface DriverRideListProps {
  onBack: () => void;
  onAcceptRide: (ride: any) => void;
}

interface RideRequest {
  id: string;
  passengerName: string;
  passengerPhone: string;
  passengerRating: number;
  origin: string;
  destination: string;
  estimatedPrice: number;
  estimatedDistance: string;
  estimatedDuration: string;
  accessibilityNeeds: string[];
  status: 'pendente' | 'a_caminho' | 'em_andamento' | 'concluida' | 'cancelada';
}

export const DriverRideList: React.FC<DriverRideListProps> = ({ onBack, onAcceptRide }) => {
  const [availableRides, setAvailableRides] = useState<RideRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { speak, vibrate } = useAccessibility();

  useEffect(() => {
    // Simular carregamento de corridas disponíveis
    setIsLoading(true);
    setTimeout(() => {
      const mockRides: RideRequest[] = [
        {
          id: '1',
          passengerName: 'Maria Silva',
          passengerPhone: '11999998888',
          passengerRating: 4.8,
          origin: 'Av. Paulista, 1000',
          destination: 'Shopping Ibirapuera',
          estimatedPrice: 35.50,
          estimatedDistance: '7.2 km',
          estimatedDuration: '25 min',
          accessibilityNeeds: ['wheelchair'],
          status: 'pendente'
        },
        {
          id: '2',
          passengerName: 'João Oliveira',
          passengerPhone: '11988887777',
          passengerRating: 4.5,
          origin: 'Rua Augusta, 500',
          destination: 'Hospital das Clínicas',
          estimatedPrice: 28.75,
          estimatedDistance: '5.5 km',
          estimatedDuration: '18 min',
          accessibilityNeeds: ['visual-assistance', 'guide-dog'],
          status: 'pendente'
        },
        {
          id: '3',
          passengerName: 'Ana Souza',
          passengerPhone: '11977776666',
          passengerRating: 4.9,
          origin: 'Estação Sé do Metrô',
          destination: 'Parque Ibirapuera',
          estimatedPrice: 42.30,
          estimatedDistance: '8.7 km',
          estimatedDuration: '30 min',
          accessibilityNeeds: ['mobility-assistance'],
          status: 'pendente'
        }
      ];
      
      setAvailableRides(mockRides);
      setIsLoading(false);
      speak(`${mockRides.length} corridas disponíveis`);
    }, 1500);
  }, [speak]);

  const handleAcceptRide = (ride: RideRequest) => {
    vibrate([200, 100, 200]);
    speak(`Aceitando corrida para ${ride.passengerName}`);
    
    // Atualizar status da corrida
    const updatedRide = {...ride, status: 'a_caminho' as const};
    onAcceptRide(updatedRide);
  };

  // Funções auxiliares para acessibilidade
  const getAccessibilityIcon = (need: string) => {
    const iconMap: { [key: string]: string } = {
      'wheelchair': '♿',
      'guide-dog': '🦮',
      'hearing-assistance': '🦻',
      'visual-assistance': '👁️',
      'mobility-assistance': '🦯'
    };
    
    // Verificação de segurança para evitar injeção de objeto
    return Object.prototype.hasOwnProperty.call(iconMap, need) ? iconMap[need] : '🔧';
  };

  const getAccessibilityLabel = (need: string) => {
    const labelMap: { [key: string]: string } = {
      'wheelchair': 'Cadeira de rodas',
      'guide-dog': 'Cão guia',
      'hearing-assistance': 'Assistência auditiva',
      'visual-assistance': 'Assistência visual',
      'mobility-assistance': 'Assistência para mobilidade'
    };
    
    // Verificação de segurança para evitar injeção de objeto
    return Object.prototype.hasOwnProperty.call(labelMap, need) ? labelMap[need] : need;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Corridas Disponíveis</h2>
        <AccessibleButton
          onClick={onBack}
          variant="ghost"
          size="sm"
          ariaLabel="Voltar ao menu principal"
        >
          Voltar
        </AccessibleButton>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg" aria-live="polite">Buscando corridas disponíveis...</p>
        </div>
      ) : availableRides.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-lg mb-4">Nenhuma corrida disponível no momento.</p>
          <AccessibleButton
            onClick={onBack}
            variant="primary"
            ariaLabel="Voltar ao menu principal"
          >
            Voltar ao Menu
          </AccessibleButton>
        </Card>
      ) : (
        <div className="space-y-4">
          {availableRides.map(ride => (
            <Card key={ride.id} className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{ride.passengerName}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="mr-1">⭐</span>
                      <span>{ride.passengerRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">R$ {ride.estimatedPrice.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{ride.estimatedDistance}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm"><strong>Origem:</strong> {ride.origin}</p>
                  <p className="text-sm"><strong>Destino:</strong> {ride.destination}</p>
                  <p className="text-sm"><strong>Duração estimada:</strong> {ride.estimatedDuration}</p>
                </div>
                
                {ride.accessibilityNeeds.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-1">Necessidades de Acessibilidade:</p>
                    <div className="flex flex-wrap gap-2">
                      {ride.accessibilityNeeds.map(need => (
                        <Badge key={need} variant="outline" className="text-xs py-0.5">
                          {getAccessibilityIcon(need)} {getAccessibilityLabel(need)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <AccessibleButton
                  onClick={() => handleAcceptRide(ride)}
                  variant="primary"
                  size="sm"
                  className="w-full mt-2"
                  ariaLabel={`Aceitar corrida para ${ride.passengerName}`}
                >
                  Aceitar Corrida
                </AccessibleButton>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};