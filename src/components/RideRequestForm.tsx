import React, { useState, useEffect } from 'react';
import { AccessibleButton } from "@/components/AccessibleButton";
import { VoiceInterface } from "@/components/VoiceInterface";
import { RideScheduler } from "@/components/RideScheduler";
import { DriverCommunication } from "@/components/DriverCommunication";
import { PaymentMethodSelector } from "@/components/PaymentMethodSelector";
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
  const [paymentMethod, setPaymentMethod] = useState<string>('credit-card');
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [rideAccepted, setRideAccepted] = useState(false);
  const [driverInfo, setDriverInfo] = useState<any>(null);
  
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
  }, [origin.address, destination.address, accessibilityNeeds, paymentMethod]);

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
      const paymentMethodFee = paymentMethod === 'bitcoin' ? 1.50 : 0;
      const estimated = basePrice + accessibilityFee + paymentMethodFee;
      
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
    } else if (lowerCommand.includes('agendar')) {
      setShowScheduler(true);
      speak('Abrindo agendamento de corrida');
    } else if (lowerCommand.includes('cartão') || lowerCommand.includes('credito')) {
      setPaymentMethod('credit-card');
      speak('Método de pagamento alterado para cartão');
    } else if (lowerCommand.includes('pix')) {
      setPaymentMethod('pix');
      speak('Método de pagamento alterado para PIX');
    } else if (lowerCommand.includes('bitcoin')) {
      setPaymentMethod('bitcoin');
      speak('Método de pagamento alterado para Bitcoin');
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
    
    if (isScheduled) {
      speak('Agendamento confirmado! Você receberá uma confirmação próximo ao horário.');
    } else {
      speak(`Solicitando corrida com pagamento via ${getPaymentMethodName(paymentMethod)}...`);
    }
    
    // Simulate API call
    setTimeout(() => {
      if (isScheduled) {
        speak('Corrida agendada com sucesso!');
        vibrate([300, 100, 300]);
        setIsSubmitting(false);
        onBack();
      } else {
        // Simulate finding driver
        const mockDriver = {
          name: 'João Silva',
          phone: '+55 11 99999-9999',
          vehicle: 'Honda Civic Branco',
          plate: 'ABC-1234',
          rating: 4.8
        };
        
        setDriverInfo(mockDriver);
        setRideAccepted(true);
        speak('Corrida aceita! Motorista a caminho.');
        vibrate([300, 100, 300]);
        setIsSubmitting(false);
      }
    }, 2000);
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'credit-card': return 'cartão de crédito/débito';
      case 'pix': return 'PIX';
      case 'bitcoin': return 'Bitcoin';
      default: return 'cartão de crédito/débito';
    }
  };

  const handleSchedule = (data: any) => {
    setScheduleData(data);
    setIsScheduled(true);
    setShowScheduler(false);
    speak(`Corrida agendada para ${data.date} às ${data.time}`);
  };

  const handleDriverCall = () => {
    if (driverInfo) {
      window.open(`tel:${driverInfo.phone}`);
    }
  };

  const handleDriverMessage = () => {
    speak('Funcionalidade de chat em desenvolvimento');
  };

  const handleLocateDriver = () => {
    speak('Localizando motorista no mapa');
  };

  if (rideAccepted && driverInfo) {
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
          <h2 className="text-2xl font-bold">Corrida Aceita</h2>
        </div>

        <div className="text-center space-y-4">
          <div className="text-6xl">🚗</div>
          <h3 className="text-xl font-bold text-green-600">Motorista a caminho!</h3>
          <p className="text-lg">Tempo estimado: 8 minutos</p>
        </div>

        <DriverCommunication
          driverInfo={driverInfo}
          onCall={handleDriverCall}
          onMessage={handleDriverMessage}
          onLocateDriver={handleLocateDriver}
        />
      </div>
    );
  }

  if (showScheduler) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <AccessibleButton
            onClick={() => setShowScheduler(false)}
            variant="outline"
            ariaLabel="Voltar ao formulário"
            className="h-12 w-12"
          >
            ←
          </AccessibleButton>
          <h2 className="text-2xl font-bold">Agendar Corrida</h2>
        </div>

        <RideScheduler
          onSchedule={handleSchedule}
          onCancel={() => setShowScheduler(false)}
        />
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
        <h2 className="text-2xl font-bold">
          {isScheduled ? 'Corrida Agendada' : 'Solicitar Corrida'}
        </h2>
      </div>

      <VoiceInterface
        onCommand={handleVoiceCommand}
        placeholder="Diga a origem, destino, método de pagamento ou 'agendar'"
      />

      {isScheduled && scheduleData && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📅</span>
            <div>
              <p className="font-bold">Corrida Agendada</p>
              <p className="text-sm text-muted-foreground">
                {scheduleData.date} às {scheduleData.time}
                {scheduleData.isRecurring && ' (Semanal)'}
              </p>
            </div>
            <AccessibleButton
              onClick={() => {
                setIsScheduled(false);
                setScheduleData(null);
              }}
              variant="outline"
              ariaLabel="Cancelar agendamento"
              className="ml-auto"
            >
              Cancelar
            </AccessibleButton>
          </div>
        </Card>
      )}

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

      <PaymentMethodSelector
        selectedMethod={paymentMethod}
        onMethodChange={setPaymentMethod}
      />

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
            <div>
              <div className="text-2xl font-bold text-green-600">
                R$ {estimatedPrice.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Pagamento via {getPaymentMethodName(paymentMethod)}
              </p>
            </div>
          ) : null}
        </Card>
      )}

      <div className="flex space-x-3">
        <AccessibleButton
          onClick={() => setShowScheduler(true)}
          variant="outline"
          ariaLabel="Agendar corrida para mais tarde"
          className="flex-1 h-16 text-lg"
        >
          <div className="flex items-center space-x-2">
            <span>📅</span>
            <span>Agendar</span>
          </div>
        </AccessibleButton>

        <AccessibleButton
          onClick={handleSubmit}
          disabled={!origin.address || !destination.address || isSubmitting}
          variant="primary"
          ariaLabel={isScheduled ? "Confirmar agendamento" : "Confirmar solicitação de corrida"}
          className="flex-1 h-16 text-lg"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>{isScheduled ? 'Agendando...' : 'Solicitando...'}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>🚗</span>
              <span>{isScheduled ? 'Confirmar Agendamento' : 'Confirmar Corrida'}</span>
            </div>
          )}
        </AccessibleButton>
      </div>
    </div>
  );
};
