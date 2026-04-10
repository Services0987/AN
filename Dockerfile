# 1. Use Node.js
FROM node:18-alpine

# 2. Set work directory
WORKDIR /app

# 3. Copy only the necessary folders
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# 4. Install dependencies using the --legacy-peer-deps flag to fix the error
RUN cd frontend && npm install --legacy-peer-deps

# 5. Set the port (Ensure this is 8080 in Back4app settings)
EXPOSE 8080

# 6. Start the server directly
CMD ["node", "backend/server.js"]
