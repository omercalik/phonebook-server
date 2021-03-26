const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator")
require("dotenv").config()

const url = process.env.MONGO_URL

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    required: true,
    unique: true,
  },
  number: {
    type: String,
    required: true,
    minlength: 10,
  },
})

contactSchema.plugin(uniqueValidator, { type: "mongoose-unique-validator" })

contactSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model("Contact", contactSchema)
