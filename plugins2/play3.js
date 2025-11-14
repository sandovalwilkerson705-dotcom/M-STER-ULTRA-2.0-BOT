```case 'play3': {
    const fetch = require('node-fetch');
    const axios = require('axios');

    const apis = {
        delirius: 'https://delirius-apiofc.vercel.app/',
        ryzen: 'https://apidl.asepharyana.cloud/',
        rioo: 'https://restapi.apibotwa.biz.id/'
    };

    await sock.sendMessage(msg.key.remoteJid, { react: { text: "🎶", key: msg.key } });

    if (!text) {
        await sock.sendMessage(msg.key.remoteJid, {
            text: `⚠️ Escribe lo que deseas buscar en Spotify.\nEjemplo: *${global.prefix}play3* Marshmello - Alone`
        }, { quoted: msg });
        break;```