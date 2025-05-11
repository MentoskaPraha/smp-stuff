# SMP Stuff

This is code for a few utilities for my private SMP. It's comprised of 2 parts: the Discord bot and the Minecraft mod. The Discord bot has several useful commands that interface with the game via RCON. The Minecraft mod links to the Discord bot via websocket and passes the chat through, which the Discord bot then outputs into a channel, it also takes all the messages of other users from the channel and passes it back to the server, via the websocket, to be outputted in the chat.

# Discord Bot Stuff

This bot only works in one guild (Discord Server), if it is in multiple, it will break!

Example env variables. All are required, except DEV.
```env
DISCORD_TOKEN=YOUR_TOKEN_GOES_HERE
DISCORD_CLIENT_ID=YOUR_CLIENT_ID_GOES_HERE
DISCORD_GUILD_ID=YOUR_GUILD_ID_GOES_HERE
DISCORD_ADMIN_USER_ID=YOUR_USER_ID_GOES_HERE
DEV=false
```
