# Roteiro do Apresentador — Apresentação Final do Projeto Integrador
## Community Bank API · Princípios e Padrões de Arquitetura (IFRS)

**Aluna:** Francine Gonçalves Nunes Moraes  
**Professora:** Beatriz Costa  
**Duração Total Sugerida:** 15 a 18 minutos (com margem para perguntas da banca)  
**Slides:** [`Apresentacao_Final_Slides.pdf`](file:///home/fran/Área de trabalho/ProjetoIntegrador_Francine_Moraes/community-bank-api/docs/Apresentacao_Final_Slides.pdf) ou exibição web em [`Apresentacao_Final_Slides.html`](file:///home/fran/Área de trabalho/ProjetoIntegrador_Francine_Moraes/community-bank-api/docs/Apresentacao_Final_Slides.html)

---

## Dicas Gerais de Apresentação
1. **Foco na Justificativa e nos Trade-offs:** A disciplina avalia a capacidade de justificar escolhas e reconhecer limitações. Evite apenas descrever o código; enfatize *por que* cada decisão foi tomada com base nos drivers e ASRs.
2. **Ritmo:** Mantenha um tom sereno e profissional, pausando brevemente na transição entre slides.
3. **Vocabulário da Disciplina:** Use com naturalidade os termos técnicos estudados: *Attribute-Driven Design (ADD)*, *Inversão de Dependência*, *Driving/Driven Adapters*, *Input/Output Ports*, *Bounded Contexts*, *ACID*, *Stateless*, *C4 Model* e *ADR*.

---

## Guia Slide a Slide (Fala a Fala)

### Slide 1: Capa (0:00 – 1:00)
- **O que falar:**
  > "Boa tarde, professora Beatriz e colegas. Meu nome é Francine e hoje apresento o resultado final do Projeto Integrador da disciplina de Princípios e Padrões de Arquitetura.
  > Nosso trabalho consistiu no desenvolvimento e na documentação arquitetural da **Community Bank API**, uma plataforma voltada para a gestão de serviços financeiros solidários e moeda social em territórios de baixa renda.
  > Ao longo da apresentação, vou demonstrar como evoluímos desde a visão inicial e o levantamento de atributos de qualidade na Entrega 1, passando pela proposta arquitetural em camadas, a implementação prática em Arquitetura Hexagonal, a consolidação em C4 Model e ADRs, até chegarmos ao planejamento de segurança e evolução tecnológica."

---

### Slide 2: Contexto e Visão do Produto (1:00 – 2:15)
- **O que falar:**
  > "Para contextualizar o problema: bancos comunitários de desenvolvimento — como o pioneiro Banco Palmas no Ceará e diversos outros apoiados pela Rede Brasileira de Bancos Comunitários — têm a missão de estimular a economia popular local.
  > Eles operam em territórios onde agências bancárias tradicionais muitas vezes não chegam. O dinheiro que circula é fruto do esforço da própria comunidade.
  > Isso impõe três desafios fundamentais que a arquitetura precisou endereçar:
  > Primeiro, a **Confiança**: cada centavo precisa ser estritamente auditável e transparente para a comunidade.
  > Segundo, o **Acesso**: os usuários acessam o sistema primordialmente por smartphones simples, frequentemente sob redes móveis com sinal oscilante.
  > E terceiro, a **Sustentabilidade**: o projeto precisa ser operável por uma equipe reduzida, sem custos exorbitantes de infraestrutura.
  > Nossos atores centrais são o morador correntista, o empreendedor solidário em busca de crédito produtivo, o gerente local e a assembleia comunitária que audita as contas."

---

### Slide 3: Drivers Arquiteturais & ASRs (2:15 – 3:45)
- **O que falar:**
  > "Como aprendemos logo na primeira aula da disciplina: *'um sistema pode funcionar e ainda assim ter uma arquitetura ruim'*. O papel da arquitetura é garantir que o sistema atenda aos atributos de qualidade essenciais.
  > Destaco os principais drivers levantados na Entrega 1:
  > Em **Desempenho (QA-01)**, estabelecemos a meta de responder a consultas de saldo e extrato em até 2 segundos no percentil 95, mesmo em horários de pico.
  > Em **Segurança (QA-02)**, definimos como prioridade máxima que qualquer tentativa de acesso não autorizado seja prontamente rejeitada e registrada em trilha de auditoria.
  > Em **Auditabilidade (QA-04)**, asseguramos que nenhum lançamento financeiro possa ser deletado ou alterado retroativamente.
  > E em **Modificabilidade e Testabilidade (QA-06 e QA-10)**, exigimos que novas regras de crédito possam ser criadas sem impactar controladores HTTP e que 100% da lógica de negócio possa ser testada em milissegundos, sem precisar subir servidores ou conexões de rede.
  > Tudo isso sob as restrições de custo zero (R4) e stack em Node.js com TypeScript e Express (R1)."

---

### Slide 4: Abordagem Arquitetural Global (3:45 – 5:15)
- **O que falar:**
  > "Na Entrega 2, elaboramos a Proposta Arquitetural utilizando o método ADD (Attribute-Driven Design).
  > A decisão central foi estruturar o sistema como um **Monólito Modular no modelo Cliente-Servidor**.
  > Por que um monólito modular e não microserviços? Porque para o tamanho atual da equipe e a restrição de custo zero, microserviços trariam complexidade acentuada de rede, latência distribuída e custos operacionais desnecessários. O monólito modular nos dá o melhor dos dois mundos: deploy em processo único via `npm start`, chamadas em memória de altíssimo desempenho, mas com fronteiras de módulos (Bounded Contexts) estritamente preservadas no código.
  > Adotamos também o conceito de **Cliente Magro (Thin Client)**: o smartphone apenas envia dados e renderiza respostas. Toda validação e cálculo financeiro residem no servidor.
  > Criamos o Value Object `Money`, que guarda valores exclusivamente em centavos inteiros para banir de vez os erros de arredondamento de ponto flutuante IEEE 754. E adotamos lançamentos contábeis imutáveis: o saldo não é um valor estático mutável, mas o resultado somatório de transações registradas."

---

### Slide 5: Fatias Verticais: Camadas vs Hexagonal (5:15 – 6:45)
- **O que falar:**
  > "Ao longo do projeto, desenvolvemos duas fatias verticais que demonstram estilos arquiteturais complementares:
  > No módulo de **Contas**, aplicamos uma **Arquitetura em 4 Camadas** (Apresentação, Aplicação, Domínio e Infraestrutura) para implementar a abertura de conta e o depósito em conta corrente. A regra de dependência garante que o domínio não conheça detalhes externos.
  > Já no módulo de **Crédito Solidário**, avançamos para a **Arquitetura Hexagonal (Ports & Adapters)** para implementar a solicitação de crédito produtivo.
  > Essa diferenciação foi consciente: o crédito comunitário lida com regras dinâmicas de assembleia, aprovação colegiada e múltiplos canais de entrada, exigindo o desacoplamento máximo que as portas e adaptadores proporcionam."

---

### Slide 6: Arquitetura Hexagonal em Detalhes (6:45 – 8:30)
- **O que falar:**
  > "Aqui vemos o núcleo da nossa atividade prática de Arquitetura Hexagonal.
  > O endpoint `POST /credit/solidarity` permite que um empreendimento solidário solicite microcrédito.
  > Como a solução foi estruturada?
  > Na borda de entrada temos o **Driving Adapter**: a classe `SolidarityCreditController`, que recebe a requisição Express, valida campos primitivos e aciona a **Input Port** `CreateSolidarityCreditApplication`.
  > A Input Port é um contrato puro em TypeScript. Ela é implementada pelo caso de uso `CreateSolidarityCreditUseCase`.
  > O caso de uso instancia as entidades de domínio: `SolidarityEnterprise`, que avalia se a atividade é elegível para a economia solidária, e `CreditRequest`, que impõe as regras pétreas do banco comunitário: **taxa de juros zero (0%)**, teto de microcrédito de R$ 15.000,00 e prazo entre 1 e 36 meses.
  > Para persistir os dados, o caso de uso não chama SQL diretamente; ele invoca a **Output Port** `CreditRequestRepository`.
  > E na borda de saída temos o **Driven Adapter**: desenvolvemos o `SqliteCreditRequestRepository`, utilizando o módulo nativo `node:sqlite` do Node.js 26. Isso nos deu persistência real em banco relacional, em arquivo em disco, sem precisar instalar pacotes externos pesados. Mantivemos também um adapter em memória para testes unitários isolados."

---

### Slide 7: C4 Model — Contexto e Contêineres (8:30 – 10:00)
- **O que falar:**
  > "Na Entrega 3, formalizamos a documentação utilizando o modelo C4 de Simon Brown.
  > No **Nível 1 (Diagrama de Contexto)**, posicionamos a plataforma no centro, atendendo aos moradores correntistas, empreendedores e gerentes comunitários, integrando-se externamente com serviços de notificação por SMS/WhatsApp e com a Rede Brasileira de Bancos Comunitários.
  > No **Nível 2 (Diagrama de Contêineres)**, mostramos como o sistema se materializa em tempo de execução:
  > Temos a aplicação cliente SPA/PWA leve para smartphones, a API backend executando em Node.js com TypeScript e Express, o banco de dados relacional (SQLite em desenvolvimento e PostgreSQL em produção) e o armazenamento de trilhas de auditoria e relatórios de prestação de contas pública."

---

### Slide 8: C4 Model — Componentes da API Backend (10:00 – 11:15)
- **O que falar:**
  > "No **Nível 3 (Diagrama de Componentes)**, abrimos a API backend e mapeamos suas divisões internas:
  > Os controladores HTTP recebem as requisições. O `ErrorHandler` centraliza o tratamento de erros em um formato padronizado `{ error: { code, message } }`, garantindo integridade conceitual.
  > Os Casos de Uso orquestram as operações através de contratos de portas.
  > As entidades de domínio concentram as regras de negócio invariáveis.
  > E os repositórios atuam como Driven Adapters concretos.
  > Destaco a nossa Composition Root em `src/main/container.ts`: nenhum controller ou caso de uso instancia seus próprios repositórios. Todas as dependências são injetadas em um único ponto, o que nos permite trocar a persistência de memória para banco relacional mudando apenas uma linha no container."

---

### Slide 9: ADRs e Trade-offs Arquiteturais (11:15 – 12:45)
- **O que falar:**
  > "Na Entrega 3 também registramos 4 ADRs (Architecture Decision Records) fundamentais:
  > No **ADR-0001**, registramos a adoção da Arquitetura Hexagonal no módulo de crédito. Benefício: testabilidade e proteção das regras; Trade-off: maior quantidade de interfaces e mapeamentos de DTO.
  > No **ADR-0002**, registramos a persistência relacional com repositórios sem ORM pesado. Benefício: garantias de transação ACID e baixo consumo de recursos; Trade-off: escrita manual de comandos SQL.
  > No **ADR-0003**, formalizamos o Monólito Modular. Benefício: facilidade de deploy e custo zero; Trade-off: exige disciplina para não violar os Bounded Contexts.
  > E no **ADR-0004**, definimos a autenticação stateless via JWT com RBAC (Role-Based Access Control). Benefício: não sobrecarrega o servidor com sessões e tolera oscilações de conexão de rede móvel; Trade-off: complexidade para revogação imediata de tokens."

---

### Slide 10: Resultados Práticos e Evidências de Testes (12:45 – 13:45)
- **O que falar:**
  > "Para comprovar que a arquitetura não ficou apenas no papel, implementamos uma suíte completa de testes automatizados com o runner nativo `node:test`.
  > São **29 testes automatizados** divididos em 8 suítes, cobrindo regras de domínio, limites de crédito, casos de uso e integração HTTP de ponta a ponta.
  > Todos os 29 testes executam em cerca de **1,2 segundos**.
  > O código compila com zero alertas no modo estrito do TypeScript e os testes HTTP utilizam requisições reais via `fetch` nativo sobre uma instância da API levantada em porta aleatória dinâmica, comprovando o funcionamento integral do fluxo."

---

### Slide 11 e 12: Evolução Arquitetural — Segurança e Tecnologias (13:45 – 15:30)
- **O que falar:**
  > "Na Entrega 4, realizamos a pesquisa de evolução futura em dois eixos:
  > No eixo de **Segurança de APIs**, selecionamos:
  > 1. **HTTPS/TLS 1.3 e mTLS**, blindando o tráfego contra interceptações em redes públicas e garantindo autenticação mútua B2B.
  > 2. **JWT com RBAC e Refresh Tokens em cookies seguros**, protegendo as operações administrativas de aprovação de crédito.
  > 3. **Rate Limiting Adaptativo**, com regras flexíveis por IP para evitar falsos positivos em redes móveis comunitárias (CGNAT) e limites rígidos por usuário contra força bruta.
  > Já no eixo de **Evolução Tecnológica**, projetamos a adoção de:
  > 1. **API Gateway (Kong/Traefik)** para desonerar a API de responsabilidades de rede e permitir futuras migrações parciais.
  > 2. **Mensageria Assíncrona com RabbitMQ**, transformando o envio de SMS e relatórios em processos orientados a eventos, aumentando a resiliência.
  > 3. **Observabilidade com OpenTelemetry e Grafana**, viabilizando painéis públicos em tempo real sobre o impacto e a saúde da moeda social.
  > 4. **Cache Distribuído com Redis**, reduzindo o tempo de consulta de relatórios públicos de transparência de 50ms para menos de 2ms."

---

### Slide 13 e 14: Aprendizados, Dificuldades e Conclusão (15:30 – 17:00)
- **O que falar:**
  > "Para encerrar, destaco os principais aprendizados da disciplina:
  > O primeiro foi compreender que **arquitetura de software é a arte de gerenciar trade-offs**. Não existe 'bala de prata'.
  > O segundo foi o perigo do *overengineering*: aprendemos que uma interface só deve existir quando há real necessidade de polimorfismo ou inversão de dependência para proteger o núcleo.
  > E o terceiro foi a constatação prática de que separar domínio de infraestrutura torna o sistema incrivelmente agradável de manter, evoluir e testar.
  > Agradeço à professora Beatriz pela condução da disciplina e coloco-me à disposição para responder às perguntas da banca."

---

## Possíveis Perguntas da Banca e Como Responder (FAQ)

### P1: "Por que vocês escolheram o SQLite para a atividade de Arquitetura Hexagonal em vez de já subir um container Docker com PostgreSQL?"
**Resposta sugerida:**
> "Escolhemos o SQLite nativo do Node.js 26 (`node:sqlite`) por alinhamento estrito com os drivers do projeto: ele é um banco de dados relacional completo, com suporte a SQL padrão e transações ACID, mas com custo zero de infraestrutura e zero atrito de setup — qualquer pessoa roda o projeto imediatamente com `npm test` sem precisar ter Docker instalado.
> E o mais importante sob a ótica da disciplina: como usamos o padrão Repository como Output Port na Arquitetura Hexagonal, quando quisermos conectar o PostgreSQL de produção, basta criar uma classe `PostgresCreditRequestRepository` e injetá-la no `container.ts`. O caso de uso e as regras de crédito não mudam uma única vírgula."

### P2: "Qual a diferença prática no código entre o Módulo Contas (Camadas) e o Módulo Crédito (Hexagonal)?"
**Resposta sugerida:**
> "No Módulo Contas em camadas, a regra de fluxo é vertical: o Controller chama diretamente a classe concreta do Caso de Uso, e este chama a interface do Repositório.
> No Módulo Crédito Hexagonal, a separação é mais formal e rigorosa: o Controller não conhece nem mesmo a classe concreta do Caso de Uso; ele se comunica exclusivamente através de uma **Input Port** (`CreateSolidarityCreditApplication`). Isso significa que o caso de uso pode ser acionado por um Controller HTTP, por um consumidor de fila RabbitMQ ou por um comando CLI sem nenhuma alteração. Além disso, as regras de elegibilidade da comunidade foram encapsuladas em entidades ricas (`SolidarityEnterprise` e `CreditRequest`), e não em services anêmicos."

### P3: "Por que vocês criaram uma classe `Money` em vez de usar números comuns (`number`)?"
**Resposta sugerida:**
> "Porque números decimais em JavaScript e na maioria das linguagens utilizam o padrão IEEE 754 de ponto flutuante, que causa imprecisões conhecidas em somas monetárias — por exemplo, `0.1 + 0.2` resulta em `0.30000000000000004`.
> Em um sistema bancário, isso levaria a diferenças no saldo e falhas de auditoria. A classe `Money` guarda internamente o valor em **centavos inteiros** (Safe Integers), garantindo precisão matemática exata em todas as somas de depósitos e parcelas de crédito."

### P4: "Como a arquitetura garante que um saldo não fique inconsistente se dois depósitos acontecerem ao mesmo tempo (concorrência)?"
**Resposta sugerida:**
> "Hoje, o saldo é calculado a partir de lançamentos imutáveis vinculados à conta. Quando conectamos a persistência relacional com PostgreSQL, a operação de depósito executa dentro de uma transação SQL com bloqueio pessimista (`SELECT ... FOR UPDATE` no registro da conta) ou controle de concorrência otimista via número de versão, garantindo isolamento estrito antes de persistir a transação."
