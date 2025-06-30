
import React, { useState } from 'react';
import { AccessibleButton } from "@/components/AccessibleButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccessibility } from "@/contexts/AccessibilityContext";

interface RideSchedulerProps {
  onSchedule: (scheduleData: { date: string; time: string; isRecurring: boolean }) => void;
  onCancel: () => void;
}

export const RideScheduler: React.FC<RideSchedulerProps> = ({ onSchedule, onCancel }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const { speak } = useAccessibility();

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) {
      speak('Por favor, selecione data e horário');
      return;
    }

    onSchedule({
      date: selectedDate,
      time: selectedTime,
      isRecurring
    });

    speak(`Corrida agendada para ${selectedDate} às ${selectedTime}`);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMinTime = () => {
    const now = new Date();
    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    
    // Se a data selecionada é hoje, definir horário mínimo como atual + 30 min
    if (selectedDateObj.toDateString() === today.toDateString()) {
      now.setMinutes(now.getMinutes() + 30);
      return now.toTimeString().slice(0, 5);
    }
    
    return '06:00'; // Horário mínimo para outros dias
  };

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-xl font-bold">Agendar Corrida</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="schedule-date" className="text-lg font-medium">
            Data da corrida
          </Label>
          <Input
            id="schedule-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            min={getMinDate()}
            className="h-12 text-lg mt-2"
          />
        </div>

        <div>
          <Label htmlFor="schedule-time" className="text-lg font-medium">
            Horário da corrida
          </Label>
          <Input
            id="schedule-time"
            type="time"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            min={selectedDate ? getMinTime() : '06:00'}
            max="23:30"
            className="h-12 text-lg mt-2"
          />
        </div>

        <div className="flex items-center space-x-3">
          <Checkbox
            id="recurring"
            checked={isRecurring}
            onCheckedChange={(checked) => {
              setIsRecurring(checked as boolean);
              speak(checked ? 'Corrida recorrente ativada' : 'Corrida recorrente desativada');
            }}
            className="h-5 w-5"
          />
          <Label htmlFor="recurring" className="text-lg cursor-pointer">
            🔄 Repetir semanalmente
          </Label>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <AccessibleButton
          onClick={handleSchedule}
          variant="primary"
          ariaLabel="Confirmar agendamento"
          className="flex-1"
        >
          📅 Agendar
        </AccessibleButton>
        
        <AccessibleButton
          onClick={onCancel}
          variant="outline"
          ariaLabel="Cancelar agendamento"
          className="flex-1"
        >
          Cancelar
        </AccessibleButton>
      </div>
    </Card>
  );
};
