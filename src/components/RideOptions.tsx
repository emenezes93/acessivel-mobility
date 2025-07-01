import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AccessibilityOptions } from '@/components/AccessibilityOptions';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { Button } from '@/components/ui/button';
import { Clock, Car } from 'lucide-react';

interface RideOptionsProps {
  accessibilityOptions: string[];
  onAccessibilityToggle: (options: string[]) => void;
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  estimatedPrice: number | null;
  isLoadingPrice: boolean;
  onSchedule: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  isDisabled: boolean;
}

export const RideOptions: React.FC<RideOptionsProps> = ({
  accessibilityOptions,
  onAccessibilityToggle,
  paymentMethod,
  onPaymentMethodChange,
  estimatedPrice,
  isLoadingPrice,
  onSchedule,
  onConfirm,
  isSubmitting,
  isDisabled
}) => {
  return (
    <Card className="shadow-lg border-t-4 border-t-primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center">
          <Car className="mr-2 h-5 w-5" />
          Opções da Corrida
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <AccessibilityOptions 
          options={accessibilityOptions} 
          onToggle={onAccessibilityToggle} 
        />
        
        <PaymentMethodSelector 
          selected={paymentMethod} 
          onSelect={onPaymentMethodChange} 
        />
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-lg font-bold">
            {isLoadingPrice ? (
              <div className="flex items-center">
                <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin mr-2"></div>
                <span className="text-muted-foreground">Calculando...</span>
              </div>
            ) : estimatedPrice ? (
              <span className="text-xl">R$ {estimatedPrice.toFixed(2)}</span>
            ) : (
              <span className="text-muted-foreground">Preço estimado</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              onClick={onSchedule} 
              variant="outline" 
              size="sm"
              className="flex items-center"
            >
              <Clock className="h-4 w-4 mr-1" /> Agendar
            </Button>
            
            <Button 
              onClick={onConfirm} 
              disabled={isSubmitting || isDisabled}
              className="px-6"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-2"></div>
                  <span>Solicitando...</span>
                </div>
              ) : (
                'Confirmar Corrida'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};