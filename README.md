# Souk-Data-Mining

Souk-Data-Mining is an open-source, full-stack web application designed to collect, analyze, and visualize real-time food price data from local weekly rural markets (souks) in Morocco using a participatory crowdsourcing approach.

This software accompanies the scientific publication: *"Souk-Data-Mining: A Citizen-Driven Web Platform for Food Price Monitoring and Inflation Analysis in Rural Markets"*.

## Key Features
- **Crowdsourced Data Collection:** Geocoded mobile-friendly forms for price entry.
- **Analytical Engine:** Statistical anomaly detection (Z-Score method) for price spikes.
- **Interactive Dashboards:** Multi-market price comparisons and temporal trend charts (D3.js).
- **Geospatial Mapping:** Leaflet & OpenStreetMap interactive visualization of regional price disparities.

## Prerequisites
Before running the application, ensure you have the following installed:
- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **SQLite3** with **PostGIS** extension (or a PostgreSQL instance with PostGIS enabled)

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com
   cd Projet_Data_mining
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env.local` file in the root directory and configure your environment variables (e.g., database connection string, session secrets):
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your_secret_key"
   ```

4. **Database Initialization:**
   Run the database migrations to set up the relational schema and geospatial indexes:
   ```bash
   npm run db:setup
   ```

## Running the Application

### Development Mode
To run the local development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Production Build
To build the application for production deployment:
```bash
npm run build
npm run start
```

## Metadata & License
- **Current Version:** V1.0.0
- **License:** MIT License - see the [LICENSE](LICENSE) file for details.
- **Contact Support:** medyahyatyib234@gmail.com / kadidjaabdoumisso@gmail.com
