from app.database.session import Base, engine
from app.models import learning_item, progress, reminder, roadmap, user  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
