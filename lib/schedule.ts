/**
 * Schedule preset (routine) — ใช้กับ trigger.config.schedule
 * เวลาอ้างอิง UTC (ตรงกับ Inngest cron)
 *
 * manual   → ไม่ยิงเอง (กดรันเอง)
 * hourly   → ทุกชั่วโมง นาทีที่ minute (default 0)
 * daily    → ทุกวัน เวลา at ("HH:MM")
 * weekdays → จันทร์-ศุกร์ เวลา at
 * weekly   → วันใน days[] (0=อา..6=ส) เวลา at
 * (custom cron = เก็บไว้ทีหลัง ต้อง cron-parser)
 */
export type Schedule =
  | { preset: "manual" }
  | { preset: "hourly"; minute?: number }
  | { preset: "daily"; at: string }
  | { preset: "weekdays"; at: string }
  | { preset: "weekly"; days: number[]; at: string };

/** ถึงเวลายิงไหม — scheduler รันทุกนาที เรียกอันนี้เช็คต่อ workflow */
export function isScheduleDue(s: Schedule | undefined, now: Date): boolean {
  if (!s) return false;
  const hhmm = `${String(now.getUTCHours()).padStart(2, "0")}:${String(
    now.getUTCMinutes(),
  ).padStart(2, "0")}`;
  const day = now.getUTCDay(); // 0=Sun .. 6=Sat

  switch (s.preset) {
    case "hourly":
      return now.getUTCMinutes() === (s.minute ?? 0);
    case "daily":
      return s.at === hhmm;
    case "weekdays":
      return day >= 1 && day <= 5 && s.at === hhmm;
    case "weekly":
      return Array.isArray(s.days) && s.days.includes(day) && s.at === hhmm;
    case "manual":
    default:
      return false;
  }
}
