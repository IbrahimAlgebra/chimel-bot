import bot from "../lib/bot.js";
import { getJakartaDate, getOnDuty, getShiftKey } from "../lib/reminder.js";
import { getJSON, setJSON } from "../lib/store.js";
import { logEvent } from "../lib/sheets.js";

const ONE_HOUR_MS = 60 * 60 * 1000;

function reminderKeyboard(shiftKey) {
  return {
    inline_keyboard: [
      [{ text: "Okayy sayangg", callback_data: `confirm:${shiftKey}` }],
    ],
  };
}

async function broadcast(text, keyboard) {
  const chatIds = [process.env.MYLUV_CHAT_ID, process.env.ME_CHAT_ID].filter(
    Boolean,
  );
  await Promise.all(
    chatIds.map((chatId) =>
      bot.telegram.sendMessage(chatId, text, { reply_markup: keyboard }),
    ),
  );
}

export default async function handler(req, res) {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }

  const now = getJakartaDate();
  const onDuty = getOnDuty(now);

  if (onDuty !== "myluv") {
    return res.status(200).json({ status: "ok", note: "not myluv's shift" });
  }

  const shiftKey = getShiftKey(now);
  const stateKey = `reminder:${shiftKey}`;
  const state = await getJSON(stateKey);

  if (!state) {
    await broadcast(
      "Waktunya shift sayangg.. Jangan lupa balas DM yaa 😘",
      reminderKeyboard(shiftKey),
    );
    await setJSON(stateKey, {
      sentAt: now.getTime(),
      confirmed: false,
      remindedAgain: false,
    });
    await logEvent("reminder_sent", `shift ${shiftKey}`);
    return res.status(200).json({ status: "ok", action: "sent_initial" });
  }

  if (
    !state.confirmed &&
    !state.remindedAgain &&
    now.getTime() - state.sentAt >= ONE_HOUR_MS
  ) {
    await broadcast(
      "Reminder lagi nih, chatku ga dibales, huaaaaa 😭",
      reminderKeyboard(shiftKey),
    );
    state.remindedAgain = true;
    await setJSON(stateKey, state);
    await logEvent("reminder_followup", `shift ${shiftKey}`);
    return res.status(200).json({ status: "ok", action: "sent_followup" });
  }

  return res.status(200).json({ status: "ok", action: "no_op" });
}
