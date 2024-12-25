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
        [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
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

function sendSequenceToChannel(chatId) {
    try {
        if (!chatId) {
            console.error('Chat ID manquant, impossible d\'envoyer le message.');
            return;
        }

        const sequenceMessage = `
${sequenceTemplate}
2.41:${generate_sequence()}
1.93:${generate_sequence()}
1.54:${generate_sequence()}
1.23:${generate_sequence()}

🚨 The signal works only on Linebet with promo code PX221 ✅️!
 
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
    } catch (error) {
        console.error(`Erreur lors de l'envoi de la séquence : ${error.message}`);
    }
}

const scheduledTimes = [
    '0 10 * * *',
    '0 11 * * *',
    '0 12 * * *',
    '0 15 * * *',
    '0 16 * * *',
    '0 17 * * *',
    '0 19 * * *',
    '0 20 * * *',
    '0 21 * * *',
    '0 22 * * *',
    '15 23 * * *',
    '30 23 * * *',
];

scheduledTimes.forEach((time) => {
    schedule.scheduleJob(time, () => {
        console.log(`Envoi de la séquence programmé à ${time}`);
        sendSequenceToChannel(channelId);
    });
});

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

    bot.sendMessage(chatId, 'Cliquez sur "Voir la pomme" pour générer les séquences :', {
        reply_markup: inlineKeyboard
    });
});

bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;

    if (query.data === 'voir_la_pomme') {
        sendSequenceToChannel(chatId);
    } else if (query.data === 'test_message') {
        sendSequenceToChannel(channelId);
    }
});

http.createServer((req, res) => {
    res.write("I'm alive");
    res.end();
}).listen(8080);
