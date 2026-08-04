import traceback
import asyncio
from telethon import TelegramClient
from telethon.sessions import StringSession

async def run():
    client = TelegramClient(StringSession(''), 31786340, '372df7642e9a81feae08269f84513ee5')
    await client.connect()
    try:
        await client.send_code_request('917385533016')
    except Exception as e:
        traceback.print_exc()

asyncio.run(run())
