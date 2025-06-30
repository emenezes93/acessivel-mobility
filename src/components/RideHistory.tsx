
import React, { useState } from 'react';
import { AccessibleButton } from "@/components/AccessibleButton";
import { Card } from "@/components/ui/card";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface RideHistoryProps {
  onBack: () => void;
}

interface RideRecord {
  id: string;
  date: string;
  origin: string;
  destination: string;
  driver: string;
  price: number;
  status: 'completed' | 'cancelled';
  rating?: number;
  accessibilityUsed: string[];
}

export const RideHistory: React.FC<RideHistoryProps> = ({ onBack }) => {
  const [rides] = useState<RideRecord[]>([
    {
      id: '1',
      date: '2024-06-28',
      origin: 'Shopping Center Norte',
      destination: 'Hospital das Clínicas',
      driver: 'João Silva',
      price: 25.50,
      status: 'completed',
      rating: 4.5,
      accessibilityUsed: ['wheelchair', 'visual-assistance']
    },
    {
      id: '2',
      date: '2024-06-25',
      origin: 'Rua das Flores, 123',
      destination: 'Metrô Vila Madalena',
      driver: 'Maria Santos',
      price: 18.00,
      status: 'completed',
      rating: 5,
      accessibilityUsed: ['hearing-assistance']
    },
    {
      id: '3',
      date: '2024-06-20',
      origin: 'Casa',
      destination: 'Consulta médica',
      driver: 'Pedro Oliveira',
      price: 32.00,
      status: 'cancelled',
      accessibilityUsed: ['guide-dog']
    }
  ]);

  const [showRatingModal, setShowRatingModal] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const { speak } = useAccessibility();

  const handleRate = (rideId: string, rating: number) => {
    speak(`Avaliação de ${rating} estrelas enviada`);
    setShowRatingModal(null);
    setSelectedRating(0);
  };

  const getAccessibilityIcons = (features: string[]) => {
    const iconMap: { [key: string]: string } = {
      'wheelchair': '♿',
      'guide-dog': '🦮',
      'hearing-assistance': '🦻',
      'visual-assistance': '👁️',
      'mobility-assistance': '🦯'
    };
    
    return features.map(feature => iconMap[feature] || '🔧').join(' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

      <div className="space-y-4">
        {rides.map((ride) => (
          <Card key={ride.id} className="p-4">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {formatDate(ride.date)}
                  </p>
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">📍</span>
                      <span className="text-sm">{ride.origin}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-red-600">🎯</span>
                      <span className="text-sm">{ride.destination}</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-lg">R$ {ride.price.toFixed(2)}</p>
                  <p className={`text-sm px-2 py-1 rounded ${
                    ride.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {ride.status === 'completed' ? 'Concluída' : 'Cancelada'}
                  </p>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Motorista</p>
                    <p className="font-medium">{ride.driver}</p>
                  </div>
                  
                  {ride.rating && (
                    <div className="flex items-center space-x-1">
                      <span>⭐</span>
                      <span className="font-medium">{ride.rating}</span>
                    </div>
                  )}
                </div>

                {ride.accessibilityUsed.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Acessibilidade</p>
                    <p className="text-lg">{getAccessibilityIcons(ride.accessibilityUsed)}</p>
                  </div>
                )}
              </div>

              {ride.status === 'completed' && !ride.rating && (
                <AccessibleButton
                  onClick={() => setShowRatingModal(ride.id)}
                  variant="outline"
                  ariaLabel={`Avaliar corrida com ${ride.driver}`}
                  className="w-full mt-3"
                >
                  ⭐ Avaliar Corrida
                </AccessibleButton>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de Avaliação */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm p-6">
            <h3 className="text-xl font-bold text-center mb-4">
              Avaliar Corrida
            </h3>
            
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <AccessibleButton
                  key={star}
                  onClick={() => {
                    setSelectedRating(star);
                    speak(`${star} estrelas selecionadas`);
                  }}
                  variant="ghost"
                  ariaLabel={`${star} estrelas`}
                  className={`text-3xl ${
                    star <= selectedRating ? 'text-yellow-500' : 'text-gray-300'
                  }`}
                >
                  ⭐
                </AccessibleButton>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <AccessibleButton
                onClick={() => handleRate(showRatingModal, selectedRating)}
                disabled={selectedRating === 0}
                variant="primary"
                ariaLabel="Confirmar avaliação"
                className="flex-1"
              >
                Confirmar
              </AccessibleButton>
              
              <AccessibleButton
                onClick={() => {
                  setShowRatingModal(null);
                  setSelectedRating(0);
                }}
                variant="outline"
                ariaLabel="Cancelar avaliação"
                className="flex-1"
              >
                Cancelar
              </AccessibleButton>
            </div>
          </Card>
        </div>
      )}

      {rides.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold mb-2">Nenhuma corrida ainda</h3>
          <p className="text-muted-foreground">
            Suas corridas aparecerão aqui após serem realizadas
          </p>
        </Card>
      )}
    </div>
  );
};
