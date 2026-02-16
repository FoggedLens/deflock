#!/bin/bash

ECR_REPO_URL=912821578123.dkr.ecr.us-east-1.amazonaws.com/alpr_cache-lambda

set -e

# check if AWS role is assumed
if ! aws sts get-caller-identity &> /dev/null; then
  echo "Error: AWS role is not assumed. Please assume the necessary role and try again."
  exit 1
fi

cd src

# login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REPO_URL

# build and push Docker image to ECR for ARM64 using legacy format
docker buildx build --platform linux/arm64 -t $ECR_REPO_URL:latest --load .
docker push $ECR_REPO_URL:latest

# update lambda function
export AWS_PAGER=""
aws lambda update-function-code --function-name alpr_cache --image-uri $ECR_REPO_URL:latest

echo "Deployed!"
