"use client";

import { useState } from 'react';
import { Button } from './ui/button';

export default function SendTestEmailButton() {
  const [status, setStatus] = useState('idle'); // idle | sending | success | error

  const handleSendEmail = async () => {
    setStatus('sending');
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error("Falha ao enviar e-mail:", error);
      setStatus('error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <Button onClick={handleSendEmail} disabled={status === 'sending'}>
        {status === 'sending' ? 'Enviando...' : 'Enviar E-mail de Teste'}
      </Button>
      {status === 'success' && <p style={{ color: 'green' }}>E-mail enviado com sucesso!</p>}
      {status === 'error' && <p style={{ color: 'red' }}>Falha ao enviar e-mail.</p>}
    </div>
  );
}
