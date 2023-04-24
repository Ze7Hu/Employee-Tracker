// Import and require mysql2
const mysql = require("mysql2");
require("console.table");
const inquirer = require("inquirer");

// Connect to database
const connection = mysql.createConnection(
  {
    host: "localhost",
    // MySQL username,
    user: "root",
    // MySQL password
    password: "hussein123",
    database: "company_db",
  },
  console.log(`Connected to the company_db database.`)
);

/* === || START APPLICATION || === */
// banner
console.log(`╔═════════════════════════════════════════════════════╗
║                                                     ║
║     _____                 _                         ║
║    | ____|_ __ ___  _ __ | | ___  _   _  ___  ___   ║
║    |  _| | '_ \` _ \\| '_ \\| |/ _ \\| | | |/ _ \\/ _ \\  ║
║    | |___| | | | | | |_) | | (_) | |_| |  __/  __/  ║
║    |_____|_| |_| |_| .__/|_|\\___/ \\__, |\\___|\\___|  ║
║                    |_|            |___/             ║
║                                                     ║
║     __  __                                          ║
║    |  \\/  | __ _ _ __   __ _  __ _  ___ _ __        ║
║    | |\\/| |/ _\` | '_ \\ / _\` |/ _\` |\/ _ \\ '__|       ║
║    | |  | | (_| | | | | (_| | (_| |  __/ |          ║
║    |_|  |_|\\__,_|_| |_|\\__,_|\\__, |\\___|_|          ║
║                              |___/                  ║
║                                                     ║
\╚═════════════════════════════════════════════════════╝
`);

connection.connect(function (err) {
  if (err) throw err;
});

function start() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "options",
        message: "What would you like to do?",
        choices: [
          "View All Employees",
          "Add Employee",
          "Update Employee Role",
          "View All Roles",
          "Add Role",
          "View All Departments",
          "Add Department",
          "Remove Department",
          "Remove Employee",
          "Remove Role",
          "Quit",
        ],
      },
    ])
    .then(function (res) {
      switch (res.options) {
        case "View All Employees":
          viewAllEmployees();
          break;

        case "Add Employee":
          addEmployee();
          break;

        case "Update Employee Role":
          updateEmployeeRole();
          break;

        case "View All Roles":
          viewAllRoles();
          break;

        case "Add Role":
          addRole();
          break;

        case "View All Departments":
          viewAllDepartments();
          break;

        case "Add Department":
          addDepartment();
          break;

        case "Remove Department":
          removeDepartment();
          break;

        case "Remove Employee":
          removeEmployee();
          break;

        case "Remove Role":
          removeRole();
          break;

        case "Quit":
          console.log("------------------------");
          console.log("Thank you for using Employee Tracker!");
          console.log("------------------------");
          break;
      }
    });
}

// View departments
function viewAllDepartments() {
  //   WHEN I choose to view all departments
  // THEN I am presented with a formatted table showing department names and department ids

  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    console.table(res);
    start();
  });
}

// View employees
function viewAllEmployees() {
  connection.query(
    "SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name, CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id left join employee e on employee.manager_id = e.id;",
    function (err, res) {
      if (err) throw err;
      console.table(res);
      start();
    }
  );
}

// View roles
function viewAllRoles() {
  //   WHEN I choose to view all roles
  // THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role

  connection.query(
    "SELECT role.title, role.id, department.name, role.salary FROM role LEFT JOIN department ON role.department_id = department.id;",
    function (err, res) {
      if (err) throw err;
      console.table(res);
      start();
    }
  );
}

// Add departments
const addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "newDep",
        message: "What is the name of the department?",
      },
    ])
    .then((res) => {
      connection.query(
        "INSERT INTO department SET ?",
        {
          name: res.newDep,
        },
        function (err, res) {
          if (err) throw err;
          console.log("these are the current departments: ");

          start();
        }
      );
    });
};

// Add employees
const addEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: "What is the employee's first name?",
      },
      {
        type: "input",
        name: "lastName",
        message: "What is the employee's last name?",
      },
    ])
    .then((answer) => {
      const crit = [answer.firstName, answer.lastName];
      const roleSql = `SELECT role.id, role.title FROM role`;
      connection.query(roleSql, (error, data) => {
        if (error) throw error;
        const roles = data.map(({ id, title }) => ({ name: title, value: id }));
        inquirer
          .prompt([
            {
              type: "list",
              name: "role",
              message: "What is the employee's role?",
              choices: roles,
            },
          ])
          .then((roleChoice) => {
            const role = roleChoice.role;
            crit.push(role);
            const managerSql = `SELECT * FROM employee`;
            connection.query(managerSql, (error, data) => {
              if (error) throw error;
              const managers = data.map(({ id, first_name, last_name }) => ({
                name: first_name + " " + last_name,
                value: id,
              }));
              inquirer
                .prompt([
                  {
                    type: "list",
                    name: "manager",
                    message: "Who is the employee's manager?",
                    choices: managers,
                  },
                ])
                .then((managerChoice) => {
                  const manager = managerChoice.manager;
                  crit.push(manager);
                  const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                  VALUES (?, ?, ?, ?)`;
                  connection.query(sql, crit, (error) => {
                    if (error) throw error;
                    console.log("");
                    console.log("-------Employee successfully added!-------");
                    console.log("");
                    start();
                    start();
                  });
                });
            });
          });
      });
    });
};

// Add a role
function addRole() {
  let query = "SELECT * FROM department";
  connection.query(query, (err, result) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: "input",
          message: "What is the name of the role?",
          name: "title",
        },
        {
          type: "number",
          message: "What is the salary of the role?",
          name: "salary",
        },
        {
          type: "list",
          message: "Which department does the role belong to?",
          choices: () => {
            const choices = [];
            for (let i = 0; i < result.length; i++) {
              choices.push(result[i].name);
            }
            return choices;
          },
          name: "department",
        },
      ])
      .then((answer) => {
        let dept_id;
        for (let i = 0; i < result.length; i++) {
          if (result[i].name === answer.department) {
            dept_id = result[i].id;
          }
        }
        query =
          "INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)";
        connection.query(
          query,
          [answer.title, answer.salary, dept_id],
          (err, res) => {
            if (err) throw err;

            start();
          }
        );
      });
  });
}

// Update employee role
function updateEmployeeRole() {
  connection.query("SELECT * FROM employee", (err, res) => {
    if (err) throw err;
    let dept = res[0].department_id;
    inquirer
      .prompt([
        {
          type: "list",
          message: "Which employee would you like to update?",
          choices: () => {
            const choices = [];
            for (let i = 0; i < res.length; i++) {
              choices.push(res[i].first_name + " " + res[i].last_name);
            }
            return choices;
          },
          name: "fullName",
        },
      ])
      .then((answers) => {
        connection.query("SELECT * FROM role", (err, res) => {
          if (err) throw err;

          inquirer
            .prompt([
              {
                type: "list",
                message: "Choose a new role",
                choices: () => {
                  const choices = [];
                  for (let i = 0; i < res.length; i++) {
                    choices.push(res[i].title);
                  }
                  return [...new Set(choices)];
                },
                name: "role",
              },
            ])
            .then((answer) => {
              connection.query("SELECT * FROM role", (err, res) => {
                if (err) throw err;
                let role_id;
                for (let i = 0; i < res.length; i++) {
                  if (answer.role === res[i].title) {
                    role_id = res[i].id;
                  }
                }
                let firstName = answers.fullName.split(" ")[0];
                let lastName = answers.fullName.split(" ")[1];
                connection.query(
                  "UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ?",
                  [role_id, firstName, lastName],
                  (err, res) => {
                    if (err) throw err;
                    start();
                  }
                );
              });
            });
        });
      });
  });
}

// function handling removing employee from database
function removeEmployee() {
  connection.query(
    `SELECT  CONCAT(employee.first_name,' ',employee.last_name) as Fullname ,employee.id FROM employee`,
    function (err, res) {
      if (err) throw err;

      inquirer
        .prompt([
          {
            name: "remove",
            type: "list",
            message: "Which Employee would you like to remove?",
            choices: function () {
              let employeeChoices = [];
              for (var i = 0; i < res.length; i++) {
                employeeChoices.push(
                  "ID:" + res[i].id + "  " + res[i].Fullname
                );
              }
              return employeeChoices;
            },
          },
        ])
        .then(function () {
          let chosenEmployee;
          for (var i = 0; i < res.length; i++) {
            chosenEmployee = res[i].id;
          }
          connection.query(
            "DELETE FROM employee WHERE id = ?",
            chosenEmployee,
            function (err, res) {
              if (err) throw err;
              console.log("");
              console.log("----- Employee has been removed! ----");
              console.log("");
              start();
            }
          );
        });
    }
  );
}

// function  handling removing department from database
function removeDepartment() {
  inquirer
    .prompt([
      {
        name: "department_id",
        type: "number",
        message:
          "Please enter the id of the department you want to delete from the database.",
      },
    ])
    .then(function (response) {
      connection.query(
        "DELETE FROM department WHERE id = ?",
        [response.department_id],
        function (err, data) {
          if (err) throw err;
          console.log(
            "The department entered has been deleted successfully from the database."
          );

          connection.query(`SELECT * FROM department`, (err, result) => {
            if (err) {
              res.status(500).json({ error: err.message });
              start();
            }
            console.table(result);
            start();
          });
        }
      );
    });
}

// function  handling removing role from database
function removeRole() {
  inquirer
    .prompt([
      {
        name: "role_id",
        type: "number",
        message:
          "Please enter the id of the role you want to delete from the database",
      },
    ])
    .then(function (response) {
      connection.query(
        "DELETE FROM role WHERE id = ?",
        [response.role_id],
        function (err, data) {
          if (err) throw err;
          console.log("Role has been successfully deleted from the database.");

          connection.query(`SELECT * FROM role`, (err, result) => {
            if (err) {
              res.status(500).json({ error: err.message });
              start();
            }
            console.table(result);
            start();
          });
        }
      );
    });
}

start();
