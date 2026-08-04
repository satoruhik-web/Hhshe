from telethon import TelegramClient
from telethon.sessions import StringSession
client = TelegramClient(StringSession(''), 31786340, "372df7642e9a81feae08269f84513ee5")
print("api_id =", type(client.api_id), client.api_id)
print("api_hash =", type(client.api_hash), client.api_hash)
