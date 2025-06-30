
import React from 'react';
import { AccessibleButton } from "@/components/AccessibleButton";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface AccessibilitySettingsProps {
  onBack: () => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ onBack }) => {
  const { settings, updateSettings, speak } = useAccessibility();

  const fontSizeOptions = [
    { value: 'normal', label: 'Normal (16px)' },
    { value: 'large', label: 'Grande (18px)' },
    { value: 'extra-large', label: 'Extra Grande (24px)' },
  ];

  const contrastOptions = [
    { value: 'normal', label: 'Contraste Normal' },
    { value: 'high', label: 'Alto Contraste' },
  ];

  const handleFontSizeChange = (size: 'normal' | 'large' | 'extra-large') => {
    updateSettings({ fontSize: size });
    speak(`Tamanho da fonte alterado para ${fontSizeOptions.find(opt => opt.value === size)?.label}`);
  };

  const handleContrastChange = (contrast: 'normal' | 'high') => {
    updateSettings({ contrast });
    speak(`Contraste alterado para ${contrastOptions.find(opt => opt.value === contrast)?.label}`);
  };

  const handleToggleSetting = (setting: keyof typeof settings, label: string) => {
    const newValue = !settings[setting];
    updateSettings({ [setting]: newValue });
    speak(`${label} ${newValue ? 'ativado' : 'desativado'}`);
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
        <h2 className="text-2xl font-bold">Configurações de Acessibilidade</h2>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tamanho da Fonte</h3>
        <div className="space-y-3">
          {fontSizeOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-3">
              <input
                type="radio"
                id={`font-${option.value}`}
                name="fontSize"
                checked={settings.fontSize === option.value}
                onChange={() => handleFontSizeChange(option.value as any)}
                className="h-5 w-5"
              />
              <Label
                htmlFor={`font-${option.value}`}
                className="text-lg cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Contraste</h3>
        <div className="space-y-3">
          {contrastOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-3">
              <input
                type="radio"
                id={`contrast-${option.value}`}
                name="contrast"
                checked={settings.contrast === option.value}
                onChange={() => handleContrastChange(option.value as any)}
                className="h-5 w-5"
              />
              <Label
                htmlFor={`contrast-${option.value}`}
                className="text-lg cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Funcionalidades</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="voice-enabled"
              checked={settings.voiceEnabled}
              onCheckedChange={() => handleToggleSetting('voiceEnabled', 'Comandos de voz')}
              className="h-5 w-5"
            />
            <Label htmlFor="voice-enabled" className="text-lg cursor-pointer">
              🎤 Comandos de Voz
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="haptic-enabled"
              checked={settings.hapticEnabled}
              onCheckedChange={() => handleToggleSetting('hapticEnabled', 'Feedback tátil')}
              className="h-5 w-5"
            />
            <Label htmlFor="haptic-enabled" className="text-lg cursor-pointer">
              📳 Feedback Tátil (Vibração)
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="reduced-motion"
              checked={settings.reducedMotion}
              onCheckedChange={() => handleToggleSetting('reducedMotion', 'Movimento reduzido')}
              className="h-5 w-5"
            />
            <Label htmlFor="reduced-motion" className="text-lg cursor-pointer">
              🎭 Reduzir Animações
            </Label>
          </div>

          <div className="flex items-center space-x-3">
            <Checkbox
              id="screen-reader"
              checked={settings.screenReader}
              onCheckedChange={() => handleToggleSetting('screenReader', 'Leitor de tela')}
              className="h-5 w-5"
            />
            <Label htmlFor="screen-reader" className="text-lg cursor-pointer">
              👁️ Otimizado para Leitor de Tela
            </Label>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Teste de Acessibilidade</h3>
        <div className="space-y-3">
          <AccessibleButton
            onClick={() => speak('Este é um teste de síntese de voz. Se você consegue ouvir esta mensagem, o sistema está funcionando corretamente.')}
            variant="outline"
            size="lg"
            ariaLabel="Testar síntese de voz"
            className="w-full"
          >
            🔊 Testar Síntese de Voz
          </AccessibleButton>

          <AccessibleButton
            onClick={() => {
              if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200, 100, 200]);
                speak('Teste de vibração executado');
              } else {
                speak('Vibração não disponível neste dispositivo');
              }
            }}
            variant="outline"
            size="lg"
            ariaLabel="Testar vibração"
            className="w-full"
          >
            📳 Testar Vibração
          </AccessibleButton>
        </div>
      </Card>
    </div>
  );
};
