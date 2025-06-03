const express = require("express")
const mysql = require("mysql2/promise")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cors = require("cors")
const path = require("path")

const app = express()
const PORT = process.env.PORT || 3306
const JWT_SECRET = process.env.JWT_SECRET || "b6203381221684dfc0504aa5bfeaa9e06ed7434ba146f02c54480b45ad785180"

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, "../")))

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "MYdatabase@2025",
  database: process.env.DB_NAME || "Santoro",
}

// Database connection
let db

async function initDatabase() {
  try {
    db = await mysql.createConnection(dbConfig)
    console.log("Connected to MySQL database")

    // Create tables if they don't exist
    await createTables()
  } catch (error) {
    console.error("Database connection failed:", error)
    process.exit(1)
  }
}

async function createTables() {
  // Users table
  await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `)

  // Reservations table
  await db.execute(`
        CREATE TABLE IF NOT EXISTS reservations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            date DATE NOT NULL,
            time VARCHAR(10) NOT NULL,
            guests INT NOT NULL,
            special_requests TEXT,
            status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
    `)
//name, email, phone, date, time, guests, special_requests
  // Menu items table
  await db.execute(`
        CREATE TABLE IF NOT EXISTS menu_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            category VARCHAR(100) NOT NULL,
            image_url VARCHAR(500),
            available BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `)

  console.log("Tabelas do banco de dados criadas com sucesso")
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Token de Acesso Necessário" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token Inválido" })
    }
    req.user = user
    next()
  })
}

// Routes

// User Registration
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Todos os campos são obrigatórios" })
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "A senha deve ter pelo menos 8 caracteres" })
    }

    // Check if user already exists
    const [existingUsers] = await db.execute("SELECT id FROM users WHERE email = ?", [email])

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email já utilizado" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const [result] = await db.execute("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
      name,
      email,
      hashedPassword,
    ])

    res.status(201).json({
      success: true,
      message: "Usuário criado com sucesso",
      userId: result.insertId,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// User Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email e senha são necessários" })
    }

    // Find user
    const [users] = await db.execute("SELECT id, name, email, password FROM users WHERE email = ?", [email])

    if (users.length === 0) {
      return res.status(401).json({ message: "Email ou Senha Inválidos" })
    }

    const user = users[0]

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({ message: "Email ou Senha Inválidos" })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" })

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Create Reservation
app.post("/api/reservations", async (req, res) => {
  try {
    const { name, email, phone, date, time, guests, specialRequests } = req.body
    const userId = req.user ? req.user.userId : null

    // Validate input
    if (!name || !email || !phone || !date || !time || !guests) {
      return res.status(400).json({ message: "Todos os campos obrigatórios devem ser fornecidos" })
    }

    // Validate date is not in the past
    const reservationDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (reservationDate < today) {
      return res.status(400).json({ message: "A data da reserva não pode estar no passado" })
    }

    // Create reservation
    const [result] = await db.execute(
      `INSERT INTO reservations (user_id, name, email, phone, date, time, guests, special_requests, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [userId, name, email, phone, date, time, guests, specialRequests || ""],
    )

    res.status(201).json({
      success: true,
      message: "Reserva criada com Sucesso",
      reservationId: result.insertId,
    })
  } catch (error) {
    console.error("Reservation creation error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Get User Reservations
app.get("/api/reservations", authenticateToken, async (req, res) => {
  try {
    const [reservations] = await db.execute(
      `SELECT id, date, time, guests, status, special_requests, created_at 
             FROM reservations 
             WHERE user_id = ? 
             ORDER BY date DESC`,
      [req.user.userId],
    )

    res.json({
      success: true,
      reservations,
    })
  } catch (error) {
    console.error("Get reservations error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Cancel Reservation
app.put("/api/reservations/:id/cancel", authenticateToken, async (req, res) => {
  try {
    const reservationId = req.params.id

    // Check if reservation belongs to user
    const [reservations] = await db.execute("SELECT id, status FROM reservations WHERE id = ? AND user_id = ?", [
      reservationId,
      req.user.userId,
    ])

    if (reservations.length === 0) {
      return res.status(404).json({ message: "Reserva não encontrada" })
    }

    if (reservations[0].status === "cancelled") {
      return res.status(400).json({ message: "Reserva já foi cancelada" })
    }

    // Update reservation status
    await db.execute('UPDATE reservations SET status = "cancelled" WHERE id = ?', [reservationId])

    res.json({
      success: true,
      message: "Reserva cancelada com sucesso",
    })
  } catch (error) {
    console.error("Cancel reservation error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Get Menu Items
app.get("/api/menu", async (req, res) => {
  try {
    const [menuItems] = await db.execute(
      "SELECT id, name, description, price, category, image_url FROM menu_items WHERE available = TRUE ORDER BY category, name",
    )

    res.json({
      success: true,
      menuItems,
    })
  } catch (error) {
    console.error("Get menu error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
})

// Serve static files
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../index.html"))
})

// Start server
async function startServer() {
  await initDatabase()

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Visit http://localhost:${PORT} to view the website`)
  })
}

startServer().catch(console.error)
