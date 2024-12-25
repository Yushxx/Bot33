const TelegramBot = require('node-telegram-bot-api');
const random = require('lodash/random');
const schedule = require('node-schedule');
const http = require('http');

// Récupération des variables sensibles depuis l'environnement
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const channelId = process.env.CHANNEL_ID;
const signupUrl = process.env.SIGNUP_URL;
const howToPlayUrl = process.env.HOW_TO_PLAY_URL;
const howToPlayUrlB = process.env.HOW_TO_PLAY_URLB;


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

🚨 The signal work only on Linebet with promo code  PX221 ✅️!
 
[ouvrir mega pari](${signupUrl})
[Tuto en Français](${howToPlayUrlB})
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
    '0 10 * * *',   // 10h00 - Matin
    '0 11 * * *',   // 11h00 - Matin
    '0 12 * * *',   // 12h00 - Matin avant déjeuner
    '0 15 * * *',   // 15h00 - Après le déjeuner
    '0 16 * * *',   // 16h00 - Période active
    '0 17 * * *',   // 17h00 - Période active
    '0 19 * * *',   // 19h00 - Début de soirée
    '0 20 * * *',   // 20h00 - Soirée active
    '0 21 * * *',   // 21h00 - Soirée active
    '0 22 * * *',   // 22h00 - Soirée tardive
    '15 23 * * *',  // 23h15 - Fin de soirée
    '30 23 * * *',  // 23h30 - Dernier envoi
];


scheduledTimes.forEach((time) => {
    schedule.scheduleJob(time, () => {
        sendSequenceToChannel(channelId); // Utilise l'ID du canal depuis l'environnement
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
