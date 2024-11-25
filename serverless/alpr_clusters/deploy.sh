#!/bin/bash

ECR_REPO_URL=912821578123.dkr.ecr.us-east-1.amazonaws.com/alpr_clusters-lambda

set -e

# check if AWS role is assumed
if ! aws sts get-caller-identity &> /dev/null; then
  echo "Error: AWS role is not assumed. Please assume the necessary role and try again."
  exit 1
fi

cd src

# build Docker image
docker build -t alpr_clusters .

# tag docker image with ECR repo
docker tag alpr_clusters:latest $ECR_REPO_URL:latest

# login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REPO_URL

# push Docker image to ECR
docker push $ECR_REPO_URL:latest

# update lambda function
export AWS_PAGER=""
aws lambda update-function-code --function-name alpr_clusters --image-uri $ECR_REPO_URL:latest

echo "Deployed!"
