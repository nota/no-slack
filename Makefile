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
