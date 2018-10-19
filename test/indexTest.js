const HapiSass = require('../index')
const Inert = require('inert')
const expect = require('chai').expect
const Hapi = require('hapi')

describe("Hapi-Sass", () => {
  describe("register", () => {
    it("creates a route for the plugin", async () => {
      const server = new Hapi.Server();
      const err = await server.register([
        Inert,
        {
          plugin: HapiSass,
          options: {}
        }
      ])

      expect(err).to.not.exist;
      await server.start();
      const tables = server.table()
      expect(tables.length).to.be.greaterThan(0);

      const route = tables[0].path
      expect(route).to.exist;
      expect(route).to.equal("/css/{file}.css");
    });
  });
});
