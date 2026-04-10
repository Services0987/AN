# Use Node.js
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy all files
COPY . .

# Move into backend, install, and build
RUN cd backend && npm install

# Match the port you set in Back4app
EXPOSE 8080

# Run the backend
CMD ["sh", "-c", "cd backend && npm start"]
