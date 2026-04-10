# 1. Build Stage: Use Node to install dependencies from the frontend folder
FROM node:18-alpine

# 2. Set the working directory
WORKDIR /app

# 3. Copy everything into the container
COPY . .

# 4. Install dependencies using the package.json found in the frontend folder
RUN cd frontend && npm install

# 5. Expose the port your server uses (ensure this matches your code)
EXPOSE 8080

# 6. Start the server located in the backend folder
# This command goes into 'backend' and runs the server directly
CMD ["node", "backend/server.js"]
