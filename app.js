const ForApp = require("express");
const app = ForApp();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let forDb = null;
const path = require("path");
const ForFile = path.join(__dirname, "todoApplication.db");
app.use(ForApp.json());
const forInitialize = async () => {
  try {
    forDb = await open({
      filename: ForFile,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Found");
    });
  } catch (e) {
    console.log("Error Occured");
    process.exit(1);
  }
};
forInitialize();

//1
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query): //if this is true then below query is taken in the code
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}'
    AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%'
    AND status = '${status}';`;
      break;
    default:
      getTodosQuery = `
   SELECT
    *
   FROM
    todo 
   WHERE
    todo LIKE '%${search_q}%';`;
  }

  data = await forDb.all(getTodosQuery);
  response.send(data);
});

///2
//GET
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const ForQuery2 = `
    SELECT 
    *
    FROM todo
    WHERE id=${todoId};`;

  const forRes = await forDb.get(ForQuery2);
  response.send(forRes);
});

///3
app.post("/todos/", async (request, response) => {
  const body = request.body;
  const { id, todo, priority, status } = body;
  const forQuery3 = `INSERT INTO todo (id,todo,priority,status)
    VALUES (${id},
        '${todo}','${priority}','${status}'
        );`;
  const res3 = await forDb.run(forQuery3);
  response.send("Todo Successfully Added");
});

///4
//PUT
app.put("todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  let updateColumn = "";
  const requestBody = request.body;
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = "Status";
      break;
    case requestBody.priority !== undefined:
      updateColumn = "Priority";
      break;
    case requestBody.todo !== undefined:
      updateColumn = "Todo";
      break;
  }
  const previousTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const previousTodo = await forDb.get(previousTodoQuery);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body;
  const updateTodoQuery = `
    UPDATE 
    todo
    SET 
    todo='${todo}',
    priority='${priority}',
    status='${status}'

    WHERE id =${todoId};`;
  await forDb.run(updateTodoQuery);
  response.send(`${updateColumn} Updated`);
});

///5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const forDel = ` DELETE  FROM  todo
    WHERE id=${todoId}`;
  const final = await forDb.get(forDel);
  response.send("Todo Deleted");
});
module.exports = ForApp;
