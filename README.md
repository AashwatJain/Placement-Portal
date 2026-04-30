# Placement Portal

A comprehensive, full-stack Placement Portal designed to manage and streamline the campus placement process. The project is divided into three main microservices: a modern React frontend, a robust Node.js backend, and a Python-based Machine Learning service for advanced features such as resume parsing and candidate evaluation.

## 🌐 Live Demo

**[Placement Portal Frontend](https://placement-portal-frontend-x18d.onrender.com/)**

## 🚀 Project Structure

The repository is organized into a monorepo-like structure with three main directories:

- `/Frontend`: The user interface built with React, Vite, and Tailwind CSS.
- `/Backend`: The core REST API built with Node.js, Express, and PostgreSQL.
- `/mlService`: A Python Flask service for machine learning tasks.

## 🛠️ Tech Stack

### Frontend
- **React 19** with **Vite**
- **Tailwind CSS v4** for styling
- **React Router DOM** for navigation
- **Firebase** for authentication/client-side integrations
- **Lucide React** for icons
- **Axios** for API calls

### Backend
- **Node.js & Express.js**
- **PostgreSQL** (`pg`) for the relational database
- **Firebase Admin** for secure backend authentication
- **Cloudinary** for cloud media/resume storage
- **Multer** for file handling
- **Nodemailer** for email notifications

### ML Service
- **Python** with **Flask**
- **Scikit-Learn & Numpy** for machine learning algorithms
- **PyPDF2** for PDF parsing (e.g., resume processing)
- **Gunicorn** for WSGI HTTP Server

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [Python 3.x](https://www.python.org/)
- [PostgreSQL](https://www.postgresql.org/)

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Placement-Portal
   ```

2. **Install Node dependencies for both Frontend and Backend:**
   From the root directory, run:
   ```bash
   npm run install:all
   ```
   *(This uses the root `package.json` script to run `npm install` in both the `frontend` and `backend` directories)*

3. **Install Python dependencies for the ML Service:**
   ```bash
   cd mlService
   python -m venv .venv
   source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
   pip install -r requirements.txt
   cd ..
   ```

## 🔐 Environment Variables

You will need to configure environment variables for both the Backend and Frontend to run correctly.

**Backend (`/Backend/.env`)**:
Typical variables required:
- PostgreSQL Database credentials
- Firebase Admin SDK credentials
- Cloudinary API keys
- Nodemailer SMTP credentials

**Frontend (`/Frontend/.env`)**:
Typical variables required:
- Backend API base URL
- Firebase client configuration

**ML Service (`/mlService/.env` - if applicable)**:
- Flask and model configuration variables

## 🚀 Running the Application

This project uses `concurrently` to run all three services simultaneously from the root directory.

*Note: Ensure your Python virtual environment inside `mlService` is created and named `.venv` as the root dev script expects this exact path.*

To start the Frontend, Backend, and ML Service together, run the following from the root directory:

```bash
npm run dev
```

This single command will:
1. Start the Node.js backend development server (`nodemon index.js`).
2. Start the Vite frontend development server.
3. Activate the Python virtual environment and start the Flask ML server (`python3 mlService/mlServer.py`).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
