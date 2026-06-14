// ===== 0. التعامل مع القائمة المنسدلة التفاعلية =====
document.addEventListener("DOMContentLoaded", () => {
  const navMenuBtn = document.getElementById("navMenuBtn");
  const navDropdownMenu = document.getElementById("navDropdownMenu");

  if (navMenuBtn && navDropdownMenu) {
    // فتح/إغلاق القائمة عند النقر على الزر
    navMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navDropdownMenu.classList.toggle("show");
      navMenuBtn.classList.toggle("active-dropdown");
    });

    // إغلاق القائمة عند النقر على أي رابط
    navDropdownMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navDropdownMenu.classList.remove("show");
        navMenuBtn.classList.remove("active-dropdown");
      });
    });

    // إغلاق القائمة عند النقر خارج المنطقة
    document.addEventListener("click", (e) => {
      if (!navMenuBtn.contains(e.target) && !navDropdownMenu.contains(e.target)) {
        navDropdownMenu.classList.remove("show");
        navMenuBtn.classList.remove("active-dropdown");
      }
    });

    // تحديد الصفحة النشطة بناءً على URL الحالي
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    navDropdownMenu.querySelectorAll("a").forEach((link) => {
      const href = link.getAttribute("href");
      if (href === currentPage || (currentPage === "" && href === "index.html")) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }
});

// ===== 1. تأثير النجوم عند تحريك الماوس (Star Trail Effect) =====
document.addEventListener("mousemove", (e) => {
  const star = document.createElement("div");
  star.className = "star";
  star.style.left = e.pageX + "px";
  star.style.top = e.pageY + "px";
  document.body.appendChild(star);

  setTimeout(() => {
    star.remove();
  }, 800);
});

// ===== 2. دالة إظهار Toast تفاعلي =====
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.className = "toast " + type + " show";

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

// ===== 3. إرسال البيانات إلى الديسكورد (Discord Sending Logic) =====
async function sendToDiscord(type, payload) {
  // التحقق من وجود الإعدادات
  if (typeof DISCORD_CONFIG === "undefined") {
    console.error("DISCORD_CONFIG is not defined. Make sure config.js is loaded.");
    return { success: false, mode: "demo", message: "لم يتم العثور على ملف الإعدادات config.js" };
  }

  const useProxy = DISCORD_CONFIG.usePhpProxy;
  const webhookUrl = DISCORD_CONFIG.webhooks[type];

  // التحقق من صحة رابط الويب هوك في حال عدم استخدام البروكسي
  if (!useProxy) {
    if (webhookUrl && (webhookUrl.includes("discord.gg") || webhookUrl.includes("discord.com/invite"))) {
      return { success: false, mode: "error", message: "الرابط المكتوب هو رابط دعوة (discord.gg). يرجى وضع رابط ويب هوك حقيقي يبدأ بـ discord.com/api/webhooks" };
    }
    if (webhookUrl && !webhookUrl.startsWith("https://discord.com/api/webhooks/") && !webhookUrl.startsWith("https://discordapp.com/api/webhooks/")) {
      if (webhookUrl !== "YOUR_DISCORD_WEBHOOK_URL_HERE") {
        return { success: false, mode: "error", message: "الرابط غير صالح. يجب أن يبدأ بـ https://discord.com/api/webhooks/" };
      }
    }
  }

  // وضع التجريب (Demo Mode) في حال لم يتم تغيير رابط الويب هوك الافتراضي
  if (!useProxy && (!webhookUrl || webhookUrl === "YOUR_DISCORD_WEBHOOK_URL_HERE")) {
    console.warn(`Webhook for ${type} is not configured. Running in Demo Mode.`);
    return { success: true, mode: "demo", message: "طلبك قيد المعالجة (وضع التجريب - لم يتم تعيين رابط ويب هوك حقيقي)" };
  }

  try {
    if (useProxy) {
      // إرسال عبر ملف الـ PHP الوسيط لحماية الروابط
      const response = await fetch("send_webhook.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: type, payload: payload })
      });

      const data = await response.json();
      if (response.ok && data.status === "success") {
        return { success: true, mode: "production" };
      } else {
        throw new Error(data.message || "فشلت عملية الإرسال من السيرفر");
      }
    } else {
      // إرسال مباشر من المتصفح (مفيد للاستضافات الاستاتيكية)
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        return { success: true, mode: "production" };
      } else {
        throw new Error(`Discord API error: ${response.statusText}`);
      }
    }
  } catch (error) {
    console.error("Discord Send Error:", error);
    return { success: false, mode: "error", message: error.message };
  }
}

// ===== 4. معالجة نموذج التقديم للانضمام (applyForm) =====
const applyForm = document.getElementById("applyForm");
if (applyForm) {
  applyForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById("applySubmitBtn");
    const originalBtnHtml = submitBtn.innerHTML;

    // تغيير حالة الزر أثناء الإرسال
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...';

    const name = document.getElementById("applyName").value.trim();
    const age = document.getElementById("applyAge").value;
    const reason = document.getElementById("applyReason").value.trim();

    // تجهيز كرت الديسكورد (Discord Embed)
    const discordPayload = {
      username: "تقديم - سيرفر ونس",
      avatar_url: "https://i.imgur.com/kS9lS1g.png", // يمكنك تغييره لأي رابط صورة
      embeds: [
        {
          title: "📝 طلب تقديم جديد للانضمام للطاقم",
          description: "تم تقديم طلب جديد عبر الموقع الإلكتروني.",
          color: 8150268, // لون بنفسجي متناسق مع شعار الموقع (#7c5cfc)
          fields: [
            { name: "👤 اسم مقدم الطلب", value: name, inline: true },
            { name: "📅 العمر", value: `${age} سنة`, inline: true },
            { name: "❓ سبب التقديم وما يمكن تقديمه", value: reason }
          ],
          footer: { text: "بوابة التقديم الإلكترونية | سيرفر ونس" },
          timestamp: new Date().toISOString()
        }
      ]
    };

    const result = await sendToDiscord("apply", discordPayload);

    if (result.success) {
      if (result.mode === "demo") {
        showToast("⚠️ " + result.message, "error");
      } else {
        showToast("✅ تم إرسال طلبك بنجاح وسيتواصل معك المشرفون!");
      }
      applyForm.reset();
    } else {
      showToast("❌ خطأ أثناء الإرسال: " + (result.message || "يرجى المحاولة لاحقاً"), "error");
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHtml;
  });
}

// ===== 5. معالجة نموذج الشكاوى والاقتراحات (complaintForm) =====
const complaintForm = document.getElementById("complaintForm");
if (complaintForm) {
  complaintForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById("complaintSubmitBtn");
    const originalBtnHtml = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...';

    const name = document.getElementById("complaintName").value.trim();
    const type = document.getElementById("complaintType").value;
    const details = document.getElementById("complaintDetails").value.trim();

    // 1. حفظ الشكوى محلياً في المتصفح لتعرض في القائمة
    let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
    complaints.push({ name, type, details, date: new Date().toLocaleDateString("ar-EG") });
    localStorage.setItem("complaints", JSON.stringify(complaints));
    displayComplaints(); // تحديث القائمة فوراً

    // 2. تجهيز كرت الديسكورد (Discord Embed)
    const discordPayload = {
      username: "بلاغات وشكاوى - سيرفر ونس",
      avatar_url: "https://i.imgur.com/kS9lS1g.png",
      embeds: [
        {
          title: `🚨 ${type} جديد`,
          description: "تم إرسال نموذج جديد من صفحة الشكاوى والاقتراحات.",
          color: type.includes("شكوى") ? 16730190 : 3447003, // أحمر للشكاوى وأزرق للاقتراحات
          fields: [
            { name: "👤 اسم المرسل / اللقب", value: name, inline: true },
            { name: "📋 نوع الرسالة", value: type, inline: true },
            { name: "💬 التفاصيل والبيان", value: details }
          ],
          footer: { text: "نظام الشكاوى التلقائي | سيرفر ونس" },
          timestamp: new Date().toISOString()
        }
      ]
    };

    const result = await sendToDiscord("complaints", discordPayload);

    if (result.success) {
      if (result.mode === "demo") {
        showToast("⚠️ تم الحفظ محلياً: " + result.message, "error");
      } else {
        showToast("✅ تم إرسال شكواك/اقتراحك بنجاح للإدارة وسنراجعها قريباً!");
      }
      complaintForm.reset();
    } else {
      showToast("❌ تم الحفظ محلياً، لكن فشل الإرسال للديسكورد: " + (result.message || "خطأ غير معروف"), "error");
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHtml;
  });
}

// ===== 6. عرض الشكاوي المحفوظة محلياً =====
function displayComplaints() {
  const listContainer = document.getElementById("complaintsList");
  if (!listContainer) return;

  listContainer.innerHTML = "";
  let complaints = JSON.parse(localStorage.getItem("complaints")) || [];

  if (complaints.length === 0) {
    listContainer.innerHTML = '<li style="color: var(--text-muted); text-align: center; width: 100%; padding: 10px;">لا يوجد شكاوى سابقة مسجلة على هذا الجهاز.</li>';
    return;
  }

  complaints.forEach((c, index) => {
    const li = document.createElement("li");
    li.className = "complaint-card";
    li.style.background = "rgba(255, 255, 255, 0.04)";
    li.style.border = "1px solid var(--border-glass)";
    li.style.borderRadius = "var(--radius-md)";
    li.style.padding = "15px";
    li.style.marginBottom = "10px";
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.gap = "15px";

    const text = document.createElement("div");
    text.className = "complaint-text";
    text.style.textAlign = "right";
    text.style.flex = "1";

    const badgeColor = c.type.includes("شكوى") ? "#ff4d4d" : "#00d4ff";
    text.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
        <span style="font-weight: 800; color: var(--text-primary);">${index + 1}. ${c.name}</span>
        <span style="background: ${badgeColor}; font-size: 0.72rem; padding: 2px 8px; border-radius: 4px; color: #fff; font-weight: bold;">${c.type}</span>
        <span style="color: var(--text-muted); font-size: 0.75rem; margin-right: auto;">${c.date || ""}</span>
      </div>
      <p style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">${c.details}</p>
    `;

    const actions = document.createElement("div");
    actions.className = "complaint-actions";
    actions.style.display = "flex";
    actions.style.gap = "8px";

    // زر نسخ
    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.style.padding = "8px 12px";
    copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i>';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(`${c.name} (${c.type}): ${c.details}`).then(() => {
        showToast("📋 تم نسخ نص الشكوى!");
      }).catch(() => {
        showToast("❌ حدث خطأ أثناء النسخ", "error");
      });
    };

    // زر حذف
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "copy-btn";
    deleteBtn.style.background = "rgba(255, 77, 77, 0.15)";
    deleteBtn.style.color = "#ff4d4d";
    deleteBtn.style.padding = "8px 12px";
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    deleteBtn.onclick = () => {
      complaints.splice(index, 1);
      localStorage.setItem("complaints", JSON.stringify(complaints));
      displayComplaints();
      showToast("🗑️ تم حذف السجل المحلي بنجاح!", "error");
    };

    actions.appendChild(copyBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(text);
    li.appendChild(actions);
    listContainer.appendChild(li);
  });
}

// ===== 7. معالجة نموذج التواصل المباشر (contactForm) =====
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById("contactSubmitBtn");
    const originalBtnHtml = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...';

    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const subject = document.getElementById("contactSubject").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    // تجهيز كرت الديسكورد (Discord Embed)
    const discordPayload = {
      username: "تواصل - سيرفر ونس",
      avatar_url: "https://i.imgur.com/kS9lS1g.png",
      embeds: [
        {
          title: "✉️ رسالة تواصل جديدة",
          description: "تم إرسال رسالة تواصل جديدة من نموذج الاتصال المباشر على الموقع.",
          color: 3447003, // أزرق غامق للرسائل العامة
          fields: [
            { name: "👤 اسم المرسل", value: name, inline: true },
            { name: "📧 البريد الإلكتروني", value: email, inline: true },
            { name: "📌 موضوع الرسالة", value: subject },
            { name: "💬 نص الرسالة", value: message }
          ],
          footer: { text: "بوابة التواصل المباشر | سيرفر ونس" },
          timestamp: new Date().toISOString()
        }
      ]
    };

    const result = await sendToDiscord("contact", discordPayload);

    if (result.success) {
      if (result.mode === "demo") {
        showToast("⚠️ " + result.message, "error");
      } else {
        showToast("✅ تم إرسال رسالتك بنجاح! شكراً لتواصلك معنا.");
      }
      contactForm.reset();
    } else {
      showToast("❌ خطأ أثناء الإرسال للديسكورد: " + (result.message || "يرجى المحاولة لاحقاً"), "error");
    }

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnHtml;
  });
}

// ===== 8. تحميل حالة سيرفر الديسكورد للـ Widget تفاعلي =====
async function loadDiscordWidget() {
  const onlineText = document.getElementById("discordOnlineCount");
  const inviteBtn = document.getElementById("discordWidgetInvite");

  if (!onlineText) return; // لضمان التشغيل فقط في الصفحة الرئيسية

  if (typeof DISCORD_CONFIG === "undefined" || !DISCORD_CONFIG.serverId) {
    onlineText.textContent = "سيرفر ونس نشط الآن | انضم إلينا";
    return;
  }

  const serverId = DISCORD_CONFIG.serverId;

  try {
    const response = await fetch(`https://discord.com/api/servers/${serverId}/widget.json`);
    if (!response.ok) {
      throw new Error("Discord Widget disabled or invalid Server ID");
    }

    const data = await response.json();
    if (data && typeof data.presence_count !== "undefined") {
      onlineText.textContent = `${data.presence_count.toLocaleString("ar-EG")} لاعب متصل بالديسكورد الآن!`;

      // إذا كان هناك رابط دعوة مباشر من الودجت نقوم بتحديثه
      if (data.instant_invite && inviteBtn) {
        inviteBtn.href = data.instant_invite;
      }
    } else {
      onlineText.textContent = "سيرفر ونس نشط الآن | انضم إلينا";
    }
  } catch (error) {
    console.warn("Could not load Discord Widget. Checking default configuration...", error);
    onlineText.textContent = "سيرفر ونس نشط الآن | انضم إلينا";
  }
}

// ===== 9. زر تبديل الوضع الليلي/النهاري =====
const toggleBtn = document.getElementById("modeToggle");
if (toggleBtn) {
  // استعادة خيار المستخدم المفضل من المتصفح
  const savedMode = localStorage.getItem("preferredTheme");
  if (savedMode === "day") {
    document.body.classList.remove("night-mode");
    document.body.classList.add("day-mode");
    toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i> الوضع النهاري';
  }

  toggleBtn.addEventListener("click", () => {
    const body = document.body;

    if (body.classList.contains("night-mode")) {
      body.classList.remove("night-mode");
      body.classList.add("day-mode");
      toggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i> الوضع النهاري';
      localStorage.setItem("preferredTheme", "day");
      showToast("☀️ تم تفعيل الوضع النهاري");
    } else {
      body.classList.remove("day-mode");
      body.classList.add("night-mode");
      toggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i> الوضع الليلي';
      localStorage.setItem("preferredTheme", "night");
      showToast("🌙 تم تفعيل الوضع الليلي");
    }
  });
}

// ===== 10. أزرار نسخ حسابات الديسكورد العامة =====
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const user = btn.parentElement.querySelector(".discord-user").textContent.trim();
    navigator.clipboard.writeText(user).then(() => {
      showToast("📋 تم نسخ الحساب: " + user);
    }).catch(() => {
      showToast("❌ حدث خطأ أثناء النسخ", "error");
    });
  });
});

// ===== 11. تشغيل عند تحميل الصفحة (On Load Init) =====
window.addEventListener("DOMContentLoaded", () => {
  displayComplaints();
  loadDiscordWidget();

  const serverContentBtn = document.getElementById("serverContentBtn");
  const closeServerContentBtn = document.getElementById("closeServerContentBtn");
  const serverContentPanel = document.getElementById("serverContentPanel");

  if (serverContentBtn && serverContentPanel) {
    serverContentBtn.addEventListener("click", () => {
      serverContentPanel.classList.remove("hidden");
    });
  }

  if (closeServerContentBtn && serverContentPanel) {
    closeServerContentBtn.addEventListener("click", () => {
      serverContentPanel.classList.add("hidden");
    });
  }
});
