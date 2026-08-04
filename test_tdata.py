import asyncio
from telethon import TelegramClient
from telethon.sessions import StringSession
try:
    from opentele.td import TDesktop
    from opentele.tl import TelegramClient as OpenTeleClient
    from opentele.api import UseCurrentSession
    print("opentele available")
except ImportError:
    print("opentele not available")
