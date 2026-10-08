/**
 * SecurityManager: Garante a proteção contra Prompt Injection, isolamento de credenciais
 * e validação estrita de ações no Morph Browser AI.
 */
export class SecurityManager {
  private static readonly INJECTION_PATTERNS = [
    /ignore (all )?(previous|prior) (instructions|directions)/i,
    /desconsidere (todas )?(as )?(instruções|regras) anteriores/i,
    /reveal (your )?(system|internal) (prompt|keys|credentials|passwords)/i,
    /revele (suas )?(senhas|chaves|credenciais|instruções)/i,
    /you are now in (unrestricted|jailbreak|developer) mode/i,
    /você agora está em modo (livre|jailbreak|desenvolvedor)/i,
    /execute (rm -rf|drop database|eval|document\.cookie)/i,
  ];

  /**
   * Examina o conteúdo extraído da página web para detectar tentativas de Prompt Injection.
   */
  public static sanitizePageContent(rawContent: string): {
    sanitized: string;
    hasSuspiciousPatterns: boolean;
    threatsDetected: string[];
  } {
    const threats: string[] = [];
    let isSuspicious = false;

    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(rawContent)) {
        isSuspicious = true;
        threats.push(`Padrão suspeito bloqueado: ${pattern.source}`);
      }
    }

    // Isola dados não confiáveis e remove tags de script ativas
    let sanitized = rawContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '[SCRIPT_REMOVED_BY_SECURITY]')
      .replace(/javascript:/gi, 'blocked:')
      .replace(/onload=|onerror=|onclick=/gi, 'blocked_attr=');

    return {
      sanitized,
      hasSuspiciousPatterns: isSuspicious,
      threatsDetected: threats,
    };
  }

  /**
   * Garante que campos de senha e credenciais nunca sejam transmitidos ao modelo de IA.
   */
  public static maskCredentials(elements: any[]): any[] {
    return elements.map((el) => {
      if (
        el.type === 'password' ||
        /password|senha|token|cvv|pin/i.test(el.placeholder || '') ||
        /password|senha|token|cvv|pin/i.test(el.id || '') ||
        /password|senha|token|cvv|pin/i.test(el.name || '')
      ) {
        return {
          ...el,
          value: '[PROTECTED_CREDENTIAL - DIGITAÇÃO DIRETA PELO USUÁRIO]',
          isSensitive: true,
          requiresUserManualEntry: true,
        };
      }
      return el;
    });
  }

  /**
   * Determina se uma ação do navegador requer confirmação explícita do usuário.
   */
  public static isSensitiveAction(tool: string, params: Record<string, any>, elementMeta?: any): boolean {
    if (tool === 'browser_click') {
      const text = (elementMeta?.text || params?.text || '').toLowerCase();
      const id = (params?.elementId || '').toLowerCase();

      // Compras, pagamentos, checkout
      if (
        /comprar|pagar|checkout|finalizar pedido|assinar|confirmar compra|pay|order/i.test(text) ||
        /buy|checkout|payment|order/i.test(id)
      ) {
        return true;
      }

      // Envio de formulário com dados privados
      if (/enviar|submit|concluir cadastro|salvar dados/i.test(text) && elementMeta?.isSensitive) {
        return true;
      }

      // Exclusão de dados
      if (/apagar|deletar|excluir|remover conta|limpar tudo|delete|remove/i.test(text)) {
        return true;
      }

      // Confirmação de reserva
      if (/confirmar reserva|book now|reservar agora/i.test(text)) {
        return true;
      }
    }

    if (tool === 'browser_type') {
      const id = (params?.elementId || '').toLowerCase();
      if (/password|senha|cartao|card_number|cvv/i.test(id)) {
        return true;
      }
    }

    return false;
  }
}
