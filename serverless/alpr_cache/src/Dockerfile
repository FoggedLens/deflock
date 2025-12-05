# Use the official AWS Lambda Python 3.14 base image from public ECR
FROM public.ecr.aws/lambda/python:3.14-arm64

# Copy function code
COPY alpr_cache.py ${LAMBDA_TASK_ROOT}

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Set the CMD to your handler
CMD ["alpr_cache.lambda_handler"]
