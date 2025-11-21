# Use the official AWS Lambda Python 3.14 base image
FROM amazon/aws-lambda-python:3.14-x86_64

# Copy function code
COPY alpr_clusters.py ${LAMBDA_TASK_ROOT}

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Set the CMD to your handler
CMD ["alpr_clusters.lambda_handler"]
