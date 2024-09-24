module.exports = (srv) => {
  const { Locations, Categories } = cds.entities("my.employees");

  srv.on("CREATE", "Locations", async (req) => {
    const result = await INSERT.into(Locations).entries(req.data);
    return result;
  });

  srv.on("CREATE", "Categories", async (req) => {
    const result = await INSERT.into(Categories).entries(req.data);
    return result;
  });
};
