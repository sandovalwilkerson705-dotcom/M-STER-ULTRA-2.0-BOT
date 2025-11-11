const fetch = require('node-fetch');

const handler = async (msg, { conn, usedPrefix, command, text }) => {
    let chatId = msg.key.remoteJid;
    
    // Verificar que se proporcionó un término de búsqueda
    if (!text) {
        return await conn.sendMessage(chatId, { 
            text: `*❌ POR FAVOR ESCRIBE LO QUE QUIERES BUSCAR*\n\n*Ejemplo:*\n*${usedPrefix + command} carro Lamborghini*\n*${usedPrefix + command} paisajes*\n*${usedPrefix + command} animales*` 
        }, { quoted: msg });
    }
    
    try {
        // Mensaje de espera
        await conn.sendMessage(chatId, { 
            text: '🔍 *Buscando imágenes...*' 
        }, { quoted: msg });
        
        const query = encodeURIComponent(text);
        
        // Usar método con Unsplash
        const imageUrls = [
            `https://source.unsplash.com/random/800x600/?${query}&1`,
            `https://source.unsplash.com/random/800x600/?${query}&2`, 
            `https://source.unsplash.com/random/800x600/?${query}&3`,
            `https://source.unsplash.com/random/800x600/?${query}&4`,
            `https://source.unsplash.com/random/800x600/?${query}&5`
        ];
        
        for (let i = 0; i < 5; i++) {
            const caption = `*🖼️ AZURA ULTRA 2.0 - RESULTADO ${i + 1}*\n*🔍 Búsqueda:* ${text}\n*🌐 Fuente:* Unsplash\n*⚡ Creado por Russell*`;
            
            try {
                await conn.sendMessage(chatId, {
                    image: { url: imageUrls[i] },
                    caption: caption
                }, { quoted: msg });
                
                // Pausa para evitar flood
                await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (error) {
                console.error(`Error en imagen ${i + 1}:`, error);
            }
        }
        
        await conn.sendMessage(chatId, { 
            text: '✅ *¡BÚSQUEDA COMPLETADA!*' 
        }, { quoted: msg });

    } catch (error) {
        console.error(error);
        await conn.sendMessage(chatId, { 
            text: '❌ *ERROR AL BUSCAR IMÁGENES. INTENTA MÁS TARDE*' 
        }, { quoted: msg });
    }
};

// Configuración del comando
handler.help = ['pin <texto>'];
handler.tags = ['internet'];
handler.command = /^pin$/i;
handler.premium = false;
handler.limit = true;
handler.register = true;

module.exports = handler;