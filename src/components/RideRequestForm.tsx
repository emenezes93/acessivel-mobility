import React, { useState, useEffect } from 'react';
import { AccessibleButton } from "@/components/AccessibleButton";
import { VoiceInterface } from "@/components/VoiceInterface";
import { RideScheduler } from "@/components/RideScheduler";
import { DriverCommunication } from "@/components/DriverCommunication";
import { LocationInput } from "@/components/LocationInput";
import { MapPlaceholder } from "@/components/MapPlaceholder";
import { RideOptions } from "@/components/RideOptions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethodSelector } from "@/components/PaymentMethodSelector";
import { LiveTracking } from "@/components/LiveTracking";
import { useGeocoding } from "@/hooks/useGeocoding";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useUser } from "@/contexts/UserContext";
import { ArrowLeft, Mic, Map } from 'lucide-react';

interface RideRequestFormProps {
  onBack: () => void;
}

interface Location {
  address: string;
  lat?: number;
  lng?: number;
}

interface ScheduleData {
  date: string;
  time: string;
  isRecurring?: boolean;
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
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [rideAccepted, setRideAccepted] = useState(false);
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const [showTracking, setShowTracking] = useState(false);
  const { speak, vibrate } = useAccessibility();
  const { user } = useUser();
  const { geocodeAddress } = useGeocoding();

  const accessibilityOptions = [
    { id: 'wheelchair', label: 'Cadeira de rodas', icon: '♿' },
    { id: 'guide-dog', label: 'Cão guia', icon: '🦮' },
    { id: 'hearing-assistance', label: 'Assistência auditiva', icon: '🦻' },
    { id: 'visual-assistance', label: 'Assistência visual', icon: '👁️' },
    { id: 'mobility-assistance', label: 'Assistência para mobilidade', icon: '🦯' },
  ];

  useEffect(() => {
    getCurrentLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (origin.address && destination.address) {
      calculateEstimate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin.address, destination.address, accessibilityNeeds, paymentMethod]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            address: 'Sua localização atual',
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCurrentLocation(location);
          setOrigin(location);
          speak('Localização atual obtida e definida como origem.');
        },
        (error) => {
          console.error('Error getting location:', error);
          speak('Não foi possível obter a localização atual. Por favor, insira manualmente.');
        }
      );
    }
  };

  const calculateEstimate = async () => {
    setIsLoadingPrice(true);
    setTimeout(() => {
      const basePrice = 12.50;
      const accessibilityFee = accessibilityNeeds.length * 2.00;
      const paymentMethodFee = paymentMethod === 'bitcoin' ? 1.50 : 0;
      const estimated = basePrice + accessibilityFee + paymentMethodFee;
      setEstimatedPrice(estimated);
      setIsLoadingPrice(false);
      speak(`Estimativa de preço: ${estimated.toFixed(2)} reais`);
    }, 1000);
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    if (lowerCommand.includes('origem')) {
      setOrigin({ address: command.replace('origem', '').trim() });
    } else if (lowerCommand.includes('destino')) {
      setDestination({ address: command.replace('destino', '').trim() });
    } else if (lowerCommand.includes('agendar')) {
      setShowScheduler(true);
    } else if (lowerCommand.includes('confirmar')) {
      handleSubmit();
    }
  };

  const toggleAccessibilityNeed = (needId: string) => {
    setAccessibilityNeeds(prev => {
      const newNeeds = prev.includes(needId) ? prev.filter(id => id !== needId) : [...prev, needId];
      const option = accessibilityOptions.find(opt => opt.id === needId);
      if (option) {
        speak(prev.includes(needId) ? `${option.label} removido` : `${option.label} adicionado`);
      }
      return newNeeds;
    });
  };

  const handleSubmit = async () => {
    if (!origin.address || !destination.address) {
      speak('Por favor, preencha os locais de partida e destino.');
      return;
    }
    setIsSubmitting(true);
    speak(isScheduled ? 'Agendando sua corrida...' : 'Procurando um motorista...');
    setTimeout(() => {
      if (isScheduled) {
        speak('Corrida agendada com sucesso!');
        onBack();
      } else {
        const mockDriver = {
          name: 'Carlos F.',
          phone: '+55 11 98765-4321',
          vehicle: 'Toyota Corolla - Preto',
          plate: 'XYZ-5678',
          rating: 4.9,
          eta: '5 min'
        };
        setDriverInfo(mockDriver);
        setRideAccepted(true);
        speak(`Motorista ${mockDriver.name} encontrado! Chega em ${mockDriver.eta}.`);
      }
      vibrate([200, 100, 200]);
      setIsSubmitting(false);
    }, 2500);
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'credit-card': return 'cartão de crédito/débito';
      case 'pix': return 'PIX';
      case 'bitcoin': return 'Bitcoin';
      default: return 'cartão de crédito/débito';
    }
  };

  const handleSchedule = (scheduleData: { date: string; time: string; isRecurring: boolean; }) => {
    const data: ScheduleData = {
      date: scheduleData.date,
      time: scheduleData.time,
      isRecurring: scheduleData.isRecurring
    };
    setScheduleData(data);
    setIsScheduled(true);
    setShowScheduler(false);
    speak(`Corrida agendada para ${data.date} às ${data.time}.`);
  };

  const toggleTracking = () => {
    setShowTracking(!showTracking);
    speak(showTracking ? 'Ocultando rastreamento' : 'Exibindo rastreamento da corrida');
  };

  if (showTracking && rideAccepted && driverInfo) {
    return (
      <LiveTracking
        rideId="ride-123"
        origin={{
          address: origin.address,
          lat: origin.lat || -23.5505,
          lng: origin.lng || -46.6333
        }}
        destination={{
          address: destination.address,
          lat: destination.lat || -23.5489,
          lng: destination.lng || -46.6388
        }}
        driverInfo={driverInfo}
        onClose={() => setShowTracking(false)}
      />
    );
  }

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
          onCall={() => {
            speak(`Ligando para o motorista ${driverInfo.name}`);
            vibrate(300);
          }}
          onMessage={() => {
            speak('Abrindo chat com o motorista');
          }}
          onLocateDriver={() => {
            speak('Localizando motorista no mapa');
          }}
        />

        <AccessibleButton
          onClick={toggleTracking}
          variant="primary"
          className="w-full h-12"
          ariaLabel="Ver rastreamento em tempo real"
        >
          <div className="flex items-center justify-center space-x-2">
            <span>🛰️</span>
            <span>Ver Rastreamento em Tempo Real</span>
          </div>
        </AccessibleButton>
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
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Voltar">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Solicitar Corrida</h1>
        <Button variant="ghost" size="icon" onClick={() => {}} aria-label="Comandos de voz">
          <Mic className="h-5 w-5" />
        </Button>
      </header>

      <div className="flex-grow relative">
        {/* Mapa com visualização estilizada */}
        <div className="absolute inset-0 bg-muted/10">
          <MapPlaceholder 
            origin={origin.address} 
            destination={destination.address} 
          />
        </div>

        <div className="absolute top-0 left-0 right-0 p-4 space-y-3 pt-6">
          <Card className="shadow-lg overflow-hidden border-none">
            <CardContent className="p-3 space-y-3">
              <LocationInput
                value={origin.address}
                onChange={(value) => setOrigin({ address: value })}
                placeholder="Local de partida"
                type="origin"
                ariaLabel="Local de partida"
              />
              <div className="border-l-2 h-4 ml-6 border-dashed border-muted"></div>
              <LocationInput
                value={destination.address}
                onChange={(value) => setDestination({ address: value })}
                placeholder="Para onde vamos?"
                type="destination"
                ariaLabel="Para onde vamos?"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="p-4 border-t bg-background">
        <RideOptions 
          accessibilityOptions={accessibilityNeeds}
          onAccessibilityToggle={setAccessibilityNeeds}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          estimatedPrice={estimatedPrice}
          isLoadingPrice={isLoadingPrice}
          onSchedule={() => setShowScheduler(true)}
          onConfirm={handleSubmit}
          isSubmitting={isSubmitting}
          isDisabled={!origin.address || !destination.address}
        />
      </footer>

      {showScheduler && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Agendar Corrida</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowScheduler(false)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <RideScheduler 
                onClose={() => setShowScheduler(false)} 
                onSchedule={handleSchedule} 
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
