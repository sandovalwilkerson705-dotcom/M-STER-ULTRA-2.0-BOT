const fs = require('fs');
const path = require('path');

const autoAcceptFile = './autoAccept.json';

const loadAutoAccept = () => {
    return fs.existsSync(autoAcceptFile) ? JSON.parse(fs.readFileSync(autoAcceptFile)) : {};
};

const saveAutoAccept = (data) => {
    fs.writeFileSync(autoAcceptFile, JSON.stringify(data));
};

const autoAccept = loadAutoAccept();

const handler = async (m, { conn, text }) => {
    if (!text) throw '✳️ Usa: .request accept on/off';
    
    if (text === 'accept on') {
        autoAccept[m.chat] = true;
        saveAutoAccept(autoAccept);
        await conn.sendMessage(m.chat, { text: '✅ Auto-accept ACTIVADO' }, { quoted: m });
    } 
    else if (text === 'accept off') {
        autoAccept[m.chat] = false;
        saveAutoAccept(autoAccept);
        await conn.sendMessage(m.chat, { text: '❌ Auto-accept DESACTIVADO' }, { quoted: m });
    } else throw '✳️ Usa: .request accept on/off';
};

// Esta función se usa en el evento principal del bot
const handleGroupUpdate = async (update, conn) => {
    if (update.action === 'request' && autoAccept[update.id]) {
        await conn.groupAcceptInviteRequest(update.id, update.participant);
    }
};

handler.command = ['request'];
handler.admin = true;

module.exports = { handler, handleGroupUpdate };