# Use the official AWS Lambda Python 3.13 base image from public ECR
FROM public.ecr.aws/lambda/python:3.13-arm64

# Copy function code
COPY alpr_counts.py ${LAMBDA_TASK_ROOT}

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Set the CMD to your handler
CMD ["alpr_counts.lambda_handler"]
