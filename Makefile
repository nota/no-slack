IMAGE := asia-northeast1-docker.pkg.dev/helpfeelinc-playgrounds-deploy/default/no-slack:latest

configure-docker:
	gcloud auth configure-docker asia-northeast1-docker.pkg.dev

docker-build:
	docker build . --platform=linux/amd64 -t $(IMAGE) -t no-slack

docker-push:
	docker push $(IMAGE)

KUBECTL := kubectl --cluster=gke_helpfeelinc-playgrounds-deploy_asia-northeast1-b_helpfeelinc-playgrounds-deploy
deploy:
	$(KUBECTL) apply -f manifest.yaml

# https://cloud.google.com/secret-manager/docs/secret-manager-managed-csi-component#use-new-service-account
gke-secret-iam-policy-binding:
	gcloud secrets add-iam-policy-binding no-slack-env \
	  --project=helpfeelinc-playgrounds-deploy \
	  --role=roles/secretmanager.secretAccessor \
	  --member=principal://iam.googleapis.com/projects/559937581201/locations/global/workloadIdentityPools/helpfeelinc-playgrounds-deploy.svc.id.goog/subject/ns/default/sa/no-slack
