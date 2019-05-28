BUCKET_NAME = s3-uploader-demo-bucket
REGION = ap-northeast-1
STACK_NAME = s3-uploader-demo-stack

make = make --no-print-directory
email = s3-uploader-demo@example.com

pre-deploy:
ifneq ($(shell aws s3api list-buckets --query 'Buckets[?Name==`${BUCKET_NAME}`].Name' --output text), ${BUCKET_NAME})
	aws s3api create-bucket --bucket $(BUCKET_NAME) --region $(REGION) --create-bucket-configuration LocationConstraint=$(REGION)
endif

deploy: pre-deploy
	sam package --s3-bucket $(BUCKET_NAME) --output-template-file packaged.yml
	sam deploy --template-file packaged.yml --stack-name $(STACK_NAME) --capabilities CAPABILITY_IAM --parameter-overrides SnsSubscriptionEndpoint=${email}
	@$(make) confirm

confirm:
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

pre-undeploy:
	$(eval bucket := $(shell aws cloudformation describe-stacks\
	  --stack-name ${STACK_NAME}\
	  --query 'Stacks[].Outputs[?OutputKey==`S3Bucket`].OutputValue'\
	  --output text))
	aws s3 rm s3://$(bucket) --recursive

undeploy: pre-undeploy
	aws cloudformation delete-stack --stack-name $(STACK_NAME)
	aws cloudformation wait stack-delete-complete --stack-name $(STACK_NAME)
