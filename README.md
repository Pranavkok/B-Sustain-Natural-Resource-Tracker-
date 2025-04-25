# 🌱 Bsustain – Track. Conserve. Earn Eco Points.

**Bsustain** is a sustainability-focused web app that allows users to track their daily consumption of water, electricity, and fuel while rewarding them with points for eco-friendly actions like planting trees and recycling. It promotes environmentally conscious behavior by encouraging users to log their usage and contribute to a greener planet.

---

## 📚 Table of Contents

- [🌟 Features](#-features)
- [🛠 Tech Stack](#-tech-stack)
- [📦 Installation](#-installation)
- [🚀 Usage Guide](#-usage-guide)
- [📁 Project Structure](#-project-structure)
- [🤝 Contributing](#-contributing)
- [📃 License](#-license)

---

## 🌟 Features

### ✅ User Authentication
- Secure registration and login system
- JWT-based token authentication stored in cookies

### 🏠 Homepage
- Navigation links to different sections
- Overview of user stats and progress (in development)

### 💧 Input Page

#### 1. Water Consumption
- Input your water usage and select from units: Bucket, Liter, Glass, etc.
- Automatically converted to liters and stored
- Weekly and cumulative stats recorded

#### 2. Electricity Consumption
- Enter your current meter reading
- Usage is auto-calculated based on difference from previous entry

#### 3. Fuel Consumption
- Enter travel distance by providing From and To locations
- Choose your transport mode: petrol car, diesel car, public transport, etc.
- Points awarded based on eco-friendliness and distance

#### 4. Other Contributions
- Upload proof of sustainable actions like:
  - Planting trees 🌳
  - Recycling waste ♻️
  - Cleaning public places 🧹
- Points are awarded manually or via admin system (future enhancement)

### 🏅 Badges Page
- Visual display of locked/unlocked badges based on eco-actions and streaks

### 🏆 Leaderboard Page
- View top users based on eco-points
- See your personal ranking and total score

### 👤 Profile Page
- Shows profile info: name, email, city, streak, rank, points
- Option to submit and view feedback from others

---

## 🛠 Tech Stack

| Category       | Tech Used           |
|----------------|---------------------|
| Frontend       | EJS, HTML, CSS      |
| Backend        | Node.js, Express.js |
| Database       | MongoDB (Mongoose)  |
| Authentication | JWT + Cookies       |
| Styling        | Basic CSS           |
| File Upload    | Multer              |

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/bsustain.git
cd bsustain/server
