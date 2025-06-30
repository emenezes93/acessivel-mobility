
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { CreditCard, Bitcoin } from "lucide-react";

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodChange
}) => {
  const { speak } = useAccessibility();

  const paymentMethods = [
    {
      id: 'credit-card',
      name: 'Cartão de Crédito/Débito',
      icon: <CreditCard className="h-6 w-6" />,
      emoji: '💳',
      description: 'Visa, Mastercard, Elo'
    },
    {
      id: 'pix',
      name: 'PIX',
      icon: <span className="text-2xl">📱</span>,
      emoji: '📱',
      description: 'Pagamento instantâneo'
    },
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      icon: <Bitcoin className="h-6 w-6" />,
      emoji: '₿',
      description: 'Criptomoeda'
    }
  ];

  const handleMethodSelect = (methodId: string, methodName: string) => {
    onMethodChange(methodId);
    speak(`Método de pagamento selecionado: ${methodName}`);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        Método de Pagamento
      </h3>
      <div className="space-y-3">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`
              p-4 rounded-lg border-2 cursor-pointer transition-all
              ${selectedMethod === method.id 
                ? 'border-primary bg-primary/10' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            onClick={() => handleMethodSelect(method.id, method.name)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMethodSelect(method.id, method.name);
              }
            }}
            aria-label={`Selecionar ${method.name}`}
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
                {method.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{method.emoji}</span>
                  <Label className="text-lg font-medium cursor-pointer">
                    {method.name}
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {method.description}
                </p>
              </div>
              <div className={`
                w-5 h-5 rounded-full border-2
                ${selectedMethod === method.id 
                  ? 'border-primary bg-primary' 
                  : 'border-gray-300'
                }
              `}>
                {selectedMethod === method.id && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
