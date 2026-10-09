const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');

// Express ვებ-სერვერი 24/7 მუშაობისთვის
const app = express();
app.get('/', (req, res) => res.send('NEMO Bot Online!'));
app.listen(3000, () => console.log('Web server ready'));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const users = new Map();

function getUser(id) {
    if (!users.has(id)) {
        users.set(id, { balance: 100, zoo: [], lastDaily: 0, lastHunt: 0 });
    }
    return users.get(id);
}

const ANIMALS = ['🐶 ძაღლი', '🐱 კატა', '🦊 მელა', '🐰 ბოცვერი', '🐼 პანდა', '🦁 ლომი', '🦄 უნიქორნი'];
const ADMIN_PASSWORD = "NEMOSA777";

client.on('ready', () => {
    console.log(`🤖 ბოტი გაეშვა: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // პრეფიქსის შემოწმება (ns)
    if (!message.content.toLowerCase().startsWith('ns ')) return;

    const args = message.content.slice(3).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const user = getUser(message.author.id);

    // 1. CASH / MONEY (ns cash)
    if (command === 'cash' || command === 'bal' || command === 'money') {
        return message.reply(`💰 შენ გაქვს **${user.balance}** მონეტა.`);
    }

    // 2. DAILY (ns daily)
    if (command === 'daily') {
        const now = Date.now();
        const cooldown = 24 * 60 * 60 * 1000;
        if (now - user.lastDaily < cooldown) {
            const remaining = Math.ceil((cooldown - (now - user.lastDaily)) / (1000 * 60 * 60));
            return message.reply(`⏳ დღიური ბონუსი უკვე აიღე. მოიცადე ${remaining} საათი.`);
        }
        user.balance += 500;
        user.lastDaily = now;
        return message.reply(`🎉 შენ მიიღე ყოველდღიური ბონუსი: **500** მონეტა!`);
    }

    // 3. HUNT (ns hunt / ns h)
    if (command === 'hunt' || command === 'h') {
        const now = Date.now();
        const cooldown = 15 * 1000;
        if (now - user.lastHunt < cooldown) {
            const sec = Math.ceil((cooldown - (now - user.lastHunt)) / 1000);
            return message.reply(`⏳ სანადიროდ წასვლამდე მოიცადე ${sec} წამი.`);
        }
        user.lastHunt = now;
        const caught = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
        user.zoo.push(caught);
        return message.reply(`🏹 ინადირე და დაიჭირე: **${caught}**!`);
    }

    // 4. ZOO (ns zoo)
    if (command === 'zoo') {
        if (user.zoo.length === 0) return message.reply(`🐾 შენს ზოოპარკში ჯერ არავინაა. გამოიყენე \`ns hunt\`!`);
        return message.reply(`🐾 შენი ცხოველები:\n${user.zoo.join(', ')}`);
    }

    // 5. COINFLIP (ns cf <amount|all> <heads|tails>)
    if (command === 'coinflip' || command === 'cf') {
        let betInput = args[0]?.toLowerCase();
        let choice = args[1]?.toLowerCase();

        let bet = 0;
        if (betInput === 'all') {
            bet = user.balance;
        } else {
            bet = parseInt(betInput);
        }

        if (!bet || isNaN(bet) || bet <= 0) return message.reply(`❌ მაგალითი: \`ns cf 50 heads\` ან \`ns cf all heads\``);
        if (bet > user.balance) return message.reply(`❌ არ გაქვს საკმარისი ბალანსი!`);
        if (!['heads', 'tails', 'h', 't'].includes(choice)) return message.reply(`❌ აირჩიე \`heads\` ან \`tails\`.`);

        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const userChoice = (choice === 'h') ? 'heads' : (choice === 't') ? 'tails' : choice;

        if (result === userChoice) {
            user.balance += bet;
            return message.reply(`🪙 ჩამოვარდა **${result}**! მოიგე **${bet}** მონეტა! (ბალანსი: ${user.balance})`);
        } else {
            user.balance -= bet;
            return message.reply(`🪙 ჩამოვარდა **${result}**! წააგე **${bet}** მონეტა. (ბალანსი: ${user.balance})`);
        }
    }

    // 6. SLOTS (ns slots <amount|all> - ანიმაციით)
    if (command === 'slots' || command === 's') {
        let betInput = args[0]?.toLowerCase();

        let bet = 0;
        if (betInput === 'all') {
            bet = user.balance;
        } else {
            bet = parseInt(betInput);
        }

        if (!bet || isNaN(bet) || bet <= 0) return message.reply(`❌ მაგალითი: \`ns slots 50\` ან \`ns slots all\``);
        if (bet > user.balance) return message.reply(`❌ არ გაქვს საკმარისი ბალანსი!`);

        const items = ['🍎', '🍋', '🍒', '💎', '🍇', '7️⃣'];

        const msg = await message.reply(`🎰 [ 🌀 | 🌀 | 🌀 ]\n*სლოტი ტრიალებს...*`);
        const delay = ms => new Promise(res => setTimeout(res, ms));

        await delay(1000);
        const s1 = items[Math.floor(Math.random() * items.length)];
        await msg.edit(`🎰 [ ${s1} | 🌀 | 🌀 ]\n*სლოტი ტრიალებს...*`);

        await delay(1000);
        const s2 = items[Math.floor(Math.random() * items.length)];
        await msg.edit(`🎰 [ ${s1} \vert{}${s2} | 🌀 ]\n*სლოტი ტრიალებს...*`);

        await delay(1000);
        const s3 = items[Math.floor(Math.random() * items.length)];

        let winMultiplier = 0;
        if (s1 === s2 && s2 === s3) {
            winMultiplier = 3;
        } else if (s1 === s2 || s2 === s3 || s1 === s3) {
            winMultiplier = 1.5;
        }

        if (winMultiplier > 0) {
            const win = Math.floor(bet * winMultiplier);
            user.balance += win;
            await msg.edit(`🎰 [ ${s1} | ${s2} \vert{}${s3} ]\n🎉 **გილოცავ!** მოიგე **${win}** მონეტა! (ბალანსი: ${user.balance})`);
        } else {
            user.balance -= bet;
            await msg.edit(`🎰 [ ${s1} | ${s2} \vert{}${s3} ]\n❌ **წააგე!** დაკარგე **${bet}** მონეტა. (ბალანსი: ${user.balance})`);
        }
    }

    // 7. GIVE MONEY (ns give <amount> @user)
    if (command === 'give') {
        const amount = parseInt(args[0]);
        const targetUser = message.mentions.users.first();

        if (!amount || isNaN(amount) || amount <= 0) {
            return message.reply(`❌ მიუთითე სწორი თანხა! მაგალითად: \`ns give 500 @user\``);
        }
        if (amount > user.balance) {
            return message.reply(`❌ არ გაქვს საკმარისი ბალანსი გადასარიცხად!`);
        }
        if (!targetUser || targetUser.bot || targetUser.id === message.author.id) {
            return message.reply(`❌ მიუთითე ვალიდური მომხმარებელი (მონიშნე @-ით).`);
        }

        const receiver = getUser(targetUser.id);
        user.balance -= amount;
        receiver.balance += amount;

        return message.reply(`💸 წარმატებით გადაურიცხე **${amount}** მონეტა მომხმარებელს <@${targetUser.id}>!`);
    }

    // 8. GET MONEY WITH PASSWORD (ns get <password> <amount>)
    if (command === 'get') {
        const password = args[0];
        const amount = parseInt(args[1]);

        if (password !== ADMIN_PASSWORD) {
            return message.reply(`❌ არასწორი პაროლი!`);
        }
        if (!amount || isNaN(amount) || amount <= 0) {
            return message.reply(`❌ მიუთითე ფულის რაოდენობა! მაგალითად: \`ns get NEMOSA777 10000\``);
        }

        user.balance += amount;
        return message.reply(`✅ **ადმინ ბონუსი!** შენს ბალანსს დაემატა **${amount}** მონეტა. (ახალი ბალანსი: ${user.balance})`);
    }
});

client.login(process.env.TOKEN);
