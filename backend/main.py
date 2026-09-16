import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from config import WEBAPP_URL
from database import init_db, get_products, create_order, get_order
from telegram_auth import validate_init_data
from bot import bot, notify_admin_about_order

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s · %(levelname)s · %(message)s",
)
log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    log.info("✅ База данных готова")
    yield
    await bot.session.close()
    log.info("Бот остановлен")


app = FastAPI(title="Coffee Mini App API", lifespan=lifespan)

# CORS — чтобы фронтенд с localhost и ngrok мог обращаться к API.
# ВАЖНО: allow_credentials=False, иначе при allow_origins=["*"]
# браузер не получит CORS-заголовки.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# --- МОДЕЛИ ---

class OrderItem(BaseModel):
    id: int
    quantity: int = Field(ge=1, le=20)


class CreateOrderRequest(BaseModel):
    init_data: str
    phone: str = Field(min_length=5, max_length=30)
    items: list[OrderItem] = Field(min_length=1)


# --- ЭНДПОИНТЫ API ---

@app.get("/")
async def root():
    return {"status": "ok", "service": "Coffee Mini App API"}


@app.get("/api/products")
async def api_products(category: str | None = None):
    """Возвращает список товаров (можно фильтровать по категории)."""
    return get_products(category)


@app.post("/api/order")
async def api_create_order(payload: CreateOrderRequest):
    """Создаёт заказ. Проверяет подпись Telegram."""
    user = validate_init_data(payload.init_data)
    if not user:
        raise HTTPException(status_code=401, detail="Неверные данные Telegram")

    # Достаём товары из БД, чтобы не доверять ценам с фронта
    all_products = {p["id"]: p for p in get_products()}
    items_for_order = []
    for item in payload.items:
        product = all_products.get(item.id)
        if not product:
            raise HTTPException(status_code=400, detail=f"Товар {item.id} не найден")
        items_for_order.append({
            "id": product["id"],
            "name": product["name"],
            "price": product["price"],
            "quantity": item.quantity,
        })

    full_name = f"{user['first_name']} {user['last_name']}".strip() or "Без имени"

    order_id = create_order(
        user_id=user["user_id"],
        username=user["username"],
        full_name=full_name,
        phone=payload.phone,
        items=items_for_order,
    )

    order = get_order(order_id)
    await notify_admin_about_order(order)

    return {
        "ok": True,
        "order_id": order_id,
        "total": order["total"],
    }


@app.get("/api/order/{order_id}")
async def api_get_order(order_id: int):
    order = get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Заказ не найден")
    return order


@app.get("/api/config")
async def api_config():
    """Фронтенд может узнать настройки при загрузке."""
    return {"webapp_url": WEBAPP_URL}


# --- СТАТИКА ---

BACKEND_DIR = Path(__file__).parent
DIST_DIR = BACKEND_DIR / "dist"          # собранный React
STATIC_DIR = BACKEND_DIR / "static"      # тестовая HTML-страница


# Раздача статики React: JS, CSS
if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")


# Тестовая страница (старая), открывается на /test
@app.get("/test")
async def serve_test_page():
    if not (STATIC_DIR / "index.html").exists():
        raise HTTPException(status_code=404, detail="Тестовая страница не найдена")
    return FileResponse(STATIC_DIR / "index.html")


# React Mini App на /app
@app.get("/app")
@app.get("/app/{path:path}")
async def serve_webapp(path: str = ""):
    index_file = DIST_DIR / "index.html"
    if not index_file.exists():
        raise HTTPException(status_code=500, detail="Frontend не собран")
    return FileResponse(index_file)