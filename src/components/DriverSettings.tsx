
import React, { useState } from 'react';
import { AccessibleButton } from "@/components/AccessibleButton";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useUser } from "@/contexts/UserContext";

interface DriverSettingsProps {
  onBack: () => void;
  onLogout: () => void;
}

export const DriverSettings: React.FC<DriverSettingsProps> = ({ onBack, onLogout }) => {
  const { speak, vibrate, settings, updateSettings } = useAccessibility();
  const { user } = useUser();
  
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10); // km
  const [workHours, setWorkHours] = useState<string[]>(['morning', 'afternoon']);
  
  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    speak(checked ? 'Notificações ativadas' : 'Notificações desativadas');
    vibrate([100, 50, 100]);
  };
  
  const handleSoundsChange = (checked: boolean) => {
    setSounds(checked);
    speak(checked ? 'Sons ativados' : 'Sons desativados');
    vibrate([100, 50, 100]);
  };
  
  const handleHapticChange = (checked: boolean) => {
    setHapticFeedback(checked);
    speak(checked ? 'Feedback tátil ativado' : 'Feedback tátil desativado');
    vibrate([100, 50, 100]);
  };
  
  const handleAutoAcceptChange = (checked: boolean) => {
    setAutoAccept(checked);
    speak(checked ? 'Aceitação automática ativada' : 'Aceitação automática desativada');
    vibrate([100, 50, 100]);
  };
  
  const handleMaxDistanceChange = (value: number[]) => {
    setMaxDistance(value[0]);
    speak(`Distância máxima definida para ${value[0]} quilômetros`);
  };
  
  const handleWorkHourToggle = (period: string) => {
    setWorkHours(prev => {
      if (prev.includes(period)) {
        const newHours = prev.filter(h => h !== period);
        speak(`Período ${getWorkHourLabel(period)} removido`);
        return newHours;
      } else {
        speak(`Período ${getWorkHourLabel(period)} adicionado`);
        return [...prev, period];
      }
    });
    vibrate([100, 50, 100]);
  };
  
  const getWorkHourLabel = (period: string) => {
    const labels: Record<string, string> = {
      'morning': 'manhã',
      'afternoon': 'tarde',
      'evening': 'noite',
      'night': 'madrugada'
    };
    return labels[period] || period;
  };
  
  const handleLogout = () => {
    speak('Saindo da conta');
    vibrate([300, 100, 300]);
    onLogout();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Configurações</h2>
        <AccessibleButton
          onClick={onBack}
          variant="ghost"
          ariaLabel="Voltar ao menu principal"
        >
          Voltar
        </AccessibleButton>
      </div>

      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Notificações e Feedback</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications" className="flex-1">
              Notificações push
            </Label>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={handleNotificationsChange}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="sounds" className="flex-1">
              Sons
            </Label>
            <Switch
              id="sounds"
              checked={sounds}
              onCheckedChange={handleSoundsChange}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="haptic" className="flex-1">
              Feedback tátil
            </Label>
            <Switch
              id="haptic"
              checked={hapticFeedback}
              onCheckedChange={handleHapticChange}
            />
          </div>
        </div>
        
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold">Preferências de Corridas</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-accept" className="flex-1">
              Aceitar corridas automaticamente
            </Label>
            <Switch
              id="auto-accept"
              checked={autoAccept}
              onCheckedChange={handleAutoAcceptChange}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="max-distance">Distância máxima para corridas</Label>
              <span>{maxDistance} km</span>
            </div>
            <Slider
              id="max-distance"
              min={1}
              max={30}
              step={1}
              value={[maxDistance]}
              onValueChange={handleMaxDistanceChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Horários de trabalho</Label>
            <div className="grid grid-cols-2 gap-2">
              {['morning', 'afternoon', 'evening', 'night'].map((period) => (
                <AccessibleButton
                  key={period}
                  variant={workHours.includes(period) ? 'primary' : 'outline'}
                  onClick={() => handleWorkHourToggle(period)}
                  ariaLabel={`${workHours.includes(period) ? 'Remover' : 'Adicionar'} período da ${getWorkHourLabel(period)}`}
                  className="justify-start"
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${workHours.includes(period) ? 'bg-white' : 'bg-primary/30'}`}></div>
                    <span>{getWorkHourLabel(period)}</span>
                  </div>
                </AccessibleButton>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold">Acessibilidade</h3>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="contrast" className="flex-1">
              Alto contraste
            </Label>
            <Switch
              id="contrast"
              checked={settings?.contrast === 'high'}
              onCheckedChange={(checked) => {
                updateSettings({ contrast: checked ? 'high' : 'normal' });
                speak(checked ? 'Alto contraste ativado' : 'Alto contraste desativado');
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="font-size" className="flex-1">
              Texto grande
            </Label>
            <Switch
              id="font-size"
              checked={settings?.fontSize === 'large' || settings?.fontSize === 'extra-large'}
              onCheckedChange={(checked) => {
                updateSettings({ fontSize: checked ? 'large' : 'normal' });
                speak(checked ? 'Texto grande ativado' : 'Texto grande desativado');
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="reduced-motion" className="flex-1">
              Reduzir movimento
            </Label>
            <Switch
              id="reduced-motion"
              checked={settings?.reducedMotion || false}
              onCheckedChange={(checked) => {
                updateSettings({ reducedMotion: checked });
                speak(checked ? 'Movimento reduzido ativado' : 'Movimento reduzido desativado');
              }}
            />
          </div>
        </div>
      </Card>

      <AccessibleButton
        onClick={handleLogout}
        variant="destructive"
        className="w-full py-4"
        ariaLabel="Sair da conta"
      >
        Sair da Conta
      </AccessibleButton>
    </div>
  );
};
