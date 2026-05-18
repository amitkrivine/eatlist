const morgan = require("morgan");

const routeDescriptions = {
    // restaurant events
    "GET /api/restaurants": "fetch all restaurants",
    "GET /api/restaurants/:id": "fetch restaurant by id",
    "POST /api/restaurants/": "restaurant added",
    "PATCH /api/restaurants/:id": "restaurant liked/unliked",
    "PUT /api/restaurants/:id": "restaurant updated",
    "DELETE /api/restaurants/:id": "restaurant deleted",
    // eatlist events
    "GET /api/eatlists": "fetch all eatlists",
    "GET /api/eatlists/:id": "fetch all eatlists",
    "POST /api/eatlists": "eatlist created",
    "PATCH /api/eatlists/:id/update": "eatlist updated",
    "PATCH /api/eatlists/:id/follow": "eatlist followed/unfollowed",
    "POST /api/eatlists/:id/restaurants": "restaurant added to eatlist",
    "DELETE /api/eatlists/:id": "eatlist deleted",
    // users
    "POST /api/users": "user registered",
    "POST /api/users/login": "user login",
    "GET /api/users": "fetch all users",
    "GET /api/users/:id": "fetch user by id",
    "PUT /api/users/:id": "user updated",
    "DELETE /api/users/:id": "user deleted"
};

const getRouteDescription = (req) => {
    const key = `${req.method} ${req.route?.path ? req.baseUrl + req.route.path : req.path}`;
    return routeDescriptions[key] || "";
};

morgan.token("description", (req) => getRouteDescription(req));

const consoleLogger = morgan(":method :url :status :response-time ms - :res[content-length] - :description");

module.exports = { consoleLogger };