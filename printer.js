require('dotenv').config();
const escpos = require('escpos');
escpos.USB = require('escpos-usb');

function imprimirPedido({ responsavel, encanador, itens, horario }) {
  return new Promise((resolve, reject) => {
    let device;
    try {
      device = new escpos.USB();
    } catch (err) {
      console.error('❌ Impressora não encontrada. Verifique o cabo USB.');
      return reject(err);
    }

    const printer = new escpos.Printer(device);

    device.open((err) => {
      if (err) return reject(err);

      printer
        .align('ct')
        .style('b')
        .size(0, 0)
        .text('==============================')
        .text('   PEDIDO ALMOXARIFADO')
        .text('==============================')
        .text('')

      printer
        .align('ct')
        .style('b')
        .size(1, 1)
        .text(encanador.toUpperCase())
        .size(0, 0)
        .style('normal')
        .text('')
        .align('lt')
        .text('------------------------------')

      itens.forEach(({ quantidade, descricao }) => {
        const qtdFormatada = String(quantidade).padEnd(4);
        printer.text(`${qtdFormatada}${descricao.toUpperCase()}`);
      });

      printer
        .text('------------------------------')

      if (responsavel) {
        printer.text(`Responsavel: ${responsavel.toUpperCase()}`);
      }

      printer
        .text(horario)
        .text('==============================')
        .text('')
        .text('')
        .cut()
        .close(() => {
          console.log(`✅ Impresso: pedido de ${encanador}`);
          resolve();
        });
    });
  });
}

module.exports = { imprimirPedido };
