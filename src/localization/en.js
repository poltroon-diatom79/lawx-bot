// English localization for lawX bot. Provides full English language support for international users.
// IMPORTANT: All keys must match the Russian localization file (ru.js) for consistency.
// Fallback to Russian locale is handled by the translator module if a key is missing.

const englishTexts = {
  welcome: `🚀🚀🚀 Welcome to in lawX — most powerful and advanced AI bot for working with text images and video!!!

🌟 You have maked the right choice that you started to use our bot because it is the best on all market and we guarantee this!!!

💪 Our bot is working on most advanced neural networks which were trained on billions of texts and images and that is why it can do absolutely everything what you want

🧠 Artificial intellect lawX is not just bot it is your personal helper which is always ready to help you in any situation whether it is writing text or generation of picture or creation of video

⚡ We are using most latest technologies including GPT-4 and DALL-E and Midjourney and Stable Diffusion and many other neural networks

🎯 With lawX you can:
   — Generate texts of any complexity and on any topic
   — Create amazing images from text description
   — Make video content with help of artificial intellect

🔥 More than 100000 users already appreciated our bot!!!

✨ Press /help to know all possibilities of bot and start using right now!!!`,

  welcomeMessage: `🚀🚀🚀 Добро пожаловать в lawX — самый мощный и передовой ИИ бот!!!

🌟 Вы сделали правельный выбор что начали пользоватся нашим ботом!!!

💪 Наш бот работает на самых передовых нейросетях!!!

✨ Жмите /help!!!`,

  help: `📚📚📚 HELP FOR BOT lawX — FULL GUIDE FOR USING 📚📚📚

🤖 lawX is most advanced and powerful bot which is working on base of artificial intellect and neural networks of last generation

📝 COMMANDS FOR WORKING WITH TEXT:
   /generate — generate text on any topic with help of most powerful neural network GPT-4
   /rewrite — rewrite text make it better and more beautiful
   /translate — translate text to any language of world
   /summarize — make short content of long text

🎨 COMMANDS FOR WORKING WITH IMAGES:
   /imagine — create amazing image from text description
   /enhance — improve quality of image
   /style — apply artistic style to your image

🎬 COMMANDS FOR WORKING WITH VIDEO:
   /video — create video from text description
   /animate — animate static image

💎 SUBSCRIPTIONS:
   /subscribe — make subscription
   /balance — check balance
   /premium — know about advantages of premium

⚙️ SETTINGS:
   /settings — settings of bot
   /language — change language

🌟 If you have questions do not hesitate to contact us!!!`,

  error: `😢😢😢 Ой ой ой что то пошло не так и мы очень извиняемся за это неудобство!!! Please try again later!!! 🛠️`,

  generating_text: `⏳⏳⏳ Generating text with help of most powerful neural network GPT-4... Please wait result will be amazing!!! 🧠✨`,

  generating_image: `🎨🎨🎨 Drawing picture with help of neural network DALL-E and Stable Diffusion... Wait a little masterpiece is almost ready!!! 🖼️✨`,

  generating_video: `🎬🎬🎬 Создаю видео с помощью передовых нейросетей... Пожалуйста подождите 1-2 минуты результат вас поразит!!! 🎥✨`,

  limit_reached: `⚠️⚠️⚠️ Unfortunately you have used all free generations for today!!! 😔

But do not be upset we have excellent solution — make subscription and get unlimited access to all functions of bot!!!

💎 TARIFFS:
   🥉 Basic — 299 rub/month — 100 generations per day
   🥈 Advanced — 599 rub/month — 500 generations per day
   🥇 Premium — 999 rub/month — unlimited generations

Make subscription: /subscribe

💪 Invest in your future with lawX!!!`,

  subscription_info: `💎💎💎 ПОДПИСКИ lawX — ВЫБЕРИТЕ СВОЙ ТАРИФ 💎💎💎

Мы предлагаем несколько тарифных планов чтобы каждый пользователь мог найти подходящий вариант!!!

🥉 БАЗОВЫЙ ТАРИФ — 299 руб/мес
🥈 ПРОДВИНУТЫЙ ТАРИФ — 599 руб/мес
🥇 ПРЕМИУМ ТАРИФ — 999 руб/мес

💰 Оформить подписку: /subscribe`,

  no_subscription: `😔 You dont have active subscription!!! Make subscription to get access to this function!!! /subscribe 💎`,

  payment_success: `✅🎉🎉🎉 Payment was successful!!! Thank you for buying subscription!!! 🚀`,

  payment_error: `❌ Error when processing payment!!! Please try again or contact support /support 😔`,

  settings_saved: `✅ Settings successfully saved!!! ⚙️`,

  language_changed: `✅ Language successfully changed!!! 🌍`,

  unknown_command: `❓ Unknown command!!! Enter /help to see list of all available commands!!! 📚`,

  maintenance: `🔧🔧🔧 Бот находится на техническом обслуживании!!! Мы улучшаем наши нейросети!!! Пожалуйста подождите!!! 🙏`,

  rate_limit: `⏰ You are sending requests too often!!! Please wait a little and try again!!! 🙏`,

  bot_restarted: `🔄 Bot was restarted!!! All your settings are saved do not worry!!! 😊`,
};

// Export English localization for use via the translator module
module.exports = englishTexts;
