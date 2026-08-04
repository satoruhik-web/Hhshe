import json
import asyncio
from tg_worker import handle_command
async def main():
    await handle_command({"action": "request_code", "phone": "917385533016", "session_string": ""})
asyncio.run(main())
