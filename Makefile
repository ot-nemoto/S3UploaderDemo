BUCKET_NAME = s3-uploader-demo-bucket
REGION = ap-northeast-1
STACK_NAME = s3-uploader-demo-stack

s3bucket:
ifneq ($(shell aws s3api list-buckets --query 'Buckets[?Name==`${BUCKET_NAME}`].Name' --output text), ${BUCKET_NAME})
	aws s3api create-bucket --bucket $(BUCKET_NAME) --region $(REGION) --create-bucket-configuration LocationConstraint=$(REGION)
endif

deploy: s3bucket
	sam package --s3-bucket $(BUCKET_NAME) --output-template-file packaged.yml
	sam deploy --template-file packaged.yml --stack-name $(STACK_NAME) --capabilities CAPABILITY_IAM

undeploy:
	aws cloudformation delete-stack --stack-name $(STACK_NAME)
	aws cloudformation wait stack-delete-complete --stack-name $(STACK_NAME)
