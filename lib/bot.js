import { Telegraf, Markup } from "telegraf";
import {
  getJakartaDate,
  getOnDuty,
  getShift,
  getShiftLabel,
} from "./reminder.js";
import { getJSON, setJSON } from "./store.js";
import { logEvent } from "./sheets.js";

const bot = new Telegraf(process.env.BOT_TOKEN);

function shiftStatusText() {
  const now = getJakartaDate();
  const shift = getShift(now);

  if (!shift) {
    return "Lagi di luar jam shift (shift aktif: 08:00-20:00).";
  }

  const onDuty = getOnDuty(now);
  const label = getShiftLabel(shift);

  if (onDuty === "myluv") {
    return `Shift sekarang (${label}): giliran ayangku 💖.`;
  }
  if (onDuty === "someone") {
    return `Shift sekarang (${label}): bukan ayangku.`;
  }
  return `Shift sekarang (${label}): belum ada jadwal.`;
}

const startMenu = Markup.inlineKeyboard([
  Markup.button.callback("Cek shift sekarang", "check_shift"),
]);

bot.start(async (ctx) => {
  await logEvent("command", "/start", ctx.chat.id);
  await ctx.reply(
    `Hai sayangg 🥰.\nKetik /help untuk melihat menu.`,
    startMenu,
  );
});

bot.command("help", async (ctx) => {
  await logEvent("command", "/help", ctx.chat.id);
  await ctx.reply(`
Perintah tersedia:

/start
/help
/ping
/shift
`);
});

bot.command("ping", async (ctx) => {
  await logEvent("command", "/ping", ctx.chat.id);
  await ctx.reply("🏓 Pong");
});

bot.command("shift", async (ctx) => {
  await logEvent("command", "/shift", ctx.chat.id);
  await ctx.reply(shiftStatusText());
});

bot.action("check_shift", async (ctx) => {
  await ctx.answerCbQuery();
  await logEvent("command", "check_shift button", ctx.chat.id);
  await ctx.reply(shiftStatusText());
});

// Fired when myluv or me taps the confirm button on a reminder.
bot.action(/^confirm:(.+)$/, async (ctx) => {
  const shiftKey = ctx.match[1];
  const key = `reminder:${shiftKey}`;

  const state = (await getJSON(key)) || {};
  state.confirmed = true;
  await setJSON(key, state);
  await logEvent("reminder_confirmed", `shift ${shiftKey}`, ctx.chat.id);

  await ctx.answerCbQuery(
    "Sipp, makaciw udah konfirmasi sayangg, met bales DM semoga lancar 😘",
  );
  try {
    await ctx.editMessageReplyMarkup(undefined);
    await ctx.editMessageText(
      `${ctx.callbackQuery.message.text}\n\nDikonfirmasi ✅`,
    );
  } catch {
    // ignore if message can't be edited (e.g. too old)
  }
});

export default bot;
