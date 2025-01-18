pipeline {
    agent {
        label 'Uttarakhand-usp'
    }
    environment {
        AWS_ACCOUNT_ID = "441336081314"
        AWS_DEFAULT_REGION = "ap-south-1"
        IMAGE_REPO_NAME = "venue-management-frontend-uat"
        IMAGE_TAG = "latest"
        REPOSITORY_URI = "${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/${IMAGE_REPO_NAME}"
        IMAGE_NAME = "${REPOSITORY_URI}:${IMAGE_TAG}"
    }
    stages {
        stage('Logging into AWS ECR') {
            steps {
                script {
                    // Log into AWS ECR
                    sh """aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${REPOSITORY_URI}"""
                }
            }
        }

        stage('Cloning Git') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/server_testing_env']], doGenerateSubmoduleConfigurations: false, extensions: [], submoduleCfg: [], userRemoteConfigs: [[credentialsId: 'd10ac3f1-efba-4a5e-84f7-4537979f9093', url: 'https://kamalchouhanassrm@bitbucket.org/HostAssrm/venue_management_system_frontend.git']]])
            }
        }
// Create env file
        stage('Copy env file') {
            steps {
                withCredentials([file(credentialsId: 'venue_frontend_env_uat', variable: 'venue_frontend_Env_File')]) {
                    sh "cp $venue_frontend_Env_File $WORKSPACE"
                }
            }
        }
        // Docker image build
        stage('Building Docker Image') {
            steps {
                script {
                    dockerImage = docker.build("${IMAGE_REPO_NAME}:${IMAGE_TAG}")
                // echo "Built Docker image ${IMAGE_REPO_NAME}:${IMAGE_TAG}"
                }
            }
        }

        // Push container to ECR
        stage('Pushing to ECR') {
            steps {
                script {
                    // Tag the Docker image
                    sh """docker tag ${IMAGE_REPO_NAME}:${IMAGE_TAG} ${REPOSITORY_URI}:${IMAGE_TAG}"""

                    // Push the Docker image to ECR
                    sh """docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${IMAGE_REPO_NAME}:${IMAGE_TAG}"""
                }
            }
        }
       stage("Remove Old Version") {
           steps {
              script {
               // Remove the old version of the Docker container
               sh """docker rm -f ${IMAGE_REPO_NAME}"""
              }
          }
       }
        stage("Start Container") {
            steps {
                script {
                    sh """docker-compose up -d ${IMAGE_REPO_NAME} || { echo 'docker-compose failed'; exit 1; }"""
                }
            }
        }
    }
}
