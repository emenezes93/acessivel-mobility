import React, { useState } from 'react';
import { AccessibleButton } from "@/components/AccessibleButton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/contexts/UserContext";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface DriverProfileProps {
  onBack: () => void;
}

interface VehicleInfo {
  model: string;
  year: string;
  plate: string;
  color: string;
  hasAccessibility: boolean;
  accessibilityFeatures: string[];
}

export const DriverProfile: React.FC<DriverProfileProps> = ({ onBack }) => {
  const { user, updateUser } = useUser();
  const { speak, vibrate } = useAccessibility();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('Motorista há 3 anos, especializado em transporte acessível.');
  const [isLoading, setIsLoading] = useState(false);
  
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    model: 'Toyota Corolla',
    year: '2022',
    plate: 'ABC1D23',
    color: 'Prata',
    hasAccessibility: true,
    accessibilityFeatures: ['wheelchair-ramp', 'extra-space']
  });

  const handleEditToggle = () => {
    if (isEditing) {
      // Salvar alterações
      setIsLoading(true);
      setTimeout(() => {
        if (user) {
          updateUser({
            name,
            phone,
            email
          });
        }
        setIsLoading(false);
        setIsEditing(false);
        speak('Perfil atualizado com sucesso');
        vibrate([200, 100, 200]);
      }, 1000);
    } else {
      setIsEditing(true);
      speak('Modo de edição ativado');
    }
  };

  const handleAccessibilityToggle = () => {
    setVehicleInfo(prev => ({
      ...prev,
      hasAccessibility: !prev.hasAccessibility
    }));
    speak(vehicleInfo.hasAccessibility ? 
      'Recursos de acessibilidade desativados' : 
      'Recursos de acessibilidade ativados');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Perfil do Motorista</h2>
        <AccessibleButton
          onClick={onBack}
          variant="ghost"
          size="sm"
          ariaLabel="Voltar ao menu principal"
        >
          Voltar
        </AccessibleButton>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl">
            👤
          </div>
          {!isEditing ? (
            <div className="text-center">
              <h3 className="text-xl font-bold">{user?.name}</h3>
              <p className="text-muted-foreground">Motorista Parceiro</p>
              <div className="flex items-center justify-center mt-2">
                <span className="text-sm mr-1">⭐</span>
                <span className="font-medium">4.8</span>
                <span className="text-xs text-muted-foreground ml-1">(203 avaliações)</span>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold mb-2">Informações de Contato</h4>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Telefone:</strong> {user?.phone}</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-2">Sobre mim</h4>
              <p>{bio}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2">Informações do Veículo</h4>
              <p><strong>Modelo:</strong> {vehicleInfo.model}</p>
              <p><strong>Ano:</strong> {vehicleInfo.year}</p>
              <p><strong>Placa:</strong> {vehicleInfo.plate}</p>
              <p><strong>Cor:</strong> {vehicleInfo.color}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2">Acessibilidade</h4>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${vehicleInfo.hasAccessibility ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <p>{vehicleInfo.hasAccessibility ? 'Veículo adaptado para acessibilidade' : 'Veículo sem adaptações de acessibilidade'}</p>
              </div>
              
              {vehicleInfo.hasAccessibility && (
                <div className="mt-2">
                  <p><strong>Recursos disponíveis:</strong></p>
                  <ul className="list-disc list-inside ml-2">
                    <li>Rampa para cadeira de rodas</li>
                    <li>Espaço extra para equipamentos</li>
                    <li>Suporte para fixação de cadeira de rodas</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="bio">Sobre mim</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="accessibility-toggle">Veículo adaptado para acessibilidade</Label>
                <Switch
                  id="accessibility-toggle"
                  checked={vehicleInfo.hasAccessibility}
                  onCheckedChange={handleAccessibilityToggle}
                />
              </div>
            </div>
          </div>
        )}

        <AccessibleButton
          onClick={handleEditToggle}
          variant="primary"
          disabled={isLoading}
          className="w-full"
          ariaLabel={isEditing ? 'Salvar alterações' : 'Editar perfil'}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Salvando...</span>
            </div>
          ) : isEditing ? 'Salvar Alterações' : 'Editar Perfil'}
        </AccessibleButton>
      </Card>
    </div>
  );
};