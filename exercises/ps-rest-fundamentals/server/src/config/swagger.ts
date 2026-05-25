import swaggerAutogen from "swagger-autogen";
const options = {
  openapi: "3.1.0",
  autoHeaders: false,
};
const auth = {
  type: "http",
  scheme: "bearer",
};

const item = {
  id: 1,
  name: "Kayak",
  imageUrl: "http://localhost:4000/images/1.jpg",
};

const itemDetail = {
  ...item,
  description: "Go for a paddle",
  staffReview: "It's a lot of fun!",
};

const itemDTO = {
  $name: "Kayak",
  description: "Go for a paddle",
};

const customerDTO = {
  name: "Kelsey Shiratori",
  email: "ks@gmail.com",
};

const customer = {
  ...customerDTO,
  $id: "45b23d49-7297-43da-b853-3c7f42c7da6a",
};

const basicOrder = {
  $id: "262cb163-5ea4-41fa-87c1-a93fac8025c6",
  status: "Created",
  createdAt: "2024-02-08T02:32:51.630Z",
};

const docV1 = {
  info: {
    version: "v1.0.0",
    title: "Carved Rock Fitness API",
    description: "API for Rest Fundamentals course on Pluralsight",
  },
  servers: [{ url: "/api/v1" }],
  components: {
    securitySchemes: {
      bearerAuth: auth,
    },
    schemas: {
      items: [item],
      item: item,
      itemDetail: itemDetail,
      itemDTO: itemDTO,
      customers: [customer],
      customer: customer,
      customerOrders: [basicOrder],
      customerDTO: customerDTO,
    },
  },
};

const outputFile = "../../public/open_api_v1.json";
const endpointFiles = ["./src/features/v1/routes.ts"];

swaggerAutogen(options)(outputFile, endpointFiles, docV1);
