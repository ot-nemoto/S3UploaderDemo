BUCKET_NAME = s3-uploader-demo-bucket
REGION = ap-northeast-1
STACK_NAME = s3-uploader-demo-stack

make = make --no-print-directory
email = s3-uploader-demo@example.com

create-s3-bucket4deploy:
ifneq ($(shell aws s3api list-buckets \
  --query 'Buckets[?Name==`${BUCKET_NAME}`].Name' \
  --output text), ${BUCKET_NAME})
	aws s3api create-bucket --bucket $(BUCKET_NAME) --region $(REGION) --create-bucket-configuration LocationConstraint=$(REGION)
endif

deploy: create-s3-bucket4deploy
	sam package --s3-bucket $(BUCKET_NAME) --output-template-file packaged.yml
	sam deploy --template-file packaged.yml --stack-name $(STACK_NAME) --capabilities CAPABILITY_IAM --parameter-overrides SnsSubscriptionEndpoint=${email}
	@$(make) confirm

confirm:
ifeq ($(shell aws cloudformation describe-stacks \
  --query 'Stacks[?StackName==`${STACK_NAME}`].StackName' \
  --output text 2>/dev/null), ${STACK_NAME})
	$(eval upload_api := $(shell aws cloudformation describe-stacks \
	  --stack-name ${STACK_NAME} \
	  --query 'Stacks[].Outputs[?OutputKey==`UploadApi`].OutputValue' \
	  --output text))
	$(eval sns_endpoint := $(shell aws cloudformation describe-stacks \
	  --stack-name ${STACK_NAME} \
	  --query 'Stacks[].Outputs[?OutputKey==`SnsSubscriptionEndpoint`].OutputValue' \
	  --output text))
	@echo
	@echo "> A confirmation email has been sent to the notification destination."
	@echo
	@echo "  $(sns_endpoint)"
	@echo
	@echo "> API to upgrade sample.jpg to S3."
	@echo
	@echo "  curl -X POST -H 'Content-type: image/jpeg' --data-binary '@sample.jpg' $(upload_api)"
	@echo
else
	@echo
	@echo "> It has not been deployed. Execute deployment with the following command."
	@echo
	@echo "  make deploy email=<Your email address>"
	@echo
endif

clean-s3-objects:
ifeq ($(shell aws cloudformation describe-stacks \
  --query 'Stacks[?StackName==`${STACK_NAME}`].StackName' \
  --output text 2>/dev/null), ${STACK_NAME})
	$(eval bucket := $(shell aws cloudformation describe-stacks\
	  --stack-name ${STACK_NAME}\
	  --query 'Stacks[].Outputs[?OutputKey==`S3Bucket`].OutputValue'\
	  --output text))
	aws s3 rm s3://$(bucket) --recursive
endif

undeploy: clean-s3-objects
	aws cloudformation delete-stack --stack-name $(STACK_NAME)
	aws cloudformation wait stack-delete-complete --stack-name $(STACK_NAME)
