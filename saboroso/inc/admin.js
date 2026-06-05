module.exports = {
  getMenus() {
    return [
      {
        text: "Tela Inicial",
        href: "/admin",
        icon: "home",
        active: false,
      },
      {
        text: "Menu",
        href: "/admin/menus",
        icon: "cutlery",
        active: false,
      },
      {
        text: "Reservas",
        href: "/admin/reservations",
        icon: "calendar-check-o",
        active: false,
      },
      {
        text: "Contatos",
        href: "/admin/contacts",
        icon: "comments",
        active: false,
      },
      {
        text: "Usuários",
        href: "/admin/users",
        icon: "users",
        active: false,
      },
      {
        text: "Emails",
        href: "/admin/emails",
        icon: "envelope",
        active: false,
      },
    ];
  },
};
