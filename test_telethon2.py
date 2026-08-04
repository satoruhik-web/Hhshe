import asyncio
from telethon import TelegramClient
from telethon.sessions import StringSession

API_ID = 31786340
API_HASH = '372df7642e9a81feae08269f84513ee5'

async def main():
    try:
        client = TelegramClient(StringSession(""), API_ID, API_HASH)
        await client.connect()
        print("Connected")
        result = await client.send_code_request("917385533016")
        print("Requested")
    except Exception as e:
        print(f"Error 1: {type(e).__name__}: {str(e)}")

asyncio.run(main())
