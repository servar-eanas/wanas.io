// إعدادات الربط مع الديسكورد (Discord Integration Configuration)
const DISCORD_CONFIG = {
  // 1. معرف سيرفر الديسكورد (Discord Server ID)
  // لعرض الأعضاء المتصلين وحالة السيرفر في الصفحة الرئيسية.
  // يمكنك الحصول عليه من: إعدادات سيرفر الديسكورد -> الرمز التعريفي (Widget / Server ID).
  // يجب تفعيل الودجت في السيرفر: إعدادات السيرفر -> الودجت (Enable Server Widget) -> حفظ التغييرات.
  serverId: "1510602008749408316", // معرف افتراضي أو اتركه فارغاً حتى تضيف معرف سيرفرك

  // 2. روابط الويب هوك (Discord Webhook URLs) الخاصة بقنواتك
  // للحصول عليها: إعدادات السيرفر في الديسكورد -> Integrations -> Webhooks -> Create Webhook.
  webhooks: {
    // ويب هوك لقناة طلبات التقديم (apply.html)
    apply: "https://discord.com/api/webhooks/1515321872219246672/q1Uq2p15R8BLfJWIhT2SJB9wHd6GPgIYdNxbzlwXkLUTHaZVmqlzecjrB7BiT3XBnVTA",

    // ويب هوك لقناة الشكاوى والاقتراحات (complaints.html)
    complaints: "https://discord.com/api/webhooks/1515321872219246672/q1Uq2p15R8BLfJWIhT2SJB9wHd6GPgIYdNxbzlwXkLUTHaZVmqlzecjrB7BiT3XBnVTA",

    // ويب هوك لقناة تواصل معنا (contact.html)
    contact: "https://discord.com/api/webhooks/1515321872219246672/q1Uq2p15R8BLfJWIhT2SJB9wHd6GPgIYdNxbzlwXkLUTHaZVmqlzecjrB7BiT3XBnVTA"
  },

  // 3. تشغيل الإرسال الآمن عبر وسيط PHP
  // - اضبط القيمة إلى true إذا كانت استضافتك تدعم PHP لزيادة الأمان وإخفاء روابط الويب هوك عن الزوار.
  // - اضبط القيمة إلى false إذا كانت استضافتك استاتيكية (مثل GitHub Pages أو Netlify)، وسيتم الإرسال مباشرة من المتصفح.
  usePhpProxy: false
};
