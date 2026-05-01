const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const register = async (req, res) => {
  try {
    console.log(req.body);
    const { name, username, email, password } = req.body;
    console.log(name, username, email, password);

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        message: "Name, Username, Email and Password are required!",
      });
    }

    const existingUser = await User.findOne({
      email: String(email).toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already in use, please enter a different email.",
      });
    }

    // Hash the password before save the user
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully!",
      data: {
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error while registering the user!",
    });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Username / Email and Password are required!",
      });
    }

    // $or Allows to MongoDB to search for matches in either fields (email or username)
    const user = await User.findOne({
      $or: [
        { email: String(identifier).toLowerCase() },
        { username: String(identifier) },
      ],
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(String(user._id), user.email);

    return res.json({
      message: "Login successful.",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error while logging in.",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized.",
      });
    }

    // Exclude the password from the response
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    return res.json({
      message: "Authenticated user fetched successfully.",
      data: {
        user,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error while fetching authenticated user.",
    });
  }
};

module.exports = { register, login, getProfile };
