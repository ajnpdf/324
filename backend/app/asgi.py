from .main import app
from .billing_routes import router as billing_router
from .billing_history_routes import router as billing_history_router

app.include_router(billing_router)
app.include_router(billing_history_router)
