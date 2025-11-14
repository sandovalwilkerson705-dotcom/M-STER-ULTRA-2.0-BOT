const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const handler = async (msg, { conn, command }) => {
  const chatId = msg.key.remoteJid;
  const pref = global.prefixes?.[0] || '.';

  // 1) Verificación más robusta de mensaje citado
  const quotedCtx = msg.message?.extendedTextMessage?.contextInfo;
  const quoted = quotedCtx?.quotedMessage;
  
  if (!quoted?.imageMessage) {
    return conn.sendMessage(chatId, {
      text: `✳️ *Usa:*\n${pref}${command}\n📌 Responde a una imagen para mejorarla.`
    }, { quoted: msg });
  }

  // 2) Verificar tamaño de imagen (límite de 10MB)
  const imageSize = quoted.imageMessage.fileLength;
  if (imageSize > 10 * 1024 * 1024) {
    return conn.sendMessage(chatId, {
      text: '❌ *La imagen es muy grande.*\n📏 Máximo permitido: 10MB'
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, { react: { text: '🧪', key: msg.key } });

  let tmpFile;
  try {
    // 3) Descargar imagen con manejo de errores mejorado
    const tmpDir = path.join(__dirname, 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    tmpFile = path.join(tmpDir, `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);
    
    const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
    const ws = fs.createWriteStream(tmpFile);
    
    let downloadedBytes = 0;
    for await (const chunk of stream) {
      ws.write(chunk);
      downloadedBytes += chunk.length;
      
      // Verificar tamaño durante descarga
      if (downloadedBytes > 15 * 1024 * 1024) {
        throw new Error('La imagen excede el tamaño máximo permitido');
      }
    }
    ws.end();
    await new Promise((resolve, reject) => {
      ws.on('finish', resolve);
      ws.on('error', reject);
    });

    // 4) Verificar que el archivo se descargó correctamente
    const stats = fs.statSync(tmpFile);
    if (stats.size === 0) {
      throw new Error('La imagen se descargó vacía');
    }

    // 5) Preparar FormData alternativo para Node.js
    const FormData = require('form-data');
    const form = new FormData();
    
    // Leer como stream en lugar de buffer completo para mejor rendimiento
    const fileStream = fs.createReadStream(tmpFile);
    form.append('file', fileStream, {
      filename: 'image.jpg',
      contentType: 'image/jpeg'
    });
    form.append('apikey', 'DowKeye42v356324');

    // 6) Llamar a la API con timeout y mejores headers
    const ADONIX_HD_URL = 'https://api-adonix.ultraplus.click/canvas/hd';
    
    const hdResponse = await axios.post(ADONIX_HD_URL, form, {
      headers: {
        ...form.getHeaders(),
        'Accept': 'image/*'
      },
      responseType: 'arraybuffer',
      timeout: 30000, // 30 segundos timeout
      maxContentLength: 25 * 1024 * 1024, // 25MB máximo
    });

    // 7) Verificar respuesta de la API
    if (!hdResponse.data || hdResponse.data.length === 0) {
      throw new Error('La API devolvió una imagen vacía');
    }

    // Verificar que sea realmente una imagen
    const buffer = Buffer.from(hdResponse.data);
    if (!buffer.slice(0, 4).toString('hex').match(/^ffd8ff|^89504e47|^47494638/)) {
      throw new Error('La respuesta no es una imagen válida');
    }

    // 8) Enviar imagen mejorada
    await conn.sendMessage(chatId, {
      image: buffer,
      caption: '✨ Imagen mejorada con éxito por *La Suki Bot*\n🔧 Usando API Adonix HD'
    }, { quoted: msg });
    
    await conn.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

  } catch (e) {
    console.error('❌ Error en comando .hd:', e);
    
    let errorMessage = `❌ *Error al procesar la imagen:* ${e.message}`;
    
    if (e.code === 'ECONNABORTED') {
      errorMessage = '❌ *Tiempo de espera agotado.*\nLa API está tardando demasiado en responder.';
    } else if (e.response?.status === 413) {
      errorMessage = '❌ *Imagen demasiado grande.*\nIntenta con una imagen más pequeña.';
    } else if (e.response?.status >= 500) {
      errorMessage = '❌ *Error del servidor.*\nEl servicio de mejora está temporalmente fuera de línea.';
    }
    
    await conn.sendMessage(chatId, { text: errorMessage }, { quoted: msg });
    await conn.sendMessage(chatId, { react: { text: '❌', key: msg.key } });
    
  } finally {
    // 9) Limpieza robusta del archivo temporal
    if (tmpFile && fs.existsSync(tmpFile)) {
      try {
        fs.unlinkSync(tmpFile);
      } catch (cleanupError) {
        console.warn('⚠️ No se pudo eliminar archivo temporal:', cleanupError.message);
      }
    }
  }
};

handler.command = ['hd'];
handler.help = ['hd'];
handler.tags = ['tools'];
handler.register = true;

// Configuración adicional para el comando
handler.limit = true;
handler.exp = 3000; // Experiencia ganada por uso

module.exports = handler;