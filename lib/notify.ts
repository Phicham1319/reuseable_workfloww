/**
 * แจ้งเตือนเมื่อ workflow พัง — ส่งอีเมลผ่าน Resend ไปยัง ALERT_EMAIL
 * no-op ถ้าไม่ตั้ง RESEND_API_KEY หรือ ALERT_EMAIL (ปลอดภัยตอน dev)
 *
 * v1: แจ้งไปอีเมลกลางตัวเดียว (ALERT_EMAIL)
 * ทีหลัง: แจ้งต่อ workflow (เก็บ notifyEmail ใน Workflow) เมื่อมี multi-user
 */
export async function sendAlert(subject: string, text: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL;
  if (!apiKey || !to) return; // ไม่ตั้ง = ไม่แจ้ง

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
      to,
      subject,
      text,
    }),
  });
}
