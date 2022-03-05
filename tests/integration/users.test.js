const request = require("supertest");
const { User } = require("../../models/User");
let server;

describe("/api/users", () => {
  beforeEach(() => {
    server = require("../../server");
  });
  afterEach(async () => {
    await User.deleteMany({});
    server.close();
  });
  // get all users test
  describe("GET /", () => {
    let token;
    let admin;
    beforeEach(async () => {
      admin = new User({
        username: "Youssef",
        email: "youssef@gmail.com",
        password: "111111111",
        isAdmin: true,
      });
      await admin.save();
      token = admin.generateAuthToken();
    });
    // execute function
    async function execute() {
      return await request(server)
        .get("/api/users")
        .set("token", `Bearer ${token}`);
    }

    it("should return all the users with status code of 200", async () => {
      const users = [
        {
          username: "hasan",
          email: "hasan@gmail.com",
          password: "111111111",
        },
        {
          username: "alireza",
          email: "alireza@gmail.com",
          password: "111111111",
        },
      ];
      await User.collection.insertMany(users);
      const res = await execute();
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(3);
    });

    it("should return 401 if the token was invalid", async () => {
      token = "invalidtoken";
      const res = await execute();
      expect(res.status).toBe(401);
    });

    it("should return 401 if no token was provided", async () => {
      const res = await request(server).get("/api/users");
      expect(res.status).toBe(401);
    });

    it("should return 403 if the user was not admin", async () => {
      token = new User().generateAuthToken();
      const res = await execute();
      expect(res.status).toBe(403);
    });
  });
  // get a user test
  describe("GET /:id", () => {
    let token;
    let id;
    let admin;
    beforeEach(async () => {
      admin = new User({
        username: "Youssef",
        email: "youssef@gmail.com",
        password: "11111111",
        isAdmin: true,
      });
      await admin.save();
      id = admin._id;
      token = admin.generateAuthToken();
    });

    const execute = async () => {
      return await request(server)
        .get(`/api/users/${id}`)
        .set("token", `Bearer ${token}`);
    };

    it("should return a 200 status if credentials was valid", async () => {
      const res = await execute();
      expect(res.status).toBe(200);
    });
    it("should return a 401 status if token was invalid", async () => {
      token = "invalidToken";
      const res = await execute();
      expect(res.status).toBe(401);
    });
    it("should return a 401 status if no token was provided", async () => {
      const res = await request(server).get(`/api/users/${id}`);
      expect(res.status).toBe(401);
    });
    it("should return a 403 if the user was not admin", async () => {
      token = new User().generateAuthToken();
      const res = await execute();
      expect(res.status).toBe(403);
    });
  });
  // delete a user test
  describe("DELETE /:id", () => {
    let token;
    let id;
    let admin;
    beforeEach(async () => {
      admin = new User({
        username: "Youssef",
        email: "youssef@gmail.com",
        password: "11111111",
        isAdmin: true,
      });
      id = admin._id;
      token = admin.generateAuthToken();
    });

    const execute = async () => {
      return await request(server)
        .delete(`/api/users/${id}`)
        .set("token", `Bearer ${token}`);
    };

    it("should return a 200 status if the credentials was valid", async () => {
      const res = await execute();
      expect(res.status).toBe(200);
    });
    it("should return a 401 status if the token was invalid", async () => {
      token = "invalidToken";
      const res = await execute();
      expect(res.status).toBe(401);
    });
    it("should return a 401 status if no token was provided", async () => {
      const res = await request(server).delete(`/api/users/${id}`);
      expect(res.status).toBe(401);
    });
    it("should return a 403 status if the user was not an admin", async () => {
      token = new User().generateAuthToken();
      const res = await execute();
      expect(res.status).toBe(403);
    });
  });
  // update a user test
  describe("PUT /:id", () => {
    let token;
    let user;
    let id;
    let name;
    beforeEach(async () => {
      user = new User({
        username: "Youssef",
        email: "youssef@gmail.com",
        password: "11111111",
        isAdmin: true,
      });
      await user.save();
      id = user._id;
      token = user.generateAuthToken();
      name = "Youssef Dan";
    });

    const execute = async () => {
      return await request(server)
        .put(`/api/users/${id}`)
        .set("token", `Bearer ${token}`)
        .send({ username: name });
    };
    it("should return a 200 and update the user if credentials was valid", async () => {
      const res = await execute();
      expect(res.status).toBe(200);
    });
    it("should return a 401 if token was invalid", async () => {
      token = "invalidToken";
      const res = await execute();
      expect(res.status).toBe(401);
    });
    it("should return a 401 if no token was provided", async () => {
      const res = await request(server).put(`/api/users/${id}`);
      expect(res.status).toBe(401);
    });
    it("should return a 403 if the user was forbidden to update", async () => {
      token = new User().generateAuthToken();
      const res = await execute();
      expect(res.status).toBe(403);
    });
    it("should return a 400 if username length was more than 70 characters", async () => {
      name = new Array(72).join("a");
      const res = await execute();
      expect(res.status).toBe(400);
    });
    it("should return a 400 if username length was less than 2 characters", async () => {
      name = "a";
      const res = await execute();
      expect(res.status).toBe(400);
    });
  });
});
