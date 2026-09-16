import logging

from aiogram import Bot
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from config import BOT_TOKEN, ADMIN_ID

log = logging.getLogger(__name__)

bot = Bot(
    token=BOT_TOKEN,
    default=DefaultBotProperties(parse_mode=ParseMode.HTML),
)


async def notify_admin_about_order(order: dict):
    """Отправляет админу уведомление о новом заказе."""
    if not ADMIN_ID:
        log.warning("ADMIN_ID не задан — уведомление не отправлено")
        return

    lines = [
        f"🔔 <b>Новый заказ №{order['id']}</b>\n",
        f"👤 {order['full_name']} (@{order['username'] or '—'})",
        f"📞 {order['phone']}\n",
        "<b>Состав заказа:</b>",
    ]
    for item in order["items"]:
        lines.append(f"• {item['name']} × {item['quantity']} = {item['price'] * item['quantity']} ₽")

    lines.append(f"\n💰 <b>Итого: {order['total']} ₽</b>")

    try:
        await bot.send_message(ADMIN_ID, "\n".join(lines))
    except Exception as e:
        log.error(f"Не удалось уведомить админа: {e}")