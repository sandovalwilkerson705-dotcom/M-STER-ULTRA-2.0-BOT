const handler = async (msg, { conn }) => {
  const ownerNumber = "+5492644893953@s.whatsapp.net"; // Número del creador
  const ownerName = "wilker s 🤖"; // Nombre visible del creador

  const messageText = `📞 *Contacto del Creador del Subbot:*

Si tienes dudas, preguntas o sugerencias sobre el funcionamiento de *M-ster Ultra Subbot*, puedes contactar a su creador.

📌 *Nombre:* Russell
📌 *Número:* +5492644893953
💬 *Toca el contacto para enviarle un mensaje directo.`;

  // Enviar contacto vCard
  await conn.sendMessage(msg.key.remoteJid, {
    contacts: {
      displayName: ownerName,
      contacts: [
        {
          vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${ownerName}\nTEL;waid=${ownerNumber.split('@')[0]}:+${ownerNumber.split('@')[0]}\nEND:VCARD`
        }
      ]
    }
  });

  // Enviar texto informativo
  await conn.sendMessage(msg.key.remoteJid, {
    text: messageText
  }, { quoted: msg });
};

handler.command = ['creador'];
module.exports = handler;
