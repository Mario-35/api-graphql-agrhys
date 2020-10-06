/**
 * Seeds the database with test / reference user accounts.
 *
 * @typedef {import("knex")} Knex
 * @copyright 2020-present Inrae
 * @author mario.adam@inrae.fr
 */

module.exports.seed = async (/** @type {Knex} */ db) => {
  await db.table("sensor").delete();

  await db.table("sensor").insert([
    { station_id: 1, code: "0101", name: "Niveau Nappe", unite: "m" },
    {
      station_id: 1,
      code: "0102",
      name: "Niveau Cours d''eau",
      unite: "m",
    },
    {
      station_id: 1,
      code: "0103",
      name: "Vitesse Cours d''eau",
      unite: "m/s",
    },
    { station_id: 1, code: "0104", name: "Débit", unite: "l/s" },
    {
      station_id: 1,
      code: "0105",
      name: "Débit de base",
      unite: "L.s-1",
    },
    {
      station_id: 1,
      code: "0108",
      name: "Niveau Nappe sur 24h",
      unite: "m",
    },
    {
      station_id: 1,
      code: "0109",
      name: "Niveau manuel Nappe",
      unite: "m",
    },
    {
      station_id: 1,
      code: "0111",
      name: "Gradient hydraulique",
      unite: "%",
    },
    {
      station_id: 1,
      code: "0112",
      name: "Niveau Cours d''eau 15 min",
      unite: "m",
    },
    {
      station_id: 1,
      code: "0115",
      name: "Niveau Cours d''eau manuel",
      unite: "m",
    },
    {
      station_id: 1,
      code: "0120",
      name: "Pression sommet tensio (-25cm)",
      unite: "",
    },
    {
      station_id: 1,
      code: "0121",
      name: "Pression sommet tensio (-50cm)",
      unite: "",
    },
    {
      station_id: 1,
      code: "0122",
      name: "Pression sommet tensio (-100cm)",
      unite: "",
    },
    {
      station_id: 1,
      code: "0123",
      name: "Pression sommet tensio (-150cm)",
      unite: "",
    },
    {
      station_id: 1,
      code: "0124",
      name: "Pression sommet tensio (-200cm)",
      unite: "",
    },
    {
      station_id: 1,
      code: "0125",
      name: "Pression sommet tensio (-250cm)",
      unite: "",
    },
    {
      station_id: 1,
      code: "0130",
      name: "Pression capillaire (-25cm)",
      unite: "",
    },
    {
      station_id: 1,
      code: "0131",
      name: "Pression capillaire (-50cm)",
      unite: "",
    },
    {
      station_id: 1,
      code: "0132",
      name: "Pression capillaire (-100cm)",
      unite: "",
    },
    {
      station_id: 1,
      code: "0133",
      name: "Pression capillaire (-150cm)",
      unite: "",
    },
    {
      station_id: 1,
      code: "0134",
      name: "Pression capillaire (-200cm)",
      unite: "",
    },
    {
      station_id: 1,
      code: "0135",
      name: "Pression capillaire (-250cm)",
      unite: "",
    },
    {
      station_id: 1,
      code: "0140",
      name: "Charge totale (-25cm)",
      unite: "",
    },
    {
      station_id: 2,
      code: "0141",
      name: "Charge totale (-50cm)",
      unite: "",
    },
    {
      station_id: 2,
      code: "0142",
      name: "Charge totale (-100cm)",
      unite: "",
    },
    {
      station_id: 2,
      code: "0143",
      name: "Charge totale (-150cm)",
      unite: "",
    },
    {
      station_id: 2,
      code: "0144",
      name: "Charge totale (-200cm)",
      unite: "",
    },
    {
      station_id: 2,
      code: "0145",
      name: "Charge totale (-250cm)",
      unite: "",
    },
    {
      station_id: 2,
      code: "0201",
      name: "Température de l''eau",
      unite: "°C",
    },
    {
      station_id: 2,
      code: "0202",
      name: "Température de l''air",
      unite: "°C",
    },

    // {
    //   station_id: 2,
    //   code: "X222",
    //   name: "Pipo",
    //   unite: "bordel",
    // },
    // {
    //   station_id: 2,
    //   code: "X305",
    //   name: "Pipo",
    //   unite: "bordel",
    // },

    // {
    //   station_id: 2,
    //   code: "X703",
    //   name: "Pipo",
    //   unite: "bordel",
    // },

    // {
    //   station_id: 2,
    //   code: "X211",
    //   name: "Pipo",
    //   unite: "bordel",
    // },

    // {
    //   station_id: 2,
    //   code: "0205",
    //   name: "Pipo",
    //   unite: "bordel",
    // },
    // {
    //   station_id: 2,
    //   code: "0224",
    //   name: "Pipo",
    //   unite: "bordel",
    // },

    // {
    //   station_id: 2,
    //   code: "X102",
    //   name: "Pipo",
    //   unite: "bordel",
    // },

    // {
    //   station_id: 2,
    //   code: "X304",
    //   name: "Pipo",
    //   unite: "bordel",
    // },
    // {
    //   station_id: 2,
    //   code: "X701",
    //   name: "Pipo",
    //   unite: "bordel",
    // },
    // {
    //   station_id: 2,
    //   code: "0701",
    //   name: "Pipo",
    //   unite: "bordel",
    // },

    // {
    //   station_id: 2,
    //   code: "X702",
    //   name: "Pipo",
    //   unite: "bordel",
    // },

    // {
    //   station_id: 2,
    //   code: "W701",
    //   name: "Pipo",
    //   unite: "bordel",
    // },
  ]);
};
