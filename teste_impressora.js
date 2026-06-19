const escpos = require('escpos');
escpos.USB = require('escpos-usb');

const device = new escpos.USB();
const printer = new escpos.Printer(device);

device.open((err) => {
  if (err) {
    console.error('❌ Impressora não encontrada:', err.message);
    return;
  }

  printer
    .align('ct')
    .style('b')
    .size(1, 1)
    .text('IMPRESSORA OK!')
    .size(0, 0)
    .style('normal')
    .text('Teste do Almoxarifado')
    .text(new Date().toLocaleString('pt-BR'))
    .text('')
    .text('')
    .cut()
    .close(() => {
      console.log('✅ Teste impresso com sucesso!');
    });
});
