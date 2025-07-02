
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with logo - Uber style */}
      <div className="bg-white px-6 pt-16 pb-8 safe-area-top">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white">♿</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Mobilidade Acessível
          </h1>
          <p className="text-gray-600">
            Transporte inclusivo para todos
          </p>
        </div>
      </div>

      <div className="flex-1 px-6">
        {/* User type selector */}
        <div className="mb-6">
          <Tabs 
            value={userType} 
            onValueChange={(value) => {
              setUserType(value as 'passenger' | 'driver');
              speak(value === 'passenger' ? 'Modo passageiro selecionado' : 'Modo motorista selecionado');
            }}
          >
            <TabsList className="grid w-full grid-cols-2 bg-gray-100">
              <TabsTrigger 
                value="passenger" 
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900"
              >
                Passageiro
              </TabsTrigger>
              <TabsTrigger 
                value="driver"
                className="data-[state=active]:bg-white data-[state=active]:text-gray-900"
              >
                Motorista
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Voice Interface */}
        <div className="mb-6">
          <VoiceInterface
            onCommand={handleVoiceCommand}
            placeholder="Diga 'entrar', 'cadastro', 'passageiro' ou 'motorista'"
          />
        </div>

        {/* Login/Register toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <AccessibleButton
            variant={isLogin ? 'primary' : 'ghost'}
            onClick={() => {
              setIsLogin(true);
              speak('Modo de login selecionado');
            }}
            className="flex-1 h-10 text-sm"
            ariaLabel="Modo de login"
          >
            Entrar
          </AccessibleButton>
          <AccessibleButton
            variant={!isLogin ? 'primary' : 'ghost'}
            onClick={() => {
              setIsLogin(false);
              speak('Modo de cadastro selecionado');
            }}
            className="flex-1 h-10 text-sm"
            ariaLabel="Modo de cadastro"
          >
            Cadastrar
          </AccessibleButton>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="h-12 bg-gray-50 border-gray-200 rounded-lg"
                placeholder="Nome completo"
              />
            </div>
          )}

          <div>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 bg-gray-50 border-gray-200 rounded-lg"
              placeholder="E-mail"
            />
          </div>

          {!isLogin && (
            <div>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required={!isLogin}
                className="h-12 bg-gray-50 border-gray-200 rounded-lg"
                placeholder="Telefone"
              />
            </div>
          )}

          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 bg-gray-50 border-gray-200 rounded-lg"
              placeholder="Senha"
            />
          </div>

          {/* Driver specific fields */}
          {!isLogin && userType === 'driver' && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div>
                <Input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  required
                  className="h-12 bg-gray-50 border-gray-200 rounded-lg"
                  placeholder="Modelo do veículo"
                />
              </div>
              
              <div>
                <Input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  required
                  className="h-12 bg-gray-50 border-gray-200 rounded-lg"
                  placeholder="Placa do veículo"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium text-gray-700">
                  Veículo adaptado para acessibilidade
                </Label>
                <Switch
                  checked={hasAccessibleVehicle}
                  onCheckedChange={setHasAccessibleVehicle}
                />
              </div>
            </div>
          )}

          <AccessibleButton
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium mt-6"
            ariaLabel={isLogin ? 'Fazer login' : 'Criar conta'}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Carregando...</span>
              </div>
            ) : (
              isLogin ? 'Entrar' : 'Criar conta'
            )}
          </AccessibleButton>
        </form>

        <div className="text-center mt-6 pb-8">
          <p className="text-xs text-gray-500">
            Ao continuar, você aceita nossos termos de uso e política de privacidade
          </p>
        </div>
      </div>
    </div>
  );
};
