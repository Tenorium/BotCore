import AbstractModule from '#abstractModule';
import axios from 'axios';

function HEXToVBColor (rrggbb) {
  const bbggrr = rrggbb.substr(4, 2) + rrggbb.substr(2, 2) + rrggbb.substr(0, 2);
  return parseInt(bbggrr, 16);
}

export default class DiscordNotify extends AbstractModule {
  load () {
  }

  unload () {
  }

  send (text, color) {
    const URL = 'https://discord.com/api/webhooks/1088580587725537382/LvHPbvd5CZfBuOGTK5c-9xXsbbZgPLySjxAf-GoqvX-5gaqOJ67eKFXhVrLFx6XDkAuW';
    axios.post(URL, JSON.stringify({
      embeds: [
        {
          description: `${app().getClient().username}: ${text}`,
          color: HEXToVBColor(color),
          timestamp: new Date().toISOString()
        }
      ]
    }),
    {
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
