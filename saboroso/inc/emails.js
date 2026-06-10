var conn = require("./db");

module.exports = {
  getEmails() {
    return new Promise((resolve, reject) => {
      conn.query(
        `
                    SELECT * FROM tb_emails ORDER BY email
                `,
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        },
      );
    });
  },

  delete(id) {
    return new Promise((resolve, reject) => {
      conn.query(
        `
                    DELETE FROM tb_emails WHERE id = ? 
                `,
        [id],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        },
      );
    });
  },

  save(req) {
    return new Promise((resolve, reject) => {
      // Armadilha evitada: pega do body (comum) ou do fields (formidable)
      let dados = req.body && req.body.email ? req.body : req.fields;

      if (!dados || !dados.email) {
        reject("Preencha o email");
      } else {
        conn.query(
          `
            INSERT INTO tb_emails (email) VALUES(?)
          `,
          [dados.email],
          (err, results) => {
            if (err) {
              reject(err.message);
            } else {
              resolve(results);
            }
          },
        );
      }
    });
  },
};
