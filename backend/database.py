import sqlite3
from datetime import datetime
from pathlib import Path
from config import DB_PATH


def init_db():
    """Создаёт таблицы, если их ещё нет."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.executescript("""
        CREATE TABLE IF NOT EXISTS products (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT NOT NULL,
            description TEXT,
            price       INTEGER NOT NULL,
            category    TEXT NOT NULL,
            emoji       TEXT DEFAULT '☕'
        );

        CREATE TABLE IF NOT EXISTS orders (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id      INTEGER NOT NULL,
            username     TEXT,
            full_name    TEXT,
            phone        TEXT NOT NULL,
            total        INTEGER NOT NULL,
            status       TEXT DEFAULT 'new',
            created_at   TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS order_items (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id    INTEGER NOT NULL,
            product_id  INTEGER NOT NULL,
            name        TEXT NOT NULL,
            price       INTEGER NOT NULL,
            quantity    INTEGER NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id)
        );
    """)

    # Заполняем меню, если таблица пустая
    cur.execute("SELECT COUNT(*) FROM products")
    if cur.fetchone()[0] == 0:
        cur.executemany(
            "INSERT INTO products (name, description, price, category, emoji) VALUES (?, ?, ?, ?, ?)",
            [
                ("Эспрессо", "Классический, 30 мл", 150, "coffee", "☕"),
                ("Американо", "Эспрессо с водой, 200 мл", 180, "coffee", "☕"),
                ("Капучино", "Эспрессо + молоко, 250 мл", 220, "coffee", "🥛"),
                ("Латте", "Мягкий, с молоком, 300 мл", 240, "coffee", "🥛"),
                ("Раф", "Сливки, ваниль, 300 мл", 280, "coffee", "🍦"),
                ("Круассан", "Свежий, с маслом", 150, "dessert", "🥐"),
                ("Чизкейк", "Нью-Йорк, 120 г", 250, "dessert", "🍰"),
                ("Маффин", "Шоколадный, 100 г", 180, "dessert", "🧁"),
            ],
        )

    conn.commit()
    conn.close()


def get_products(category: str | None = None) -> list[dict]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    if category:
        cur.execute("SELECT * FROM products WHERE category = ?", (category,))
    else:
        cur.execute("SELECT * FROM products")

    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


def create_order(
    user_id: int,
    username: str | None,
    full_name: str,
    phone: str,
    items: list[dict],
) -> int:
    """Создаёт заказ + позиции. Возвращает ID заказа."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    total = sum(item["price"] * item["quantity"] for item in items)

    cur.execute(
        """INSERT INTO orders (user_id, username, full_name, phone, total, created_at)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (
            user_id,
            username,
            full_name,
            phone,
            total,
            datetime.now().isoformat(timespec="seconds"),
        ),
    )
    order_id = cur.lastrowid

    for item in items:
        cur.execute(
            """INSERT INTO order_items (order_id, product_id, name, price, quantity)
               VALUES (?, ?, ?, ?, ?)""",
            (order_id, item["id"], item["name"], item["price"], item["quantity"]),
        )

    conn.commit()
    conn.close()
    return order_id


def get_order(order_id: int) -> dict | None:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("SELECT * FROM orders WHERE id = ?", (order_id,))
    order = cur.fetchone()
    if not order:
        conn.close()
        return None

    cur.execute("SELECT * FROM order_items WHERE order_id = ?", (order_id,))
    items = [dict(r) for r in cur.fetchall()]

    result = dict(order)
    result["items"] = items
    conn.close()
    return result