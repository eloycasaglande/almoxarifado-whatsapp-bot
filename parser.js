/**
 * Interpreta mensagens no formato:
 *
 * Pedido
 *
 * Responsável: Bruno
 *
 * Encanador: Emanuel
 * 2 união
 * 5 adaptador com registro
 * 10 metros pead
 */

function parsearPedido(texto) {
  const linhas = texto
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);

  let responsavel = null;
  let encanador = null;
  const itens = [];

  for (const linha of linhas) {
    const lower = linha.toLowerCase();

    // Ignora a linha "pedido"
    if (lower === 'pedido') continue;

    // Extrai Responsável
    if (lower.startsWith('responsável:') || lower.startsWith('responsavel:')) {
      responsavel = linha.split(':')[1]?.trim() || null;
      continue;
    }

    // Extrai Encanador — itens começam após essa linha
    if (lower.startsWith('encanador:')) {
      encanador = linha.split(':')[1]?.trim() || null;
      continue;
    }

    // Se já encontrou o encanador, o restante são itens
    if (encanador !== null) {
      const match = linha.match(/^(\d+)\s+(.+)$/);
      if (match) {
        itens.push({
          quantidade: parseInt(match[1]),
          descricao: match[2].trim()
        });
      } else if (linha.length > 0) {
        itens.push({ quantidade: 1, descricao: linha });
      }
    }
  }

  // Validação mínima
  if (!encanador || itens.length === 0) return null;

  return { responsavel, encanador, itens };
}

module.exports = { parsearPedido };
