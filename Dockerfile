# Use Python
FROM python:3.10-slim

# Set work directory
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies from your backend folder
RUN pip install --no-cache-dir -r backend/requirements.txt

# Set port environment variable
ENV PORT=8000

# Expose the port
EXPOSE 8000

# Run FastAPI with uvicorn
# This points to: backend folder -> server.py file -> app variable
CMD ["uvicorn", "backend.server:app", "--host", "0.0.0.0", "--port", "8000"]
