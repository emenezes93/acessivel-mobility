
import React, { useState, useEffect } from 'react';
import { AccessibleButton } from "@/components/AccessibleButton";
import { VoiceInterface } from "@/components/VoiceInterface";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useUser } from "@/contexts/UserContext";

interface RideRequestFormProps {
  onBack: () => void;
}

interface Location {
  address: string;
  lat?: number;
  lng?: number;
}

export const RideRequestForm: React.FC<RideRequestFormProps> = ({ onBack }) => {
  const [origin, setOrigin] = useState<Location>({ address: '' });
  const [destination, setDestination] = useState<Location>({ address: '' });
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>([]);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  
  const { speak, vibrate } = useAccessibility();
  const { user } = useUser();

  const accessibilityOptions = [
    { id: 'wheelchair', label: 'Cadeira de rodas', icon: '♿' },
    { id: 'guide-dog', label: 'Cão guia', icon: '🦮' },
    { id: 'hearing-assistance', label: 'Assistência auditiva', icon: '🦻' },
    { id: 'visual-assistance', label: 'Assistência visual', icon: '👁️' },
    { id: 'mobility-assistance', label: 'Assistência para mobilidade', icon: '🦯' },
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (origin.address && destination.address) {
      calculateEstimate();
    }
  }, [origin.address, destination.address, accessibilityNeeds]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            address: 'Localização atual',
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          speak('Localização atual obtida');
        },
        (error) => {
          console.error('Error getting location:', error);
          speak('Não foi possível obter a localização atual');
        }
      );
    }
  };

  const useCurrentLocation = () => {
    if (currentLocation) {
      setOrigin(currentLocation);
      speak('Localização atual definida como origem');
      vibrate(200);
    }
  };

  const calculateEstimate = async () => {
    setIsLoadingPrice(true);
    
    // Simulate API call for price estimation
    setTimeout(() => {
      const basePrice = 12.50;
      const accessibilityFee = accessibilityNeeds.length * 2.00;
      const estimated = basePrice + accessibilityFee;
      
      setEstimatedPrice(estimated);
      setIsLoadingPrice(false);
      speak(`Valor estimado: ${estimated.toFixed(2)} reais`);
    }, 1500);
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('origem') || lowerCommand.includes('saída')) {
      setOrigin({ address: command });
      speak('Origem definida por voz');
    } else if (lowerCommand.includes('destino') || lowerCommand.includes('indo')) {
      setDestination({ address: command });
      speak('Destino definido por voz');
    } else if (lowerCommand.includes('confirmar') || lowerCommand.includes('solicitar')) {
      handleSubmit();
    }
  };

  const toggleAccessibilityNeed = (needId: string) => {
    setAccessibilityNeeds(prev => {
      const newNeeds = prev.includes(needId)
        ? prev.filter(id => id !== needId)
        : [...prev, needId];
      
      const option = accessibilityOptions.find(opt => opt.id === needId);
      if (option) {
        speak(prev.includes(needId) ? 
          `${option.label} removido` : 
          `${option.label} adicionado`
        );
      }
      
      return newNeeds;
    });
  };

  const handleSubmit = async () => {
    if (!origin.address || !destination.address) {
      speak('Por favor, preencha origem e destino');
      return;
    }

    setIsSubmitting(true);
    speak('Solicitando corrida...');
    
    // Simulate API call
    setTimeout(() => {
      speak('Corrida solicitada com sucesso! Procurando motoristas próximos.');
      vibrate([300, 100, 300]);
      setIsSubmitting(false);
      onBack();
    }, 2000);
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
        <h2 className="text-2xl font-bold">Solicitar Corrida</h2>
      </div>

      <VoiceInterface
        onCommand={handleVoiceCommand}
        placeholder="Diga a origem e destino da sua viagem"
      />

      <Card className="p-6 space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="origin" className="text-lg font-medium">
              De onde você está saindo?
            </Label>
            <div className="flex space-x-2 mt-2">
              <Input
                id="origin"
                value={origin.address}
                onChange={(e) => setOrigin({ address: e.target.value })}
                placeholder="Digite o endereço de origem"
                className="h-12 text-lg flex-1"
              />
              {currentLocation && (
                <AccessibleButton
                  onClick={useCurrentLocation}
                  variant="outline"
                  ariaLabel="Usar localização atual"
                  className="h-12 px-3"
                >
                  📍
                </AccessibleButton>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="destination" className="text-lg font-medium">
              Para onde você vai?
            </Label>
            <Input
              id="destination"
              value={destination.address}
              onChange={(e) => setDestination({ address: e.target.value })}
              placeholder="Digite o endereço de destino"
              className="h-12 text-lg mt-2"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Necessidades de Acessibilidade
        </h3>
        <div className="space-y-3">
          {accessibilityOptions.map((option) => (
            <div key={option.id} className="flex items-center space-x-3">
              <Checkbox
                id={option.id}
                checked={accessibilityNeeds.includes(option.id)}
                onCheckedChange={() => toggleAccessibilityNeed(option.id)}
                className="h-5 w-5"
              />
              <Label
                htmlFor={option.id}
                className="flex items-center space-x-2 text-lg cursor-pointer"
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </Label>
            </div>
          ))}
        </div>
      </Card>

      {(origin.address && destination.address) && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Estimativa de Preço</h3>
          {isLoadingPrice ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span>Calculando...</span>
            </div>
          ) : estimatedPrice ? (
            <div className="text-2xl font-bold text-green-600">
              R$ {estimatedPrice.toFixed(2)}
            </div>
          ) : null}
        </Card>
      )}

      <AccessibleButton
        onClick={handleSubmit}
        disabled={!origin.address || !destination.address || isSubmitting}
        variant="default"
        size="lg"
        ariaLabel="Confirmar solicitação de corrida"
        className="w-full h-16 text-lg"
      >
        {isSubmitting ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Solicitando...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span>🚗</span>
            <span>Confirmar Corrida</span>
          </div>
        )}
      </AccessibleButton>
    </div>
  );
};
