import React, { useState } from 'react';
import { AccessibleButton } from "@/components/AccessibleButton";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface DriverEarningsProps {
  onBack: () => void;
}

interface EarningPeriod {
  id: string;
  label: string;
  total: number;
  rides: number;
  hours: number;
  details: EarningDetail[];
}

interface EarningDetail {
  id: string;
  date: string;
  amount: number;
  rides: number;
  hours: number;
}

export const DriverEarnings: React.FC<DriverEarningsProps> = ({ onBack }) => {
  const { speak } = useAccessibility();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week');

  // Dados simulados de ganhos
  const earningsData: Record<string, EarningPeriod> = {
    day: {
      id: 'day',
      label: 'Hoje',
      total: 120.50,
      rides: 8,
      hours: 6,
      details: [
        { id: '1', date: '08:00 - 10:00', amount: 45.00, rides: 3, hours: 2 },
        { id: '2', date: '12:00 - 14:00', amount: 35.50, rides: 2, hours: 2 },
        { id: '3', date: '16:00 - 18:00', amount: 40.00, rides: 3, hours: 2 }
      ]
    },
    week: {
      id: 'week',
      label: 'Esta Semana',
      total: 850.75,
      rides: 42,
      hours: 38,
      details: [
        { id: '1', date: 'Segunda-feira', amount: 145.25, rides: 9, hours: 7 },
        { id: '2', date: 'Terça-feira', amount: 132.50, rides: 8, hours: 6 },
        { id: '3', date: 'Quarta-feira', amount: 168.00, rides: 10, hours: 8 },
        { id: '4', date: 'Quinta-feira', amount: 155.50, rides: 7, hours: 7 },
        { id: '5', date: 'Sexta-feira', amount: 120.50, rides: 8, hours: 6 },
        { id: '6', date: 'Sábado', amount: 129.00, rides: 0, hours: 4 },
        { id: '7', date: 'Domingo', amount: 0, rides: 0, hours: 0 }
      ]
    },
    month: {
      id: 'month',
      label: 'Este Mês',
      total: 3250.25,
      rides: 168,
      hours: 160,
      details: [
        { id: '1', date: 'Semana 1', amount: 820.50, rides: 42, hours: 40 },
        { id: '2', date: 'Semana 2', amount: 780.25, rides: 38, hours: 38 },
        { id: '3', date: 'Semana 3', amount: 850.75, rides: 42, hours: 38 },
        { id: '4', date: 'Semana 4', amount: 798.75, rides: 46, hours: 44 }
      ]
    }
  };

  const handlePeriodChange = (value: string) => {
    setSelectedPeriod(value);
    speak(`Mostrando ganhos de ${earningsData[value].label}`);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Meus Ganhos</h2>
        <AccessibleButton
          onClick={onBack}
          variant="ghost"
          size="sm"
          ariaLabel="Voltar ao menu principal"
        >
          Voltar
        </AccessibleButton>
      </div>

      <Tabs defaultValue="week" onValueChange={handlePeriodChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="day" aria-label="Ver ganhos de hoje">
            Hoje
          </TabsTrigger>
          <TabsTrigger value="week" aria-label="Ver ganhos desta semana">
            Semana
          </TabsTrigger>
          <TabsTrigger value="month" aria-label="Ver ganhos deste mês">
            Mês
          </TabsTrigger>
        </TabsList>

        {Object.values(earningsData).map((period) => (
          <TabsContent key={period.id} value={period.id} className="space-y-4">
            <Card className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Total</p>
                  <p className="text-2xl font-bold">{formatCurrency(period.total)}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Corridas</p>
                  <p className="text-2xl font-bold">{period.rides}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Horas</p>
                  <p className="text-2xl font-bold">{period.hours}h</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Detalhamento</h3>
                <div className="space-y-2">
                  {period.details.map((detail) => (
                    <div key={detail.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-accent/50">
                      <div>
                        <p className="font-medium">{detail.date}</p>
                        <p className="text-sm text-muted-foreground">{detail.rides} corridas • {detail.hours}h</p>
                      </div>
                      <p className="font-bold">{formatCurrency(detail.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Estatísticas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Média por corrida</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(period.rides > 0 ? period.total / period.rides : 0)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Média por hora</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(period.hours > 0 ? period.total / period.hours : 0)}
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};