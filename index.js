const express = require("express")
const morgan = require("morgan")
const cors = require("cors")

const Contact = require("./mongo")

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" })
  }
  next(error)
}

const app = express()
const PORT = process.env.PORT || 3001
app.use(cors())
app.use(express.json())
morgan.token("body", (req, res) => JSON.stringify(req.body))
app.use(
  morgan(
    ":method :url :status :response-time ms - :res[content-length] :body - :req[content-length]"
  )
)
app.use(errorHandler)

app.get("/api/persons/:id", (request, response, next) => {
  Contact.findById(request.params.id)
    .then((contact) => {
      if (contact) {
        response.json(contact)
      } else {
        response.status(404).end()
      }
    })
    .catch((err) => {
      next(err)
    })
})

app.put("/api/persons/:id", (request, response, next) => {
  const query = { _id: request.params.id }
  Contact.findOneAndUpdate(
    query,
    { number: request.body.number },
    { new: true }
  )
    .then((res) => {
      response.json(res)
    })
    .catch((err) => {
      console.log(err)
      next()
    })
})

app.get("/api/persons", (request, response) => {
  Contact.find({}).then((result) => {
    response.json(result)
  })
})

app.post("/api/persons", (request, response, next) => {
  const newPerson = new Contact({
    name: request.body.name,
    number: request.body.number,
  })
  if (!newPerson.number || !newPerson.name) {
    response.status(400).send({
      error: "Fill the missing areas",
    })
  } else {
    newPerson
      .save()
      .then((result) => {
        console.log(`${newPerson.name} saved to phonebook`)
        response.json(newPerson)
      })
      .catch((error) => {
        response.status(400).send(error)
      })
  }
})

app.get("/api/info", (request, response) => {
  const date = new Date()

  Contact.find({})
    .then((result) => {
      console.log(result)
      response.send(
        `Phonebook has info for ${result.length} people <br /> <br /> ${date}`
      )
    })
    .catch((err) => console.log(err))
})

app.delete("/api/persons/:id", (request, response, next) => {
  Contact.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).send(result)
    })
    .catch((err) => next(err))
})

app.listen(PORT, () => {
  console.log("Server is running on port 3001")
})
