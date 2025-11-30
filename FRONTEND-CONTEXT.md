# Frontend Development Context - Movimentation System

## Sistema de Importação e Gestão de Movimentações Bancárias

Este documento fornece o contexto completo para desenvolvimento do frontend que irá consumir a API de importação de extratos bancários com classificação inteligente.

---

## 🎯 Objetivo do Sistema

Facilitar a importação de extratos bancários (formato Nubank CSV) com:
- Upload de arquivo CSV ou inserção direta de dados
- Análise prévia das movimentações antes de salvar
- Sugestão automática de classificações baseada em aprendizado de descrições
- Gestão de mapeamentos de descrições para classificações
- Dashboard com agregações por classificação e plano de contas

---

## 📊 Estrutura da API

### Base URL
```
http://localhost:3000/api
```

### Autenticação
Todas as requisições (exceto login/register) requerem JWT no header:
```
Authorization: Bearer <token>
```

---

## 🔐 Autenticação

### POST /api/auth/register
Criar nova conta de usuário.

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /api/auth/login
Fazer login e obter token JWT.

**Request:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "joao@email.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /api/auth/me
Obter dados do usuário autenticado.

**Response:**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "joao@email.com"
}
```

---

## 📦 Plano de Contas

### GET /api/plan-of-bills
Listar todos os planos de conta do usuário.

**Response:**
```json
[
  {
    "id": 1,
    "description": "Despesas Fixas",
    "type": "Expense"
  },
  {
    "id": 2,
    "description": "Receitas",
    "type": "Income"
  }
]
```

### POST /api/plan-of-bills
Criar novo plano de contas.

**Request:**
```json
{
  "description": "Investimentos",
  "type": "Expense"
}
```

---

## 🏷️ Classificações

### GET /api/classification
Listar todas as classificações do usuário.

**Query Parameters:**
- `planOfBillId` (opcional): Filtrar por plano de contas

**Response:**
```json
[
  {
    "id": 1,
    "description": "Alimentação",
    "type": "Expense",
    "planOfBill": {
      "id": 1,
      "description": "Despesas Fixas"
    }
  },
  {
    "id": 2,
    "description": "Salário",
    "type": "Income",
    "planOfBill": {
      "id": 2,
      "description": "Receitas"
    }
  }
]
```

### POST /api/classification
Criar nova classificação.

**Request:**
```json
{
  "description": "Transporte",
  "type": "Expense",
  "planOfBillId": 1
}
```

---

## 🔄 Importação de Extratos

### POST /api/import/analyze

**Objetivo:** Analisar extrato (CSV ou JSON) e sugerir classificações ANTES de salvar no banco.

#### Opção 1: Upload de Arquivo CSV (Multipart Form Data)

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Arquivo CSV no formato Nubank

**Exemplo com Fetch:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/import/analyze', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

#### Opção 2: Envio de Dados JSON (Application JSON)

**Content-Type:** `application/json`

**Request:**
```json
{
  "csvContent": "Data,Valor,Identificador,Descrição\n01/11/2024,15.90,nuinvest,Rendimento\n02/11/2024,-125.50,pag*1234,Compra débito - Padaria"
}
```

ou

```json
{
  "data": [
    {
      "date": "2024-11-01",
      "value": 15.90,
      "description": "Rendimento nuinvest"
    },
    {
      "date": "2024-11-02",
      "value": -125.50,
      "description": "Compra débito - Padaria do Zé"
    }
  ]
}
```

#### Formato do CSV Nubank
```csv
Data,Valor,Identificador,Descrição
01/11/2024,15.90,nuinvest,Rendimento
02/11/2024,-125.50,pag*1234,Compra débito - Padaria do Zé
03/11/2024,-45.00,transferencia,Transferência enviada pelo Pix
```

**Características:**
- Data no formato `DD/MM/YYYY`
- Valor em reais com vírgula (1.234,56) ou ponto (1234.56)
- Valores negativos indicam despesas
- Valores positivos indicam receitas
- Descrições podem conter vírgulas (serão tratadas corretamente)

#### Response (Análise)

```json
{
  "totalItems": 3,
  "withSuggestion": 2,
  "withoutSuggestion": 1,
  "items": [
    {
      "date": "2024-11-01",
      "value": 15.90,
      "description": "Rendimento nuinvest",
      "suggestedClassification": {
        "id": 2,
        "description": "Salário",
        "type": "Income",
        "confidence": 0.85,
        "reason": "Matched with 'rendimento' (exact match)"
      }
    },
    {
      "date": "2024-11-02",
      "value": -125.50,
      "description": "Compra débito - Padaria do Zé",
      "suggestedClassification": {
        "id": 1,
        "description": "Alimentação",
        "type": "Expense",
        "confidence": 0.72,
        "reason": "Matched with 'padaria' (partial match)"
      }
    },
    {
      "date": "2024-11-03",
      "value": -45.00,
      "description": "Transferência enviada pelo Pix",
      "suggestedClassification": null
    }
  ]
}
```

**Notas importantes:**
- Os valores retornam em REAIS (formato original)
- `confidence` indica a confiança da sugestão (0-1)
- `reason` explica por que foi sugerida essa classificação
- Items sem sugestão devem ser classificados manualmente pelo usuário

---

### POST /api/import/bulk

**Objetivo:** Salvar movimentações no banco após revisão do usuário.

**Request:**
```json
{
  "items": [
    {
      "date": "2024-11-01",
      "value": 15.90,
      "description": "Rendimento nuinvest",
      "classificationId": 2
    },
    {
      "date": "2024-11-02",
      "value": -125.50,
      "description": "Compra débito - Padaria do Zé",
      "classificationId": 1
    },
    {
      "date": "2024-11-03",
      "value": -45.00,
      "description": "Transferência enviada pelo Pix",
      "classificationId": 5
    }
  ],
  "learnFromImport": true
}
```

**Campos:**
- `items`: Array de movimentações a serem criadas
  - `date`: Data no formato ISO (YYYY-MM-DD) ou DD/MM/YYYY
  - `value`: Valor em REAIS (positivo = receita, negativo = despesa)
  - `description`: Descrição da movimentação
  - `classificationId`: ID da classificação selecionada
  - `payDate` (opcional): Data de pagamento
- `learnFromImport`: Se true, salva os mapeamentos descrição → classificação

**Response:**
```json
{
  "created": 3,
  "learned": 2,
  "movimentations": [
    {
      "id": 101,
      "date": "2024-11-01",
      "value": 1590,
      "description": "Rendimento nuinvest",
      "classification": {
        "id": 2,
        "description": "Salário"
      }
    },
    // ... demais movimentações
  ]
}
```

**Notas importantes:**
- Os valores são convertidos para CENTAVOS no backend (15.90 → 1590)
- O flag `learnFromImport` cria/atualiza mapeamentos automáticos
- Mapeamentos aprendidos melhoram sugestões futuras

---

## 🗺️ Gestão de Mapeamentos

### GET /api/mappings
Listar todos os mapeamentos de descrições aprendidos.

**Response:**
```json
[
  {
    "id": 1,
    "originalDescription": "Compra débito - Padaria do Zé",
    "normalizedDescription": "padaria",
    "classification": {
      "id": 1,
      "description": "Alimentação",
      "type": "Expense"
    },
    "user": {
      "id": 1,
      "name": "João Silva"
    }
  }
]
```

### POST /api/mappings
Criar mapeamento manual.

**Request:**
```json
{
  "description": "uber",
  "classificationId": 3
}
```

### PUT /api/mappings/:id
Atualizar mapeamento existente.

**Request:**
```json
{
  "classificationId": 5
}
```

### DELETE /api/mappings/:id
Remover mapeamento.

---

## 💰 Movimentações e Dashboard

### GET /api/movimentations

**Objetivo:** Listar movimentações com agregações para dashboard.

**Query Parameters:**
- `dateFrom`: Data inicial (YYYY-MM-DD)
- `dateTo`: Data final (YYYY-MM-DD)
- `payDateFrom`: Data pagamento inicial
- `payDateTo`: Data pagamento final
- `valueMin`: Valor mínimo em centavos
- `valueMax`: Valor máximo em centavos
- `classificationId`: Filtrar por classificação

**Response:**
```json
{
  "movimentations": [
    {
      "id": 1,
      "date": "2024-11-01",
      "value": 1590,
      "description": "Rendimento nuinvest",
      "payDate": null,
      "createDate": "2024-11-30T02:00:00.000Z",
      "updateDate": "2024-11-30T02:00:00.000Z",
      "classification": {
        "id": 2,
        "description": "Salário",
        "type": "Income",
        "planOfBill": {
          "id": 2,
          "description": "Receitas"
        }
      },
      "user": {
        "id": 1,
        "name": "João Silva"
      }
    }
  ],
  "summary": {
    "total": 150,
    "totalIncome": 450000,
    "totalExpense": -320000,
    "balance": 130000,
    "byClassification": [
      {
        "classificationId": 1,
        "classificationName": "Alimentação",
        "classificationType": "Expense",
        "planOfBillId": 1,
        "planOfBillName": "Despesas Fixas",
        "total": -125000,
        "count": 45
      },
      {
        "classificationId": 2,
        "classificationName": "Salário",
        "classificationType": "Income",
        "planOfBillId": 2,
        "planOfBillName": "Receitas",
        "total": 450000,
        "count": 12
      }
    ],
    "byPlanOfBills": [
      {
        "planOfBillId": 1,
        "planOfBillName": "Despesas Fixas",
        "total": -320000,
        "count": 89
      },
      {
        "planOfBillId": 2,
        "planOfBillName": "Receitas",
        "total": 450000,
        "count": 12
      }
    ]
  }
}
```

**Notas sobre valores:**
- Todos os valores no banco e na API estão em CENTAVOS
- Para exibir: `value / 100` (ex: 1590 → R$ 15,90)
- Valores negativos = despesas
- Valores positivos = receitas
- `balance` = totalIncome + totalExpense

**Uso para Gráficos:**
- **Gráfico de pizza por Classificação:** Use `summary.byClassification`
- **Gráfico de pizza por Plano de Contas:** Use `summary.byPlanOfBills` **filtrando apenas totais negativos** (despesas), pois plano de contas não tem tipo (Income/Expense) próprio - o tipo vem da classificação
- **Resumo financeiro:** Use `summary.totalIncome`, `summary.totalExpense`, `summary.balance`

### POST /api/movimentations
Criar movimentação individual.

**Request:**
```json
{
  "date": "2024-11-30",
  "value": -8500,
  "description": "Almoço",
  "classificationId": 1,
  "payDate": "2024-12-05"
}
```

### PATCH /api/movimentations/:id
Atualizar movimentação existente.

**Request:**
```json
{
  "classificationId": 3,
  "payDate": "2024-12-10"
}
```

---

## 🎨 Fluxo de UI Sugerido

### 1. Tela de Login/Registro
- Formulário de login (email/senha)
- Link para registro
- Armazenar token JWT no localStorage/sessionStorage

### 2. Dashboard Principal
- **Cards de Resumo:**
  - Total de Receitas (verde)
  - Total de Despesas (vermelho)
  - Saldo (azul)
  - Total de Movimentações

- **Gráfico de Pizza - Por Classificação:**
  - Usar `summary.byClassification`
  - Mostrar nome da classificação e valor
  - Cores diferentes para cada classificação
  - Tooltip com percentual

- **Gráfico de Pizza - Por Plano de Contas:**
  - Usar `summary.byPlanOfBills` filtrando apenas despesas (total < 0)
  - Mostrar nome do plano e valor absoluto
  - Cores diferentes para cada plano
  - Tooltip com percentual
  - **Importante:** Plano de contas agrupa classificações, não tem tipo próprio. Considere apenas valores negativos (despesas)

- **Filtros:**
  - Range de datas
  - Classificação específica
  - Range de valores

- **Tabela de Movimentações:**
  - Data, Descrição, Classificação, Plano, Valor
  - Paginação
  - Ordenação
  - Ações: Editar, Visualizar

### 3. Tela de Importação
```
┌─────────────────────────────────────────┐
│  Importar Extrato Bancário              │
├─────────────────────────────────────────┤
│                                          │
│  [ Arrastar arquivo ou clicar ]         │
│     Formato: CSV (Nubank)               │
│                                          │
│  OU                                     │
│                                          │
│  [ Colar conteúdo CSV aqui ]            │
│  ┌─────────────────────────────────┐   │
│  │ Data,Valor,Id,Descrição         │   │
│  │ 01/11/2024,15.90,...            │   │
│  └─────────────────────────────────┘   │
│                                          │
│         [Analisar Extrato]              │
└─────────────────────────────────────────┘
```

### 4. Tela de Revisão (Após Análise)
```
┌─────────────────────────────────────────────────────────┐
│  Revisar Importação                                     │
│  ✓ 2 com sugestão automática                           │
│  ⚠ 1 precisa de classificação manual                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐│
│  │ 01/11/2024 │ R$ 15,90 │ Rendimento nuinvest       ││
│  │                                                     ││
│  │ Classificação sugerida: Salário (85% confiança)   ││
│  │ [✓ Aceitar] [Alterar ▼]                          ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  ┌────────────────────────────────────────────────────┐│
│  │ 02/11/2024 │ R$ -125,50 │ Padaria do Zé           ││
│  │                                                     ││
│  │ Classificação sugerida: Alimentação (72%)         ││
│  │ [✓ Aceitar] [Alterar ▼]                          ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  ┌────────────────────────────────────────────────────┐│
│  │ 03/11/2024 │ R$ -45,00 │ Transferência Pix        ││
│  │                                                     ││
│  │ ⚠ Sem sugestão - Selecione a classificação:       ││
│  │ [Selecionar Classificação ▼]                      ││
│  └────────────────────────────────────────────────────┘│
│                                                          │
│  ☑ Aprender com esta importação                        │
│  (melhorará sugestões futuras)                         │
│                                                          │
│         [Cancelar]  [Importar Tudo]                    │
└─────────────────────────────────────────────────────────┘
```

### 5. Tela de Mapeamentos
- Listar todos os mapeamentos aprendidos
- Editar classificação de um mapeamento
- Remover mapeamentos incorretos
- Adicionar mapeamentos manualmente

### 6. Tela de Configurações
- Gerenciar Planos de Conta
- Gerenciar Classificações
- Dados do usuário

---

## 🔧 Algoritmo de Matching (Informativo)

O backend usa um algoritmo inteligente para sugerir classificações:

1. **Normalização:**
   - Remove acentos, pontuação, caracteres especiais
   - Converte para minúsculas
   - Remove stopwords comuns:
     - transferncia, enviada, recebida, pelo, pix
     - compra, dbito, agncia, conta, banco
     - sa, ltda, instituio, pagamento

2. **Scoring:**
   - **Match exato:** peso 2x
   - **Match parcial:** peso 1x
   - Threshold: 60% de similaridade

3. **Exemplo:**
   ```
   Descrição: "Transferência enviada pelo Pix para João"
   Após normalização: "joao"
   
   Se existe mapeamento "joao" → "Empréstimos"
   → Sugestão com alta confiança
   ```

---

## 💡 Dicas de Implementação

### Gestão de Token JWT
```javascript
// Salvar após login
localStorage.setItem('token', response.token);

// Usar em requisições
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};
```

### Conversão de Valores
```javascript
// API retorna em centavos, converter para reais
const valueInReais = (valueInCents / 100).toFixed(2);

// Exibir com formatação brasileira
const formatted = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
}).format(valueInReais);
// Resultado: "R$ 15,90"
```

### Upload de Arquivo
```javascript
const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:3000/api/import/analyze', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // NÃO incluir Content-Type, o browser define automaticamente
    },
    body: formData
  });
  
  const data = await response.json();
  // Exibir tela de revisão com data.items
};
```

### Parsing de CSV no Frontend (Opcional)
```javascript
const parseCsv = (csvText) => {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return {
      date: values[0],
      value: parseFloat(values[1].replace(',', '.')),
      description: values[3]
    };
  });
};
```

### Gráfico com Chart.js
```javascript
import { Pie } from 'react-chartjs-2';

const ChartByClassification = ({ data }) => {
  const chartData = {
    labels: data.byClassification.map(item => item.classificationName),
    datasets: [{
      data: data.byClassification.map(item => Math.abs(item.total / 100)),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF'
      ]
    }]
  };
  
  return <Pie data={chartData} />;
};

const ChartByPlanOfBills = ({ data }) => {
  // Filtrar apenas despesas (valores negativos)
  const expenses = data.byPlanOfBills.filter(item => item.total < 0);
  
  const chartData = {
    labels: expenses.map(item => item.planOfBillName),
    datasets: [{
      data: expenses.map(item => Math.abs(item.total / 100)),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0',
        '#9966FF'
      ]
    }]
  };
  
  return <Pie data={chartData} />;
};
```

---

## 🧪 Testando a API

### Postman Collection
O projeto inclui uma collection Postman em `Movimentation-API.postman_collection.json` com todas as requisições pré-configuradas.

### Usando cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@email.com","password":"senha123"}'
```

**Analisar CSV:**
```bash
curl -X POST http://localhost:3000/api/import/analyze \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "file=@extrato.csv"
```

**Dashboard:**
```bash
curl -X GET "http://localhost:3000/api/movimentations?dateFrom=2024-11-01&dateTo=2024-11-30" \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 📋 Checklist de Funcionalidades

### Essenciais (MVP)
- [ ] Autenticação (Login/Registro)
- [ ] Upload de arquivo CSV
- [ ] Análise e preview de importação
- [ ] Revisão e ajuste de classificações sugeridas
- [ ] Importação final com aprendizado
- [ ] Dashboard com gráficos
- [ ] Lista de movimentações

### Desejáveis
- [ ] Gestão de mapeamentos
- [ ] Filtros avançados no dashboard
- [ ] Edição de movimentações
- [ ] Exportação de relatórios
- [ ] Gráficos de evolução temporal
- [ ] Dark mode

### Avançadas
- [ ] Múltiplos usuários
- [ ] Compartilhamento de orçamentos
- [ ] Metas e alertas
- [ ] Integração com bancos (Open Banking)
- [ ] App mobile

---

## 🚀 Tecnologias Sugeridas

### React + TypeScript
```bash
npx create-react-app movimentation-front --template typescript
npm install axios react-router-dom
npm install recharts # ou chart.js
npm install react-dropzone # upload de arquivos
npm install date-fns # manipulação de datas
```

### Vue 3 + TypeScript
```bash
npm create vue@latest movimentation-front
npm install axios vue-router
npm install chart.js vue-chartjs
npm install vue-dropzone
```

### Next.js
```bash
npx create-next-app@latest movimentation-front
npm install axios
npm install recharts
npm install react-dropzone
```

---

## 📞 Suporte

Para dúvidas sobre a API:
1. Verifique a collection do Postman
2. Consulte os testes em `src/modules/*/**.spec.ts`
3. Execute `yarn test` para validar o backend

---

## 📝 Notas Finais

- **Valores:** SEMPRE em centavos na API, converter para reais no frontend
- **Datas:** Aceita ISO (YYYY-MM-DD) ou BR (DD/MM/YYYY)
- **Autenticação:** JWT obrigatório em todas as rotas exceto auth
- **User Isolation:** Cada usuário vê apenas seus dados
- **Aprendizado:** Flag `learnFromImport` melhora sugestões futuras
- **Stopwords:** Algoritmo filtra palavras genéricas para melhor matching
- **Agregações:** Use `summary.byClassification` e `summary.byPlanOfBills` para gráficos

---

**Versão:** 2.0  
**Última atualização:** 30/11/2025  
**Backend rodando em:** http://localhost:3000
