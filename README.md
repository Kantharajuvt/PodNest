# PodNest - AI-Powered Recording Studio & Whiteboard

PodNest is a professional recording studio and podcasting platform designed for creators. It features a high-performance recording environment, integrated real-time collaboration tools, and a dynamic "Live Explain" whiteboard.

## 🚀 Key Features

### 🎙️ Recording Studio
- **High-Quality Audio Stage**: Real-time audio visualization and multi-participant support.
- **Smart Side Panel**: Integrated Chat, People management, and Notes.
- **Invite System**: Easily invite participants via email or unique studio links.

### 🎨 Live Explain (Whiteboard)
- **Interactive Tools**: Pen, Highlighter, Eraser, and dedicated Text annotations.
- **Native Selection**: Crop, Enlarge, or edit specific regions of the canvas.
- **Canva Integration**: Direct access to Canva for professional design and asset creation.
- **Optimized for Studio**: Built specifically to fit within the recording stage side panel.

### 💳 Subscription & Billing
- **Multiple Providers**: Integration with Cashfree and Razorpay for seamless payments.
- **Plan Management**: Support for tiered pricing and subscription lifecycles.

## 🛠️ Tech Stack

### Frontend
- **React 19 / Vite**: Modern, fast frontend development.
- **Tailwind CSS**: Utility-first styling with custom corporate aesthetics.
- **Framer Motion**: Smooth animations and interactive UI transitions.
- **Lucide React**: Premium iconography.

### Backend
- **Spring Boot**: Robust Java-based backend architecture.
- **JPA / Hibernate**: Professional database ORM.
- **MySQL**: Relational data storage.
- **JUnit**: Comprehensive testing framework.

## 🏁 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Kantharajuvt/PodNest.git
   cd PodNest
   ```

2. **Backend Setup**:
   - Configure `backend/src/main/resources/application.properties` with your DB credentials.
   - Run via Maven or your IDE.

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🚀 Deployment (Render + Docker)

To deploy the backend to Render:
1. Create a new **Web Service**.
2. Connect your GitHub repository.
3. Set **Runtime** to `Docker`.
4. Set **Root Directory** to `backend`.
5. Add your environment variables in the Render dashboard.

## 📄 License
This project is licensed under the MIT License.
