pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building the code'
                sh 'npm install --prefer-offline || npm ci'
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing the code'
                sh 'npm test'
            }
        }
        stage('Code Analysis') {
            steps {
                echo 'Analyzing code..'
            }
        }
        stage('Publish') {
            steps {
                echo 'Publishing..'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
            }
        }
    }
}
