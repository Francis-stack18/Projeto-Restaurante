var express = require("express");
var router = express.Router();
var users = require("../inc/users");
var admin = require("../inc/admin");
var menus = require("../inc/menus");
var reservations = require("../inc/reservations");
var moment = require("moment");
var contacts = require("../inc/contacts");
var emails = require("../inc/emails");
var mailer = require("../inc/mailer");

module.exports = function (io) {
  moment.locale("pt-BR");

  router.use(function (req, res, next) {
    if (["/login"].indexOf(req.url) === -1 && !req.session.user) {
      res.redirect("/admin/login");
    } else {
      next();
    }
  });

  router.use(function (req, res, next) {
    req.menus = admin.getMenus(req);

    next();
  });

  router.get("/logout", function (req, res, next) {
    delete req.session.user;

    res.redirect("admin/login");
  });

  router.get("/", function (req, res, next) {
    console.log("A requisição chegou na rota raiz ( / ) !");
    admin
      .dashbord()
      .then((data) => {
        res.render(
          "admin/index",
          admin.getParams(req, {
            data,
          }),
        );
      })
      .catch((err) => {
        console.error("ERRO NO BANCO DE DADOS (MySQL):", err);
        res.send("Erro interno do banco de dados.");
      });
  });

  router.get("/dashboard", function (req, res, next) {
    reservations
      .dashboard()
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        res.status(500).json(err);
      });
  });

  router.get("/login", function (req, res, next) {
    users.render(req, res, null);
  });

  router.post("/login", function (req, res, next) {
    console.log(req.body);
    if (!req.body.email) {
      users.render(req, res, "Preencha o campo e-mail.");
    } else if (!req.body.password) {
      users.render(req, res, "Preencha o campo senha.");
    } else {
      users
        .login(req.body.email, req.body.password)
        .then((user) => {
          req.session.user = user;

          res.redirect("/admin");
        })
        .catch((err) => {
          users.render(req, res, err.message || err);
        });
    }
  });

  router.get("/contacts", function (req, res, next) {
    contacts.getContacts().then((data) => {
      res.render(
        "admin/contacts",
        admin.getParams(req, {
          data,
        }),
      );
    });
  });

  router.delete("/contacts/:id", function (req, res, next) {
    contacts
      .delete(req.params.id)
      .then((results) => {
        res.send(results);
        io.emit("dashboard update");
      })
      .catch((err) => {
        res.send(err);
      });
  });

  router.get("/emails", function (req, res, next) {
    emails.getEmails().then((data) => {
      res.render(
        "admin/emails",
        admin.getParams(req, {
          data,
        }),
      );
    });
  });

  router.delete("/emails/:id", function (req, res, next) {
    emails
      .delete(req.params.id)
      .then((results) => {
        res.send(results);
        io.emit("dashboard update");
      })
      .catch((err) => {
        res.send(err);
      });
  });

  router.get("/menus", function (req, res, next) {
    menus.getMenus().then((data) => {
      res.render(
        "admin/menus",
        admin.getParams(req, {
          data,
        }),
      );
    });
  });

  router.post("/menus", function (req, res, next) {
    menus
      .save(req.fields, req.files)
      .then((results) => {
        io.emit("dashboard update");
        res.send(results);
      })
      .catch((err) => {
        res.send(err);
      });
  });

  router.delete("/menus/:id", function (req, res, next) {
    menus
      .delete(req.params.id)
      .then((results) => {
        io.emit("dashboard update");
        res.send(results);
      })
      .catch((err) => {
        res.send(err);
      });
  });

  router.get("/reservations", function (req, res, next) {
    let start = req.query.start
      ? req.query.start
      : moment().subtract(1, "year").format("YYYY-MM-DD");
    let end = req.query.end ? req.query.end : moment().format("YYYY-MM-DD");

    reservations.getReservations(req).then((pag) => {
      res.render(
        "admin/reservations",
        admin.getParams(req, {
          date: {
            start,
            end,
          },
          data: pag.data,
          moment,
          links: pag.links,
        }),
      );
    });
  });

  router.get("/reservations/export", function (req, res, next) {
    reservations
      .export(req)
      .then((data) => {
        let csv = "ID;Nome;E-mail;Pessoas;Data;Hora\n";

        data.forEach((row) => {
          let formattedDate = moment(row.date).format("DD/MM/YYYY");

          csv += `${row.id};${row.name};${row.email};${row.people};${formattedDate};${row.time}\n`;
        });

        res.header("Content-Type", "text/csv; charset=utf-8");
        res.attachment("relatorio-reservas.csv");

        res.send("\uFEFF" + csv);
      })
      .catch((err) => {
        res.send(err);
      });
  });

  router.get("/reservations/chart", function (req, res, next) {
    req.query.start = req.query.start
      ? req.query.start
      : moment().subtract(1, "year").format("YYYY-MM-DD");
    req.query.end = req.query.end
      ? req.query.end
      : moment().format("YYYY-MM-DD");

    reservations.chart(req).then((chartData) => {
      res.send(chartData);
    });
  });

  router.post("/reservations", function (req, res, next) {
    if (parseInt(req.body.id) > 0) {
      reservations
        .getReservation(req.body.id)
        .then((oldData) => {
          reservations
            .save(req.body)
            .then((results) => {
              io.emit("dashboard update");
              res.send(results);

              let oldDate = moment(oldData.date).format("DD/MM/YYYY");
              let newDate = moment(req.body.date).format("DD/MM/YYYY");

              let updateHtml = `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; margin: 0;">
                  <div style="max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    
                    <div style="background-color: #232323; padding: 30px 20px; text-align: center;">
                      <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px; font-family: Arial, sans-serif; font-weight: bold;">
                        <span style="color: #ffffff; text-transform: uppercase;">Saboroso</span><span style="color: #f39c12; font-style: italic; font-family: 'Georgia', 'Times New Roman', serif; margin-left: 3px;">!</span>
                      </h1>
                    </div>
                    
                    <div style="padding: 30px; color: #333333;">
                      <h2 style="margin-top: 0; color: #2c3e50;">Olá, ${req.body.name}!</h2>
                      <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                        Sua reserva foi <strong>atualizada</strong> pelo administrador do restaurante. Veja abaixo o comparativo com as alterações realizadas:
                      </p>
                      
                      <div style="margin: 30px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="width: 48%; background-color: #f5f5f5; border-left: 5px solid #7f8c8d; padding: 15px; border-radius: 0 4px 4px 0; vertical-align: top;">
                              <h4 style="margin: 0 0 10px 0; color: #7f8c8d; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Reserva Anterior</h4>
                              <p style="margin: 5px 0; font-size: 14px;"><strong>📅 Data:</strong> ${oldDate}</p>
                              <p style="margin: 5px 0; font-size: 14px;"><strong>⏰ Hora:</strong> ${oldData.time}</p>
                              <p style="margin: 5px 0; font-size: 14px;"><strong>👥 Pessoas:</strong> ${oldData.people}</p>
                            </td>
                            
                            <td style="width: 4%;"></td>
                            
                            <td style="width: 48%; background-color: #f0f9eb; border-left: 5px solid #27ae60; padding: 15px; border-radius: 0 4px 4px 0; vertical-align: top;">
                              <h4 style="margin: 0 0 10px 0; color: #27ae60; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Nova Reserva Atualizada</h4>
                              <p style="margin: 5px 0; font-size: 14px; color: #2c3e50;"><strong>📅 Data:</strong> ${newDate}</p>
                              <p style="margin: 5px 0; font-size: 14px; color: #2c3e50;"><strong>⏰ Hora:</strong> ${req.body.time}</p>
                              <p style="margin: 5px 0; font-size: 14px; color: #2c3e50;"><strong>👥 Pessoas:</strong> ${req.body.people}</p>
                            </td>
                          </tr>
                        </table>
                      </div>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                        Se as novas informações estiverem corretas, nenhuma ação é necessária. Estamos prontos para receber você!
                      </p>
                      
                      <p style="font-size: 16px; line-height: 1.6; color: #555555; margin-top: 30px;">
                        Atenciosamente,<br>
                        <strong style="color: #2c3e50;">Equipe Restaurante Saboroso</strong>
                      </p>
                    </div>
                    
                    <div style="background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d;">
                      <p style="margin: 0;">Este é um e-mail automático enviado devido a uma alteração cadastral.</p>
                      <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} Restaurante Saboroso. Todos os direitos reservados.</p>
                    </div>
                    
                  </div>
                </div>
              `;

              mailer
                .send(
                  req.body.email,
                  "Sua reserva foi atualizada! - Restaurante Saboroso",
                  updateHtml,
                )
                .then(() =>
                  console.log(
                    "E-mail de atualização enviado para: " + req.body.email,
                  ),
                )
                .catch((err) =>
                  console.error("Falha ao enviar e-mail de atualização: ", err),
                );
            })
            .catch((err) => {
              res.send(err);
            });
        })
        .catch((err) => {
          res.send(err);
        });
    } else {
      reservations
        .save(req.body)
        .then((results) => {
          io.emit("dashboard update");
          res.send(results);
        })
        .catch((err) => {
          res.send(err);
        });
    }
  });

  router.delete("/reservations/:id", function (req, res, next) {
    reservations
      .getReservation(req.params.id)
      .then((dadosReserva) => {
        reservations
          .delete(req.params.id)
          .then((results) => {
            io.emit("dashboard update");
            res.send(results);

            let formattedDate = moment(dadosReserva.date).format("DD/MM/YYYY");

            let cancelHtml = `
            <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; margin: 0;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                
                <div style="background-color: #232323; padding: 30px 20px; text-align: center;">
                  <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px; font-family: Arial, sans-serif; font-weight: bold;">
                    <span style="color: #ffffff; text-transform: uppercase;">Saboroso</span><span style="color: #f39c12; font-style: italic; font-family: 'Georgia', 'Times New Roman', serif; margin-left: 3px;">!</span>
                  </h1>
                </div>
                
                <div style="padding: 30px; color: #333333;">
                  <h2 style="margin-top: 0; color: #2c3e50;">Olá, ${dadosReserva.name}!</h2>
                  <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                    Informamos que a sua reserva detalhada abaixo foi <strong style="color: #e74c3c;">cancelada</strong> em nosso sistema.
                  </p>
                  
                  <div style="background-color: #f9f9f9; border-left: 5px solid #e74c3c; padding: 15px 20px; margin: 25px 0; border-radius: 0 4px 4px 0;">
                    <p style="margin: 8px 0; font-size: 16px;">
                      <strong style="color: #2c3e50;">📅 Data:</strong> ${formattedDate}
                    </p>
                    <p style="margin: 8px 0; font-size: 16px;">
                      <strong style="color: #2c3e50;">⏰ Hora:</strong> ${dadosReserva.time}
                    </p>
                    <p style="margin: 8px 0; font-size: 16px;">
                      <strong style="color: #2c3e50;">👥 Pessoas:</strong> ${dadosReserva.people}
                    </p>
                  </div>
                  
                  <p style="font-size: 16px; line-height: 1.6; color: #555555;">
                    Se isso foi um engano ou se desejar agendar uma nova data, por favor, acesse nosso site ou responda a este e-mail.
                  </p>
                  
                  <p style="font-size: 16px; line-height: 1.6; color: #555555; margin-top: 30px;">
                    Atenciosamente,<br>
                    <strong style="color: #2c3e50;">Equipe Restaurante Saboroso</strong>
                  </p>
                </div>
                
                <div style="background-color: #ecf0f1; padding: 15px; text-align: center; font-size: 12px; color: #7f8c8d;">
                  <p style="margin: 0;">Este é um e-mail automático.</p>
                  <p style="margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} Restaurante Saboroso. Todos os direitos reservados.</p>
                </div>
                
              </div>
            </div>
            `;

            mailer
              .send(
                dadosReserva.email,
                "Reserva Cancelada - Restaurante Saboroso",
                cancelHtml,
              )
              .then(() =>
                console.log(
                  "E-mail de cancelamento enviado para: " + dadosReserva.email,
                ),
              )
              .catch((err) =>
                console.error("Falha ao enviar e-mail de cancelamento: ", err),
              );
          })
          .catch((err) => {
            res.send(err);
          });
      })
      .catch((err) => {
        res.send(err);
      });
  });

  router.get("/users", function (req, res, next) {
    users.getUsers().then((data) => {
      res.render(
        "admin/users",
        admin.getParams(req, {
          data,
        }),
      );
    });
  });

  router.post("/users", function (req, res, next) {
    users
      .save(req.fields)
      .then((results) => {
        io.emit("dashboard update");
        res.send(results);
      })
      .catch((err) => {
        res.render("admin/users", admin.getParams(req));
      });
  });

  router.post("/users/password-change", function (req, res, next) {
    users
      .changePassword(req)
      .then((results) => {
        res.send(results);
      })
      .catch((err) => {
        res.send({
          error: err,
        });
      });
  });

  router.delete("/users/:id", function (req, res, next) {
    users
      .delete(req.params.id)
      .then((results) => {
        io.emit("dashboard update");
        res.send(results);
      })
      .catch((err) => {
        res.send(err);
      });
  });

  return router;
};
