import json
import asyncio
import traceback
from tg_worker import handle_command
async def main():
    try:
        await handle_command({"action": "request_code", "phone": "917385533016", "session_string": ""})
    except Exception as e:
        traceback.print_exc()
asyncio.run(main())
