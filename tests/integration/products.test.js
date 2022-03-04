const request = require("supertest");
const { User } = require("../../models/User");
const { Product } = require("../../models/Product");
const { default: mongoose } = require("mongoose");
let server;

describe("/api/products", () => {
  beforeEach(() => {
    server = require("../../server");
  });
  afterEach(async () => {
    await Product.deleteMany({});
    await User.deleteMany({});
    server.close();
  });
  // get all products test
  describe("GET /", () => {
    it("should return all products with status code 200", async () => {
      const products = [
        {
          title: "product1",
          description: "about product1",
          price: 10,
        },
        {
          title: "product2",
          description: "about product2",
          price: 10,
        },
      ];
      await Product.collection.insertMany(products);
      const res = await request(server).get("/api/products");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some((v) => v.title === "product1")).toBeTruthy();
    });
  });
  // get single product test
  describe("GET /:id", () => {
    let product;
    let id;
    beforeEach(async () => {
      product = new Product({
        title: "carpet",
        description: "about carpet of kashan",
        price: 200,
      });
      await product.save();
      id = product._id;
    });
    // execute function
    const execute = async () => {
      return await request(server).get(`/api/products/${id}`);
    };

    it("should return status 404 if the product id was invalid", async () => {
      id = "1";
      const res = await execute();
      expect(res.status).toBe(404);
    });
    it("should return status 404 the given id was not exist in database", async () => {
      id = mongoose.Types.ObjectId();
      const res = await execute();
      expect(res.status).toBe(404);
    });
    it("should return 200 status if product id was valid", async () => {
      const res = await execute();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("title", "carpet");
    });
  });
  // delete a product test
  describe("DELETE /:id", () => {
    let token;
    let id;
    let user;
    let product;
    beforeEach(async () => {
      product = new Product({
        title: "product1",
        description: "about product1",
        price: 100,
      });
      await product.save();

      user = new User({
        username: "Youssef",
        email: "youssef@gmail.com",
        password: "11111111",
        isAdmin: true,
      });
      await user.save();

      id = product._id;
      token = user.generateAuthToken();
    });
    // execute function
    const execute = async () => {
      return await request(server)
        .delete(`/api/products/${id}`)
        .set("token", `Bearer ${token}`);
    };

    it("should return a 200 status if everything was OK", async () => {
      const res = await execute();
      expect(res.status).toBe(200);
    });
    it("should return a 401 if no token is provided", async () => {
      const res = await request(server).delete(`/api/products/${id}`);
      expect(res.status).toBe(401);
    });
    it("should return a 401 if token invalid token was passed", async () => {
      token = "invalidToken";
      const res = await execute();
      expect(res.status).toBe(401);
    });
    it("should return a 403 if the user was not admin", async () => {
      token = new User().generateAuthToken();
      const res = await execute();
      expect(res.status).toBe(403);
    });
  });
  // update a product test
  describe("PUT /:id", () => {
    let product;
    let user;
    let productId;
    let token;
    beforeEach(async () => {
      product = new Product({
        title: "product1",
        description: "about product1",
        price: 100,
      });
      await product.save();
      productId = product._id;
      user = new User({
        username: "alireza",
        email: "ali@gmail.com",
        password: "11111111",
        isAdmin: true,
      });
      await user.save();
      token = user.generateAuthToken();
    });
    // execute function
    async function execute() {
      return await request(server)
        .put(`/api/products/${productId}`)
        .set("token", `Bearer ${token}`)
        .send({ title: "product2" });
    }
    it("should update the product if user was authorized", async () => {
      const res = await execute();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("title", "product2");
    });
    it("should return 401 if token was invalid", async () => {
      token = "ivalidToken";
      const res = await execute();
      expect(res.status).toBe(401);
    });
    it("should return 401 if no token provided", async () => {
      const res = await request(server).put(`/api/products/${productId}`);
      expect(res.status).toBe(401);
    });
    it("should return 500 product id was invalid", async () => {
      productId = "1";
      const res = await execute();
      expect(res.status).toBe(500);
    });
  });
  // create new product test
  describe("POST /", () => {
    let token;
    let user;
    let product;

    beforeEach(async () => {
      user = new User({
        username: "Youssef",
        email: "youssef@gmail.com",
        password: "11111111",
        isAdmin: true,
      });
      token = user.generateAuthToken();

      product = {
        title: "new product",
        description: "about new product",
        price: 170,
      };
    });

    // execute function
    async function execute() {
      return await request(server)
        .post("/api/products")
        .set("token", `Bearer ${token}`)
        .send(product);
    }

    it("should return 201 status if user was authorized", async () => {
      const res = await execute();
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("title", "new product");
    });
    it("should return 401 if invalid token was passed", async () => {
      token = "invalidToken";
      const res = await execute();
      expect(res.status).toBe(401);
    });
    it("should return 401 if no token was provided", async () => {
      const res = await request(server).post("/api/products");
      expect(res.status).toBe(401);
    });
    it("should return 403 the user was not admin", async () => {
      token = new User().generateAuthToken();
      const res = await execute();
      expect(res.status).toBe(403);
    });
    it("should return 400 the product title have more than 70 characters", async () => {
      product.title = new Array(72).join("a");
      const res = await execute();
      expect(res.status).toBe(400);
    });
    it("should return 400 the product title have less than 5 characters", async () => {
      product.title = "1234";
      const res = await execute();
      expect(res.status).toBe(400);
    });
  });
});
