require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')//morgan middleware invoque
const cors = require('cors')
const Person = require('./models/person')

morgan.token('addPerson', (req, res) => {
  console.log(req.method)
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return null
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :addPerson'))
app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(requestLogger)

// get all persons
app.get('/api/persons', (request, response) => {
  Person.find({}).then(person => {
    response.json(person)
  })
})

//middleware for error handling
const errorHandler = (error, request, response, next ) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if(error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

/*Post a new person*/
app.post('/api/persons', (request, response, next) => {
  const body = request.body
  // const nameExist = (() =>{
  //   Person.findOne({ name: body.name })
  //     .then((person) => {
  //       if(person){
  //         console.log("Testing the message on code");
  //         return true
  //       }else{
  //         console.log("This names there is not in database");
  //         return false
  //       }
  //     })
  //     .catch((error)=> {
  //       console.log("There is aproblem to find the name");
  //     })
  //   console.log(nameExist)
  // } )

  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({
      error: 'name or number missing',
    })
  }
  // } else if (nameExist) {
  //   console.log(nameExist);
  //   return response.status(400).json({
  //     error: "This name already exist on the phonebook ",
  //   });
  // }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  console.log(person)
  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next (error))
})

/*Get a especific person by id*/
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      }else{
        response.status(404).end
      }
    })
    .catch(error => {
      console.log( error => next(error))
    })
})

/*Update a person*/
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

/*Delete a person*/
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

// const generateId = () => {
//   const minId = 1
//   const maxId = 1000
//   const randomId = Math.floor(Math.random() * maxId - minId + 1) + minId

//   return randomId
// }

app.use(errorHandler)

app.use(unknownEndpoint)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

