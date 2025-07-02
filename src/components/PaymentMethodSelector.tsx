
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Send, Bitcoin } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selected: string;
  onSelect: (method: string) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({ selected, onSelect }) => {
  const paymentOptions = [
    { id: 'credit-card', label: 'Cartão', icon: CreditCard },
    { id: 'pix', label: 'PIX', icon: Send },
    { id: 'bitcoin', label: 'Bitcoin', icon: Bitcoin },
  ];

  return (
    <div>
      <h3 className="font-semibold mb-2">Forma de Pagamento</h3>
      <div className="flex items-center space-x-2 rounded-lg bg-muted p-1">
        {paymentOptions.map(opt => (
          <Button 
            key={opt.id} 
            onClick={() => onSelect(opt.id)}
            variant={selected === opt.id ? 'default' : 'ghost'}
            className="w-full flex-1 justify-center"
            aria-pressed={selected === opt.id}
          >
            <opt.icon className="h-4 w-4 mr-2" />
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
