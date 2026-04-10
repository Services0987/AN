# 1. Use a very small Node image to save space
FROM node:18-alpine

# 2. Set work directory
WORKDIR /app

# 3. ONLY copy the backend folder and the frontend's package files
# This stops the container from getting too heavy
COPY backend/ ./backend/
COPY frontend/package*.json ./frontend/

# 4. Install dependencies inside the frontend folder
RUN cd frontend && npm install --production

# 5. Set the port (Ensure this is 8080 in Back4app settings)
EXPOSE 8080

# 6. Start the server directly
CMD ["node", "backend/server.js"]
