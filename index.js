const express = require("express");
const app = express();
const morgan = require("morgan");//morgan middleware invoque 
const cors = require('cors')

morgan.token('addPerson', (req,res)=>{
  console.log(req.method)
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return null
})

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(cors())
app.use(express.json());
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :addPerson'))
app.use(requestLogger)
app.use(express.static('build'))


let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Phonebook-app (backEnd) </h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (request, response) => {
  const people = persons.length;
  const currentDate = new Date();
  console.log(people);
  console.log(currentDate);
  response.send(
    `<p>Phonebook has info for ${people} people <br> ${currentDate} / <p>`
  );
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  console.log(person);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

const generateId = () => {
  const minId = 1;
  const maxId = 1000;
  const randomId = Math.floor(Math.random() * maxId - minId + 1) + minId;

  return randomId;
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  const nameExist = persons.filter((person) => person.name === body.name);

  if (!body.name || !body.number) {
    console.log(generateId());
    return response.status(400).json({
      error: "name or number missing",
    });
  } else if (nameExist) {
    console.log(nameExist);
    return response.status(400).json({
      error: "This name already exist on the phonebook ",
    });
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  };

  persons = persons.concat(person);

  console.log(person);
  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

