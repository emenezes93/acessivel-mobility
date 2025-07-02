
import React, { useState, useEffect, useRef } from 'react';
import { AccessibleButton } from "@/components/AccessibleButton";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Mic, MicOff } from "lucide-react";

interface VoiceInterfaceProps {
  onCommand?: (command: string) => void;
  placeholder?: string;
  autoStart?: boolean;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  onCommand,
  placeholder = "Clique para falar",
  autoStart = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  const { speak, vibrate, settings } = useAccessibility();

  useEffect(() => {
    // Check if Web Speech API is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';
      
      recognition.onstart = () => {
        setIsListening(true);
        speak('Escutando...');
        vibrate([100, 50, 100]);
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript && onCommand) {
          onCommand(finalTranscript);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
        if (transcript) {
          speak(`Você disse: ${transcript}`);
        }
      };
      
      recognition.onerror = (event: any) => {
        setIsListening(false);
        console.error('Speech recognition error:', event.error);
        speak('Erro no reconhecimento de voz. Tente novamente.');
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onCommand, speak, vibrate, transcript]);

  useEffect(() => {
    if (autoStart && isSupported && settings.voiceEnabled) {
      startListening();
    }
  }, [autoStart, isSupported, settings.voiceEnabled]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center p-4 bg-muted rounded-lg">
        <p className="text-muted-foreground">
          Reconhecimento de voz não disponível neste navegador
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <AccessibleButton
          onClick={toggleListening}
          variant={isListening ? "destructive" : "outline"}
          size="lg"
          ariaLabel={isListening ? "Parar gravação de voz" : "Iniciar gravação de voz"}
          voiceAnnouncement={isListening ? "Parando gravação" : "Iniciando gravação de voz"}
          className="h-16 w-16 rounded-full"
        >
          {isListening ? (
            <MicOff className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </AccessibleButton>
      </div>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">
          {isListening ? 'Escutando...' : placeholder}
        </p>
        
        {transcript && (
          <div 
            className="bg-muted p-3 rounded-lg text-left"
            role="status"
            aria-live="polite"
          >
            <p className="font-medium">Você disse:</p>
            <p className="text-lg mt-1">{transcript}</p>
          </div>
        )}
      </div>
      
      {isListening && (
        <div className="flex justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};
