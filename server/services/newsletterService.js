const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const cron = require('node-cron');
const nodemailer = require('nodemailer');

const dataDirectory = path.join(__dirname, '..', 'data');
const recipesFile = path.join(dataDirectory, 'recipes.json');
const subscriptionsFile = path.join(dataDirectory, 'newsletter-subscribers.json');

const readArray = async (filePath, fileName, missingIsEmpty = false) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const value = JSON.parse(content.replace(/^\uFEFF/, ''));
    if (!Array.isArray(value)) throw new Error(`${fileName} phải chứa một mảng JSON.`);
    return value;
  } catch (error) {
    if (missingIsEmpty && error.code === 'ENOENT') return [];
    throw error;
  }
};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

const getMailConfig = (env) => {
  const host = env.NEWSLETTER_SMTP_HOST?.trim();
  const from = env.NEWSLETTER_FROM?.trim();
  const port = Number(env.NEWSLETTER_SMTP_PORT || 587);
  const user = env.NEWSLETTER_SMTP_USER?.trim();
  const pass = env.NEWSLETTER_SMTP_PASS;
  if (!host || !from) return null;
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('NEWSLETTER_SMTP_PORT không hợp lệ.');
  if (Boolean(user) !== Boolean(pass)) throw new Error('NEWSLETTER_SMTP_USER và NEWSLETTER_SMTP_PASS phải được đặt cùng nhau.');
  return {
    from,
    transport: {
      host,
      port,
      secure: env.NEWSLETTER_SMTP_SECURE === undefined ? port === 465 : env.NEWSLETTER_SMTP_SECURE.toLowerCase() === 'true',
      ...(user ? { auth: { user, pass } } : {})
    }
  };
};

const renderEmail = (recipe, subscription, env) => {
  const clientBase = (env.NEWSLETTER_CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
  const serverBase = (env.NEWSLETTER_SERVER_URL || 'http://localhost:5000').replace(/\/$/, '');
  const recipeUrl = `${clientBase}/recipe/${encodeURIComponent(recipe.id)}`;
  const unsubscribeUrl = `${serverBase}/api/newsletter/unsubscribe/${encodeURIComponent(subscription.token)}`;
  const image = typeof recipe.image === 'string' ? recipe.image.trim() : '';
  const imageUrl = /^https?:\/\//i.test(image)
    ? image
    : image.startsWith('/') ? `${serverBase}${image}` : '';
  const title = escapeHtml(recipe.title || 'Món ngon hôm nay');
  const subjectTitle = String(recipe.title || 'Công thức mới').replace(/[\r\n]+/g, ' ').slice(0, 150);
  const description = escapeHtml(String(recipe.description || 'Một công thức ngon đang chờ bạn thử.').slice(0, 1200));
  const imageHtml = imageUrl ? `<p><img src="${escapeHtml(imageUrl)}" alt="${title}" style="max-width:100%;height:auto"></p>` : '';

  return {
    to: subscription.email,
    subject: `Món ngon hôm nay: ${subjectTitle}`,
    text: `Xin chào!\n\nHôm nay Cooked gợi ý: ${recipe.title || 'Món ngon'}\n\n${recipe.description || 'Một công thức ngon đang chờ bạn thử.'}\n\nXem công thức: ${recipeUrl}\n\nHủy nhận bản tin: ${unsubscribeUrl}`,
    html: `<main style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#25352d"><p>Xin chào!</p><h1>${title}</h1><p>${description}</p>${imageHtml}<p><a href="${escapeHtml(recipeUrl)}">Xem công thức</a></p><hr><p style="font-size:12px;color:#666">Bạn nhận email này vì đã đăng ký bản tin Cooked. <a href="${escapeHtml(unsubscribeUrl)}">Hủy đăng ký</a>.</p></main>`
  };
};

const sendScheduledNewsletter = async ({ env = process.env, transportFactory = nodemailer.createTransport } = {}) => {
  const mailConfig = getMailConfig(env);
  if (!mailConfig) return { skipped: true, reason: 'SMTP is not configured.' };

  const [recipes, subscriptions] = await Promise.all([
    readArray(recipesFile, 'recipes.json'),
    readArray(subscriptionsFile, 'newsletter-subscribers.json', true)
  ]);
  const approved = recipes.filter((recipe) => recipe.status === 'approved');
  const activeSubscribers = subscriptions.filter((item) => item.active === true && item.email && item.token);
  if (!approved.length || !activeSubscribers.length) {
    return { skipped: true, reason: !approved.length ? 'No approved recipes.' : 'No active subscribers.' };
  }

  const recipe = approved[crypto.randomInt(approved.length)];
  const transporter = transportFactory(mailConfig.transport);
  let sent = 0;
  let failed = 0;
  try {
    for (const subscription of activeSubscribers) {
      try {
        await transporter.sendMail({ from: mailConfig.from, ...renderEmail(recipe, subscription, env) });
        sent += 1;
      } catch (error) {
        failed += 1;
        console.error('Newsletter delivery failed:', error.message);
      }
    }
  } finally {
    transporter.close?.();
  }
  return { sent, failed, recipeId: recipe.id };
};

const startNewsletterScheduler = () => {
  let mailConfig;
  try {
    mailConfig = getMailConfig(process.env);
  } catch (error) {
    console.error('Newsletter schedule disabled:', error.message);
    return null;
  }
  if (!mailConfig) {
    console.info('Newsletter schedule disabled: configure SMTP in server/.env.');
    return null;
  }

  const expression = process.env.NEWSLETTER_CRON || '0 9 * * *';
  const timezone = process.env.NEWSLETTER_TIMEZONE || 'Asia/Ho_Chi_Minh';
  if (!cron.validate(expression)) {
    console.error('Newsletter schedule disabled: NEWSLETTER_CRON is invalid.');
    return null;
  }

  try {
    const task = cron.schedule(expression, async () => {
      try {
        const result = await sendScheduledNewsletter();
        console.info('Newsletter run completed:', result);
      } catch (error) {
        console.error('Newsletter run failed:', error.message);
      }
    }, { timezone, noOverlap: true });
    console.info(`Newsletter schedule enabled (${expression}, ${timezone}).`);
    return task;
  } catch (error) {
    console.error('Newsletter schedule disabled:', error.message);
    return null;
  }
};

module.exports = { renderEmail, sendScheduledNewsletter, startNewsletterScheduler };
