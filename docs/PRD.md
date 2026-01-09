# PRD - AgendamentoJô

## Visão Geral
O AgendamentoJô é um sistema de agendamento e pagamento online projetado para os clientes de Joana. O aplicativo permitirá que os usuários se cadastrem, escolham horários disponíveis, e efetuem o pagamento de forma segura e conveniente, com confirmações automáticas por e-mail e WhatsApp.

## Objetivos
- **Objetivo principal**: Simplificar e automatizar o processo de agendamento e pagamento para os clientes.
- **Objetivos secundários**:
    - Oferecer flexibilidade no pagamento (sinal ou valor total).
    - Reduzir a carga administrativa de gerenciamento de agenda.
    - Proporcionar uma experiência de usuário moderna e profissional.

## Público-Alvo
Os futuros clientes de Joana que desejam agendar serviços de forma autônoma e online.

## Funcionalidades Core
1.  **Autenticação de Cliente**: Cadastro e login de usuários via e-mail/senha ou provedores sociais (Google).
2.  **Seleção de Horários**: Visualização de um calendário com dias e horários disponíveis para agendamento.
3.  **Processo de Pagamento**: Integração com um gateway de pagamento para transações com Cartão de Crédito e Pix.
    - A opção Pix deve permitir o pagamento de um sinal (valor a ser definido) ou o pagamento do valor total.
4.  **Confirmações Automatizadas**: Envio de e-mails e mensagens de WhatsApp para o cliente após a confirmação do pagamento e do agendamento.

## Requisitos Técnicos
- **Framework**: Next.js 14+ com App Router
- **UI**: shadcn/ui + Tailwind CSS
- **Linguagem**: TypeScript
- **Autenticação**: A definir (ex: NextAuth.js)
- **Dados**: Mock data inicialmente (sem banco de dados)
- **Deploy**: A definir

## Requisitos de Segurança (OWASP Top 10)
1.  **Broken Access Control**: Implementar controle de acesso baseado em função (RBAC) para garantir que usuários só possam ver e gerenciar seus próprios agendamentos.
2.  **Cryptographic Failures**: Forçar o uso de HTTPS. Todos os dados sensíveis (ex: senhas, tokens) devem ser armazenados e transmitidos de forma criptografada.
3.  **Injection**: Utilizar ORMs ou Prepared Statements para acesso a dados e validar/sanitizar todas as entradas do usuário.
4.  **Insecure Design**: O design seguirá o princípio do menor privilégio.
5.  **Security Misconfiguration**: Configurar corretamente os headers de segurança (CORS, CSP) no Next.js.
6.  **Vulnerable Components**: Manter as dependências (npm) atualizadas e auditá-las regularmente.
7.  **Authentication Failures**: Implementar rate limiting em tentativas de login, exigir senhas fortes e considerar autenticação de dois fatores (2FA) no futuro.
8.  **Data Integrity Failures**: Utilizar tokens anti-CSRF em formulários.
9.  **Security Logging**: Configurar logs de segurança para monitorar atividades suspeitas.
10. **Server-Side Request Forgery (SSRF)**: Validar todas as URLs fornecidas pelo usuário e manter uma whitelist de domínios permitidos para requisições externas.

## Métricas de Sucesso
- **Performance**: LCP (Largest Contentful Paint) abaixo de 2.5s.
- **Segurança**: Zero vulnerabilidades críticas reportadas por auditorias.
- **Engajamento**: Taxa de conclusão de agendamento acima de 80%.
