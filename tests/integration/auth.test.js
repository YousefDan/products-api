const request = require("supertest");
const { User } = require("../../models/User");
let server;

describe("/api/auth", () => {
  let admin;
  beforeEach(async () => {
    server = require("../../server");
    admin = new User({
      username: "hasan",
      email: "hasan@gmail.com",
      password: "22222222",
      isAdmin: true,
    });
    await admin.save();
  });
  afterEach(async () => {
    await User.deleteMany({});
    server.close();
  });

  // register a user test
  describe("POST /register", () => {
    let user = {
      username: "Danial",
      email: "danial@gmail.com",
      password: "1111111111",
    };
    const execute = async () => {
      return await request(server).post("/api/auth/register").send(user);
    };
    it("should return a 201 status and register the user", async () => {
      const res = await execute();
      expect(res.status).toBe(201);
    });

    it("should return a 400 status if the password length was less than 8 characters", async () => {
      user.password = "1234";
      const res = await execute();
      expect(res.status).toBe(400);
    });
    it("should return a 400 status if the user was already registered", async () => {
      const res = await request(server).post("/api/auth/register").send(admin);
      expect(res.status).toBe(400);
    });
  });
  // login a user test
  describe("POST /login", () => {
    it("should should return a 200 status and login the user", async () => {
      const res = await request(server).post("/api/auth/login").send({
        username: "hasan",
        password: "22222222",
      });
      expect(res.status).toBe(200);
    });

    it("should should return a 400 status if username was not valid", async () => {
      const res = await request(server).post("/api/auth/login").send({
        username: "ali",
        password: "22222222",
      });
      expect(res.status).toBe(400);
    });
  });
});
