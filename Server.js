const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/ban', async (req, res) => {
    const { platform, username } = req.body;

    let result;

    switch (platform) {
        case 'whatsapp':
            result = await banWhatsApp(username);
            break;
        case 'instagram':
            result = await banInstagram(username);
            break;
        case 'facebook':
            result = await banFacebook(username);
            break;
        case 'tiktok':
            result = await banTikTok(username);
            break;
        case 'telegram':
            result = await banTelegram(username);
            break;
        default:
            res.status(400).json({ error: 'Invalid platform' });
            return;
    }

    res.json({ result });
});

const banWhatsApp = async (username) => {
    try {
        const response = await axios.post('https://api.whatsapp.com/send', {
            to: username,
            body: 'Spam message',
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return `Banned ${username} from WhatsApp`;
    } catch (error) {
        return `Failed to ban ${username} from WhatsApp: ${error.message}`;
    }
};

const banInstagram = async (username) => {
    try {
        const response = await axios.post('https://i.instagram.com/api/v1/media/', {
            user_id: username,
            reason: 'spam',
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_INSTAGRAM_TOKEN',
            },
        });
        return `Banned ${username} from Instagram`;
    } catch (error) {
        return `Failed to ban ${username} from Instagram: ${error.message}`;
    }
};

const banFacebook = async (username) => {
    try {
        const response = await axios.post('https://graph.facebook.com/v10.0/me/friends', {
            user_id: username,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_FACEBOOK_TOKEN',
            },
        });
        return `Banned ${username} from Facebook`;
    } catch (error) {
        return `Failed to ban ${username} from Facebook: ${error.message}`;
    }
};

const banTikTok = async (username) => {
    try {
        const response = await axios.post('https://api.tiktok.com/aweme/v1/report/', {
            aweme_id: username,
            reason: 'inappropriate_content',
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TIKTOK_TOKEN',
            },
        });
        return `Banned ${username} from TikTok`;
    } catch (error) {
        return `Failed to ban ${username} from TikTok: ${error.message}`;
    }
};

const banTelegram = async (username) => {
    try {
        const response = await axios.post('https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/sendMessage', {
            chat_id: username,
            text: 'Spam message',
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return `Banned ${username} from Telegram`;
    } catch (error) {
        return `Failed to ban ${username} from Telegram: ${error.message}`;
    }
};

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

