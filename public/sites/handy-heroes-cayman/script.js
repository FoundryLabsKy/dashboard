/* Handy Heroes Cayman — shared behavior */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "13453272468"; // +1 345-327-2468

  // Mobile nav toggle
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Quote form: inline validation, then composes a WhatsApp message from the
  // fields and opens the chat. Photos can't ride along on a wa.me link, so we
  // prompt to attach them in the chat instead.
  function validateField(field) {
    var input = field.querySelector("input, textarea");
    if (!input || !input.required) return true;
    var value = input.value.trim();
    var ok = value.length > 0;
    if (ok && input.type === "tel") {
      ok = /[0-9].*[0-9].*[0-9].*[0-9].*[0-9].*[0-9]/.test(value);
    }
    field.classList.toggle("field--invalid", !ok);
    input.setAttribute("aria-invalid", ok ? "false" : "true");
    return ok;
  }

  document.querySelectorAll(".quote-form").forEach(function (form) {
    var fields = Array.prototype.slice.call(form.querySelectorAll(".field"));

    fields.forEach(function (field) {
      var input = field.querySelector("input, textarea");
      if (!input || !input.required) return;
      input.addEventListener("blur", function () {
        if (input.value.trim() || field.classList.contains("field--invalid")) {
          validateField(field);
        }
      });
      input.addEventListener("input", function () {
        if (field.classList.contains("field--invalid")) validateField(field);
      });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var firstInvalid = null;
      fields.forEach(function (field) {
        if (!validateField(field) && !firstInvalid) {
          firstInvalid = field.querySelector("input, textarea");
        }
      });
      var status = form.querySelector(".form-status");
      if (firstInvalid) {
        firstInvalid.focus();
        if (status) {
          status.textContent = "";
          status.classList.remove("show");
        }
        return;
      }

      var name = form.querySelector('[name="name"]').value.trim();
      var phone = form.querySelector('[name="phone"]').value.trim();
      var job = form.querySelector('[name="job"]').value.trim();
      var photoInput = form.querySelector('[name="photo"]');
      var hasPhoto = photoInput && photoInput.files && photoInput.files.length > 0;

      var lines = [
        "Hi Handy Heroes! I'd like a quote.",
        "Name: " + name,
        "Phone: " + phone,
        "What I need: " + job,
      ];
      if (hasPhoto) {
        lines.push("(I have " + photoInput.files.length + " photo" + (photoInput.files.length > 1 ? "s" : "") + " of the job to send you.)");
      }

      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");

      if (status) {
        status.textContent = hasPhoto
          ? "WhatsApp is opening with your details — attach your photo in the chat and hit send. We'll reply fast."
          : "WhatsApp is opening with your details — just hit send. We'll reply fast.";
        status.classList.add("show");
      }
    });
  });

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
