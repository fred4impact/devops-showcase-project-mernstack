#!/bin/bash

# Jenkins CI/CD Setup Script for MERN Stack DevOps Showcase
# This script helps set up Jenkins with the required plugins and configurations

set -e

echo "🚀 Setting up Jenkins CI/CD for MERN Stack DevOps Showcase..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Check if Jenkins is running
check_jenkins() {
    print_header "Checking Jenkins Status"
    
    if ! systemctl is-active --quiet jenkins; then
        print_error "Jenkins is not running. Please start Jenkins first:"
        echo "sudo systemctl start jenkins"
        echo "sudo systemctl enable jenkins"
        exit 1
    fi
    
    print_status "Jenkins is running"
}

# Install required Jenkins plugins
install_plugins() {
    print_header "Installing Required Jenkins Plugins"
    
    local plugins=(
        "workflow-aggregator"
        "docker-workflow"
        "git"
        "credentials"
        "htmlpublisher"
        "build-timeout"
        "timestamper"
        "ws-cleanup"
        "nodejs"
        "slack"
        "email-ext"
        "build-discarder"
        "pipeline-stage-view"
        "blueocean"
    )
    
    for plugin in "${plugins[@]}"; do
        print_status "Installing plugin: $plugin"
        java -jar jenkins-cli.jar -s http://localhost:8080 install-plugin "$plugin" || print_warning "Failed to install $plugin"
    done
    
    print_status "Restarting Jenkins to apply plugin changes..."
    java -jar jenkins-cli.jar -s http://localhost:8080 restart || print_warning "Failed to restart Jenkins"
    
    # Wait for Jenkins to restart
    print_status "Waiting for Jenkins to restart..."
    sleep 30
    
    # Wait for Jenkins to be ready
    while ! curl -s http://localhost:8080/api/json > /dev/null; do
        print_status "Waiting for Jenkins to be ready..."
        sleep 5
    done
    
    print_status "Jenkins plugins installed successfully"
}

# Configure global tools
configure_tools() {
    print_header "Configuring Global Tools"
    
    # Configure Node.js
    print_status "Configuring Node.js..."
    curl -X POST "http://localhost:8080/scriptText" \
        --data-urlencode "script=
        import jenkins.model.Jenkins
        import hudson.model.JDK
        import hudson.tools.InstallSourceProperty
        import hudson.tools.ZipExtractionInstaller
        
        def jenkins = Jenkins.getInstance()
        def nodeJS = jenkins.getDescriptor('jenkins.plugins.nodejs.tools.NodeJSInstallation')
        
        if (nodeJS != null) {
            def installations = nodeJS.getInstallations()
            def nodeJSInstallation = new jenkins.plugins.nodejs.tools.NodeJSInstallation(
                'NodeJS-18',
                '',
                [
                    new InstallSourceProperty([
                        new ZipExtractionInstaller('NodeJS-18', 'https://nodejs.org/dist/v18.19.0/node-v18.19.0-linux-x64.tar.xz', 'node-v18.19.0-linux-x64/bin/node')
                    ])
                ]
            )
            installations = installations + [nodeJSInstallation]
            nodeJS.setInstallations(installations.toArray(new jenkins.plugins.nodejs.tools.NodeJSInstallation[0]))
            jenkins.save()
        }
        " || print_warning "Failed to configure Node.js"
    
    print_status "Global tools configured"
}

# Create credentials
create_credentials() {
    print_header "Creating Jenkins Credentials"
    
    # Create Docker Hub credentials
    print_status "Creating Docker Hub credentials..."
    curl -X POST "http://localhost:8080/credentials/store/system/domain/_/createCredentials" \
        --data-urlencode "json={
            \"\": \"0\",
            \"credentials\": {
                \"scope\": \"GLOBAL\",
                \"id\": \"docker-hub-credentials\",
                \"username\": \"your-dockerhub-username\",
                \"password\": \"your-dockerhub-access-token\",
                \"description\": \"Docker Hub credentials for image pushing\",
                \"\$class\": \"com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl\"
            }
        }" || print_warning "Failed to create Docker Hub credentials"
    
    # Create Git credentials (if needed)
    print_status "Creating Git credentials..."
    curl -X POST "http://localhost:8080/credentials/store/system/domain/_/createCredentials" \
        --data-urlencode "json={
            \"\": \"0\",
            \"credentials\": {
                \"scope\": \"GLOBAL\",
                \"id\": \"git-credentials\",
                \"username\": \"your-git-username\",
                \"password\": \"your-git-token\",
                \"description\": \"Git credentials for repository access\",
                \"\$class\": \"com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl\"
            }
        }" || print_warning "Failed to create Git credentials"
    
    print_status "Credentials created"
}

# Create pipeline job
create_pipeline_job() {
    print_header "Creating Pipeline Job"
    
    # Create the main pipeline job
    print_status "Creating MERN-Stack-CI-CD pipeline job..."
    
    # Create job configuration
    cat > /tmp/jenkins-job-config.xml << 'EOF'
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.46">
  <description>MERN Stack DevOps Showcase - Complete CI/CD Pipeline</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <jenkins.model.BuildDiscarderProperty>
      <strategy class="hudson.tasks.LogRotator">
        <daysToKeepStr>10</daysToKeepStr>
        <numToKeepStr>10</numToKeepStr>
        <artifactDaysToKeepStr>-1</artifactDaysToKeepStr>
        <artifactNumToKeepStr>-1</artifactNumToKeepStr>
      </strategy>
    </jenkins.model.BuildDiscarderProperty>
    <hudson.plugins.build__timeout.BuildTimeoutProperty>
      <timeoutMinutes>30</timeoutMinutes>
      <failBuild>true</failBuild>
      <writingDescription>false</writingDescription>
      <timeoutPercentage>0</timeoutPercentage>
      <timeoutType>absolute</timeoutType>
      <timeoutMinutesElasticDefault>3</timeoutMinutesElasticDefault>
    </hudson.plugins.build__timeout.BuildTimeoutProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.90">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@4.8.3">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>https://github.com/your-username/mernstack-devops-showcase-project.git</url>
          <credentialsId>git-credentials</credentialsId>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/main</name>
        </hudson.plugins.git.BranchSpec>
        <hudson.plugins.git.BranchSpec>
          <name>*/develop</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="list"/>
      <extensions>
        <hudson.plugins.git.extensions.impl.CleanBeforeCheckout/>
        <hudson.plugins.git.extensions.impl.CleanCheckout/>
      </extensions>
    </scm>
    <scriptPath>jenkins/Jenkinsfile</scriptPath>
    <lightweight>false</lightweight>
  </definition>
  <triggers>
    <hudson.triggers.SCMTrigger>
      <spec>H/5 * * * *</spec>
      <ignorePostCommitHooks>false</ignorePostCommitHooks>
    </hudson.triggers.SCMTrigger>
  </triggers>
  <disabled>false</disabled>
</flow-definition>
EOF

    # Create the job
    curl -X POST "http://localhost:8080/createItem?name=MERN-Stack-CI-CD" \
        -H "Content-Type: application/xml" \
        --data-binary @/tmp/jenkins-job-config.xml || print_warning "Failed to create pipeline job"
    
    print_status "Pipeline job created"
}

# Install security tools
install_security_tools() {
    print_header "Installing Security Tools"
    
    # Install Trivy
    print_status "Installing Trivy..."
    if ! command -v trivy &> /dev/null; then
        curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
        print_status "Trivy installed"
    else
        print_status "Trivy already installed"
    fi
    
    # Install Snyk CLI
    print_status "Installing Snyk CLI..."
    if ! command -v snyk &> /dev/null; then
        npm install -g snyk
        print_status "Snyk CLI installed"
    else
        print_status "Snyk CLI already installed"
    fi
    
    # Install Dive
    print_status "Installing Dive..."
    if ! command -v dive &> /dev/null; then
        wget https://github.com/wagoodman/dive/releases/latest/download/dive_0.10.0_linux_amd64.deb
        dpkg -i dive_0.10.0_linux_amd64.deb || print_warning "Failed to install Dive"
        rm dive_0.10.0_linux_amd64.deb
        print_status "Dive installed"
    else
        print_status "Dive already installed"
    fi
    
    print_status "Security tools installed"
}

# Configure environment variables
configure_environment() {
    print_header "Configuring Environment Variables"
    
    # Set environment variables in Jenkins
    print_status "Setting environment variables..."
    curl -X POST "http://localhost:8080/scriptText" \
        --data-urlencode "script=
        import jenkins.model.Jenkins
        import hudson.EnvVars
        
        def jenkins = Jenkins.getInstance()
        def globalNodeProperties = jenkins.getGlobalNodeProperties()
        def envVarsNodePropertyList = globalNodeProperties.getAll(hudson.slaves.EnvironmentVariablesNodeProperty.class)
        
        if (envVarsNodePropertyList.isEmpty()) {
            globalNodeProperties.add(new hudson.slaves.EnvironmentVariablesNodeProperty())
            envVarsNodePropertyList = globalNodeProperties.getAll(hudson.slaves.EnvironmentVariablesNodeProperty.class)
        }
        
        def envVars = envVarsNodePropertyList.get(0).getEnvVars()
        envVars.put('DOCKER_USERNAME', 'your-dockerhub-username')
        envVars.put('DOCKER_PASSWORD', 'your-dockerhub-access-token')
        envVars.put('NODE_VERSION', '18')
        envVars.put('NPM_CONFIG_CACHE', '.npm')
        
        jenkins.save()
        " || print_warning "Failed to set environment variables"
    
    print_status "Environment variables configured"
}

# Main setup function
main() {
    print_header "Jenkins CI/CD Setup for MERN Stack DevOps Showcase"
    
    # Check prerequisites
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v java &> /dev/null; then
        print_error "Java is required but not installed"
        exit 1
    fi
    
    # Download Jenkins CLI
    print_status "Downloading Jenkins CLI..."
    wget -q http://localhost:8080/jnlpJars/jenkins-cli.jar || {
        print_error "Failed to download Jenkins CLI. Make sure Jenkins is running on port 8080"
        exit 1
    }
    
    # Run setup steps
    check_jenkins
    install_plugins
    configure_tools
    create_credentials
    create_pipeline_job
    install_security_tools
    configure_environment
    
    print_header "Setup Complete!"
    print_status "Jenkins CI/CD pipeline has been set up successfully"
    print_status "Access Jenkins at: http://localhost:8080"
    print_status "Pipeline job: MERN-Stack-CI-CD"
    
    print_warning "Please update the following before running the pipeline:"
    echo "1. Update Docker Hub credentials in Jenkins"
    echo "2. Update Git repository URL in job configuration"
    echo "3. Set Snyk token if using Snyk security scanning"
    echo "4. Configure Slack webhook URL for notifications (optional)"
    
    # Cleanup
    rm -f jenkins-cli.jar
    rm -f /tmp/jenkins-job-config.xml
    
    print_status "Setup script completed successfully!"
}

# Run main function
main "$@"
