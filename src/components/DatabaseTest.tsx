
import React, { useState, useEffect } from 'react';
import { AccessibleButton } from './AccessibleButton';
import { Card } from './ui/card';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { popularBancoComDados } from '../lib/seedData';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp?: string;
}

export const DatabaseTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTestResult = (testName: string, status: TestResult['status'], message: string) => {
    setTestResults(prev => {
      const existing = prev.find(t => t.test === testName);
      const newResult: TestResult = {
        test: testName,
        status,
        message,
        timestamp: new Date().toLocaleTimeString()
      };
      
      if (existing) {
        return prev.map(t => t.test === testName ? newResult : t);
      } else {
        return [...prev, newResult];
      }
    });
  };

  const testFirebaseConnection = async () => {
    updateTestResult('Conexão Firebase', 'pending', 'Testando conexão...');
    
    try {
      // Testa conexão real com Firebase
      console.log('🔧 Tentando autenticação anônima...');
      const userCredential = await signInAnonymously(auth);
      console.log('✅ Usuário autenticado:', userCredential.user);
      updateTestResult('Conexão Firebase', 'success', 
        `Firebase conectado | User ID: ${userCredential.user.uid.substring(0, 8)}...`);
      return true;
    } catch (error: any) {
      console.error('❌ Erro na conexão Firebase:', error);
      updateTestResult('Conexão Firebase', 'error', 
        `Erro: ${error.code || error.message || error}`);
      return false;
    }
  };

  const testFirestoreRead = async () => {
    updateTestResult('Leitura Firestore', 'pending', 'Testando leitura de dados...');
    
    try {
      console.log('🔧 Tentando ler coleção test...');
      // Tenta ler da coleção 'test' no Firestore
      const querySnapshot = await getDocs(collection(db, 'test'));
      const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      console.log('✅ Documentos lidos:', documents);
      updateTestResult('Leitura Firestore', 'success', 
        `Documentos encontrados: ${documents.length} | Dados: ${JSON.stringify(documents.slice(0, 1))}`);
      return true;
    } catch (error: any) {
      console.error('❌ Erro na leitura Firestore:', error);
      updateTestResult('Leitura Firestore', 'error', 
        `Erro: ${error.code || error.message || error}`);
      return false;
    }
  };

  const testFirestoreWrite = async () => {
    updateTestResult('Escrita Firestore', 'pending', 'Testando escrita de dados...');
    
    try {
      const testData = {
        timestamp: new Date().toISOString(),
        testValue: 'database-test',
        userId: auth.currentUser?.uid || 'anonymous-user',
        appVersion: '1.0.0'
      };
      
      console.log('🔧 Tentando escrever documento:', testData);
      // Escreve documento na coleção 'test'
      const docRef = await addDoc(collection(db, 'test'), testData);
      
      console.log('✅ Documento criado:', docRef.id);
      updateTestResult('Escrita Firestore', 'success', 
        `Documento criado | ID: ${docRef.id.substring(0, 8)}... | User: ${testData.userId.substring(0, 8)}...`);
      return true;
    } catch (error: any) {
      console.error('❌ Erro na escrita Firestore:', error);
      updateTestResult('Escrita Firestore', 'error', 
        `Erro: ${error.code || error.message || error}`);
      return false;
    }
  };

  const testAuthentication = async () => {
    updateTestResult('Autenticação', 'pending', 'Testando autenticação...');
    
    try {
      const user = auth.currentUser;
      if (user) {
        updateTestResult('Autenticação', 'success', 
          `Usuário autenticado: ${user.uid} | Anônimo: ${user.isAnonymous}`);
        return true;
      } else {
        updateTestResult('Autenticação', 'error', 'Nenhum usuário autenticado');
        return false;
      }
    } catch (error) {
      updateTestResult('Autenticação', 'error', `Erro na autenticação: ${error}`);
      return false;
    }
  };

  const popularDadosFicticios = async () => {
    updateTestResult('População de Dados', 'pending', 'Populando banco com dados fictícios...');
    
    try {
      console.log('🔧 Iniciando população de dados...');
      const resultado = await popularBancoComDados();
      
      console.log('📊 Resultado da população:', resultado);
      
      if (resultado.erro > 0) {
        updateTestResult('População de Dados', 'error', 
          `Parcial: ${resultado.sucesso} OK, ${resultado.erro} erros | ${resultado.detalhes.slice(-2).join(' | ')}`);
        return false;
      } else {
        updateTestResult('População de Dados', 'success', 
          `${resultado.sucesso} registros OK! | ${resultado.detalhes.slice(-1)[0]}`);
        return true;
      }
    } catch (error: any) {
      console.error('❌ Erro ao popular dados:', error);
      updateTestResult('População de Dados', 'error', 
        `Erro: ${error.code || error.message || error}`);
      return false;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    console.log('🔧 Iniciando testes do banco de dados...');
    
    try {
      const connectionTest = await testFirebaseConnection();
      
      if (connectionTest) {
        await Promise.all([
          testFirestoreRead(),
          testFirestoreWrite(),
          testAuthentication()
        ]);
      }
      
      console.log('✅ Testes concluídos');
    } catch (error) {
      console.error('❌ Erro nos testes:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Teste do Banco de Dados</h2>
        <p className="text-muted-foreground">
          Valide a conectividade e funcionalidade do Firebase
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="flex space-x-4">
          <AccessibleButton
            onClick={runAllTests}
            disabled={isRunning}
            variant="primary"
            className="px-6 py-3"
            ariaLabel={isRunning ? 'Executando testes...' : 'Executar testes do banco'}
          >
            {isRunning ? '🔄 Executando...' : '🧪 Executar Testes'}
          </AccessibleButton>
          
          <AccessibleButton
            onClick={popularDadosFicticios}
            disabled={isRunning}
            variant="secondary"
            className="px-6 py-3"
            ariaLabel="Popular banco com dados fictícios"
          >
            📊 Popular Dados
          </AccessibleButton>
        </div>
        
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Use "Executar Testes" para validar a conexão ou "Popular Dados" para adicionar dados fictícios ao banco
        </p>
      </div>

      {testResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Resultados dos Testes</h3>
          
          {testResults.map((result, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">
                  {getStatusIcon(result.status)}
                </span>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{result.test}</h4>
                    {result.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        {result.timestamp}
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-sm mt-1 ${getStatusColor(result.status)}`}>
                    {result.message}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {testResults.length === 0 && !isRunning && (
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">🏗️</div>
          <h3 className="text-xl font-bold mb-2">Pronto para Testar</h3>
          <p className="text-muted-foreground">
            Clique no botão acima para executar os testes do banco de dados
          </p>
        </Card>
      )}

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">ℹ️ Informações dos Testes</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• <strong>Conexão Firebase:</strong> Verifica se o Firebase está configurado</li>
            <li>• <strong>Leitura Firestore:</strong> Testa operações de leitura no banco</li>
            <li>• <strong>Escrita Firestore:</strong> Testa operações de escrita no banco</li>
            <li>• <strong>Autenticação:</strong> Verifica se o serviço de auth está ativo</li>
            <li>• <strong>População de Dados:</strong> Adiciona dados fictícios (usuários, motoristas, corridas, contatos)</li>
          </ul>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <h4 className="font-medium mb-2 text-yellow-800">⚠️ Configuração Necessária</h4>
          <p className="text-sm text-yellow-700">
            Se os testes falharem, verifique se as regras do Firestore permitem acesso para usuários autenticados.
            Nas configurações do Firebase Console, vá em "Firestore Database" → "Rules" e use as regras do arquivo firestore.rules.
          </p>
        </div>
      </div>
    </div>
  );
};
