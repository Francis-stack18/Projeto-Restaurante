let conn = require("./db");
let path = require("path");

module.exports = {
  getMenus() {
    return new Promise((resolve, reject) => {
      conn.query(
        `
    SELECT * FROM tb_menus ORDER BY title
    `,
        (err, results) => {
          if (err) {
            reject(err);
          }

          resolve(results);
        },
      );
    });
  },
  save(fields, files) {
    return new Promise((resolve, reject) => {
      if (files && files.photo && files.photo.size > 0) {
        fields.photo = `images/${path.parse(files.photo.path).base}`;
      } else {
        delete fields.photo;
      }

      let query, queryParams;

      if (parseInt(fields.id) > 0) {
        if (fields.photo) {
          query = `
                        UPDATE tb_menus 
                        SET title = ?, description = ?, price = ?, photo = ?
                        WHERE id = ?
                    `;
          queryParams = [
            fields.title,
            fields.description,
            fields.price,
            fields.photo,
            fields.id,
          ];
        } else {
          query = `
                        UPDATE tb_menus 
                        SET title = ?, description = ?, price = ?
                        WHERE id = ?
                    `;
          queryParams = [
            fields.title,
            fields.description,
            fields.price,
            fields.id,
          ];
        }
      } else {
        if (!fields.photo) {
          fields.photo = "images/boxed-bg.jpg";
        }

        query = `
                    INSERT INTO tb_menus (title, description, price, photo)
                    VALUES(?, ?, ?, ?)
                `;
        queryParams = [
          fields.title,
          fields.description,
          fields.price,
          fields.photo,
        ];
      }

      conn.query(query, queryParams, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  },
};
