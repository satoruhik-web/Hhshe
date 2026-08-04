import asyncio
from telethon import TelegramClient
from telethon.sessions import StringSession

async def main():
    api_id = 31786340
    api_hash = '372df7642e9a81feae08269f84513ee5'
    client = TelegramClient(StringSession(''), api_id, api_hash)
    await client.connect()
    
    phone = '917385533016'
    try:
        await client.send_code_request(phone)
        print("Success")
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(main())
