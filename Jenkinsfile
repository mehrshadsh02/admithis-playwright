pipeline {

    /*
     * Jenkins agent requirements:
     * - Git
     * - Node.js (v18+ or v20+ recommended) & npm in System PATH
     * - Shared Playwright browsers cache directory
     */
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(
            logRotator(
                numToKeepStr: '20',
                artifactNumToKeepStr: '20'
            )
        )
    }

    environment {
        /*
         * CI Mode for Playwright (forces headless mode and CI optimizations)
         */
        CI = 'true'

        /*
         * Direct Playwright to the central shared cache location.
         * Playwright automatically looks for the 'ms-playwright' folder inside this path.
         */
        PLAYWRIGHT_BROWSERS_PATH = 'C:\\ProgramData\\Jenkins\\.jenkins\\playwright-browsers'

        /*
         * Fast CDN Mirror to prevent 403 / network timeout issues if new revisions are checked
         */
        PLAYWRIGHT_DOWNLOAD_HOST = 'https://cdn.npmmirror.com/binaries/playwright'

        /*
         * Generate both HTML and JUnit XML reports for Jenkins
         */
        PLAYWRIGHT_JUNIT_OUTPUT_NAME = 'playwright-report/results.xml'
    }

    stages {

        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout Source Code') {
            steps {
                checkout scm
                echo 'Source code checked out successfully.'
            }
        }

        stage('Verify Build Tools') {
            steps {
                bat 'git --version'
                bat 'node --version'
                bat 'npm --version'
            }
        }

        stage('Install Dependencies') {
            options {
                timeout(time: 15, unit: 'MINUTES')
            }
            steps {
                /*
                 * Install dependencies using clean install (npm ci) or standard install (npm install)
                 */
                bat '''
                    npm ci || npm install
                '''
            }
        }

        stage('Install Playwright Browsers') {
            steps {
                /*
                 * Checks PLAYWRIGHT_BROWSERS_PATH. If matching revisions exist, it skips downloading.
                 */
                bat '''
                    npx playwright install
                '''
            }
        }

        stage('Run Playwright Tests') {
            steps {
                /*
                 * Execute Playwright tests.
                 * Reporters:
                 * - 'list' or 'dot' for console logs
                 * - 'html' for the full visual report
                 * - 'junit' for Jenkins test trend graph
                 */
                bat '''
                    npx playwright test --reporter=list,html,junit
                '''
            }
        }
    }

    post {

        always {

            /*
             * Publish standard JUnit XML test results for test trends in Jenkins.
             */
            junit(
                testResults: '**/playwright-report/*.xml',
                allowEmptyResults: true
            )

            /*
             * Publish the Playwright HTML Report
             */
            publishHTML(
                target: [
                    allowMissing: true,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    reportName: 'Playwright HTML Report',
                    reportTitles: 'admithis-playwright Test Report'
                ]
            )

            /*
             * Archive test artifacts (traces, screenshots, videos, html reports).
             */
            archiveArtifacts(
                artifacts: 'playwright-report/**/*',
                fingerprint: true,
                allowEmptyArchive: true
            )
        }

        success {
            echo 'Playwright Pipeline completed successfully.'
        }

        unstable {
            echo 'Pipeline completed with failing test assertions.'
        }

        failure {
            echo 'Pipeline failed due to execution errors. Review Console Output.'
        }
    }
}
