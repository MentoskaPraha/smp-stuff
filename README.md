# SMP Stuff

This is code for a few utilities for my private SMP. It's comprised of 2 parts: the Discord bot and the Minecraft mod. The Discord bot has several useful commands that interface with the game via RCON. The Minecraft mod links to the Discord bot via websocket and passes the chat through, which the Discord bot then outputs into a channel, it also takes all the messages of other users from the channel and passes it back to the server, via the websocket, to be outputted in the chat.

# Discord Bot Stuff

This bot only works in one guild (Discord Server), if it's in multiple it shouldn't break, but it won't do anything. The bot is configured via environment variables.

Example ENV variables. All are required, except `DEBUG` and `DATA_DIR`. It's important to set `DATA_DIR` in a development environment or application data will be stored in the `/data` directory.
```env
DEV=false
DEBUG=false
DATA_DIR="/data"
DISCORD_ADMIN_ID="YOUR-DISCORD-ID-HERE"
DISCORD_GUILD_ID="DISCORD-SERVER-ID-HERE"
DISCORD_TOKEN="DISCORD-BOT-TOKEN-HERE"
```

# To-Do

- [ ] Discord Bot Feature
  - [X] Whitelisting
  - [X] Color
  - [X] Basic Settings
  - [ ] Automatic mod suggestion
    - [X] Filters for valid links only
    - [X] Automatic reactions added for polling
    - [X] Duplicate detection
    - [ ] Bot made starter message
    - [ ] Add automatic thread management
  - [ ] Chat link
    - [ ] Pass user messages
    - [ ] Pass replies
    - [ ] Pass pings
    - [ ] Don't pass system messages
  - [ ] Activity Ping
    - [ ] Update number of players on leave and join
    - [ ] Send DM to user when X amount of players is online
    - [ ] Add cooldown
  - [ ] Status
    - [ ] Auto-update every 15 minutes
    - [ ] Online players in status
    - [ ] Bot Status
      - [ ] Discord WS Ping
      - [ ] Uptime
    - [ ] Server Status
      - [ ] Bot WS Ping
      - [ ] TPS for the last 15 minutes
      - [ ] Uptime
  - [ ] Clean up when user leaves the server
- [ ] Minecraft Mod Stuff
  - [ ] WS to Discord Bot
    - [ ] Chat link
      - [ ] Pass player messages
      - [ ] Pass system messages (deaths, player join/leave, etc.)
      - [ ] Command to pin last messages in Discord
    - [ ] Name color link
    - [ ] Pass status to Discord
    - [ ] Whitelisting
  - [ ] Performance Monitoring
  - [ ] Grey out name of idle players

# Excel to Packwiz Script

This script was used to convert an excel sheet to a packwiz pack. I made it with AI be mad about, I don't care. I don't write in python and I needed it for this one thing only and this was the easiest solution.
