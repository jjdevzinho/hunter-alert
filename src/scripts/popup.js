document.addEventListener("DOMContentLoaded", () => {
  const countdownElement = document.getElementById("countdown");
  const alertTimeSelect = document.getElementById("alertTime");
  const disableAlertCheckbox = document.getElementById("disableAlert");
  const clockElement = document.getElementById("clock");

  // Atualiza o relógio
  function getTime() {
    const now = new Date();

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    clockElement.textContent = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  // Atualiza o contador regressivo
  function updateCountdown() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    countdownElement.textContent = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  // Carrega as configurações salvas
  chrome.storage.sync.get(["alertTime", "disableAlert"], (data) => {
    if (data.alertTime) {
      alertTimeSelect.value = data.alertTime;
    }
    if (data.disableAlert !== undefined) {
      disableAlertCheckbox.checked = data.disableAlert;
    }
  });

  // Salva as configurações quando alteradas
  alertTimeSelect.addEventListener("change", () => {
    chrome.storage.sync.set({ alertTime: alertTimeSelect.value });
  });

  disableAlertCheckbox.addEventListener("change", () => {
    chrome.storage.sync.set({ disableAlert: disableAlertCheckbox.checked });
  });

  // Função que combina as duas atualizações
  function updateBoth() {
    updateCountdown();
    getTime();
  }

  // Atualiza ambas as funções a cada segundo
  setInterval(updateBoth, 1000);

  // Chama as funções imediatamente para evitar o atraso inicial
  updateBoth();

  // Verifica se há notificações pendentes
  chrome.action.getBadgeText({}, (badgeText) => {
    if (badgeText) {
      document.getElementById("clearBadge").classList.remove("hidden");
    }
  });

  document.getElementById("clearBadge").addEventListener("click", () => {
    chrome.action.setBadgeText({ text: "" });
    document.getElementById("clearBadge").classList.add("hidden");
    // const notificationIds = ["midnightAlert", "missedNotification", "beforeMidnightAlert"]; // Substitua pelos IDs das notificações que deseja limpar

    // notificationIds.forEach((notificationId) => {
    //   chrome.notifications.clear(notificationId, (wasCleared) => {
    //     if (wasCleared) {
    //       console.log(`Notificação ${notificationId} removida`);
    //     } else {
    //       console.log(`Falha ao remover notificação ${notificationId}`);
    //     }
    //   });
    // });
  });
});
