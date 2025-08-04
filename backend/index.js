// backend/index.js
import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/appointments', appointmentRoutes)

app.use(errorHandler)

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('Server running')))
  .catch(err => console.error('MongoDB connection error:', err))


// models/User.js
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['patient', 'doctor'], required: true },
})

export default mongoose.model('User', userSchema)


// models/Appointment.js
import mongoose from 'mongoose'

const appointmentSchema = new mongoose.Schema({
  patientEmail: { type: String, required: true },
  doctorEmail: { type: String, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
})

export default mongoose.model('Appointment', appointmentSchema)


// controllers/authController.js
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ message: 'User already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = await User.create({ email, password: hashedPassword, role })
    res.status(201).json({ message: 'User created' })
  } catch (err) {
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(400).json({ message: 'User not found' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(400).json({ message: 'Invalid credentials' })

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET)
    res.json({ token, email: user.email, role: user.role })
  } catch (err) {
    next(err)
  }
}


// controllers/appointmentController.js
import Appointment from '../models/Appointment.js'

export const createAppointment = async (req, res, next) => {
  try {
    const { doctorEmail, date } = req.body
    const appointment = await Appointment.create({
      doctorEmail,
      date,
      patientEmail: req.user.email
    })
    res.status(201).json(appointment)
  } catch (err) {
    next(err)
  }
}

export const getAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patientEmail: req.user.email })
    res.json(appointments)
  } catch (err) {
    next(err)
  }
}

export const getDoctorAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ doctorEmail: req.user.email })
    res.json(appointments)
  } catch (err) {
    next(err)
  }
}

export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const updated = await Appointment.findByIdAndUpdate(id, { status }, { new: true })
    res.json(updated)
  } catch (err) {
    next(err)
  }
}


// middleware/authMiddleware.js
import jwt from 'jsonwebtoken'

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'No token provided' })

  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' })
    req.user = user
    next()
  })
}


// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error(err)
  res.status(500).json({ message: err.message || 'Something went wrong' })
}


// routes/authRoutes.js
import express from 'express'
import { login, register } from '../controllers/authController.js'
const router = express.Router()

router.post('/register', register)
router.post('/login', login)

export default router


// routes/appointmentRoutes.js
import express from 'express'
import {
  createAppointment,
  getAppointments,
  getDoctorAppointments,
  updateAppointmentStatus
} from '../controllers/appointmentController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)
router.post('/', createAppointment)
router.get('/', getAppointments)
router.get('/doctor', getDoctorAppointments)
router.patch('/:id', updateAppointmentStatus)

export default router
