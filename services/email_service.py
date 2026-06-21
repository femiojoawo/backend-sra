from pathlib import Path

from fastapi_mail import ConnectionConfig, MessageSchema, FastMail

from core.config import config

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"

conf = ConnectionConfig(
    MAIL_USERNAME=config.mail_username,
    MAIL_PASSWORD=config.mail_password,
    MAIL_FROM=config.mail_username,
    MAIL_PORT=config.mail_port,
    MAIL_SERVER=config.mail_server,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    TEMPLATE_FOLDER=TEMPLATES_DIR,
)


async def send_reservation_email(
    email: str,
    reservation_details: dict,
    message_title: str,
    template_name: str,
):
    message = MessageSchema(
        subject=message_title,
        recipients=[email,"ndachrisbony@gmail.com"],
        subtype="html",
        template_body=reservation_details,
    )
    fm = FastMail(conf)
    await fm.send_message(message, template_name=template_name)
