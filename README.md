# Morph Browser AI (Android & Web)

**Morph Browser AI** é um assistente de inteligência artificial moderno com navegador web autônomo integrado. Sua interface foi totalmente concebida sob o paradigma **Chat-First** (inspirada na elegância e usabilidade de assistentes de IA contemporâneos), permitindo ao usuário simplesmente pedir o que deseja em linguagem natural enquanto o agente navega, extrai informações, preenche formulários e executa tarefas na web em segundo plano.

---

## 🎨 Nova Estrutura Visual (Chat-First)

```text
┌──────────────────────────────────────────────┐
│ ☰  Morph Browser AI        [Ver navegador] ⋯ │
├──────────────────────────────────────────────┤
│                                              │
│               Morph Browser AI               │
│            O que você quer fazer?            │
│                                              │
│  [Pesquisa algo na web]  [Resume esta página]│
│  [Encontra melhor preço] [Compara produtos]  │
│                                              │
│  ──────────────────────────────────────────  │
│  Usuário: "Procura smartphones baratos"      │
│  Morph: "Encontrei 4 opções. O mais barato   │
│          é o Realme Note 50 (R$ 689,00)."    │
│                                              │
│  [✓ Atividade do agente: Tarefa concluída ▼] │
│                                              │
├──────────────────────────────────────────────┤
│ [＋] [ O que você quer fazer?         ] 🎙️ ➤│
└──────────────────────────────────────────────┘
```

1. **Barra Superior Compacta:**
   - Botão de menu hamburguer `☰` para abrir a barra lateral.
   - Identidade própria do Morph Browser AI.
   - Indicador de estado `🌐 Navegador ativo` e botão `Ver navegador`.
   - Menu rápido `⋯` (Limpar conversa, Configurações).

2. **Barra Lateral (Drawer):**
   - **Nova conversa** (`+`).
   - Campo de busca em conversas anteriores.
   - Conversas recentes organizadas por data (**Hoje**, **Ontem**, **Últimos 7 dias**).
   - Atalhos para **Navegador Web Integrado**, **Favoritos**, **Histórico** e **Configurações**.

3. **Área Principal da Conversa:**
   - **Tela Inicial Limpa:** Marca elegante do Morph e cartões clicáveis com exemplos de comandos que preenchem o campo de entrada ao toque.
   - **Mensagens do Usuário:** Balões compactos, confortáveis e alinhados à direita.
   - **Respostas do Agente:** Formatação natural de assistente com suporte a markdown, cartões de produtos e tabelas comparativas completas.
   - **Atividade do Agente Expansível:** Mostra apenas o estado de alto nível (`◌ Pesquisando na web...` ➔ `✓ 5 resultados encontrados`), sem poluir a interface com detalhes técnicos internos.

4. **Campo de Mensagem Inferior Fixado:**
   - Botão de anexo `[＋]` (`Página atual`, `Imagem`, `Arquivo`).
   - Textarea com auto-expansão para mensagens curtas ou longas.
   - Botão de microfone para comandos de voz.
   - Botão de envio `➤`, que se transforma instantaneamente no botão **PARAR** (vermelho com animação de trabalho) durante a execução de tarefas.

5. **Visualizador do Navegador ("Ver navegador"):**
   - O navegador não compete com o chat. Ao tocar em `Ver navegador`, abre-se uma tela deslizante com o motor web (`BrowserEngine`), barra de endereços, abas e o botão `← Voltar ao chat`.

---

## 🛠️ Como Testar a Nova Interface

1. **Nova Conversa e Exemplos:**
   - Abra o aplicativo e toque no cartão *"Pesquisa algo na web"*.
   - O texto preenche a caixa inferior. Clique em `➤` para enviar.
2. **Execução Autônoma no Navegador:**
   - Envie: *"Procura smartphones baratos."*
   - O agente exibe o indicador `🌐 Navegador ativo` no topo e a caixa expansível `Atividade do agente`.
   - Toque em `Ver navegador` a qualquer momento para assistir o agente rolar a página e interagir com os elementos.
   - Toque em `← Voltar ao chat` para retornar à conversa.
3. **Conversa Contínua:**
   - Logo após o agente listar os celulares, pergunte: *"Qual é o mais barato?"*.
   - O assistente mantém o contexto e responde diretamente com o modelo mais econômico e suas especificações.
4. **Interrupção com o Botão PARAR:**
   - Durante uma busca, o botão de envio se transforma em `Parar`. Toque nele para cancelar as ações no mesmo instante.
5. **Histórico e Barra Lateral:**
   - Toque em `☰` no canto superior esquerdo para visualizar as conversas salvas, trocar de chat ou criar uma nova conversa.
