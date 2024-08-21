chrome.runtime.onInstalled.addListener(() => {
  // Configura o alarme para verificar a hora a cada minuto
  chrome.alarms.create("checkTime", { periodInMinutes: 1 });
  checkLastNotification();

  // // Icon deve ter o mesmo tamanho do badge default
  // chrome.action.setIcon({ path: "../assets/icons/icon-128-alert.png" });

  // chrome.action.setBadgeText({ text: "1" });
  // chrome.action.setBadgeBackgroundColor({ color: "#ad2d23" });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "checkTime") {
    checkTimeAndAlert();
  }
});

function checkTimeAndAlert() {
  chrome.storage.sync.get(["alertTime", "disableAlert", "lastNotificationDate"], (data) => {
    if (data.disableAlert) {
      return;
    }

    const alertMinutesBeforeMidnight = parseInt(data.alertTime) || 0;
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const today = now.toISOString().split("T")[0]; // Formato YYYY-MM-DD
    const nextDay = new Date(now.getTime() + 86400000).toISOString().split("T")[0];

    // Verifica se é meia-noite
    if (hours === 0 && data.lastNotificationDate !== today) {
      sendNotification("midnightAlert", "Hora do Hunter", "Esta é a hora de jogar o Hunter Country!");
      chrome.storage.sync.set({ lastNotificationDate: today });
      return;
    }

    // Verifica se é X minutos antes de meia-noite
    if (hours === 23 && minutes >= 60 - alertMinutesBeforeMidnight && data.lastNotificationDate !== nextDay) {
      const minutesLeft = 60 - minutes;
      sendNotification("beforeMidnightAlert", "Quase Meia Noite - Hora do Hunter", `Faltam ${minutesLeft} minutos para meia-noite!`);
      chrome.storage.sync.set({ lastNotificationDate: nextDay });
    }
  });
}

function sendNotification(id, title, message) {
  chrome.notifications.create(id, {
    type: "basic",
    iconUrl: "../assets/icons/icon-128.png",
    title: title,
    message: message,
  });
  chrome.action.setBadgeText({ text: "1" });
  chrome.action.setBadgeBackgroundColor({ color: "#ad2d23" });
}

function checkLastNotification() {
  chrome.storage.sync.get(["lastNotificationDate", "disableAlert"], (data) => {
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // Formato YYYY-MM-DD
    const nextDay = new Date(now.getTime() + 86400000).toISOString().split("T")[0];

    // Verifica se as notificações estão desativadas
    if (data.disableAlert) {
      return;
    }

    // Verifica se a notificação já foi enviada hoje
    if (data.lastNotificationDate !== today && data.lastNotificationDate !== nextDay) {
      sendNotification("missedNotification", "Hunter Country", "Você perdeu a notificação de meia-noite!");
      chrome.storage.sync.set({ lastNotificationDate: today });
    }
  });
}

// Listener para clicar na notificação
chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === "midnightAlert" || notificationId === "beforeMidnightAlert" || notificationId === "missedNotification") {
    chrome.tabs.create({ url: "https://superfans.top/games/hunter/country" });
  }
});

setTimeout(() => {
  chrome.action.setBadgeText({ text: "" });
}, 3600000 / 15); // 15 minutos
