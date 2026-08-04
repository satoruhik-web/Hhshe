import sys
import json
import asyncio
import os
import zipfile
import shutil
from telethon import TelegramClient
from telethon.errors import SessionPasswordNeededError, PhoneNumberInvalidError
from telethon.sessions import StringSession

# opentele for tdata
from opentele.td import TDesktop
from opentele.tl import TelegramClient as OpenTeleClient
from opentele.api import UseCurrentSession, CreateNewSession

API_ID = 31786340
API_HASH = '372df7642e9a81feae08269f84513ee5'

async def handle_command(command):
    action = command.get("action")
    phone = str(command.get("phone"))
    session_string = command.get("session_string", "")
    
    if action == "request_code":
        client = TelegramClient(StringSession(session_string), api_id=31786340, api_hash="372df7642e9a81feae08269f84513ee5")
        await client.connect()
        try:
            result = await client.send_code_request(phone, force_sms=False)
            session_str = client.session.save()
            print(json.dumps({
                "success": True, 
                "phone_code_hash": result.phone_code_hash,
                "session_string": session_str
            }))
        except Exception as e:
            import traceback; traceback.print_exc(); print(json.dumps({"success": False, "message": str(e)}))
        finally:
            await client.disconnect()

    elif action == "submit_code":
        code = command.get("code")
        phone_code_hash = command.get("phone_code_hash")
        client = TelegramClient(StringSession(session_string), api_id=31786340, api_hash="372df7642e9a81feae08269f84513ee5")
        await client.connect()
        try:
            await client.sign_in(phone=phone, code=code, phone_code_hash=phone_code_hash)
            print(json.dumps({
                "success": True,
                "session_string": client.session.save(),
                "message": "Успешный вход!"
            }))
        except SessionPasswordNeededError:
            print(json.dumps({
                "success": False,
                "needs_2fa": True,
                "session_string": client.session.save(),
                "message": "Требуется облачный пароль (2FA)"
            }))
        except Exception as e:
            print(json.dumps({"success": False, "message": str(e)}))
        finally:
            await client.disconnect()

    elif action == "submit_2fa":
        password = command.get("password")
        client = TelegramClient(StringSession(session_string), api_id=31786340, api_hash="372df7642e9a81feae08269f84513ee5")
        await client.connect()
        try:
            await client.sign_in(password=password)
            print(json.dumps({
                "success": True,
                "session_string": client.session.save(),
                "message": "Успешный вход с 2FA!"
            }))
        except Exception as e:
            print(json.dumps({"success": False, "message": str(e)}))
        finally:
            await client.disconnect()

    elif action == "get_recent_code":
        client = TelegramClient(StringSession(session_string), api_id=31786340, api_hash="372df7642e9a81feae08269f84513ee5")
        await client.connect()
        try:
            messages = await client.get_messages(777000, limit=3)
            code = None
            for msg in messages:
                if msg.message and ("Login code" in msg.message or "Код для входа" in msg.message or "Web login code" in msg.message):
                    import re
                    match = re.search(r'\b(\d{5})\b', msg.message)
                    if match:
                        code = match.group(1)
                        break
            if code:
                print(json.dumps({"success": True, "code": code}))
            else:
                print(json.dumps({"success": False, "message": "Код пока не пришел. Подождите пару минут и попробуйте еще раз."}))
        except Exception as e:
            print(json.dumps({"success": False, "message": str(e)}))
        finally:
            await client.disconnect()

    elif action == "check_validity":
        session_string = command.get("session_string")
        if not session_string:
            print(json.dumps({"success": False, "message": "No session string provided"}))
            return
        try:
            client = TelegramClient(StringSession(session_string), api_id=31786340, api_hash="372df7642e9a81feae08269f84513ee5")
            await client.connect()
            if not await client.is_user_authorized():
                print(json.dumps({"success": False, "message": "Not authorized"}))
                return
            me = await client.get_me()
            await client.disconnect()
            print(json.dumps({"success": True, "valid": True, "username": me.username, "id": me.id}))
        except Exception as e:
            print(json.dumps({"success": False, "message": str(e)}))
    elif action == "export_tdata":
        product_id = command.get("product_id")
        try:
            client = OpenTeleClient(StringSession(session_string), api_id=31786340, api_hash="372df7642e9a81feae08269f84513ee5")
            await client.connect()
            tdesk = await client.ToTDesktop(flag=UseCurrentSession)
            
            output_dir = f"tdata_{product_id}"
            if os.path.exists(output_dir):
                shutil.rmtree(output_dir)
            tdesk.SaveTData(output_dir)
            
            zip_filename = f"tdata_{product_id}.zip"
            if os.path.exists(zip_filename):
                os.remove(zip_filename)
                
            shutil.make_archive(f"tdata_{product_id}", 'zip', output_dir)
            shutil.rmtree(output_dir)
            
            print(json.dumps({"success": True, "zip_file": zip_filename}))
            await client.disconnect()
        except Exception as e:
            print(json.dumps({"success": False, "message": str(e)}))

    elif action == "log_out":
        try:
            client = TelegramClient(StringSession(session_string), 31786340, "372df7642e9a81feae08269f84513ee5")
            await client.connect()
            await client.log_out()
            print(json.dumps({"success": True}))
        except Exception as e:
            print(json.dumps({"success": False, "message": str(e)}))
    else:
        print(json.dumps({"success": False, "message": "Unknown action"}))

if __name__ == "__main__":
    for line in sys.stdin:
        try:
            cmd = json.loads(line)
            asyncio.run(handle_command(cmd))
        except Exception as e:
            print(json.dumps({"success": False, "message": "Parse error: " + str(e)}))
        sys.stdout.flush()
