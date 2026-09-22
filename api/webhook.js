import bot from "../lib/bot.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({
      status: "ok",
    });
  }

  try {
    await bot.handleUpdate(req.body);

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: error.message,
    });
  }
}
