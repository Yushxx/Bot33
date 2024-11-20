require('dotenv').config(); // Charge les variables d'environnement depuis .env
const TelegramBot = require('node-telegram-bot-api');
const random = require('lodash/random');
const schedule = require('node-schedule');
const http = require('http');

// Récupération des variables sensibles depuis le fichier .env
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const channelId = process.env.CHANNEL_ID;
const signupUrl = process.env.SIGNUP_URL;
const howToPlayUrl = process.env.HOW_TO_PLAY_URL;

function generate_sequence() {
    const sequence = ["🟩", "🟩", "🟩", "🟩", "🍎"];
    for (let i = sequence.length - 1; i > 0; i--) {
        const j = random(0, i);
        [sequence[i], sequence[j]] = [sequence[j], sequence[i]]; // Permuter les éléments
    }
    return sequence.join(" ");
}

// Modèle de séquence
const sequenceTemplate = `
🔔 CONFIRMED ENTRY!
🍎 Apple : 4
🔐 Attempts: 5
⏰ Validity: 5 minutes
`;

// Fonction pour envoyer une séquence dans le canal
function sendSequenceToChannel(chatId) {
    const sequenceMessage = `
${sequenceTemplate}
2.41:${generate_sequence()}
1.93:${generate_sequence()}
1.54:${generate_sequence()}
1.23:${generate_sequence()}

🚨 WORKS ONLY ON MEGA PARI WITH PROMO CODE PXVIP221 ✅️!
 
[sign up](${signupUrl})
[How to play](${howToPlayUrl})
`;

    const inlineKeyboard = {
        inline_keyboard: [
            [
                { text: 'Sign up', url: signupUrl },
                { text: 'How to play', url: howToPlayUrl }
            ]
        ]
    };

    const options = {
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: inlineKeyboard
    };

    bot.sendMessage(chatId, sequenceMessage, options);
}

// Planification des envois de séquences
const scheduledTimes = [
    '0-30/10 8 * * *',    // De 8h00 à 8h30 chaque 10 min
    '0-30/10 11 * * *',   // De 11h00 à 11h30 chaque 10 min
    '0-30/10 19 * * *',   // De 19h00 à 19h30 chaque 10 min
    '0-30/10 20 * * *',   // De 20h00 à 20h30 chaque 10 min
    '0-30/15 22 * * *',   // De 22h00 à 22h30 chaque 15 min
    '0-30/15 23 * * *',   // De 23h00 à 23h30 chaque 15 min
];

scheduledTimes.forEach((time) => {
    schedule.scheduleJob(time, () => {
        sendSequenceToChannel(channelId); // Utilise l'ID du canal depuis le fichier .env
    });
});

// Gérer la commande /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const inlineKeyboard = {
        inline_keyboard: [
            [
                { text: 'Voir la pomme', callback_data: 'voir_la_pomme' },
                { text: 'Test', callback_data: 'test_message' }
            ]
        ]
    };
    const replyMarkup = { reply_markup: inlineKeyboard };

    bot.sendMessage(chatId, 'Cliquez sur "Voir la pomme" pour générer les séquences :', replyMarkup);
});

// Gérer le clic sur le bouton "Voir la pomme" ou "Test"
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;

    if (query.data === 'voir_la_pomme') {
        sendSequenceToChannel(chatId);
    } else if (query.data === 'test_message') {
        sendSequenceToChannel(channelId); // Envoi de séquence au canal
    }
});

// Code keep_alive pour éviter que le bot ne s'endorme
http.createServer(function (req, res) {
    res.write("I'm alive");
    res.end();
}).listen(8080);
