const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { withLock } = require('../utils/mutex');

const subscriptionsFile = path.join(__dirname, '..', 'data', 'newsletter-subscribers.json');

const readSubscriptions = async () => {
  try {
    const content = await fs.readFile(subscriptionsFile, 'utf8');
    const subscriptions = JSON.parse(content.replace(/^\uFEFF/, ''));
    if (!Array.isArray(subscriptions)) throw new Error('newsletter-subscribers.json phải chứa một mảng JSON.');
    return subscriptions;
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
};

const writeSubscriptions = async (subscriptions) => {
  const tempFile = path.join(path.dirname(subscriptionsFile), `.newsletter-${crypto.randomUUID()}.tmp`);
  try {
    await fs.writeFile(tempFile, `${JSON.stringify(subscriptions, null, 2)}\n`, 'utf8');
    await fs.rename(tempFile, subscriptionsFile);
  } catch (error) {
    await fs.unlink(tempFile).catch(() => {});
    throw error;
  }
};

const sendError = (res, error, fallback) => {
  if (Number.isInteger(error.status) && error.status < 500) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  console.error(fallback, error.message);
  return res.status(500).json({ success: false, message: fallback });
};

const subscribe = async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập email hợp lệ.' });
  }

  try {
    const result = await withLock(async () => {
      const subscriptions = await readSubscriptions();
      const existing = subscriptions.find((item) => item.email === email);
      if (existing?.active) {
        return { status: 409, message: 'Email này đã đăng ký nhận bản tin.' };
      }

      const now = new Date().toISOString();
      if (existing) {
        existing.active = true;
        existing.token = crypto.randomBytes(32).toString('hex');
        existing.subscribedAt = now;
        delete existing.unsubscribedAt;
        await writeSubscriptions(subscriptions);
        return { status: 200, data: { email, subscribed: true } };
      }

      subscriptions.push({
        id: crypto.randomUUID(),
        email,
        token: crypto.randomBytes(32).toString('hex'),
        active: true,
        subscribedAt: now
      });
      await writeSubscriptions(subscriptions);
      return { status: 201, data: { email, subscribed: true } };
    });

    if (result.message) {
      return res.status(result.status).json({ success: false, message: result.message });
    }
    return res.status(result.status).json({ success: true, data: result.data });
  } catch (error) {
    return sendError(res, error, 'Không thể lưu đăng ký nhận bản tin.');
  }
};

const unsubscribe = async (req, res) => {
  try {
    const result = await withLock(async () => {
      const subscriptions = await readSubscriptions();
      const subscription = subscriptions.find((item) => item.token === req.params.token);
      if (!subscription) return { status: 404, message: 'Liên kết hủy đăng ký không hợp lệ hoặc đã hết hạn.' };
      if (!subscription.active) return { status: 200, data: { email: subscription.email, subscribed: false } };

      subscription.active = false;
      subscription.unsubscribedAt = new Date().toISOString();
      await writeSubscriptions(subscriptions);
      return { status: 200, data: { email: subscription.email, subscribed: false } };
    });

    if (result.message) {
      return res.status(result.status).json({ success: false, message: result.message });
    }
    return res.status(result.status).json({ success: true, data: result.data });
  } catch (error) {
    return sendError(res, error, 'Không thể hủy đăng ký nhận bản tin.');
  }
};

module.exports = { subscribe, unsubscribe };
