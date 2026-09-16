"""
Валидация initData от Telegram WebApp.
Документация: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
"""
import hmac
import hashlib
import json
from urllib.parse import parse_qsl

from config import BOT_TOKEN


def validate_init_data(init_data: str) -> dict | None:
    """
    Проверяет подпись initData и возвращает данные пользователя.
    Если подпись неверна — возвращает None.
    """
    # --- ОТЛАДКА ---
    print(f"DEBUG: initData длина = {len(init_data) if init_data else 0}")
    print(f"DEBUG: initData первые 120 символов = {init_data[:120] if init_data else '(пусто)'}")
    print(f"DEBUG: BOT_TOKEN первые 15 символов = {BOT_TOKEN[:15]}")
    # --- /ОТЛАДКА ---

    if not init_data:
        return None

    try:
        parsed = dict(parse_qsl(init_data, strict_parsing=True))
    except ValueError as e:
        print(f"DEBUG: parse_qsl error: {e}")
        return None

    received_hash = parsed.pop("hash", None)
    print(f"DEBUG: hash из initData = {received_hash[:16] if received_hash else '(нет)'}...")

    if not received_hash:
        return None

    # Собираем data_check_string: все поля кроме hash, отсортированные по алфавиту
    data_check_string = "\n".join(
        f"{k}={v}" for k, v in sorted(parsed.items())
    )

    # secret_key = HMAC_SHA256("WebAppData", BOT_TOKEN)
    secret_key = hmac.new(
        b"WebAppData",
        BOT_TOKEN.encode(),
        hashlib.sha256,
    ).digest()

    # signature = HMAC_SHA256(secret_key, data_check_string)
    calculated_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256,
    ).hexdigest()

    print(f"DEBUG: рассчитанный hash = {calculated_hash[:16]}...")
    print(f"DEBUG: совпадает = {hmac.compare_digest(calculated_hash, received_hash)}")

    if not hmac.compare_digest(calculated_hash, received_hash):
        return None

    # Парсим user
    user_raw = parsed.get("user")
    if not user_raw:
        return None

    try:
        user = json.loads(user_raw)
    except json.JSONDecodeError:
        return None

    return {
        "user_id": user.get("id"),
        "username": user.get("username"),
        "first_name": user.get("first_name", ""),
        "last_name": user.get("last_name", ""),
        "language_code": user.get("language_code"),
    }