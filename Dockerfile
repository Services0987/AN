# 1. Use Node.js
FROM node:18-alpine

# 2. Set the working directory
WORKDIR /app

# 3. Copy everything
COPY . .

# 4. Install dependencies specifically INSIDE the backend folder
RUN cd backend && npm install

# 5. Set the port (Back4app uses 8080 by default)
EXPOSE 8080

# 6. Start the server from the backend folder
CMD ["sh", "-c", "cd backend && npm start"]
