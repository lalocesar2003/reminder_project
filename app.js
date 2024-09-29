// Notification Factory Method
class NotificationFactory {
  static createNotification(method) {
    switch (method) {
      case "email":
        return new EmailNotification();
      case "whatsapp":
        return new WhatsAppNotification();
      case "sms":
        return new SMSNotification();
      default:
        throw new Error("Notification method not supported.");
    }
  }
}

// Email Notification (active)
class EmailNotification {
  send(payload) {
    return fetch("https://hook.us1.make.com/ppfcwgmfr77p63c2byjesgbpwkc3o9fu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }
}

// WhatsApp Notification (active)
class WhatsAppNotification {
  send(payload) {
    return fetch("https://hook.us1.make.com/5d2yblu62d3mnsck1rmlwn4yionej80j", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }
}

// SMS Notification (using TextBelt API with custom message format)
class SMSNotification {
  send(payload) {
    const message = `Hola ${payload.name}, te recordamos que tienes una deuda de ${payload.amount} por el servicio de ${payload.reason} con la fecha de ${payload.date}.`;

    return fetch("https://textbelt.com/text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: payload.phone,
        message: message,
        key: "textbelt",
      }),
    });
  }
}

// Handle form submission
document
  .getElementById("notificationForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const amount = document.getElementById("amount").value;
    const reason = document.getElementById("reason").value;
    const date = document.getElementById("date").value;

    // Get selected methods
    const selectedMethods = Array.from(
      document.querySelectorAll('input[name="method"]:checked')
    ).map((el) => el.value);

    if (selectedMethods.length === 0) {
      alert("Please select at least one method to send the notification.");
      return;
    }

    const payload = {
      name: name,
      email: email,
      phone: phone,
      amount: amount,
      reason: reason,
      date: date,
    };

    // Send notification to each selected method
    const promises = selectedMethods.map((method) => {
      const notification = NotificationFactory.createNotification(method);
      return notification.send(payload);
    });

    // Wait for all promises to resolve
    Promise.all(promises)
      .then((responses) => {
        responses.forEach((response) => {
          const contentType = response.headers
            ? response.headers.get("content-type")
            : null;
          if (contentType && contentType.includes("application/json")) {
            response
              .json()
              .then((data) => console.log("Server response:", data));
          } else {
            response
              .text()
              .then((text) => console.log("Server response:", text));
          }
        });
        alert("Notifications sent successfully!");
      })
      .catch((error) => {
        alert("Error sending notification: " + error.message);
      });
  });
