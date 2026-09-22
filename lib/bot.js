import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(async (ctx) => {
  await ctx.reply(
    `Halo ${ctx.from.first_name}! 👋

Bot berhasil berjalan di Vercel.
Ketik /help untuk melihat menu.`,
  );
});

bot.command("help", async (ctx) => {
  await ctx.reply(`
Perintah tersedia:

/start
/help
/ping
`);
});

bot.command("ping", async (ctx) => {
  await ctx.reply("🏓 Pong");
});

export default bot;
