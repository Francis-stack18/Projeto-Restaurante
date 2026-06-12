var conn = require("../inc/db");
var express = require("express");
var router = express.Router();
var menus = require("../inc/menus");
var reservations = require("../inc/reservations");
var contacts = require("../inc/contacts");
var emails = require("../inc/emails");
var mailer = require("../inc/mailer");

/* GET home page. */

module.exports = function (io) {
  router.get("/", function (req, res, next) {
    menus.getMenus().then((results) => {
      res.render("index", {
        title: "Restaurante Saboroso!",
        menus: results,
        isHome: true,
      });
    });
  });

  router.get("/contacts", function (req, res, next) {
    contacts.render(req, res);
  });

  router.post("/contacts", function (req, res, next) {
    if (!req.body.name) {
      contacts.render(req, res, "Digite o nome");
    } else if (!req.body.email) {
      contacts.render(req, res, "Digite o e-mail");
    } else if (!req.body.message) {
      contacts.render(req, res, "Digite a mensagem");
    } else {
      contacts
        .save(req.body)
        .then((results) => {
          req.body = {};

          io.emit("dashboard update");

          contacts.render(req, res, null, "Contato enviado com sucesso!");
        })
        .catch((err) => {
          contacts.render(req, res, err.message);
        });
    }
  });

  router.get("/menus", function (req, res, next) {
    menus.getMenus().then((results) => {
      res.render("menus", {
        title: "Menus - Restaurante Saboroso!",
        background: "images/img_bg_1.jpg",
        h1: "Saboreie nosso menu",
        menus: results,
      });
    });
  });

  router.get("/reservations", function (req, res, next) {
    reservations.render(req, res);
  });

  router.post("/reservations", function (req, res, next) {
    if (!req.body.name) {
      reservations.render(req, res, "Digite o nome");
    } else if (!req.body.email) {
      reservations.render(req, res, "Digite o Email");
    } else if (!req.body.people) {
      reservations.render(req, res, "Selecione o número de pessoas");
    } else if (!req.body.date) {
      reservations.render(req, res, "Selecione a data");
    } else if (!req.body.time) {
      reservations.render(req, res, "Selecione a hora");
    } else {
      reservations
        .save(req.body)
        .then((results) => {
          io.emit("dashboard update");

          const userEmail = req.body.email;

          let dateParts = req.body.date.split("-");
          let formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;

          let emailHtml = `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; margin: 0;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                
                <div style="background-color: #232323; padding: 30px 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px; font-family: Arial, sans-serif; font-weight: bold;">
                    <span style="color: #ffffff; text-transform: uppercase;">Saboroso</span><span style="color: #f39c12; font-style: italic; font-family: 'Georgia', 'Times New Roman', serif; margin-left: 3px;">!</span>
                  </h1>
                </div>
                
                <div style="padding: 30px; color: #333333;">
                  <h2 style="margin-top: 0; color: #2c3e50;">Olá, ${req.body.name}!</h2>
                  <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                    Sua reserva foi confirmada com sucesso em nosso sistema. Estamos muito felizes em receber você!
                  </p>
                  
                  <div style="background-color: #f9f9f9; border-left: 5px solid #f39c12; padding: 15px 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                    <p style="margin: 8px 0; font-size: 16px;">
                      <strong style="color: #2c3e50;">📅 Data:</strong> ${formattedDate}
                    </p>
                    <p style="margin: 8px 0; font-size: 16px;">
                      <strong style="color: #2c3e50;">⏰ Hora:</strong> ${req.body.time}
                    </p>
                    <p style="margin: 8px 0; font-size: 16px;">
                      <strong style="color: #2c3e50;">👥 Pessoas:</strong> ${req.body.people}
                    </p>
                  </div>
                  
                  <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                    Caso precise alterar ou cancelar sua reserva, basta responder a este e-mail.
                  </p>
                  
                  <p style="font-size: 16px; line-height: 1.6; color: #555555; margin-top: 30px;">
                    Até breve,<br>
                    <strong style="color: #2c3e50;">Equipe Restaurante Saboroso</strong>
                  </p>
                </div>
                
                <div style="background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d;">
                  <p style="margin: 0;">Este é um e-mail automático, mas você pode respondê-lo se precisar de ajuda.</p>
                  <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} Restaurante Saboroso. Todos os direitos reservados.</p>
                </div>
                
              </div>
            </div>
          `;

          mailer
            .send(
              userEmail,
              "Reserva Confirmada - Restaurante Saboroso",
              emailHtml,
            )
            .then(() =>
              console.log("E-mail de confirmação enviado para: " + userEmail),
            )
            .catch((err) => console.error("Falha ao enviar e-mail: ", err));

          req.body = {};

          reservations.render(req, res, null, "Reserva realizada com sucesso!");
        })
        .catch((err) => {
          reservations.render(req, res, err.message);
        });
    }
  });

  router.get("/services", function (req, res, next) {
    res.render("services", {
      title: "Serviços - Restaurante Saboroso!",
      background: "images/img_bg_1.jpg",
      h1: "É um prazer poder servir!",
    });
  });

  router.post("/subscribe", function (req, res, next) {
    emails
      .save(req)
      .then((results) => {
        res.send(results);
      })
      .catch((err) => {
        res.send(err);
      });
  });
  return router;
};
