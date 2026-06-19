require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { parsearPedido } = require('./parser');
const { imprimirPedido } = require('./printer');

const NOME_DO_GRUPO  = process.env.NOME_DO_GRUPO;
const PALAVRA_CHAVE  = (process.env.PALAVRA_CHAVE || 'pedido').toLowerCase();

// ─── Cliente WhatsApp ────────────────────────────────────────────────────────
// LocalAuth salva a sessão em .wwebjs_auth — não precisa escanear QR toda vez
const client = new Client({
  authStrategy: new LocalAuth({ clientId: 'almoxarifado' }),
  puppeteer: { headless: true }
});

// ─── QR Code (apenas na primeira execução) ───────────────────────────────────
client.on('qr', (qr) => {
  console.clear();
  console.log('╔══════════════════════════════════════╗');
  console.log('║     BOT ALMOXARIFADO - WHATSAPP      ║');
  console.log('╚══════════════════════════════════════╝');
  console.log('');
  console.log('📱 Abra o WhatsApp no celular do almoxarife');
  console.log('   Aparelhos conectados → Conectar aparelho');
  console.log('   Escaneie o QR Code abaixo:\n');
  qrcode.generate(qr, { small: true });
});

// ─── Conectado ───────────────────────────────────────────────────────────────
client.on('ready', () => {
  console.clear();
  console.log('╔══════════════════════════════════════╗');
  console.log('║     BOT ALMOXARIFADO - ATIVO ✅      ║');
  console.log('╚══════════════════════════════════════╝');
  console.log(`\n👁  Monitorando grupo : "${NOME_DO_GRUPO}"`);
  console.log(`🔑  Palavra-chave     : "${PALAVRA_CHAVE}"`);
  console.log('\nAguardando pedidos...\n');
});

// ─── Falha de autenticação ───────────────────────────────────────────────────
client.on('auth_failure', () => {
  console.error('\n❌ Falha na autenticação!');
  console.error('   Delete a pasta .wwebjs_auth e execute novamente.\n');
});

// ─── Desconectado ────────────────────────────────────────────────────────────
client.on('disconnected', (reason) => {
  console.warn(`\n⚠️  Bot desconectado: ${reason}`);
  console.warn('   Reinicie o sistema.\n');
});

// ─── Fila de impressão ───────────────────────────────────────────────────────
// Garante que apenas UM pedido é impresso por vez. Se dois pedidos chegarem
// quase juntos, o segundo só começa depois que o primeiro terminar — assim
// nunca há duas tentativas simultâneas de abrir a impressora USB (o que poderia
// travar a comunicação). NÃO altera o printer.js, apenas organiza a ordem.
let filaImpressao = Promise.resolve();

function enfileirarImpressao(pedido) {
  // O .catch antes do .then evita que a falha de um pedido bloqueie os próximos.
  filaImpressao = filaImpressao
    .catch(() => {})
    .then(() => imprimirPedido(pedido));
  return filaImpressao;
}

// ─── Processar mensagens ─────────────────────────────────────────────────────
client.on('message', async (msg) => {
  try {
    // Ignora mensagens fora de grupos
    if (!msg.from.endsWith('@g.us')) return;

    // Verifica se é o grupo correto
    const chat = await msg.getChat();
    if (chat.name !== NOME_DO_GRUPO) return;

    // Verifica palavra-chave
    if (!msg.body.toLowerCase().includes(PALAVRA_CHAVE)) return;

    console.log(`\n📨 Pedido recebido às ${new Date().toLocaleTimeString('pt-BR')}`);
    console.log(`Mensagem:\n${msg.body}\n`);

    // Interpreta a mensagem
    const pedido = parsearPedido(msg.body);

    // Formato inválido — avisa no grupo
    if (!pedido) {
      console.warn('⚠️  Formato inválido. Avisando no grupo...');
      await msg.reply(
        '⚠️ *Formato inválido.* Envie exatamente assim:\n\n' +
        '*Pedido*\n\n' +
        '*Responsável:* Seu Nome\n\n' +
        '*Encanador:* Nome do Encanador\n' +
        '2 nome do item\n' +
        '1 outro item'
      );
      return;
    }

    // Formata horário
    const horario = new Date(msg.timestamp * 1000)
      .toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

    // Imprime (passando pela fila — um pedido por vez)
    await enfileirarImpressao({ ...pedido, horario });


  } catch (err) {
    console.error('Erro ao processar mensagem:', err.message);
  }
});

// ─── Inicializa ──────────────────────────────────────────────────────────────
client.initialize();
