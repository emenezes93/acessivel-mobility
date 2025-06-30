
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccessibleButton } from "@/components/AccessibleButton";
import { VoiceInterface } from "@/components/VoiceInterface";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useUser } from "@/contexts/UserContext";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

interface AccessibleLoginProps {
  onLogin: (userType: 'passenger' | 'driver') => void;
}

export const AccessibleLogin: React.FC<AccessibleLoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'passenger' | 'driver'>('passenger');
  
  // Campos adicionais para motoristas
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [hasAccessibleVehicle, setHasAccessibleVehicle] = useState(false);
  
  const { speak, vibrate } = useAccessibility();
  const { setUser } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newUser = {
        id: '1',
        name: isLogin ? 'Usuário' : name,
        email,
        phone: isLogin ? '(11) 99999-9999' : phone,
        userType: userType,
        accessibilityNeeds: {
          visualImpairment: false,
          hearingImpairment: false,
          mobilityImpairment: false,
          cognitiveImpairment: false,
          preferredInterface: 'visual' as const,
        },
        emergencyContacts: [],
        // Adicionar informações do veículo se for motorista
        ...(userType === 'driver' && !isLogin ? {
          vehicle: {
            model: vehicleModel,
            plate: vehiclePlate,
            hasAccessibility: hasAccessibleVehicle
          }
        } : {})
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      speak(isLogin ? 'Login realizado com sucesso!' : 'Cadastro realizado com sucesso!');
      vibrate([200, 100, 200]);
      setIsLoading(false);
      onLogin(userType);
    }, 1500);
  };

  const handleVoiceCommand = (command: string) => {
    if (command.toLowerCase().includes('entrar') || command.toLowerCase().includes('login')) {
      setIsLogin(true);
      speak('Modo de login ativado');
    } else if (command.toLowerCase().includes('cadastro') || command.toLowerCase().includes('registrar')) {
      setIsLogin(false);
      speak('Modo de cadastro ativado');
    } else if (command.toLowerCase().includes('passageiro')) {
      setUserType('passenger');
      speak('Modo passageiro selecionado');
    } else if (command.toLowerCase().includes('motorista')) {
      setUserType('driver');
      speak('Modo motorista selecionado');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-green-50">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4" role="img" aria-label="Ícone de acessibilidade">
            ♿
          </div>
          <h1 className="text-3xl font-bold text-primary">
            Mobilidade Acessível
          </h1>
          <p className="text-lg text-muted-foreground">
            Transporte inclusivo para todos
          </p>
        </div>

        <VoiceInterface
          onCommand={handleVoiceCommand}
          placeholder="Diga 'entrar', 'cadastro', 'passageiro' ou 'motorista'"
        />

        <div className="flex space-x-2">
          <AccessibleButton
            variant={isLogin ? 'primary' : 'secondary'}
            onClick={() => {
              setIsLogin(true);
              speak('Modo de login selecionado');
            }}
            ariaLabel="Selecionar modo de login"
            className="flex-1"
          >
            Entrar
          </AccessibleButton>
          <AccessibleButton
            variant={!isLogin ? 'primary' : 'secondary'}
            onClick={() => {
              setIsLogin(false);
              speak('Modo de cadastro selecionado');
            }}
            ariaLabel="Selecionar modo de cadastro"
            className="flex-1"
          >
            Cadastro
          </AccessibleButton>
        </div>
        
        <Tabs 
          value={userType} 
          onValueChange={(value) => {
            setUserType(value as 'passenger' | 'driver');
            speak(value === 'passenger' ? 'Modo passageiro selecionado' : 'Modo motorista selecionado');
          }}
          className="mt-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="passenger" aria-label="Entrar como passageiro">
              Passageiro
            </TabsTrigger>
            <TabsTrigger value="driver" aria-label="Entrar como motorista">
              Motorista
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg font-medium">
                Nome completo
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="h-12 text-lg"
                placeholder="Seu nome completo"
                aria-describedby="name-help"
              />
              <p id="name-help" className="text-sm text-muted-foreground">
                Digite seu nome completo
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-lg font-medium">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 text-lg"
              placeholder="seu.email@exemplo.com"
              aria-describedby="email-help"
            />
            <p id="email-help" className="text-sm text-muted-foreground">
              Digite seu endereço de e-mail
            </p>
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-lg font-medium">
                Telefone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required={!isLogin}
                className="h-12 text-lg"
                placeholder="(11) 99999-9999"
                aria-describedby="phone-help"
              />
              <p id="phone-help" className="text-sm text-muted-foreground">
                Digite seu número de telefone
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="password" className="text-lg font-medium">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 text-lg"
              placeholder="Sua senha"
              aria-describedby="password-help"
            />
            <p id="password-help" className="text-sm text-muted-foreground">
              {isLogin ? 'Digite sua senha' : 'Crie uma senha segura'}
            </p>
          </div>

          {/* Campos adicionais para motoristas */}
          {!isLogin && userType === 'driver' && (
            <div className="space-y-4 border-t pt-4 mt-4">
              <h3 className="font-medium">Informações do Veículo</h3>
              
              <div className="space-y-2">
                <Label htmlFor="vehicleModel" className="text-lg font-medium">
                  Modelo do Veículo
                </Label>
                <Input
                  id="vehicleModel"
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  required
                  className="h-12 text-lg"
                  placeholder="Ex: Toyota Corolla"
                  aria-describedby="vehicle-model-help"
                />
                <p id="vehicle-model-help" className="text-sm text-muted-foreground">
                  Digite o modelo do seu veículo
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="vehiclePlate" className="text-lg font-medium">
                  Placa do Veículo
                </Label>
                <Input
                  id="vehiclePlate"
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  required
                  className="h-12 text-lg"
                  placeholder="Ex: ABC1234"
                  aria-describedby="vehicle-plate-help"
                />
                <p id="vehicle-plate-help" className="text-sm text-muted-foreground">
                  Digite a placa do seu veículo
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="accessibleVehicle"
                  checked={hasAccessibleVehicle}
                  onCheckedChange={setHasAccessibleVehicle}
                />
                <Label htmlFor="accessibleVehicle" className="text-lg font-medium">
                  Veículo adaptado para acessibilidade
                </Label>
              </div>
            </div>
          )}

          <AccessibleButton
            type="submit"
            variant="primary"
            disabled={isLoading}
            ariaLabel={isLogin ? 'Fazer login' : 'Criar conta'}
            className="w-full h-14 text-lg"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Carregando...</span>
              </div>
            ) : (
              isLogin ? 'Entrar' : 'Criar conta'
            )}
          </AccessibleButton>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Ao continuar, você aceita nossos termos de uso e política de privacidade
          </p>
        </div>
      </Card>
    </div>
  );
};
